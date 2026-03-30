import { Router } from 'express';
import db, { save } from '../db/database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// Build flat section object from stored { key: { value, type } } map
function buildSection(raw = {}) {
  const out = {};
  for (const [key, meta] of Object.entries(raw)) {
    out[key] = meta.type === 'json'
      ? (typeof meta.value === 'string' ? JSON.parse(meta.value) : meta.value)
      : meta.value;
  }
  return out;
}

// GET /api/content  — all sections (public)
router.get('/', (_req, res) => {
  const result = {};
  for (const [section, keys] of Object.entries(db.data.site_content)) {
    result[section] = buildSection(keys);
  }
  res.json(result);
});

// GET /api/content/:section  — single section (public)
router.get('/:section', (req, res) => {
  if (!db.data.site_content) db.data.site_content = {};
  const raw = db.data.site_content[req.params.section];
  // Return empty object instead of 404 so the admin editor shows empty fields
  res.json(raw ? buildSection(raw) : {});
});

// PUT /api/content/:section  — update section (admin only)
router.put('/:section', requireAuth, (req, res) => {
  const { section } = req.params;
  const updates = req.body;

  if (typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ error: 'Body must be a plain object' });
  }

  if (!db.data.site_content[section]) db.data.site_content[section] = {};

  for (const [key, value] of Object.entries(updates)) {
    const isJson = typeof value === 'object' && value !== null;
    db.data.site_content[section][key] = {
      value: isJson ? JSON.stringify(value) : String(value ?? ''),
      type:  isJson ? 'json' : 'text',
    };
  }

  save();
  res.json(buildSection(db.data.site_content[section]));
});

export default router;
