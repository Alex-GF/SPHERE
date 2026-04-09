import { useMemo, useState } from 'react';
import type { ContextInputType, PricingContextItem, UrlContextItemInput } from '../types/types';
import ContextManagerItem from './ContextManagerItem';
import usePlayground from '../hooks/usePlayground';

interface Props {
  items: PricingContextItem[];
  detectedUrls: string[];
  onAdd: (input: ContextInputType) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function ContextManager({ items, detectedUrls, onAdd, onRemove, onClear }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isPlaygroundEnabled = usePlayground()

  const availableDetected = useMemo(
    () =>
      detectedUrls.filter(url => !items.some(item => item.kind === 'url' && item.value === url)),
    [detectedUrls, items]
  );

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Enter a URL to add it to the context.');
      return;
    }

    try {
      const normalized = new URL(trimmed).href;
      const urlItem: UrlContextItemInput = {
        kind: 'url',
        url: normalized,
        label: normalized,
        value: normalized,
        origin: 'user',
        transform: 'not-started',
      };
      onAdd(urlItem);
      setUrlInput('');
      setError(null);
    } catch {
      setError('Enter a valid http(s) URL.');
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Pricing Context
          </h2>
          <p className="text-sm text-slate-600">
            Add URLs or YAML exports to ground H.A.R.V.E.Y.'s answers.
          </p>
          {!isPlaygroundEnabled && (
            <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
              All pricings detected or added via URL will be modeled automatically; this process
              can take up to 30-60 minutes.
            </div>
          )}
          {!isPlaygroundEnabled && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Due to temporary production limits, URL extraction might trigger a "LoadError".
              Please wait for the loading icon in the pricing context box to disappear; once
              complete, you can proceed to ask questions normally.
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-600">
            {items.length} selected
          </div>
          {items.length > 0 && (
            <button
              type="button"
              className="rounded-md border border-red-500 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500 hover:text-white"
              onClick={onClear}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        {items.length === 0 ? (
          <div className="py-4 text-center text-sm text-slate-600">
            No pricings selected. Add one to keep the conversation grounded.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {items.map(item => (
              <ContextManagerItem key={item.id} item={item} onRemove={onRemove} />
            ))}
          </ul>
        )}
      </div>

      {availableDetected.length > 0 && (
        <div className="mb-4">
          <div className="mb-1 text-sm font-semibold">
            Detected in question
          </div>
          <div className="flex flex-wrap gap-2">
            {availableDetected.map(url => (
              <button
                type="button"
                key={url}
                onClick={() =>
                  onAdd({
                    kind: 'url',
                    url: url,
                    label: url,
                    value: url,
                    transform: 'not-started',
                    origin: 'detected',
                  })
                }
                className="rounded-full border border-sky-300 px-3 py-1 text-sm text-sky-700 hover:bg-sky-50"
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="url"
          name="context-url"
          value={urlInput}
          disabled={isPlaygroundEnabled}
          placeholder="https://example.com/pricing"
          onChange={event => {
            setUrlInput(event.target.value);
            setError(null);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddUrl();
            }
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
        />
        <button
          type="button"
          disabled={isPlaygroundEnabled}
          onClick={handleAddUrl}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Add URL
        </button>
      </div>
      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </section>
  );
}

export default ContextManager;
