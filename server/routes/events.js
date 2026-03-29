import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import db, { save, getNextId } from '../db/database.js';

const router = Router();

// GET /api/events — public, active upcoming events
router.get('/', (req, res) => {
  const { category } = req.query;
  const today = new Date().toISOString().split('T')[0];
  let items = (db.data.events || [])
    .filter(e => e.active && e.date >= today);
  if (category) items = items.filter(e => e.category === category);
  items.sort((a, b) => a.date.localeCompare(b.date));
  res.json(items);
});

// GET /api/events/all — admin
router.get('/all', requireAuth, (req, res) => {
  const { category } = req.query;
  let items = [...(db.data.events || [])];
  if (category) items = items.filter(e => e.category === category);
  items.sort((a, b) => b.date.localeCompare(a.date));
  res.json(items);
});

// GET /api/events/:id — public
router.get('/:id', (req, res) => {
  const item = (db.data.events || []).find(e => e.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Event not found' });
  res.json(item);
});

// POST /api/events — admin create
router.post('/', requireAuth, (req, res) => {
  if (!db.data.events) db.data.events = [];
  const event = {
    id: getNextId('events'),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.data.events.push(event);
  save();
  res.status(201).json(event);
});

// PUT /api/events/:id — admin update
router.put('/:id', requireAuth, (req, res) => {
  if (!db.data.events) db.data.events = [];
  const idx = db.data.events.findIndex(e => e.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });
  db.data.events[idx] = {
    ...db.data.events[idx],
    ...req.body,
    id: db.data.events[idx].id,
    updated_at: new Date().toISOString(),
  };
  save();
  res.json(db.data.events[idx]);
});

// DELETE /api/events/:id — admin delete
router.delete('/:id', requireAuth, (req, res) => {
  if (!db.data.events) db.data.events = [];
  const idx = db.data.events.findIndex(e => e.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });
  db.data.events.splice(idx, 1);
  save();
  res.json({ ok: true });
});

export default router;
