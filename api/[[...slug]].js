/**
 * Vercel Serverless Function — catch-all entry point.
 *
 * The optional catch-all filename `[[...slug]].js` makes Vercel route every
 * request under `/api/*` (and `/api` itself) to this single function while
 * preserving the original URL in `req.url`. Express then dispatches by its
 * own router. This avoids the need for a manual `/api/(.*)` rewrite in
 * vercel.json and avoids any URL rewriting that could strip path segments.
 *
 * Locally (`npm run dev`), `server/dev.js` boots the same Express app on
 * its own port — this file is only used by Vercel.
 */
import { app } from '../server/index.js';

export default app;
