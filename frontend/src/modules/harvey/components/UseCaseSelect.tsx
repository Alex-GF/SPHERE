import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
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

  const handlePresetChange = (event: SelectChangeEvent) => {
    const currPreset = findPresetById(event.target.value as string);
    setPreset(currPreset);
    if (currPreset) {
      onPresetSelect(currPreset);
    }
  };

  const availablePresets = USE_CASES.filter(preset => preset.response)

  return (
    <FormControl>
      <InputLabel id="use-case-select-label">Select a use case</InputLabel>
      <Select
        labelId="use-case-select-label"
        value={preset ? preset.id : ''}
        required
        label="Select an use case"
        onChange={handlePresetChange}
      >
        {availablePresets.length > 0 &&
          availablePresets.map(item => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}

export default UseCaseSelect;
