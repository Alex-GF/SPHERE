import SphereThemeProvider from './modules/core/theme/theme';
import Router from './routes/router';
import { AuthContext } from './modules/auth/contexts/authContext';
import { AuthUserContext } from './modules/auth/hooks/useAuth';
import { useState } from 'react';
import { useScrollToTop } from './modules/core/hooks/useScrollToTop';
import { OrganizationContext } from './modules/organization/contexts/organizationContext';
import { useOrganizationManager } from './modules/organization/hooks/useOrganization';

function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { organizations, activeOrganization, setActiveOrganization, isLoading } = useOrganizationManager();

  return (
    <OrganizationContext.Provider
      value={{ organizations, activeOrganization, setActiveOrganization, isLoading }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export default function App() {
  useScrollToTop();

  const [authUser, setAuthUser] = useState<AuthUserContext>({
    isAuthenticated: false,
    user: null,
    token: null,
    tokenExpiration: null,
    isLoading: true,
  });

  return (
    <SphereThemeProvider>
      <AuthContext.Provider value={{ authUser, setAuthUser }}>
        <OrganizationProvider>
          <Router />
        </OrganizationProvider>
      </AuthContext.Provider>
    </SphereThemeProvider>
  );
}
