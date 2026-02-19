import { useContext } from 'react';
import { PresetContext } from '../context/presetContext';

export function usePreset() {
  const presetContext = useContext(PresetContext);

  if (!presetContext) {
    throw Error('usePreset has to be used within PresetProvider');
  }

  const { preset, setPreset } = presetContext;

  return {
    preset,
    setPreset
  };
}
