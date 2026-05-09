import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createRequire } from 'node:module';
import qrcode from 'qrcode';

// otplib v13 ships as CommonJS with no real ESM entry. Both
// `import {authenticator}` and `import * as otplib` fail in Node ESM
// (no named/default export, namespace contains undefined fields).
// createRequire is the canonical Node-supported interop path.
const require = createRequire(import.meta.url);
const { authenticator } = require('otplib');
import supabase from '../db/supabase.js';
import requireAuth from '../middleware/auth.js';
import { JWT_SECRET } from '../config.js';
import { isValidEmail, normalizeText } from '../lib/validation.js';

// Allow ±1 step (30 s window) of clock skew between server and authenticator app.
authenticator.options = { window: 1 };

const router = Router();

// Friendly response when /api/auth/login is opened in a browser address bar.
// The actual login form lives at /admin and submits via POST.
router.get('/login', (_req, res) => {
  res
    .status(405)
    .set('Allow', 'POST')
    .json({
      error: 'Method Not Allowed.',
      message: 'POST credentials to this endpoint to obtain a JWT, or visit /admin to use the login form.',
      loginPage: '/admin',
    });
});

router.post('/login', async (req, res) => {
  try {
    const username = normalizeText(req.body.username);
    const password = normalizeText(req.body.password, { trim: false });
    const totpCode = normalizeText(req.body.totp_code, { trim: true });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const { data: user } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 2FA gate. If the account has 2FA enabled, require a valid TOTP code.
    // The client interprets `requires_2fa: true` as a signal to render the
    // 6-digit code field and re-submit with the same credentials + code.
    if (user.totp_enabled) {
      if (!totpCode) {
        return res.status(401).json({
          error: 'Two-factor code required.',
          requires_2fa: true,
        });
      }
      const valid = authenticator.check(totpCode, user.totp_secret || '');
      if (!valid) {
        return res.status(401).json({
          error: 'Invalid two-factor code.',
          requires_2fa: true,
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.json({
      token,
      username: user.username,
      totp_enabled: !!user.totp_enabled,
    });
  } catch (error) {
    console.error('[auth/login]', error);
    return res.status(500).json({ error: 'Unable to complete login right now.' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const currentPassword = normalizeText(req.body.currentPassword, { trim: false });
    const newPassword = normalizeText(req.body.newPassword, { trim: false });

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    if (isValidEmail(newPassword)) {
      return res.status(400).json({ error: 'New password looks invalid. Please choose a secure password.' });
    }

    const { data: user } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', req.admin.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const { error } = await supabase
      .from('admin_users')
      .update({ password_hash: bcrypt.hashSync(newPassword, 10) })
      .eq('id', user.id);

    if (error) throw error;
    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[auth/change-password]', error);
    return res.status(500).json({ error: 'Unable to change the password right now.' });
  }
});

// ---------------------------------------------------------------------------
// 2FA / TOTP enrollment + management
// ---------------------------------------------------------------------------

const TOTP_ISSUER = 'La Norma Admin';

router.get('/2fa/status', requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('admin_users')
      .select('totp_enabled')
      .eq('id', req.admin.id)
      .single();
    res.json({ enabled: !!user?.totp_enabled });
  } catch (error) {
    console.error('[auth/2fa-status]', error);
    res.status(500).json({ error: 'Unable to load 2FA status.' });
  }
});

// Step 1 of enrollment — generate a fresh secret, store it, return a
// QR-data-URL for the client to scan in their authenticator app. The
// secret is NOT enabled until the user verifies a code (step 2).
router.post('/2fa/setup', requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('admin_users')
      .select('id, username, totp_enabled')
      .eq('id', req.admin.id)
      .single();
    if (!user) return res.status(404).json({ error: 'Admin user not found.' });
    if (user.totp_enabled) {
      return res.status(400).json({ error: 'Two-factor is already enabled. Disable it first to re-enroll.' });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.username, TOTP_ISSUER, secret);
    const qrDataUrl = await qrcode.toDataURL(otpauth);

    const { error: upErr } = await supabase
      .from('admin_users')
      .update({ totp_secret: secret })
      .eq('id', user.id);
    if (upErr) throw upErr;

    res.json({ secret, otpauth, qr: qrDataUrl });
  } catch (error) {
    console.error('[auth/2fa-setup]', error);
    res.status(500).json({ error: 'Unable to start 2FA setup.' });
  }
});

// Step 2 — verify a code against the pending secret; on success flip the
// totp_enabled flag.
router.post('/2fa/enable', requireAuth, async (req, res) => {
  try {
    const code = normalizeText(req.body.totp_code, { trim: true });
    if (!code) return res.status(400).json({ error: 'Provide the 6-digit code from your authenticator app.' });

    const { data: user } = await supabase
      .from('admin_users')
      .select('id, totp_secret, totp_enabled')
      .eq('id', req.admin.id)
      .single();
    if (!user) return res.status(404).json({ error: 'Admin user not found.' });
    if (user.totp_enabled) return res.status(400).json({ error: '2FA is already enabled.' });
    if (!user.totp_secret) return res.status(400).json({ error: 'Run setup first.' });

    if (!authenticator.check(code, user.totp_secret)) {
      return res.status(401).json({ error: 'Invalid code. Check your authenticator clock and try again.' });
    }

    const { error: upErr } = await supabase
      .from('admin_users')
      .update({ totp_enabled: true })
      .eq('id', user.id);
    if (upErr) throw upErr;

    res.json({ ok: true, enabled: true });
  } catch (error) {
    console.error('[auth/2fa-enable]', error);
    res.status(500).json({ error: 'Unable to enable 2FA.' });
  }
});

// Disable 2FA — requires a fresh password confirmation. Clears the secret too.
router.post('/2fa/disable', requireAuth, async (req, res) => {
  try {
    const password = normalizeText(req.body.password, { trim: false });
    if (!password) return res.status(400).json({ error: 'Confirm your password to disable 2FA.' });

    const { data: user } = await supabase
      .from('admin_users')
      .select('id, password_hash, totp_enabled')
      .eq('id', req.admin.id)
      .single();
    if (!user) return res.status(404).json({ error: 'Admin user not found.' });
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Password is incorrect.' });
    }

    const { error: upErr } = await supabase
      .from('admin_users')
      .update({ totp_enabled: false, totp_secret: null })
      .eq('id', user.id);
    if (upErr) throw upErr;

    res.json({ ok: true, enabled: false });
  } catch (error) {
    console.error('[auth/2fa-disable]', error);
    res.status(500).json({ error: 'Unable to disable 2FA.' });
  }
});

export default router;
