import { createContext, useContext, useState, useCallback } from 'react';

export const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [page, setPage] = useState('home');

  const navigate = useCallback((destination) => {
    setPage(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavigationContext.Provider value={{ page, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}
