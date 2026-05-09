import { useEffect, useState } from 'react';
import API_BASE from '../config/api';

const EMPTY_DATA = { navLinks: [], footerColumns: [], footerColumnLinks: [] };

let cachedPromise = null;

export function useSiteNavigation() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!cachedPromise) {
      cachedPromise = fetch(`${API_BASE}/api/site-navigation`)
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .catch(() => EMPTY_DATA);
    }

    let cancelled = false;
    cachedPromise.then((result) => {
      if (cancelled) return;
      setData(result || EMPTY_DATA);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loaded };
}
