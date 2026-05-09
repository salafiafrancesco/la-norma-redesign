/**
 * Best-effort admin notifications via Resend.
 *
 * Reads three env vars:
 *   RESEND_API_KEY      — your Resend API key
 *   NOTIFY_EMAIL_FROM   — verified sender (e.g. notifications@yourdomain.com)
 *   NOTIFY_EMAIL_TO     — one or more recipients, comma-separated
 *
 * If any of the three is missing, notifyAdmin() returns silently without
 * throwing — notifications are best-effort and must never break a public
 * form submission. On Vercel Functions we await the send (no fire-and-
 * forget — the function shuts down after the response), but a 5s timeout
 * guards against a hanging Resend request.
 */
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL_FROM = process.env.NOTIFY_EMAIL_FROM;
const NOTIFY_EMAIL_TO = process.env.NOTIFY_EMAIL_TO;
const NOTIFY_TIMEOUT_MS = 5000;

let resendClient = null;
function getClient() {
  if (!RESEND_API_KEY) return null;
  if (!resendClient) {
    try {
      resendClient = new Resend(RESEND_API_KEY);
    } catch (error) {
      console.error('[notify] failed to initialize Resend client:', error);
      return null;
    }
  }
  return resendClient;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Resend send timed out after ${ms}ms`)), ms),
    ),
  ]);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render a list of `{ label, value }` pairs as a clean Resend-friendly HTML
 * block + a plain-text fallback. Skips empty values.
 */
export function renderFields(pairs) {
  const filtered = pairs.filter(([, value]) => value !== undefined && value !== null && value !== '');
  const text = filtered.map(([label, value]) => `${label}: ${value}`).join('\n');
  const rows = filtered
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#6b6b6b;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#1a1a1a;font-size:14px;">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  const html = `<table style="border-collapse:collapse;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${rows}</table>`;
  return { text, html };
}

/**
 * Send an admin notification email. Returns `{ sent, reason?, id? }` for
 * logging — never throws to the caller.
 */
export async function notifyAdmin({ subject, text, html, replyTo }) {
  const client = getClient();
  if (!client || !NOTIFY_EMAIL_FROM || !NOTIFY_EMAIL_TO) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '[notify] skipped — set RESEND_API_KEY, NOTIFY_EMAIL_FROM and NOTIFY_EMAIL_TO env vars on Vercel to enable.',
      );
    }
    return { sent: false, reason: 'env-missing' };
  }

  const to = NOTIFY_EMAIL_TO.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (to.length === 0) {
    return { sent: false, reason: 'no-recipients' };
  }

  try {
    const result = await withTimeout(
      client.emails.send({
        from: NOTIFY_EMAIL_FROM,
        to,
        subject,
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      NOTIFY_TIMEOUT_MS,
    );
    return { sent: true, id: result?.data?.id };
  } catch (error) {
    console.error('[notify] send failed:', error?.message || error);
    return { sent: false, reason: 'send-failed' };
  }
}
