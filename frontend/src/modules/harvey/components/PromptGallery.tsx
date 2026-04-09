import type { PromptPreset } from '../types/types';

interface Props {
  presets: PromptPreset[];
  onSelect: (preset: PromptPreset) => void;
  disabled?: boolean;
}

function PromptGallery({ presets, onSelect, disabled = false }: Props) {
  if (!presets || presets.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <h2 className="mb-2 text-lg font-semibold">Prompt presets</h2>
      <div className="grid gap-3 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {presets.map((preset) => (
          <button
            type="button"
            key={preset.id}
            className="rounded-xl border border-slate-200 bg-white p-0 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onSelect(preset)}
            disabled={disabled}
            title={preset.description}
          >
            <div className="flex h-full gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 font-semibold text-white">
                {preset.label.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{preset.label}</div>
                <div className="text-sm text-slate-600">{preset.description}</div>
              </div>
              <div className="text-2xl text-slate-400">↗</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PromptGallery;
