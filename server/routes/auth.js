import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { save } from '../db/database.js';
import requireAuth from '../middleware/auth.js';
import { JWT_SECRET } from '../config.js';
import { isValidEmail, normalizeText } from '../lib/validation.js';

const router = Router();

router.post('/login', (req, res) => {
  try {
    const username = normalizeText(req.body.username);
    const password = normalizeText(req.body.password, { trim: false });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = db.data.admin_users.find((entry) => entry.username === username);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.json({ token, username: user.username });
  } catch (error) {
    console.error('[auth/login]', error);
    return res.status(500).json({ error: 'Unable to complete login right now.' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

router.post('/change-password', requireAuth, (req, res) => {
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
      // Gentle guard against pasting the wrong value into the password field.
      return res.status(400).json({ error: 'New password looks invalid. Please choose a secure password.' });
    }

    const user = db.data.admin_users.find((entry) => entry.id === req.admin.id);
    if (!user) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password_hash = bcrypt.hashSync(newPassword, 10);
    save();
    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[auth/change-password]', error);
    return res.status(500).json({ error: 'Unable to change the password right now.' });
  }
});

export default router;
