import { useCallback, useContext, useEffect, useRef } from 'react';
import { useLocalStorage } from '../../core/hooks/useLocalStorage';
import { AuthContext } from '../contexts/authContext';
import { getCurrentUser, USERS_BASE_PATH } from '../api/usersApi';

const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'auth_user';
let authBootstrapPromise: Promise<void> | null = null;

export interface AuthUserContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  tokenExpiration: Date | null;
  isLoading: boolean;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
}

const normalizeUser = (user: any): AuthUser => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
});

export const useAuth = () => {
  const { authUser, setAuthUser } = useContext(AuthContext);
  const { getItem, setItem, removeItem } = useLocalStorage();
  const refreshInFlightRef = useRef<Promise<void> | null>(null);

  const setSession = useCallback((user: AuthUser, token: string, tokenExpiration: Date | null = null) => {
    setAuthUser({
      user,
      isAuthenticated: true,
      token,
      tokenExpiration,
      isLoading: false,
    });

    setItem(AUTH_TOKEN_KEY, token);
    setItem(AUTH_USER_KEY, JSON.stringify(user));
  }, [setAuthUser, setItem]);

  const clearSession = useCallback(() => {
    setAuthUser({
      user: null,
      isAuthenticated: false,
      token: null,
      tokenExpiration: null,
      isLoading: false,
    });

    removeItem(AUTH_TOKEN_KEY);
    removeItem(AUTH_USER_KEY);
  }, [setAuthUser, removeItem]);

  const refreshTokenIfNeeded = useCallback(async () => {
    if (!authUser.token || !authUser.user?.username || !authUser.tokenExpiration) {
      return;
    }

    const expirationTime = new Date(authUser.tokenExpiration).getTime();
    const currentTime = Date.now();
    const timeDifference = expirationTime - currentTime;

    if (timeDifference > 60 * 60 * 1000 || timeDifference <= 0) {
      return;
    }

    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const refreshPromise = fetch(`${USERS_BASE_PATH}/${authUser.user.username}/refresh-token`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authUser.token}`,
      },
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.token) {
          throw new Error(body.error || 'Failed to refresh token');
        }

        const tokenExpiration = body.tokenExpiration ? new Date(body.tokenExpiration) : authUser.tokenExpiration;
        setSession(authUser.user!, body.token, tokenExpiration);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        refreshInFlightRef.current = null;
      });

    refreshInFlightRef.current = refreshPromise;
    return refreshPromise;
  }, [authUser.token, authUser.user, authUser.tokenExpiration, setSession, clearSession]);

  useEffect(() => {
    if (!authUser.isLoading) {
      return;
    }

    if (authBootstrapPromise) {
      return;
    }

    const bootstrapSession = async () => {
      const storedToken = getItem(AUTH_TOKEN_KEY);
      const storedUser = getItem(AUTH_USER_KEY);

      if (!storedToken) {
        clearSession();
        return;
      }

      try {
        const currentUser = await getCurrentUser(storedToken);
        setSession(normalizeUser(currentUser), storedToken, null);
      } catch {
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setSession(normalizeUser(parsedUser), storedToken, null);
            return;
          } catch {
            clearSession();
            return;
          }
        }
        clearSession();
      }
    };

    authBootstrapPromise = bootstrapSession().finally(() => {
      authBootstrapPromise = null;
    });
  }, [authUser.isLoading]);

  const login = useCallback(async (token: string) => {
    const currentUser = await getCurrentUser(token);
    setSession(normalizeUser(currentUser), token, null);
  }, [setSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const fetchWithInterceptor = useCallback(async (url: RequestInfo | URL, options?: RequestInit) => {
    await refreshTokenIfNeeded();

    const currentToken = authUser.token ?? getItem(AUTH_TOKEN_KEY);
    const baseHeaders = options?.headers ? new Headers(options.headers) : new Headers();

    if (currentToken && !baseHeaders.has('Authorization')) {
      baseHeaders.set('Authorization', `Bearer ${currentToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers: baseHeaders,
    });

    if (response.status === 401) {
      clearSession();
    }

    return response;
  }, [authUser.token, clearSession, getItem, refreshTokenIfNeeded]);

  return { authUser, login, logout, setAuthUser, fetchWithInterceptor };
};
