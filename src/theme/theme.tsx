import { createTheme, ThemeOptions } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { palette } from './palette';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ModeContext } from '../contexts/modeContext';
import monaco from "monaco-editor";

export default function MasspThemeProvider({ children }: { children: React.ReactNode }) {
  const memoizedValue = useMemo(
    () => ({
      palette: palette(),
      // typography,
      // shadows: shadows(),
      // customShadows: customShadows(),
      // shape: { borderRadius: 8 },
    }),
    []
  );

  const theme = createTheme(memoizedValue as unknown as ThemeOptions);

  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // fetch("/assets/editor-themes/Cobalt2.json")
  // .then(data => data.json())
  // .then(data => {
  //   monaco.editor.defineTheme('cobalt2', data);
  // })

  return (
    <ThemeProvider theme={theme}>
      <ModeContext.Provider value={{mode, setMode}}>
        <CssBaseline/>
        {children}
      </ModeContext.Provider>
    </ThemeProvider>
  );
}