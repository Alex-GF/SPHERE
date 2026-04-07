import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { grey, primary } from '../../core/theme/palette';

import type { ChatMessage, PromptPreset } from '../types/types';
import usePlayground from '../hooks/usePlayground';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  promptPresets?: PromptPreset[];
  onPresetSelect?: (preset: PromptPreset) => void;
}

function ChatTranscript({ messages, isLoading, promptPresets = [], onPresetSelect }: Props) {
  const isPlaygroundEnabled = usePlayground();

  const isPresetGalleyEnabled = !isPlaygroundEnabled && promptPresets.length > 0 && onPresetSelect;

  return (
    <div className="h-full overflow-y-auto p-2" aria-live="polite" aria-busy={isLoading}>
      {messages.length === 0 && !isLoading ? (
        <div className="mt-8 text-center">
          <div className="mb-4">
            <p className="mb-2 text-5xl">💬</p>
            <h2 className="mb-2 text-3xl font-semibold text-slate-800">
              Welcome to H.A.R.V.E.Y.
            </h2>
            <p className="text-slate-600">
              Enabling seamless execution of the Pricing Intelligence Interpretation Process.
            </p>
          </div>
          {isPresetGalleyEnabled && (
            <div className="mx-auto flex max-w-[600px] flex-col gap-2">
              {promptPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => onPresetSelect(preset)}
                  className="rounded-md border border-slate-300 p-4 text-left normal-case hover:border-sphere-primary-500 hover:bg-sphere-primary-100"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {messages.map(message => (
        <div
          key={message.id}
          className={`mb-2 rounded-md p-4 ${message.role === 'user' ? 'bg-sphere-primary-100 border-l-4 border-sphere-primary-500' : 'bg-slate-100 border-l-4 border-slate-500'}`}
        >
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-semibold text-slate-800">
              {message.role === 'user' ? 'You' : 'H.A.R.V.E.Y.'}
            </span>
            <span className="text-xs text-slate-600">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="prose max-w-none [&_p]:mb-1 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-slate-200 [&_pre]:p-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
          {message.metadata?.plan || message.metadata?.result ? (
            <details className="mt-2 rounded-md border border-slate-200 p-2">
              <summary className="cursor-pointer text-sm">View H.A.R.V.E.Y. context</summary>
              <div className="mt-2">
                {message.metadata.plan ? (
                  <div className="mb-2">
                    <p className="mb-1 text-sm font-semibold">Planner</p>
                    <pre className="overflow-x-auto rounded-md bg-slate-200 p-2 text-sm">
                      {JSON.stringify(message.metadata.plan, null, 2)}
                    </pre>
                  </div>
                ) : null}
                {message.metadata.result ? (
                  <div>
                    <p className="mb-1 text-sm font-semibold">Result</p>
                    <pre className="overflow-x-auto rounded-md bg-slate-200 p-2 text-sm">
                      {JSON.stringify(message.metadata.result, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </details>
          ) : null}
        </div>
      ))}
      {isLoading ? (
        <div className="flex items-center gap-2 p-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sphere-primary-500" />
          <span>Processing request...</span>
        </div>
      ) : null}
    </div>
  );
}

export default ChatTranscript;
