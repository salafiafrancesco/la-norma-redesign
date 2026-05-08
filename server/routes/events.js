import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import db, { getNextId, save } from '../db/database.js';
import {
  isPlainObject,
  normalizeBoolean,
  normalizeInteger,
  normalizeIsoDate,
  normalizeNumber,
  normalizeOptionalText,
  normalizeText,
} from '../lib/validation.js';

const router = Router();
const EVENT_CATEGORIES = new Set(['wine_tasting', 'live_music']);

function normalizeEventPayload(payload, { partial = false } = {}) {
  if (!isPlainObject(payload)) return { error: 'Body must be a plain object.' };

  const category = payload.category !== undefined ? normalizeText(payload.category) : '';
  const title = payload.title !== undefined ? normalizeText(payload.title) : '';
  const date = payload.date !== undefined ? normalizeIsoDate(payload.date) : '';

  if (!partial && !EVENT_CATEGORIES.has(category)) {
    return { error: 'Category must be wine_tasting or live_music.' };
  }

  if (payload.category !== undefined && !EVENT_CATEGORIES.has(category)) {
    return { error: 'Category must be wine_tasting or live_music.' };
  }

  if (!partial && !title) return { error: 'Title is required.' };
  if (payload.title !== undefined && !title) return { error: 'Title is required.' };
  if (!partial && !date) return { error: 'A valid event date is required.' };
  if (payload.date !== undefined && !date) return { error: 'Date must use YYYY-MM-DD format.' };

  const maxSpots = payload.max_spots !== undefined
    ? normalizeInteger(payload.max_spots, { min: 0, max: 80, fallback: 0 })
    : undefined;
  const spotsLeft = payload.spots_left !== undefined
    ? normalizeInteger(payload.spots_left, { min: 0, max: maxSpots ?? 80, fallback: 0 })
    : undefined;

  if (maxSpots !== undefined && spotsLeft !== undefined && spotsLeft > maxSpots) {
    return { error: 'Spots left cannot exceed max spots.' };
  }

  return {
    value: {
      ...(payload.category !== undefined || !partial ? { category } : {}),
      ...(payload.title !== undefined || !partial ? { title } : {}),
      ...(payload.description !== undefined || !partial ? { description: normalizeOptionalText(payload.description) } : {}),
      ...(payload.date !== undefined || !partial ? { date } : {}),
      ...(payload.time !== undefined || !partial ? { time: normalizeText(payload.time, { fallback: '6:00 PM - 8:00 PM' }) } : {}),
      ...(payload.price !== undefined || !partial ? { price: normalizeNumber(payload.price, { min: 0, max: 500, fallback: 0 }) } : {}),
      ...(maxSpots !== undefined || !partial ? { max_spots: maxSpots ?? 0 } : {}),
      ...(spotsLeft !== undefined || !partial ? { spots_left: spotsLeft ?? 0 } : {}),
      ...(payload.active !== undefined || !partial ? { active: normalizeBoolean(payload.active, true) } : {}),
      ...(payload.image_url !== undefined || !partial ? { image_url: normalizeOptionalText(payload.image_url) || null } : {}),
    },
  };
}

router.get('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const category = req.query.category ? normalizeText(req.query.category) : '';

  let entries = db.data.events.filter((item) => item.active && item.date >= today);

  if (category) {
    entries = entries.filter((item) => item.category === category);
  }

  entries.sort((left, right) => left.date.localeCompare(right.date));
  res.json(entries);
});

router.get('/all', requireAuth, (req, res) => {
  const category = req.query.category ? normalizeText(req.query.category) : '';
  let entries = [...db.data.events];

  if (category) {
    entries = entries.filter((item) => item.category === category);
  }

  entries.sort((left, right) => right.date.localeCompare(left.date));
  res.json(entries);
});

router.get('/:id', (req, res) => {
  const eventId = Number(req.params.id);
  const entry = db.data.events.find((item) => item.id === eventId);

  if (!entry) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  res.json(entry);
});

router.post('/', requireAuth, (req, res) => {
  const parsed = normalizeEventPayload(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const now = new Date().toISOString();
  const nextEntry = {
    id: getNextId('events'),
    ...parsed.value,
    created_at: now,
    updated_at: now,
  };

  try {
    db.data.events.push(nextEntry);
    save();
    res.status(201).json(nextEntry);
  } catch (error) {
    console.error('[events/create]', error.message);
    res.status(500).json({ error: 'Unable to create the event.' });
  }
});

router.put('/:id', requireAuth, (req, res) => {
  const eventId = Number(req.params.id);
  const index = db.data.events.findIndex((item) => item.id === eventId);

  if (index === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const parsed = normalizeEventPayload(req.body, { partial: true });
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const current = db.data.events[index];
  const nextEntry = {
    ...current,
    ...parsed.value,
    id: current.id,
    updated_at: new Date().toISOString(),
  };

  if (nextEntry.spots_left > nextEntry.max_spots) {
    return res.status(400).json({ error: 'Spots left cannot exceed max spots.' });
  }

  try {
    db.data.events[index] = nextEntry;
    save();
    res.json(nextEntry);
  } catch (error) {
    console.error('[events/update]', error.message);
    res.status(500).json({ error: 'Unable to update the event.' });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  const eventId = Number(req.params.id);
  const index = db.data.events.findIndex((item) => item.id === eventId);

  if (index === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  try {
    db.data.events.splice(index, 1);
    save();
    res.json({ message: 'Event deleted.' });
  } catch (error) {
    console.error('[events/delete]', error.message);
    res.status(500).json({ error: 'Unable to delete the event.' });
  }
});

export default router;
