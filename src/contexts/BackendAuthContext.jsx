import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/backend/authService';
import { isBackendConfigured } from '../services/backend/apiClient';

const BackendAuthContext = createContext(null);

export function BackendAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!isBackendConfigured() || !authService.isAuthenticated()) {
      setLoading(false);
      return;
    }
    try {
      const data = await authService.me();
      setUser(data);
    } catch {
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password);
    await loadUser();
    return data;
  }, [loadUser]);

  const register = useCallback(async (username, email, password) => {
    return authService.register(username, email, password);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isBackendAvailable: isBackendConfigured(),
    login,
    register,
    logout,
  };

  return (
    <BackendAuthContext.Provider value={value}>
      {children}
    </BackendAuthContext.Provider>
  );
}

export function useBackendAuth() {
  const ctx = useContext(BackendAuthContext);
  if (!ctx) throw new Error('useBackendAuth debe usarse dentro de BackendAuthProvider');
  return ctx;
}
