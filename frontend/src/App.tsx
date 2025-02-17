import SphereThemeProvider from './modules/core/theme/theme';
import Router from './routes/router';
import { AuthContext } from './modules/auth/contexts/authContext';
import { AuthUserContext } from './modules/auth/hooks/useAuth';
import { useState } from 'react';
import { useScrollToTop } from './modules/core/hooks/useScrollToTop';

export default function App() {
  useScrollToTop();

  const [authUser, setAuthUser] = useState<AuthUserContext>({
    isAuthenticated: false,
    user: null,
    token: '',
    tokenExpiration: null,
    isLoading: true,
  });

  return (
    <SphereThemeProvider>
      <AuthContext.Provider value={{ authUser, setAuthUser }}>
        <Router />
      </AuthContext.Provider>
    </SphereThemeProvider>
  );
}
