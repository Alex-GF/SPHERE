import { createContext } from "react";
import { PromptPreset } from "../types/types";

export interface PresetContextType {
    preset: PromptPreset | null
    setPreset: React.Dispatch<React.SetStateAction<PromptPreset | null>>
}

export const PresetContext = createContext<PresetContextType | undefined>(undefined)