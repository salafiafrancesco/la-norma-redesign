/**
 * Audit log middleware.
 *
 * Captures every non-GET request that passed requireAuth and writes a
 * single row to admin_audit_log AFTER the response is sent (so logging
 * never delays the user). Failures during logging are swallowed — a
 * broken audit log must not break the API.
 *
 * Mount AFTER requireAuth so req.admin is populated.
 */
import supabase from '../db/supabase.js';

const SKIP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const BODY_PREVIEW_MAX = 1000;
const SENSITIVE_KEYS = new Set([
  'password', 'currentPassword', 'newPassword',
  'token', 'jwt', 'secret', 'totp_secret', 'totp_code',
]);

function summarizeBody(body) {
  if (!body || typeof body !== 'object') return '';
  try {
    const redacted = Array.isArray(body) ? body : { ...body };
    if (!Array.isArray(redacted)) {
      for (const key of Object.keys(redacted)) {
        if (SENSITIVE_KEYS.has(key)) redacted[key] = '[REDACTED]';
      }
    }
    let str = JSON.stringify(redacted);
    if (str.length > BODY_PREVIEW_MAX) {
      str = str.slice(0, BODY_PREVIEW_MAX) + '… (truncated)';
    }
    return str;
  } catch {
    return '';
  }
}

export default function auditLog(req, res, next) {
  // Always attach the listener; the auth check happens at finish time so
  // requireAuth (which runs per-route, AFTER this global middleware) has
  // had a chance to populate req.admin.
  res.on('finish', () => {
    if (SKIP_METHODS.has(req.method) || !req.admin) return;

    const row = {
      admin_id: req.admin.id ?? null,
      username: req.admin.username ?? null,
      method: req.method,
      path: req.originalUrl || req.url,
      status_code: res.statusCode,
      body_summary: summarizeBody(req.body) || null,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket?.remoteAddress
        || null,
      user_agent: req.headers['user-agent']?.slice(0, 500) || null,
    };

    supabase
      .from('admin_audit_log')
      .insert(row)
      .then(({ error }) => {
        if (error) console.error('[audit-log] insert failed:', error.message);
      })
      .catch((err) => {
        console.error('[audit-log] insert threw:', err);
      });
  });

  return next();
}
