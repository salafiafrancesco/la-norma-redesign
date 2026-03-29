import { Router } from 'express';
import db, { save, getNextId } from '../db/database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

const today = () => new Date().toISOString().split('T')[0];

// GET /api/classes  — active upcoming classes (public)
router.get('/', (_req, res) => {
  const list = db.data.cooking_classes
    .filter(c => c.active && c.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date));
  res.json(list);
});

// GET /api/classes/all  — all (admin)
router.get('/all', requireAuth, (_req, res) => {
  const list = [...db.data.cooking_classes].sort((a, b) => b.date.localeCompare(a.date));
  res.json(list);
});

// GET /api/classes/:id
router.get('/:id', (req, res) => {
  const cls = db.data.cooking_classes.find(c => c.id === Number(req.params.id));
  if (!cls) return res.status(404).json({ error: 'Class not found' });
  res.json(cls);
});

// POST /api/classes  — create (admin)
router.post('/', requireAuth, (req, res) => {
  const { date, time, theme, short_theme, description, difficulty, price, max_spots, spots_left, active, image_url } = req.body;
  if (!date || !theme) return res.status(400).json({ error: 'date and theme are required' });

  const cls = {
    id:          getNextId('cooking_classes'),
    date,
    time:        time        ?? '10:00 AM \u2013 1:30 PM',
    theme,
    short_theme: short_theme ?? theme,
    description: description ?? '',
    difficulty:  difficulty  ?? 'All levels',
    price:       Number(price ?? 95),
    max_spots:   Number(max_spots ?? 8),
    spots_left:  Number(spots_left ?? max_spots ?? 8),
    active:      active !== false,
    image_url:   image_url   ?? null,
    created_at:  new Date().toISOString(),
    updated_at:  new Date().toISOString(),
  };

  db.data.cooking_classes.push(cls);
  save();
  res.status(201).json(cls);
});

// PUT /api/classes/:id  — update (admin)
router.put('/:id', requireAuth, (req, res) => {
  const idx = db.data.cooking_classes.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Class not found' });

  const old = db.data.cooking_classes[idx];
  const updated = { ...old, ...req.body, id: old.id, updated_at: new Date().toISOString() };
  // Coerce types
  updated.price     = Number(updated.price);
  updated.max_spots = Number(updated.max_spots);
  updated.spots_left = Number(updated.spots_left);
  updated.active    = Boolean(updated.active);

  db.data.cooking_classes[idx] = updated;
  save();
  res.json(updated);
});

// DELETE /api/classes/:id  — delete (admin)
router.delete('/:id', requireAuth, (req, res) => {
  const idx = db.data.cooking_classes.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Class not found' });
  db.data.cooking_classes.splice(idx, 1);
  save();
  res.json({ message: 'Class deleted' });
});

export default router;
