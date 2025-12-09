import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { grey } from '../../../core/theme/palette';

import ChatTranscript from '../../components/ChatTranscript';
import ControlPanel from '../../components/ControlPanel';
import type {
  ChatMessage,
  ContextItemInput,
  PricingContextItem,
  PromptPreset
} from '../../types/types'
import { PROMPT_PRESETS } from '../../prompts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8086';

const extractPricingUrls = (text: string): string[] => {
  const matches = text.match(/https?:\/\/[^\s)]+/gi) ?? [];
  const urls: string[] = [];

  matches.forEach((raw) => {
    const candidate = raw.replace(/[),.;]+$/, '');
    try {
      const url = new URL(candidate);
      if (!urls.includes(url.href)) {
        urls.push(url.href);
      }
    } catch (error) {
      console.warn('Detected invalid pricing URL candidate', candidate, error);
    }
  });

  return urls;
};

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const extractHttpReferences = (payload: unknown): string[] => {
  const results = new Set<string>();
  const visited = new Set<unknown>();

  const visit = (value: unknown) => {
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === 'string') {
      if (isHttpUrl(value)) {
        results.add(value);
      }
      return;
    }
    if (typeof value !== 'object') {
      return;
    }
    if (visited.has(value)) {
      return;
    }
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    Object.values(value).forEach(visit);
  };

  visit(payload);
  return Array.from(results);
};

function PricingAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [contextItems, setContextItems] = useState<PricingContextItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const stored = window.localStorage.getItem('pricing-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const detectedPricingUrls = useMemo(() => extractPricingUrls(question), [question]);

  const isSubmitDisabled = useMemo(() => {
    const hasQuestion = Boolean(question.trim());
    return isLoading || !hasQuestion;
  }, [question, isLoading]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pricing-theme', theme);
    }
  }, [theme]);

  const addContextItems = (inputs: ContextItemInput[]) => {
    setContextItems((previous) => {
      if (inputs.length === 0) {
        return previous;
      }

      const next = [...previous];
      inputs.forEach((input) => {
        const trimmedValue = input.value.trim();
        if (!trimmedValue) {
          return;
        }

        const exists = next.some((item) => item.kind === input.kind && item.value === trimmedValue);
        if (exists) {
          return;
        }

        next.push({
          id: crypto.randomUUID(),
          kind: input.kind,
          label: input.label?.trim() || trimmedValue,
          value: trimmedValue,
          origin: input.origin ?? 'user'
        });
      });
      return next;
    });
  };

  const addContextItem = (input: ContextItemInput) => {
    addContextItems([input]);
  };

  const removeContextItem = (id: string) => {
    setContextItems((previous) => previous.filter((item) => item.id !== id));
  };

  const clearContext = () => {
    setContextItems([]);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);
    Promise.all(
      fileArray.map((file) =>
        file
          .text()
          .then((content) => ({ name: file.name, content }))
      )
    )
      .then((results) => {
        const inputs: ContextItemInput[] = results
          .filter((result) => Boolean(result.content.trim()))
          .map((result) => ({
            kind: 'yaml',
            label: result.name,
            value: result.content,
            origin: 'user'
          }));

        if (inputs.length > 0) {
          addContextItems(inputs);
        }

        if (inputs.length !== results.length) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: 'One or more uploaded files were empty and were skipped.',
              createdAt: new Date().toISOString()
            }
          ]);
        }
      })
      .catch((error) => {
        console.error('Failed to read YAML file', error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Could not read the uploaded file. Please try again.',
            createdAt: new Date().toISOString()
          }
        ]);
      });
  };

  const handlePromptSelect = (preset: PromptPreset) => {
    setQuestion(preset.question);
    if (preset.context.length > 0) {
      addContextItems(
        preset.context.map((entry) => ({
          kind: entry.kind,
          label: entry.label,
          value: entry.value,
          origin: entry.origin ?? 'preset'
        }))
      );
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setQuestion('');
    setContextItems([]);
    setIsLoading(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    const contextUrls = contextItems.filter((item) => item.kind === 'url').map((item) => item.value);
    const contextYamls = contextItems.filter((item) => item.kind === 'yaml').map((item) => item.value);

    const combinedUrlSet = new Set<string>(contextUrls);
    detectedPricingUrls.forEach((url) => combinedUrlSet.add(url));
    const combinedUrls = Array.from(combinedUrlSet);
    const dedupedYamls = Array.from(new Set(contextYamls));

    const newlyDetected = detectedPricingUrls.filter(
      (url) => !contextUrls.includes(url)
    );
    if (newlyDetected.length > 0) {
      addContextItems(
        newlyDetected.map((url) => ({
          kind: 'url',
          label: url,
          value: url,
          origin: 'detected'
        }))
      );
    }

    const body: Record<string, unknown> = {
      question: trimmedQuestion
    };

    if (combinedUrls.length === 1) {
      body.pricing_url = combinedUrls[0];
    } else if (combinedUrls.length > 1) {
      body.pricing_urls = combinedUrls;
    }

    if (dedupedYamls.length === 1) {
      body.pricing_yaml = dedupedYamls[0];
    } else if (dedupedYamls.length > 1) {
      body.pricing_yamls = dedupedYamls;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedQuestion,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        let message = `API returned ${response.status}`;
        try {
          const detail = await response.json();
          if (typeof detail?.detail === 'string') {
            message = detail.detail;
          }
        } catch (parseError) {
          console.error('Failed to parse error response', parseError);
        }
        throw new Error(message);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer ?? 'No response available.',
        createdAt: new Date().toISOString(),
        metadata: {
          plan: data.plan ?? undefined,
          result: data.result ?? undefined
        }
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const planReferences = extractHttpReferences(data?.plan);
      const resultReferences = extractHttpReferences(data?.result);
      const agentDiscoveredUrls = [...planReferences, ...resultReferences];
      if (agentDiscoveredUrls.length > 0) {
        addContextItems(
          agentDiscoveredUrls.map((url) => ({
            kind: 'url',
            label: url,
            value: url,
            origin: 'agent'
          }))
        );
      }
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              H.A.R.V.E.Y. Pricing Assistant
            </Typography>
            <Typography variant="body1" sx={{ color: grey[600] }}>
              Ask about optimal subscriptions and pricing insights using the Holistic Analysis and
              Regulation Virtual Expert for You (H.A.R.V.E.Y.) agent.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleNewConversation}
              disabled={isLoading}
            >
              New conversation
            </Button>
          </Box>
        </Box>
      </Box>
      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ChatTranscript 
              messages={messages} 
              isLoading={isLoading}
              promptPresets={PROMPT_PRESETS}
              onPresetSelect={handlePromptSelect}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', overflowY: 'auto' }}>
          <ControlPanel
            question={question}
            detectedPricingUrls={detectedPricingUrls}
            contextItems={contextItems}
            isSubmitting={isLoading}
            isSubmitDisabled={isSubmitDisabled}
            onQuestionChange={setQuestion}
            onSubmit={handleSubmit}
            onFileSelect={handleFilesSelected}
            onContextAdd={addContextItem}
            onContextRemove={removeContextItem}
            onContextClear={clearContext}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default PricingAssistantPage;
