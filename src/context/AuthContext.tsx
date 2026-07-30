import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, LoginCredentials } from '../types/auth';
import { apiClient } from '../api/client';
import { setupInterceptors } from '../api/interceptors';
import { authService } from '../api/services/auth.service';
import { env } from '../env';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock initial user for standalone demo / testing when mock enabled
const MOCK_USER: User = {
  id: 'usr_01H8X9Z',
  email: 'admin@digilocal.com',
  firstName: 'Senior',
  lastName: 'Architect',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  role: 'super_admin',
  permissions: ['users:read', 'users:write', 'users:delete', 'settings:read', 'settings:write', 'analytics:read'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper ref to access current token inside interceptor callbacks
  const tokenRef = React.useRef<string | null>(null);
  tokenRef.current = accessToken;

  const handleLogout = useCallback(async () => {
    try {
      if (!env.VITE_ENABLE_MOCK_API && accessToken) {
        await authService.logout().catch(() => {});
      }
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, [accessToken]);

  const handleRefreshToken = useCallback(async (): Promise<string | null> => {
    try {
      if (env.VITE_ENABLE_MOCK_API) {
        const mockToken = 'mock_jwt_token_' + Date.now();
        setAccessToken(mockToken);
        return mockToken;
      }
      const data = await authService.refreshToken();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Configure Axios Interceptors
  useEffect(() => {
    setupInterceptors(apiClient, {
      getToken: () => tokenRef.current,
      refreshToken: handleRefreshToken,
      onUnauthorized: () => {
        setAccessToken(null);
        setUser(null);
      },
    });
  }, [handleRefreshToken]);

  // Initial Auth Check on App Load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (env.VITE_ENABLE_MOCK_API) {
          // Automatic dev bypass login for instant demonstration
          setUser(MOCK_USER);
          setAccessToken('mock_bearer_token');
        } else {
          const newToken = await handleRefreshToken();
          if (newToken) {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [handleRefreshToken]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      if (env.VITE_ENABLE_MOCK_API) {
        // Simulate network latency
        await new Promise((res) => setTimeout(res, 600));
        setUser(MOCK_USER);
        setAccessToken('mock_bearer_token_' + Date.now());
      } else {
        const authData = await authService.login(credentials);
        setAccessToken(authData.accessToken);
        setUser(authData.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      logout: handleLogout,
      refreshToken: handleRefreshToken,
    }),
    [user, accessToken, isLoading, handleLogout, handleRefreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
