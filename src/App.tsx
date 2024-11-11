import MasspThemeProvider from './modules/core/theme/theme';
import Router from './routes/router';
import { AuthContext } from './modules/auth/contexts/authContext';
import { AuthUserContext } from './modules/auth/hooks/useAuth';
import { useState } from 'react';

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUserContext>({
    isAuthenticated: false,
    user: null,
    token: '',
    isLoading: true,
  });

  return (
    <MasspThemeProvider>
      <AuthContext.Provider value={{ authUser, setAuthUser }}>
        <Router />
      </AuthContext.Provider>
    </MasspThemeProvider>
  );
}
