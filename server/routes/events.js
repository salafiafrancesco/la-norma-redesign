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
const EVENT_CATEGORIES = new Set(['wine_tasting', 'live_music']);

function normalizeEventPayload(payload, { partial = false } = {}) {
  if (!isPlainObject(payload)) return { error: 'Body must be a plain object.' };

  const category = payload.category !== undefined ? normalizeText(payload.category) : '';
  const title = payload.title !== undefined ? normalizeText(payload.title) : '';
  const date = payload.date !== undefined ? normalizeIsoDate(payload.date) : '';

  if (!partial && !EVENT_CATEGORIES.has(category)) return { error: 'Category must be wine_tasting or live_music.' };
  if (payload.category !== undefined && !EVENT_CATEGORIES.has(category)) return { error: 'Category must be wine_tasting or live_music.' };
  if (!partial && !title) return { error: 'Title is required.' };
  if (payload.title !== undefined && !title) return { error: 'Title is required.' };
  if (!partial && !date) return { error: 'A valid event date is required.' };
  if (payload.date !== undefined && !date) return { error: 'Date must use YYYY-MM-DD format.' };

  const maxSpots = payload.max_spots !== undefined ? normalizeInteger(payload.max_spots, { min: 0, max: 80, fallback: 0 }) : undefined;
  const spotsLeft = payload.spots_left !== undefined ? normalizeInteger(payload.spots_left, { min: 0, max: maxSpots ?? 80, fallback: 0 }) : undefined;

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

router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let query = supabase.from('events').select('*').eq('active', true).gte('date', today);

    const category = req.query.category ? normalizeText(req.query.category) : '';
    if (category) query = query.eq('category', category);

    query = query.order('date', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[events/list]', error);
    res.status(500).json({ error: 'Unable to load events.' });
  }
});

router.get('/all', requireAuth, async (req, res) => {
  try {
    let query = supabase.from('events').select('*');
    const category = req.query.category ? normalizeText(req.query.category) : '';
    if (category) query = query.eq('category', category);
    query = query.order('date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[events/listAll]', error);
    res.status(500).json({ error: 'Unable to load events.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data } = await supabase.from('events').select('*').eq('id', Number(req.params.id)).single();
    if (!data) return res.status(404).json({ error: 'Event not found.' });
    res.json(data);
  } catch (error) {
    console.error('[events/get]', error);
    res.status(500).json({ error: 'Unable to load event.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = normalizeEventPayload(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const { data, error } = await supabase.from('events').insert(parsed.value).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('[events/create]', error);
    res.status(500).json({ error: 'Unable to create the event.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const parsed = normalizeEventPayload(req.body, { partial: true });
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const updateData = { ...parsed.value, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('events').update(updateData).eq('id', Number(req.params.id)).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Event not found.' });

    if (data.spots_left > data.max_spots) {
      return res.status(400).json({ error: 'Spots left cannot exceed max spots.' });
    }
    res.json(data);
  } catch (error) {
    console.error('[events/update]', error);
    res.status(500).json({ error: 'Unable to update the event.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('events').delete().eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ message: 'Event deleted.' });
  } catch (error) {
    console.error('[events/delete]', error);
    res.status(500).json({ error: 'Unable to delete the event.' });
  }
});

export default router;
