import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth as authApi } from '../api/client';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(authApi.getToken()));

  useEffect(() => {
    let cancelled = false;
    const token = authApi.getToken();

    if (!token) return undefined;

    authApi.me()
      .then((user) => {
        if (!cancelled) {
          setAdmin(user);
        }
      })
      .catch(() => {
        authApi.logout();
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username, password, totpCode) => {
    const { token, username: user } = await authApi.login(username, password, totpCode);
    authApi.saveToken(token);
    setAdmin({ username: user });
    setChecking(false);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setAdmin(null);
    setChecking(false);
  }, []);

  return (
    <AdminContext.Provider value={{ admin, checking, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin must be used inside AdminProvider.');
  }

  return context;
}
