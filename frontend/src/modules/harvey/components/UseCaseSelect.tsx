import type { ChangeEvent } from 'react';
import { usePreset } from '../hooks/usePreset';
import { USE_CASES } from '../use-cases';
import { PromptPreset } from '../types/types';

interface Props {
  onPresetSelect: (preset: PromptPreset) => void;
}

function UseCaseSelect({ onPresetSelect }: Props) {
  const { preset, setPreset } = usePreset();

  const findPresetById = (presetId: string): PromptPreset | null => {
    const res = USE_CASES.filter(preset => preset.id === presetId);
    if (res.length === 0) {
      return null;
    }
    return res[0];
  };

  const handlePresetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const currPreset = findPresetById(event.target.value as string);
    setPreset(currPreset);
    if (currPreset) {
      onPresetSelect(currPreset);
    }
  };

  const availablePresets = USE_CASES.filter(preset => preset.response)

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="use-case-select" className="text-sm font-medium text-slate-700">
        Select a use case
      </label>
      <select
        id="use-case-select"
        value={preset ? preset.id : ''}
        required
        onChange={handlePresetChange}
        className="rounded-md border border-slate-300 px-3 py-2"
      >
        <option value="" disabled>
          Select an use case
        </option>
        {availablePresets.map(item => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default UseCaseSelect;
