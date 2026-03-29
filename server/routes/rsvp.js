import { Router } from 'express';
import db, { save, getNextId } from '../db/database.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// POST /api/rsvp  — submit booking (public)
router.post('/', (req, res) => {
  const { class_id, first_name, last_name, email, phone, guests, notes } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name, and email are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const guestsCount = parseInt(guests, 10) || 1;
  let classDate  = null;
  let classTheme = null;

  if (class_id) {
    const cls = db.data.cooking_classes.find(c => c.id === Number(class_id) && c.active);
    if (!cls) return res.status(404).json({ error: 'Class not found or no longer available' });
    if (cls.spots_left < guestsCount) {
      return res.status(409).json({ error: `Only ${cls.spots_left} spot(s) remaining` });
    }
    classDate  = cls.date;
    classTheme = cls.theme;
    // Decrement spots
    cls.spots_left -= guestsCount;
  }

  const record = {
    id:          getNextId('rsvp'),
    class_id:    class_id ? Number(class_id) : null,
    class_date:  classDate,
    class_theme: classTheme,
    first_name,
    last_name,
    email,
    phone:       phone || null,
    guests:      guestsCount,
    notes:       notes || null,
    status:      'pending',
    created_at:  new Date().toISOString(),
  };

  db.data.rsvp.push(record);
  save();

  res.status(201).json({
    id:          record.id,
    message:     'Reservation received. We will confirm within 24 hours.',
    class_date:  classDate,
    class_theme: classTheme,
  });
});

// GET /api/rsvp  — list all (admin)
router.get('/', requireAuth, (req, res) => {
  const { status, class_id } = req.query;
  let list = [...db.data.rsvp];

  if (status)   list = list.filter(r => r.status === status);
  if (class_id) list = list.filter(r => r.class_id === Number(class_id));

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(list);
});

// GET /api/rsvp/:id  — single (admin)
router.get('/:id', requireAuth, (req, res) => {
  const rsvp = db.data.rsvp.find(r => r.id === Number(req.params.id));
  if (!rsvp) return res.status(404).json({ error: 'RSVP not found' });
  res.json(rsvp);
});

// PUT /api/rsvp/:id  — update status (admin)
router.put('/:id', requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });

  const rsvp = db.data.rsvp.find(r => r.id === Number(req.params.id));
  if (!rsvp) return res.status(404).json({ error: 'RSVP not found' });

  rsvp.status = status;
  save();
  res.json(rsvp);
});

// DELETE /api/rsvp/:id  — delete (admin)
router.delete('/:id', requireAuth, (req, res) => {
  const idx = db.data.rsvp.findIndex(r => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'RSVP not found' });
  db.data.rsvp.splice(idx, 1);
  save();
  res.json({ message: 'RSVP deleted' });
});

export default router;
