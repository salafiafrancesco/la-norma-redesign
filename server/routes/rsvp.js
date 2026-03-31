import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import db, { getNextId, save } from '../db/database.js';
import {
  isValidEmail,
  normalizeInteger,
  normalizeOptionalText,
  normalizeText,
} from '../lib/validation.js';

const router = Router();
const RSVP_STATUSES = new Set(['pending', 'confirmed', 'cancelled']);

function findClass(classId) {
  return db.data.cooking_classes.find((entry) => entry.id === Number(classId));
}

function shouldHoldInventory(record) {
  if (!record.class_id) return false;
  if (typeof record.inventory_applied === 'boolean') return record.inventory_applied;
  return record.status !== 'cancelled';
}

function reserveSeats(record) {
  if (!record.class_id) return;

  const selectedClass = findClass(record.class_id);
  if (!selectedClass || !selectedClass.active) {
    throw new Error('Selected class is no longer available.');
  }

  if (selectedClass.spots_left < record.guests) {
    throw new Error(`Only ${selectedClass.spots_left} spot(s) remain for this class.`);
  }

  selectedClass.spots_left -= record.guests;
  record.inventory_applied = true;
}

function releaseSeats(record) {
  if (!record.class_id || !shouldHoldInventory(record)) return;

  const selectedClass = findClass(record.class_id);
  if (selectedClass) {
    selectedClass.spots_left = Math.min(
      selectedClass.max_spots,
      selectedClass.spots_left + record.guests,
    );
  }

  record.inventory_applied = false;
}

router.post('/', (req, res) => {
  const firstName = normalizeText(req.body.first_name);
  const lastName = normalizeText(req.body.last_name);
  const email = normalizeText(req.body.email, { lowercase: true });
  const phone = normalizeOptionalText(req.body.phone);
  const notes = normalizeOptionalText(req.body.notes);
  const guests = normalizeInteger(req.body.guests, { min: 1, max: 8, fallback: 1 });
  const classId = req.body.class_id ? Number(req.body.class_id) : null;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  let classDate = '';
  let classTheme = '';

  if (classId) {
    const selectedClass = findClass(classId);
    if (!selectedClass || !selectedClass.active) {
      return res.status(404).json({ error: 'Selected class is no longer available.' });
    }

    classDate = selectedClass.date;
    classTheme = selectedClass.theme;
  }

  const nextRecord = {
    id: getNextId('rsvp'),
    class_id: classId,
    class_date: classDate,
    class_theme: classTheme,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    guests,
    notes: notes || null,
    status: 'pending',
    inventory_applied: false,
    created_at: new Date().toISOString(),
  };

  try {
    if (classId) {
      reserveSeats(nextRecord);
    }

    db.data.rsvp.push(nextRecord);
    save();
  } catch (error) {
    return res.status(409).json({ error: error.message });
  }

  return res.status(201).json({
    id: nextRecord.id,
    message: 'Reservation received. We will confirm availability within 24 hours.',
    class_date: classDate,
    class_theme: classTheme,
  });
});

router.get('/', requireAuth, (req, res) => {
  const status = req.query.status ? normalizeText(req.query.status) : '';
  const classId = req.query.class_id ? Number(req.query.class_id) : null;

  let records = [...db.data.rsvp];

  if (status) {
    records = records.filter((entry) => entry.status === status);
  }

  if (classId) {
    records = records.filter((entry) => entry.class_id === classId);
  }

  records.sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
  res.json(records);
});

router.get('/:id', requireAuth, (req, res) => {
  const recordId = Number(req.params.id);
  const record = db.data.rsvp.find((entry) => entry.id === recordId);

  if (!record) {
    return res.status(404).json({ error: 'RSVP not found.' });
  }

  res.json(record);
});

router.put('/:id', requireAuth, (req, res) => {
  const nextStatus = normalizeText(req.body.status);
  if (!RSVP_STATUSES.has(nextStatus)) {
    return res.status(400).json({ error: 'Status must be pending, confirmed, or cancelled.' });
  }

  const recordId = Number(req.params.id);
  const record = db.data.rsvp.find((entry) => entry.id === recordId);

  if (!record) {
    return res.status(404).json({ error: 'RSVP not found.' });
  }

  try {
    const wasHoldingInventory = shouldHoldInventory(record);
    const shouldHoldNext = nextStatus !== 'cancelled' && Boolean(record.class_id);

    if (wasHoldingInventory && !shouldHoldNext) {
      releaseSeats(record);
    }

    if (!wasHoldingInventory && shouldHoldNext) {
      reserveSeats(record);
    }

    record.status = nextStatus;
    save();
    return res.json(record);
  } catch (error) {
    return res.status(409).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  const recordId = Number(req.params.id);
  const index = db.data.rsvp.findIndex((entry) => entry.id === recordId);

  if (index === -1) {
    return res.status(404).json({ error: 'RSVP not found.' });
  }

  const record = db.data.rsvp[index];
  releaseSeats(record);
  db.data.rsvp.splice(index, 1);
  save();

  res.json({ message: 'RSVP deleted.' });
});

export default router;
