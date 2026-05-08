import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
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
    ? normalizeInteger(payload.spots_left, { min: 0, max: maxSpots ?? 24, fallback: maxSpots ?? 8 })
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

router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('cooking_classes')
      .select('*')
      .eq('active', true)
      .gte('date', todayIso())
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[classes/list]', error);
    res.status(500).json({ error: 'Unable to load classes.' });
  }
});

router.get('/all', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('cooking_classes')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[classes/listAll]', error);
    res.status(500).json({ error: 'Unable to load classes.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cooking_classes')
      .select('*')
      .eq('id', Number(req.params.id))
      .single();

    if (error || !data) return res.status(404).json({ error: 'Cooking class not found.' });
    res.json(data);
  } catch (error) {
    console.error('[classes/get]', error);
    res.status(500).json({ error: 'Unable to load class.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = normalizeClassPayload(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const { data, error } = await supabase
      .from('cooking_classes')
      .insert(parsed.value)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('[classes/create]', error);
    res.status(500).json({ error: 'Unable to create the cooking class.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const parsed = normalizeClassPayload(req.body, { partial: true });
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const updateData = { ...parsed.value, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('cooking_classes')
      .update(updateData)
      .eq('id', classId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cooking class not found.' });

    if (data.spots_left > data.max_spots) {
      return res.status(400).json({ error: 'Spots left cannot exceed max spots.' });
    }

    res.json(data);
  } catch (error) {
    console.error('[classes/update]', error);
    res.status(500).json({ error: 'Unable to update the cooking class.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('cooking_classes')
      .delete()
      .eq('id', Number(req.params.id));

    if (error) throw error;
    res.json({ message: 'Cooking class deleted.' });
  } catch (error) {
    console.error('[classes/delete]', error);
    res.status(500).json({ error: 'Unable to delete the cooking class.' });
  }
});

export default router;
