/**
 * init.js — Auto-initializes the database on first run.
 * Called automatically when the server starts.
 * Safe to call multiple times (idempotent).
 */
import bcrypt from 'bcryptjs';
import db, { save } from './database.js';

export function ensureInitialized() {
  // Create admin user if none exists
  if (!db.data.admin_users || db.data.admin_users.length === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'lanorma2025';
    if (!db.data.admin_users) db.data.admin_users = [];
    db.data.admin_users.push({
      id:            1,
      username,
      password_hash: bcrypt.hashSync(password, 10),
    });
    save();
    console.log(`[init] Admin user "${username}" created automatically.`);
    console.log(`[init] Run "npm run seed" via Render Shell to populate site content.`);
  }
}
