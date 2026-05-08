import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import {
  cleanObject,
  isPlainObject,
  normalizeInteger,
  normalizeIsoDate,
  normalizeOptionalText,
  normalizeText,
} from '../lib/validation.js';

const router = Router();
const VALID_TYPES = new Set(['cooking_class', 'wine_tasting', 'live_music']);
const VALID_STATUSES = new Set(['draft', 'published', 'cancelled', 'sold_out']);

// ---------------------------------------------------------------------------
// Public — list published events (optionally filter by type)
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('experience_events')
      .select('*')
      .eq('status', 'published')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    const type = req.query.type ? normalizeText(req.query.type) : '';
    if (type && VALID_TYPES.has(type)) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[experience-events/list]', error);
    res.status(500).json({ error: 'Unable to load events.' });
  }
});

// ---------------------------------------------------------------------------
// Public — single event by ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('experience_events')
      .select('*')
      .eq('id', Number(req.params.id))
      .single();

    if (error || !data) return res.status(404).json({ error: 'Event not found.' });
    res.json(data);
  } catch (error) {
    console.error('[experience-events/get]', error);
    res.status(500).json({ error: 'Unable to load event.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — list ALL events (any status, any date)
// ---------------------------------------------------------------------------
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    let query = supabase
      .from('experience_events')
      .select('*')
      .order('date', { ascending: false });

    const type = req.query.type ? normalizeText(req.query.type) : '';
    if (type && VALID_TYPES.has(type)) query = query.eq('type', type);

    const status = req.query.status ? normalizeText(req.query.status) : '';
    if (status && VALID_STATUSES.has(status)) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[experience-events/admin-list]', error);
    res.status(500).json({ error: 'Unable to load events.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — create event
// ---------------------------------------------------------------------------
router.post('/', requireAuth, async (req, res) => {
  const type = normalizeText(req.body.type);
  const title = normalizeText(req.body.title);
  const date = normalizeIsoDate(req.body.date);
  const startTime = normalizeText(req.body.start_time);

  if (!VALID_TYPES.has(type)) return res.status(400).json({ error: 'Invalid event type.' });
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  if (!date) return res.status(400).json({ error: 'Valid date (YYYY-MM-DD) is required.' });
  if (!startTime) return res.status(400).json({ error: 'Start time is required.' });

  try {
    const row = {
      type,
      title,
      description: normalizeOptionalText(req.body.description),
      date,
      start_time: startTime,
      end_time: normalizeOptionalText(req.body.end_time),
      price_cents: normalizeInteger(req.body.price_cents, { min: 0, max: 100000, fallback: 0 }),
      currency: normalizeText(req.body.currency, { fallback: 'USD' }),
      capacity: normalizeInteger(req.body.capacity, { min: 0, max: 200, fallback: 0 }),
      seats_booked: 0,
      difficulty: normalizeOptionalText(req.body.difficulty),
      image_url: normalizeOptionalText(req.body.image_url),
      status: VALID_STATUSES.has(req.body.status) ? req.body.status : 'published',
    };

    const { data, error } = await supabase.from('experience_events').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('[experience-events/create]', error);
    res.status(500).json({ error: 'Unable to create event.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — update event
// ---------------------------------------------------------------------------
router.put('/:id', requireAuth, async (req, res) => {
  if (!isPlainObject(req.body)) return res.status(400).json({ error: 'Body must be a plain object.' });

  try {
    const eventId = Number(req.params.id);
    const { data: current } = await supabase.from('experience_events').select('*').eq('id', eventId).single();
    if (!current) return res.status(404).json({ error: 'Event not found.' });

    const updateData = cleanObject({
      title: req.body.title !== undefined ? normalizeText(req.body.title) : undefined,
      description: req.body.description !== undefined ? normalizeOptionalText(req.body.description) : undefined,
      date: req.body.date !== undefined ? normalizeIsoDate(req.body.date) : undefined,
      start_time: req.body.start_time !== undefined ? normalizeText(req.body.start_time) : undefined,
      end_time: req.body.end_time !== undefined ? normalizeOptionalText(req.body.end_time) : undefined,
      price_cents: req.body.price_cents !== undefined ? normalizeInteger(req.body.price_cents, { min: 0, max: 100000 }) : undefined,
      capacity: req.body.capacity !== undefined ? normalizeInteger(req.body.capacity, { min: 0, max: 200 }) : undefined,
      difficulty: req.body.difficulty !== undefined ? normalizeOptionalText(req.body.difficulty) : undefined,
      image_url: req.body.image_url !== undefined ? normalizeOptionalText(req.body.image_url) : undefined,
      status: req.body.status !== undefined && VALID_STATUSES.has(req.body.status) ? req.body.status : undefined,
      updated_at: new Date().toISOString(),
    });

    const { data: updated, error } = await supabase.from('experience_events').update(updateData).eq('id', eventId).select().single();
    if (error) throw error;
    res.json(updated);
  } catch (error) {
    console.error('[experience-events/update]', error);
    res.status(500).json({ error: 'Unable to update event.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — delete event
// ---------------------------------------------------------------------------
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('experience_events').delete().eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('[experience-events/delete]', error);
    res.status(500).json({ error: 'Unable to delete event.' });
  }
});

export default router;
