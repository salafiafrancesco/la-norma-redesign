import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { save } from '../db/database.js';
import requireAuth from '../middleware/auth.js';
import { JWT_SECRET } from '../config.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = db.data.admin_users;
    if (!Array.isArray(users)) {
      console.error('[auth/login] admin_users collection is not initialized');
      return res.status(500).json({ error: 'Server configuration error — admin data unavailable' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      console.error('[auth/login] user record is missing password_hash');
      return res.status(500).json({ error: 'Server configuration error — corrupted user record' });
    }

    const passwordOk = bcrypt.compareSync(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, username: user.username });

  } catch (err) {
    console.error('[auth/login] unexpected error:', err.message, err.stack);
    res.status(500).json({ error: 'Login failed due to a server error' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both fields are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const user = db.data.admin_users.find(u => u.id === req.admin.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password_hash = bcrypt.hashSync(newPassword, 10);
    save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[auth/change-password] unexpected error:', err.message);
    res.status(500).json({ error: 'Password change failed due to a server error' });
  }
});

export default router;
