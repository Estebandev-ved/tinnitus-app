import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { authService } from '../api/authService';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setTokenState] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && !authService.getToken()) {
        try {
          const data = await authService.firebaseLogin(user.uid, user.email, user.displayName);
          setTokenState(data.token);
        } catch (e) {
          console.warn('AdminAutoSync: no se pudo obtener JWT', e.message);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = authService.getToken();
      setTokenState((prev) => prev !== current ? current : prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(username, password);
      setTokenState(data.token);
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setTokenState(null);
  };

  return (
    <AdminAuthContext.Provider value={{ token, isAuthenticated: Boolean(token), loading, error, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
