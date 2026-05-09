import { useEffect } from 'react';
import API_BASE from '../../config/api';
import { THEME_DEFAULTS } from '../../../shared/contentSchema.js';

const HEX_RX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Fetches theme tokens once on mount and applies them as CSS custom
 * properties on document.documentElement, so admin-edited brand colors
 * take effect on next page load without a redeploy.
 *
 * Falls back silently to compiled-in defaults if the API is unreachable
 * or the section is empty — the public site never crashes if the theme
 * row is missing.
 */
export default function ThemeInjector() {
  useEffect(() => {
    let cancelled = false;
    const root = document.documentElement;

    fetch(`${API_BASE}/api/content/theme`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled || !data) return;
        for (const key of Object.keys(THEME_DEFAULTS)) {
          const value = data[key];
          if (typeof value === 'string' && HEX_RX.test(value.trim())) {
            // Underscore -> hyphen: gold_light -> --gold-light
            root.style.setProperty(`--${key.replace(/_/g, '-')}`, value.trim());
          }
        }
      })
      .catch(() => {
        // Theme not configured yet — keep compile-time defaults.
      });

    return () => { cancelled = true; };
  }, []);

  return null;
}
