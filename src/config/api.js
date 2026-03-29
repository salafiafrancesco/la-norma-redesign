/**
 * Central API base URL.
 * Set VITE_API_URL in Vercel project settings → Environment Variables.
 * Value must be the full backend origin, no trailing slash.
 * Example: https://la-norma-redesign.onrender.com
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

if (!API_BASE && import.meta.env.PROD) {
  // eslint-disable-next-line no-console
  console.error(
    '[La Norma] VITE_API_URL is not set. ' +
    'All API calls will be routed to the current origin and will fail. ' +
    'Add VITE_API_URL to your Vercel environment variables.'
  );
}

export default API_BASE;
