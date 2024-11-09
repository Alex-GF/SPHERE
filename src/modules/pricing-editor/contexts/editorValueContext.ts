import { createContext } from "react";

export interface EditorValueContextInteface {
    editorValue: string;
    setEditorValue: (editorValue: string) => void;
}

export const EditorValueContext = createContext<EditorValueContextInteface>({
    editorValue: '',
    setEditorValue: () => {},
});