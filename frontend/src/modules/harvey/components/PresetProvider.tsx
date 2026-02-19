import { PresetContext, PresetContextType } from '../context/presetContext';

interface Props {
  presetContext: PresetContextType;
  children: React.ReactNode;
}

function PresetProvider({ presetContext, children }: Props) {
  return <PresetContext.Provider value={presetContext}>{children}</PresetContext.Provider>;
}

export default PresetProvider;
