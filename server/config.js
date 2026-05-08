export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const PORT = Number(process.env.PORT || 3001);

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lanorma2025';

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (IS_PRODUCTION ? null : 'dev_secret_only__do_not_use_in_production');

if (!JWT_SECRET) {
  console.error(
    '\n[FATAL] JWT_SECRET environment variable is not set.\n' +
    'Add it in your hosting provider before starting the API.\n',
  );
  process.exit(1);
}

if (!IS_PRODUCTION && !process.env.JWT_SECRET) {
  console.warn('[config] JWT_SECRET not set - using insecure development fallback.');
}

if (!IS_PRODUCTION && !process.env.ADMIN_PASSWORD) {
  console.warn('[config] ADMIN_PASSWORD not set - using default local development password.');
}

const LOCAL_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
];

const envOrigins = [
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
]
  .map((value) => value.trim())
  .filter(Boolean);

export const ALLOWED_ORIGINS = [...new Set([...LOCAL_DEV_ORIGINS, ...envOrigins])];
