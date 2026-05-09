import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { ensureInitialized } from './db/init.js';
import {
  ALLOWED_ORIGINS,
  IS_PRODUCTION,
  PORT,
} from './config.js';

import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import bookingRoutes from './routes/bookings.js';
import cateringRoutes from './routes/catering.js';
import cateringContentRoutes from './routes/cateringContent.js';
import classRoutes from './routes/classes.js';
import contentRoutes from './routes/content.js';
import eventRoutes from './routes/events.js';
import experienceEventRoutes from './routes/experienceEvents.js';
import homepageContentRoutes from './routes/homepageContent.js';
import inquiryRoutes from './routes/inquiries.js';
import rsvpRoutes from './routes/rsvp.js';
import uploadRoutes from './routes/upload.js';

export const app = express();

// Run init once (idempotent — seeds only if tables are empty)
let initDone = false;
async function runInit() {
  if (initDone) return;
  await ensureInitialized();
  initDone = true;
}

// Middleware that ensures DB is seeded before first request
app.use(async (_req, _res, next) => {
  try {
    await runInit();
    next();
  } catch (error) {
    console.error('[init]', error);
    next(error);
  }
});

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: IS_PRODUCTION ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https:'],
    },
  } : false,
}));

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
});

app.use(corsMiddleware);
app.use(express.json({ limit: '4mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking requests. Please wait before trying again.' },
});

function bookingSubmissionLimiter(req, res, next) {
  if (req.method === 'POST') {
    return bookingLimiter(req, res, next);
  }
  return next();
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

app.use('/api', apiLimiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/bookings', bookingSubmissionLimiter, bookingRoutes);
app.use('/api/catering', bookingSubmissionLimiter, cateringRoutes);
app.use('/api/catering-content', cateringContentRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/experience-events', experienceEventRoutes);
app.use('/api/homepage-content', homepageContentRoutes);
app.use('/api/rsvp', bookingSubmissionLimiter, rsvpRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/inquiries', bookingSubmissionLimiter, inquiryRoutes);

app.get('/', (_req, res) => {
  res.send('La Norma backend is running.');
});

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

app.use((error, _req, res, next) => {
  void next;
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }
  if (error?.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }
  console.error('[express error]', error);
  const status = error.status || 500;
  const message = IS_PRODUCTION && status === 500
    ? 'Internal server error.'
    : (error.message || 'Internal server error.');
  return res.status(status).json({ error: message });
});

// Only listen when run directly (not when imported by Vercel)
const isDirectRun = !process.env.VERCEL;
if (isDirectRun) {
  app.listen(PORT, () => {
    if (!IS_PRODUCTION) {
      console.log(`La Norma API -> http://localhost:${PORT}`);
      console.log(`Health check -> http://localhost:${PORT}/api/health`);
    }
  });
}
