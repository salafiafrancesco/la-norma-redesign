import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import db, { save, getNextId } from '../db/database.js';

const router = Router();

const VALID_TYPES = ['wine_tasting', 'live_music', 'private_event'];

// POST /api/inquiries — public
router.post('/', (req, res) => {
  if (!db.data.inquiries) db.data.inquiries = [];
  const { type, first_name, last_name, email, phone, date, guests, message } = req.body;

  if (!type || !first_name || !last_name || !email) {
    return res.status(400).json({ error: 'type, first_name, last_name, and email are required' });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid inquiry type' });
  }

  const inquiry = {
    id:         getNextId('inquiries'),
    type,
    first_name: first_name.trim(),
    last_name:  last_name.trim(),
    email:      email.trim().toLowerCase(),
    phone:      (phone || '').trim(),
    date:       (date || '').trim(),
    guests:     Math.max(1, Number(guests) || 1),
    message:    (message || '').trim(),
    status:     'new',
    created_at: new Date().toISOString(),
  };

  db.data.inquiries.push(inquiry);
  save();
  res.status(201).json({ ok: true, id: inquiry.id });
});

// GET /api/inquiries — admin
router.get('/', requireAuth, (req, res) => {
  const { type, status } = req.query;
  let items = [...(db.data.inquiries || [])];
  if (type)   items = items.filter(i => i.type === type);
  if (status) items = items.filter(i => i.status === status);
  items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(items);
});

// PUT /api/inquiries/:id — admin update (status, notes, etc.)
router.put('/:id', requireAuth, (req, res) => {
  if (!db.data.inquiries) db.data.inquiries = [];
  const idx = db.data.inquiries.findIndex(i => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Inquiry not found' });
  db.data.inquiries[idx] = {
    ...db.data.inquiries[idx],
    ...req.body,
    id:         db.data.inquiries[idx].id,
    created_at: db.data.inquiries[idx].created_at,
  };
  save();
  res.json(db.data.inquiries[idx]);
});

// DELETE /api/inquiries/:id — admin delete
router.delete('/:id', requireAuth, (req, res) => {
  if (!db.data.inquiries) db.data.inquiries = [];
  const idx = db.data.inquiries.findIndex(i => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Inquiry not found' });
  db.data.inquiries.splice(idx, 1);
  save();
  res.json({ ok: true });
});

export default router;
