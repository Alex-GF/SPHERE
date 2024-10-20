import { createContext } from "react";
import { AuthUserContext } from "../hooks/useAuth";

interface AuthContextInterface {
    authUser: AuthUserContext;
    setAuthUser: (authUser: AuthUserContext) => void;
}

export const AuthContext = createContext<AuthContextInterface>({
    authUser: {
        user: null,
        isAuthenticated: false,
        token: "",
        isLoading: true
    },
    setAuthUser: () => {},
});