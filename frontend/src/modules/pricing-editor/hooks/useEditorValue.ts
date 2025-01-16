import { useContext } from "react";
import { EditorValueContext } from "../contexts/editorValueContext";

export const useEditorValue = () => {
    const { editorValue, setEditorValue } = useContext(EditorValueContext);

    return { editorValue, setEditorValue };
};