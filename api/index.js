/**
 * Vercel Serverless Function entry point.
 *
 * vercel.json rewrites every /api/* path to /api, which Vercel resolves to
 * this file. Vercel preserves the original URL in req.url, so Express sees
 * the full path (e.g. /api/auth/login) and dispatches with its own router.
 *
 * NOTE: do not switch to api/[...slug].js. Standalone Vercel Functions
 * (non-Next.js) had inconsistent routing for some multi-segment paths under
 * a catch-all in this project — /api/health and /api/content resolved fine,
 * but /api/auth and /api/auth/login returned edge 404. The explicit rewrite
 * below routes every path through this function uniformly.
 *
 * Locally (`npm run dev`), `server/dev.js` boots the same Express app on
 * its own port — this file is only used by Vercel.
 */
import { app } from '../server/index.js';

export default app;
