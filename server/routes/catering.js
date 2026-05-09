import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import {
  cleanObject,
  isPlainObject,
  isValidEmail,
  normalizeInteger,
  normalizeIsoDate,
  normalizeOptionalText,
  normalizeText,
} from '../lib/validation.js';
import { CATERING_EVENT_TYPES, CATERING_REQUEST_STATUSES } from '../../shared/cateringDefaults.js';
import { notifyAdmin, renderFields } from '../lib/notify.js';

const router = Router();
const VALID_TYPES = new Set(CATERING_EVENT_TYPES);
const VALID_STATUSES = new Set(CATERING_REQUEST_STATUSES);

// ---------------------------------------------------------------------------
// Public — submit a catering request
// ---------------------------------------------------------------------------
router.post('/requests', async (req, res) => {
  const name = normalizeText(req.body.name);
  const email = normalizeText(req.body.email, { lowercase: true });
  const phone = normalizeOptionalText(req.body.phone);
  const eventDate = normalizeIsoDate(req.body.event_date);
  const eventType = normalizeOptionalText(req.body.event_type);
  const guests = req.body.guests != null
    ? normalizeInteger(req.body.guests, { min: 1, max: 5000, fallback: null })
    : null;
  const message = normalizeOptionalText(req.body.message);
  const locationType = normalizeOptionalText(req.body.location_type);
  const budgetRange = normalizeOptionalText(req.body.budget_range);

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (eventType && !VALID_TYPES.has(eventType)) {
    return res.status(400).json({ error: 'Event type is invalid.' });
  }

  try {
    const { data, error } = await supabase
      .from('catering_requests')
      .insert({
        name,
        email,
        phone,
        event_date: eventDate || null,
        event_type: eventType || null,
        guests,
        message,
        location_type: locationType || null,
        budget_range: budgetRange || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw error;

    const { text, html } = renderFields([
      ['Name', name],
      ['Email', email],
      ['Phone', phone || '—'],
      ['Event date', eventDate || 'Flexible'],
      ['Event type', eventType || '—'],
      ['Guests', guests ?? '—'],
      ['Location type', locationType || '—'],
      ['Budget range', budgetRange || '—'],
      ['Message', message || '—'],
    ]);
    await notifyAdmin({
      subject: `New catering request — ${name}${eventType ? ` (${eventType})` : ''}`,
      text,
      html,
      replyTo: email,
    });

    res.status(201).json({ ok: true, id: data.id });
  } catch (error) {
    console.error('[catering/create]', error);
    res.status(500).json({ error: 'Unable to submit the catering request.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — list all catering requests
// ---------------------------------------------------------------------------
router.get('/requests', requireAuth, async (req, res) => {
  try {
    let query = supabase.from('catering_requests').select('*');

    const status = req.query.status ? normalizeText(req.query.status) : '';
    if (status) query = query.eq('status', status);

    const eventType = req.query.event_type ? normalizeText(req.query.event_type) : '';
    if (eventType) query = query.eq('event_type', eventType);

    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[catering/list]', error);
    res.status(500).json({ error: 'Unable to load catering requests.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — update a catering request (status, notes)
// ---------------------------------------------------------------------------
router.put('/requests/:id', requireAuth, async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Body must be a plain object.' });
  }

  try {
    const requestId = Number(req.params.id);
    const { data: current } = await supabase
      .from('catering_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!current) return res.status(404).json({ error: 'Catering request not found.' });

    if (req.body.status && !VALID_STATUSES.has(normalizeText(req.body.status))) {
      return res.status(400).json({ error: 'Status must be new, contacted, or closed.' });
    }

    const updateData = cleanObject({
      status: req.body.status ? normalizeText(req.body.status) : undefined,
      phone: req.body.phone !== undefined ? normalizeOptionalText(req.body.phone) : undefined,
      event_date: req.body.event_date !== undefined ? (normalizeIsoDate(req.body.event_date) || null) : undefined,
      event_type: req.body.event_type !== undefined ? normalizeOptionalText(req.body.event_type) : undefined,
      guests: req.body.guests !== undefined
        ? (req.body.guests != null ? normalizeInteger(req.body.guests, { min: 1, max: 5000, fallback: null }) : null)
        : undefined,
      message: req.body.message !== undefined ? normalizeOptionalText(req.body.message) : undefined,
      updated_at: new Date().toISOString(),
    });

    const { data: updated, error } = await supabase
      .from('catering_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (error) {
    console.error('[catering/update]', error);
    res.status(500).json({ error: 'Unable to update the catering request.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — delete a catering request
// ---------------------------------------------------------------------------
router.delete('/requests/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('catering_requests')
      .delete()
      .eq('id', Number(req.params.id));

    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('[catering/delete]', error);
    res.status(500).json({ error: 'Unable to delete the catering request.' });
  }
});

export default router;
