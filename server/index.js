import 'dotenv/config';
import express from 'express';
import { ensureInitialized } from './db/init.js';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import authRoutes      from './routes/auth.js';
import contentRoutes   from './routes/content.js';
import classRoutes     from './routes/classes.js';
import rsvpRoutes      from './routes/rsvp.js';
import uploadRoutes    from './routes/upload.js';
import eventRoutes     from './routes/events.js';
import inquiryRoutes   from './routes/inquiries.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Auto-create admin user on first run (safe to call every startup)
ensureInitialized();

// ── Allowed origins ───────────────────────────────────────────
// Reads both CORS_ORIGIN (single value set on Render) and
// ALLOWED_ORIGINS (comma-separated list) and merges them.
const LOCAL_DEV = [
  'http://localhost:5173','http://localhost:5174','http://localhost:5175',
  'http://localhost:5176','http://localhost:5177','http://localhost:5178',
  'http://localhost:5179','http://localhost:5180','http://localhost:5181',
  'http://localhost:5182','http://localhost:5183','http://localhost:5184',
  'http://localhost:5185','http://localhost:4173','http://localhost:3000',
];
const fromEnv = [
  ...(process.env.CORS_ORIGIN     ? process.env.CORS_ORIGIN.split(',')     : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
].map(s => s.trim()).filter(Boolean);

const ALLOWED_ORIGINS = [...new Set([...LOCAL_DEV, ...fromEnv])];

// ── Security headers ──────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // needed for images from external sources
  contentSecurityPolicy: false,     // managed by frontend
}));

// ── CORS ─────────────────────────────────────────────────────
const corsMiddleware = cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
});

// Handle preflight OPTIONS requests for all routes
app.options('*', corsMiddleware);
app.use(corsMiddleware);

app.use(express.json({ limit: '2mb' }));

// ── Rate limiters ─────────────────────────────────────────────
// General API: 100 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Strict limiter for RSVP submissions: 5 req / hour per IP
const rsvpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking requests. Please wait before trying again.' },
});

// Auth attempts: 10 / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait before trying again.' },
});

app.use('/api/', apiLimiter);

// ── Static: serve uploaded images ─────────────────────────────
app.use('/uploads', express.static(join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
}));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',      authLimiter,  authRoutes);
app.use('/api/content',               contentRoutes);
app.use('/api/classes',               classRoutes);
app.use('/api/rsvp',     rsvpLimiter, rsvpRoutes);
app.use('/api/upload',                uploadRoutes);
app.use('/api/events',                eventRoutes);
app.use('/api/inquiries', rsvpLimiter, inquiryRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  time: new Date().toISOString(),
  env: process.env.NODE_ENV || 'development',
}));

// ── 404 for unknown API routes ────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  // Always log — Render captures console output in service logs
  console.error('[express error]', err.message, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🍝 La Norma API → http://localhost:${PORT}`);
    console.log(`   Health:     http://localhost:${PORT}/api/health`);
    console.log(`   Admin UI:   http://localhost:5173/admin\n`);
  }
});
