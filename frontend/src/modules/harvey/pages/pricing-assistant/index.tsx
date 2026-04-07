import { FormEvent, useEffect, useMemo, useState } from 'react';
import ChatTranscript from '../../components/ChatTranscript';
import ControlPanel from '../../components/ControlPanel';
import type {
  ChatMessage,
  ChatRequest,
  ContextInputType,
  NotificationUrlEvent,
  PresetContextInput,
  PricingContextItem,
  PricingContextUrlWithId,
  PromptPreset,
} from '../../types/types';
import { PROMPT_PRESETS } from '../../prompts';
import { PricingContext } from '../../context/pricingContext';
import {
  chatWithAgent,
  createContextBodyPayload,
  deleteYamlPricing,
  diffPricingContextWithDetectedUrls,
  extractHttpReferences,
  extractPricingUrls,
  uploadYamlPricing,
} from '../../utils';
import PlaygroundProvider from '../../components/PlaygroundProvider';
import PresetProvider from '../../components/PresetProvider';
import {
  playgroundMockUrlTrnasformEvent,
  sseUrlTransformEvent,
  UrlTransformEvent,
} from '../../sse';
import { UseCases } from '../../use-cases';

const HARVEY_API_BASE_URL = import.meta.env.VITE_HARVEY_URL ?? 'http://localhost:8086';

interface Props {
  playground?: boolean;
}

function PricingAssistantPage({ playground = false }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [contextItems, setContextItems] = useState<PricingContextItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preset, setPreset] = useState<PromptPreset | null>(null);

  const urlTransformEvent: UrlTransformEvent = !playground
    ? sseUrlTransformEvent
    : playgroundMockUrlTrnasformEvent;

  const handleUrlNotification = (notification: NotificationUrlEvent) =>
    setContextItems(previous =>
      previous.map(item =>
        item.kind === 'url' && item.id === notification.id
          ? { ...item, transform: 'done', value: notification.yaml_content }
          : item
      )
    );

  useEffect(() => {
    return urlTransformEvent.connect(handleUrlNotification);
  }, [playground]);

  const detectedPricingUrls = useMemo(() => extractPricingUrls(question), [question]);

  const isSubmitDisabled = useMemo(() => {
    const hasQuestion = Boolean(question.trim());
    return isLoading || !hasQuestion || (playground && messages.length > 0);
  }, [question, isLoading, messages]);

  const createPricingContextItems = (contextInputItems: ContextInputType[]): PricingContextItem[] =>
    contextInputItems
      .map(item => ({
        ...item,
        value: item.value.trim(),
        id: crypto.randomUUID(),
      }))
      .filter(
        item =>
          !contextItems.some(
            stateItem => stateItem.kind === item.kind && stateItem.value === item.value
          )
      );

  const addContextItems = (inputs: ContextInputType[]) => {
    if (inputs.length === 0) {
      return null;
    }

    const newPricingContextItems: PricingContextItem[] = createPricingContextItems(inputs);

    if (!playground) {
      const uploadPromises = newPricingContextItems
        .filter(
          item =>
            item.kind === 'yaml' &&
            item.origin &&
            (item.origin === 'user' || item.origin === 'preset')
        )
        .map(item => uploadYamlPricing(`${item.id}.yaml`, item.value));

      if (uploadPromises.length > 0) {
        Promise.all(uploadPromises).catch(err => console.error('Upload failed', err));
      }
    }

    setContextItems(previous => [...previous, ...newPricingContextItems]);

    return newPricingContextItems;
  };

  const addContextItem = (input: ContextInputType) => {
    addContextItems([input]);
  };

  const removeContextItem = (id: string) => {
    if (!playground) {
      const deletePromises = contextItems
        .filter(
          item =>
            item.id === id &&
            item.kind === 'yaml' &&
            item.origin &&
            (item.origin === 'user' || item.origin === 'preset')
        )
        .map(item => deleteYamlPricing(`${item.id}.yaml`));
      if (deletePromises.length > 0) {
        Promise.all(deletePromises);
      }
    }

    setContextItems(previous => previous.filter(item => item.id !== id));
  };

  const removeSphereContextItem = (sphereId: string) => {
    setContextItems(previous =>
      previous.filter(item => item.origin && item.origin === 'sphere' && item.sphereId !== sphereId)
    );
  };

  const clearContext = () => {
    setContextItems([]);
    if (!playground) {
      const storedYamls = contextItems
        .filter(
          item =>
            (item.kind === 'yaml' && item.origin && item.origin !== 'sphere') ||
            (item.kind === 'url' && item.transform === 'done')
        )
        .map(item => deleteYamlPricing(`${item.id}.yaml`));
      Promise.all(storedYamls).catch(() => console.error('Failed to delete yamls'));
    }
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);
    Promise.all(fileArray.map(file => file.text().then(content => ({ name: file.name, content }))))
      .then(results => {
        const inputs: ContextInputType[] = results
          .filter(result => Boolean(result.content.trim()))
          .map(result => ({
            kind: 'yaml',
            label: result.name,
            value: result.content,
            origin: 'user',
          }));

        if (inputs.length > 0) {
          addContextItems(inputs);
        }

        if (inputs.length !== results.length) {
          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: 'One or more uploaded files were empty and were skipped.',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch(error => {
        console.error('Failed to read YAML file', error);
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Could not read the uploaded file. Please try again.',
            createdAt: new Date().toISOString(),
          },
        ]);
      });
  };

  const mapPresetContexttoContext = (contextInput: PresetContextInput): ContextInputType => {
    if (contextInput.kind === 'url') {
      return {
        kind: 'url',
        label: contextInput.label,
        value: contextInput.value,
        url: contextInput.value,
        transform: 'not-started',
        origin: 'preset',
      };
    }

    return { kind: 'yaml', label: contextInput.label, value: contextInput.value, origin: 'preset' };
  };

  const handlePromptSelect = (preset: PromptPreset) => {
    setQuestion(preset.question);
    if (preset.context.length > 0) {
      const mappedInput: ContextInputType[] = preset.context.map(entry =>
        mapPresetContexttoContext(entry)
      );
      addContextItems(mappedInput);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setQuestion('');
    setContextItems([]);
    setIsLoading(false);
    setPreset(null);
  };

  const getUrlItems = () =>
    contextItems.filter(item => item.kind === 'url').map(item => ({ id: item.id, url: item.url }));

  const getUniqueYamlFiles = () =>
    Array.from(new Set(contextItems.filter(item => item.kind === 'yaml').map(item => item.value)));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    const newlyDetected = diffPricingContextWithDetectedUrls(contextItems, detectedPricingUrls);
    let newUrls: PricingContextUrlWithId[] = [];
    if (newlyDetected.length > 0) {
      const newItems = addContextItems(
        newlyDetected.map(url => ({
          kind: 'url',
          url: url,
          label: url,
          value: url,
          origin: 'detected',
          transform: 'pending',
        }))
      );
      newUrls = newItems
        ? newItems.filter(item => item.kind === 'url').map(item => ({ id: item.id, url: item.url }))
        : [];
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedQuestion,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setContextItems(prev =>
      prev.map(item => (item.kind === 'url' ? { ...item, transform: 'pending' } : item))
    );

    try {
      const requestBody: ChatRequest = {
        question: trimmedQuestion,
        ...createContextBodyPayload([...getUrlItems(), ...newUrls], getUniqueYamlFiles()),
      };
      const data = await chatWithAgent(requestBody);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer ?? 'No response available.',
        createdAt: new Date().toISOString(),
        metadata: {
          plan: data.plan ?? undefined,
          result: data.result ?? undefined,
        },
      };
      setMessages(prev => [...prev, assistantMessage]);

      const planReferences = extractHttpReferences(data?.plan);
      const resultReferences = extractHttpReferences(data?.result);
      const agentDiscoveredUrls = [...planReferences, ...resultReferences];
      const newAgentDiscovered = diffPricingContextWithDetectedUrls(
        contextItems,
        agentDiscoveredUrls
      );
      if (newAgentDiscovered.length > 0) {
        addContextItems(
          newAgentDiscovered.map(url => ({
            kind: 'url',
            url: url,
            label: url,
            value: url,
            origin: 'agent',
            transform: 'not-started',
          }))
        );
      }
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
  };

  const handlePlaygroundSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (preset) {
      const message: ChatMessage = {
        id: preset.id,
        role: 'assistant',
        content: preset.response?.answer ?? '',
        createdAt: new Date().toLocaleString(),
        metadata: {
          plan: preset.response?.plan ?? {},
          result: preset.response?.result ?? {},
        },
      };
      if (preset.id === UseCases.AMINT) {
        setContextItems(items =>
          items.map(item => (item.kind === 'url' ? { ...item, transform: 'done' } : item))
        );
      }

      setMessages(messages => [...messages, message]);
    }
  };

  return (
    <PlaygroundProvider playground={playground}>
      <PresetProvider presetContext={{ preset, setPreset }}>
        <PricingContext.Provider value={contextItems}>
          <div className="flex h-screen flex-col px-4 py-6 lg:px-6">
            <div className="mb-4 space-y-4">
              {playground && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Playground mode is active
                </div>
              )}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="mb-1 text-4xl font-semibold">
                    H.A.R.V.E.Y. Pricing Assistant
                  </h1>

                  <p className="max-w-3xl text-sm text-slate-600 md:text-base">
                    Ask about optimal subscriptions and pricing insights using the Holistic Agent
                    for Reasoning on Value and Economic analYsis (HARVEY).
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleNewConversation} disabled={isLoading} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                    New conversation
                  </button>
                </div>
              </div>
            </div>
            <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <ChatTranscript
                    messages={messages}
                    isLoading={isLoading}
                    promptPresets={PROMPT_PRESETS}
                    onPresetSelect={handlePromptSelect}
                  />
              </div>
              <div className="min-h-0 overflow-y-auto">
                <ControlPanel
                  question={question}
                  detectedPricingUrls={detectedPricingUrls}
                  contextItems={contextItems}
                  isSubmitting={isLoading}
                  isSubmitDisabled={isSubmitDisabled}
                  onQuestionChange={setQuestion}
                  onSubmit={!playground ? handleSubmit : handlePlaygroundSubmit}
                  onFileSelect={handleFilesSelected}
                  onContextAdd={addContextItem}
                  onContextRemove={removeContextItem}
                  onSphereContextRemove={removeSphereContextItem}
                  onContextClear={clearContext}
                  onPresetSelect={handlePromptSelect}
                />
              </div>
            </div>
          </div>
        </PricingContext.Provider>
      </PresetProvider>
    </PlaygroundProvider>
  );
}

export default PricingAssistantPage;
