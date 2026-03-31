import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import db, { getNextId, save } from '../db/database.js';
import {
  cleanObject,
  isPlainObject,
  isValidEmail,
  normalizeGuestSelection,
  normalizeIsoDate,
  normalizeOptionalText,
  normalizeText,
} from '../lib/validation.js';

const router = Router();

const INQUIRY_TYPES = new Set(['wine_tasting', 'live_music', 'private_event']);
const INQUIRY_STATUSES = new Set(['new', 'read', 'replied']);

router.post('/', (req, res) => {
  const type = normalizeText(req.body.type);
  const firstName = normalizeText(req.body.first_name);
  const lastName = normalizeText(req.body.last_name);
  const email = normalizeText(req.body.email, { lowercase: true });
  const phone = normalizeOptionalText(req.body.phone);
  const date = normalizeIsoDate(req.body.date);
  const occasion = normalizeOptionalText(req.body.occasion);
  const message = normalizeOptionalText(req.body.message);

  if (!INQUIRY_TYPES.has(type)) {
    return res.status(400).json({ error: 'Inquiry type is invalid.' });
  }

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const guestSelection = normalizeGuestSelection(req.body.guests, req.body.guest_label);
  const now = new Date().toISOString();

  const inquiry = {
    id: getNextId('inquiries'),
    type,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    date,
    guests: guestSelection.display,
    guest_count: guestSelection.count,
    guest_label: guestSelection.label,
    event_id: req.body.event_id ? Number(req.body.event_id) : null,
    occasion,
    message,
    status: 'new',
    created_at: now,
    updated_at: now,
  };

  db.data.inquiries.push(inquiry);
  save();

  res.status(201).json({ ok: true, id: inquiry.id });
});

router.get('/', requireAuth, (req, res) => {
  const type = req.query.type ? normalizeText(req.query.type) : '';
  const status = req.query.status ? normalizeText(req.query.status) : '';

  let inquiries = [...db.data.inquiries];

  if (type) {
    inquiries = inquiries.filter((entry) => entry.type === type);
  }

  if (status) {
    inquiries = inquiries.filter((entry) => entry.status === status);
  }

  inquiries.sort((left, right) => right.created_at.localeCompare(left.created_at));
  res.json(inquiries);
});

router.put('/:id', requireAuth, (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Body must be a plain object.' });
  }

  const inquiryId = Number(req.params.id);
  const index = db.data.inquiries.findIndex((entry) => entry.id === inquiryId);

  if (index === -1) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }

  if (req.body.status && !INQUIRY_STATUSES.has(normalizeText(req.body.status))) {
    return res.status(400).json({ error: 'Status must be new, read, or replied.' });
  }

  const current = db.data.inquiries[index];
  const guestSelection = req.body.guests !== undefined || req.body.guest_label !== undefined
    ? normalizeGuestSelection(req.body.guests ?? current.guests, req.body.guest_label ?? current.guest_label)
    : null;

  const nextEntry = {
    ...current,
    ...cleanObject({
      status: req.body.status ? normalizeText(req.body.status) : undefined,
      phone: req.body.phone !== undefined ? normalizeOptionalText(req.body.phone) : undefined,
      date: req.body.date !== undefined ? normalizeIsoDate(req.body.date) : undefined,
      occasion: req.body.occasion !== undefined ? normalizeOptionalText(req.body.occasion) : undefined,
      message: req.body.message !== undefined ? normalizeOptionalText(req.body.message) : undefined,
      event_id: req.body.event_id !== undefined ? (req.body.event_id ? Number(req.body.event_id) : null) : undefined,
      guests: guestSelection?.display,
      guest_count: guestSelection?.count,
      guest_label: guestSelection?.label,
    }),
    id: current.id,
    created_at: current.created_at,
    updated_at: new Date().toISOString(),
  };

  db.data.inquiries[index] = nextEntry;
  save();
  res.json(nextEntry);
});

router.delete('/:id', requireAuth, (req, res) => {
  const inquiryId = Number(req.params.id);
  const index = db.data.inquiries.findIndex((entry) => entry.id === inquiryId);

  if (index === -1) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }

  db.data.inquiries.splice(index, 1);
  save();
  res.json({ ok: true });
});

export default router;
