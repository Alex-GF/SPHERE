import { useContext } from "react";
import { ModeContext } from "../contexts/modeContext";

export const useMode = () => {
    const { mode, setMode } = useContext(ModeContext);

    return { mode, setMode };
};