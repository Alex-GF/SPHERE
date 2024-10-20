import MasspThemeProvider from './theme/theme';
import Router from "./routes/router";
import { AuthContext } from './contexts/authContext';
import { AuthUserContext } from './hooks/useAuth';
import { useState } from "react";

export default function App() {
  
  const [authUser, setAuthUser] = useState<AuthUserContext>({ isAuthenticated: false, user: null, token: "", isLoading: true });
  
  return (
    <MasspThemeProvider>
      <AuthContext.Provider value={{ authUser, setAuthUser }}>
        <Router/>
      </AuthContext.Provider>
    </MasspThemeProvider>
  );
}