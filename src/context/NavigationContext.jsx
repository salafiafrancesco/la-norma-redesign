import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  PAGE_KEYS,
  PAGE_PATHS,
  buildPageHref,
  getAnchorFromHash,
  getPageFromPathname,
} from '../../shared/routes.js';

export const NavigationContext = createContext(null);

function scrollToAnchor(anchor) {
  if (!anchor) return;

  const target = document.getElementById(anchor);
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetScrollPosition() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function NavigationProvider({ children }) {
  const [page, setPage] = useState(() => getPageFromPathname(window.location.pathname));
  const [pendingAnchor, setPendingAnchor] = useState(() => getAnchorFromHash(window.location.hash));

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPage(getPageFromPathname(window.location.pathname));
      setPendingAnchor(getAnchorFromHash(window.location.hash));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!pendingAnchor) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToAnchor(pendingAnchor);
      setPendingAnchor('');
    });

    return () => window.cancelAnimationFrame(frame);
  }, [page, pendingAnchor]);

  const navigate = useCallback((destination, options = {}) => {
    const targetPage = PAGE_PATHS[destination] ? destination : PAGE_KEYS.home;
    const anchor = options.anchor ?? '';
    const targetHref = buildPageHref(targetPage, anchor);
    const currentHref = `${window.location.pathname}${window.location.hash}`;

    if (currentHref !== targetHref) {
      window.history[options.replace ? 'replaceState' : 'pushState']({}, '', targetHref);
    }

    setPage(targetPage);

    if (anchor) {
      setPendingAnchor(anchor);
      return;
    }

    setPendingAnchor('');
    window.requestAnimationFrame(() => {
      resetScrollPosition();
    });
  }, []);

  const navigatePath = useCallback((path, options = {}) => {
    const url = new URL(String(path ?? '/'), window.location.origin);
    const targetPage = getPageFromPathname(url.pathname);
    const anchor = options.anchor ?? getAnchorFromHash(url.hash);
    const targetHref = anchor ? `${url.pathname}#${anchor}` : url.pathname;
    const currentHref = `${window.location.pathname}${window.location.hash}`;

    if (currentHref !== targetHref) {
      window.history[options.replace ? 'replaceState' : 'pushState']({}, '', targetHref);
    }

    setPage(targetPage);

    if (anchor) {
      setPendingAnchor(anchor);
      return;
    }

    setPendingAnchor('');
    window.requestAnimationFrame(() => {
      resetScrollPosition();
    });
  }, []);

  const value = useMemo(() => ({
    page,
    navigate,
    navigatePath,
    resolveHref: (pageKey, anchor = '') => buildPageHref(pageKey, anchor),
  }), [page, navigate, navigatePath]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}
