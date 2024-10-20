import { createTheme, ThemeOptions } from '@mui/material/styles';
import { useMemo } from 'react';
import { palette } from './palette';
import { CssBaseline, ThemeProvider } from '@mui/material';

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}