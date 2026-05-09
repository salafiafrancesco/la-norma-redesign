/**
 * Central API base URL.
 *
 * Default (recommended): leave VITE_API_URL UNSET. Frontend and backend live
 * on the same Vercel deployment — calls go to the relative path /api/*,
 * which vercel.json rewrites to the api/index.js Vercel Function. Same-origin
 * requests skip CORS entirely.
 *
 * Override only if the API is hosted elsewhere (e.g. a separate Vercel
 * project or a different host). Value must be the full backend origin, no
 * trailing slash. Example: https://api.lanormarestaurant.com
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default API_BASE;
