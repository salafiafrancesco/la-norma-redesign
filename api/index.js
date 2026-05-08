/**
 * Vercel Serverless Function entry point.
 * Imports the Express app and exposes it as a default export.
 * Vercel routes /api/* requests here via vercel.json rewrites.
 */
import { app } from '../server/index.js';

export default app;
