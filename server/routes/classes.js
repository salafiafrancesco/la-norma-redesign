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

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function normalizeClassPayload(payload, { partial = false } = {}) {
  if (!isPlainObject(payload)) return { error: 'Body must be a plain object.' };

  const date = payload.date !== undefined ? normalizeIsoDate(payload.date) : '';
  const theme = payload.theme !== undefined ? normalizeText(payload.theme) : '';

  if (!partial && !date) return { error: 'A valid date is required.' };
  if (!partial && !theme) return { error: 'Theme is required.' };
  if (payload.date !== undefined && !date) return { error: 'Date must use YYYY-MM-DD format.' };
  if (payload.theme !== undefined && !theme) return { error: 'Theme is required.' };

  const maxSpots = payload.max_spots !== undefined
    ? normalizeInteger(payload.max_spots, { min: 1, max: 24, fallback: 8 })
    : undefined;

  const spotsLeft = payload.spots_left !== undefined
    ? normalizeInteger(payload.spots_left, {
      min: 0,
      max: maxSpots ?? 24,
      fallback: maxSpots ?? 8,
    })
    : undefined;

  if (maxSpots !== undefined && spotsLeft !== undefined && spotsLeft > maxSpots) {
    return { error: 'Spots left cannot exceed max spots.' };
  }

  return {
    value: {
      ...(payload.date !== undefined || !partial ? { date } : {}),
      ...(payload.time !== undefined || !partial ? { time: normalizeText(payload.time, { fallback: '10:00 AM - 1:30 PM' }) } : {}),
      ...(payload.theme !== undefined || !partial ? { theme } : {}),
      ...(payload.short_theme !== undefined || !partial ? { short_theme: normalizeText(payload.short_theme, { fallback: theme || normalizeText(payload.theme) }) } : {}),
      ...(payload.description !== undefined || !partial ? { description: normalizeOptionalText(payload.description) } : {}),
      ...(payload.difficulty !== undefined || !partial ? { difficulty: normalizeText(payload.difficulty, { fallback: 'All levels' }) } : {}),
      ...(payload.price !== undefined || !partial ? { price: normalizeNumber(payload.price, { min: 0, max: 500, fallback: 95 }) } : {}),
      ...(maxSpots !== undefined || !partial ? { max_spots: maxSpots ?? 8 } : {}),
      ...(spotsLeft !== undefined || !partial ? { spots_left: spotsLeft ?? maxSpots ?? 8 } : {}),
      ...(payload.active !== undefined || !partial ? { active: normalizeBoolean(payload.active, true) } : {}),
      ...(payload.image_url !== undefined || !partial ? { image_url: normalizeOptionalText(payload.image_url) || null } : {}),
    },
  };
}

router.get('/', (_req, res) => {
  const upcomingClasses = db.data.cooking_classes
    .filter((entry) => entry.active && entry.date >= todayIso())
    .sort((left, right) => left.date.localeCompare(right.date));

  res.json(upcomingClasses);
});

router.get('/all', requireAuth, (_req, res) => {
  const allClasses = [...db.data.cooking_classes].sort((left, right) =>
    right.date.localeCompare(left.date),
  );

  res.json(allClasses);
});

router.get('/:id', (req, res) => {
  const classId = Number(req.params.id);
  const entry = db.data.cooking_classes.find((item) => item.id === classId);

  if (!entry) {
    return res.status(404).json({ error: 'Cooking class not found.' });
  }

  res.json(entry);
});

router.post('/', requireAuth, (req, res) => {
  const parsed = normalizeClassPayload(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const now = new Date().toISOString();
  const nextEntry = {
    id: getNextId('cooking_classes'),
    ...parsed.value,
    created_at: now,
    updated_at: now,
  };

  db.data.cooking_classes.push(nextEntry);
  save();
  res.status(201).json(nextEntry);
});

router.put('/:id', requireAuth, (req, res) => {
  const classId = Number(req.params.id);
  const index = db.data.cooking_classes.findIndex((item) => item.id === classId);

  if (index === -1) {
    return res.status(404).json({ error: 'Cooking class not found.' });
  }

  const parsed = normalizeClassPayload(req.body, { partial: true });
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const current = db.data.cooking_classes[index];
  const nextEntry = {
    ...current,
    ...parsed.value,
    id: current.id,
    updated_at: new Date().toISOString(),
  };

  if (nextEntry.spots_left > nextEntry.max_spots) {
    return res.status(400).json({ error: 'Spots left cannot exceed max spots.' });
  }

  db.data.cooking_classes[index] = nextEntry;
  save();
  res.json(nextEntry);
});

router.delete('/:id', requireAuth, (req, res) => {
  const classId = Number(req.params.id);
  const index = db.data.cooking_classes.findIndex((item) => item.id === classId);

  if (index === -1) {
    return res.status(404).json({ error: 'Cooking class not found.' });
  }

  db.data.cooking_classes.splice(index, 1);
  save();
  res.json({ message: 'Cooking class deleted.' });
});

export default router;
