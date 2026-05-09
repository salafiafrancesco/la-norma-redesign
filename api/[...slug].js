/**
 * Vercel Serverless Function — catch-all entry point.
 *
 * The catch-all filename `[...slug].js` makes Vercel route every request
 * under `/api/*` to this single function while preserving the original URL
 * in `req.url`. Express then dispatches by its own router. No vercel.json
 * rewrite is needed for /api/*; Vercel resolves the catch-all automatically.
 *
 * Locally (`npm run dev`), `server/dev.js` boots the same Express app on
 * its own port — this file is only used by Vercel.
 */
import { app } from '../server/index.js';

export default app;
