/**
 * Central server configuration.
 * Validates required environment variables at startup so the process
 * fails immediately with a clear message rather than crashing mid-request.
 */

const isProd = process.env.NODE_ENV === 'production';

// JWT_SECRET: REQUIRED in production. Falls back to a dev-only value locally.
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (isProd ? null : 'dev_secret_only__do_not_use_in_production');

if (!JWT_SECRET) {
  console.error(
    '\n[FATAL] JWT_SECRET environment variable is not set.\n' +
    '        Add it in Render → Environment Variables:\n' +
    '        JWT_SECRET = <long random string>\n' +
    '        Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n'
  );
  process.exit(1);
}

if (!isProd && !process.env.JWT_SECRET) {
  console.warn('[warn] JWT_SECRET not set — using insecure dev fallback. Set it before deploying.');
}
