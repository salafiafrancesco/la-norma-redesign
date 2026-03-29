import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth as authApi } from '../api/client';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin]   = useState(null);   // { username }
  const [checking, setChecking] = useState(true); // initial token check

  // Verify stored token on mount
  useEffect(() => {
    const token = authApi.getToken();
    if (!token) { setChecking(false); return; }
    authApi.me()
      .then(setAdmin)
      .catch(() => authApi.logout())
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { token, username: user } = await authApi.login(username, password);
    authApi.saveToken(token);
    setAdmin({ username: user });
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setAdmin(null);
  }, []);

  return (
    <AdminContext.Provider value={{ admin, checking, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
