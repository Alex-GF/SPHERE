import { createTheme, ThemeOptions } from '@mui/material/styles';
import { useMemo, useState, useEffect } from 'react';
import { palette } from './palette';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ModeContext } from '../contexts/modeContext';

export default function SphereThemeProvider({ children }: { children: React.ReactNode }) {
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

  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ModeContext.Provider value={{ mode, setMode }}>
        <CssBaseline />
        {children}
      </ModeContext.Provider>
    </ThemeProvider>
  );
}
