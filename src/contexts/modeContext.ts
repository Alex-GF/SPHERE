import { createContext } from "react";

export interface ModeContextInteface {
    mode: 'light' | 'dark';
    setMode: (mode: 'light' | 'dark') => void;
}

export const ModeContext = createContext<ModeContextInteface>({
    mode: 'light',
    setMode: () => {},
});