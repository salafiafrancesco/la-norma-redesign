import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import {
  cleanObject,
  isPlainObject,
  isValidEmail,
  normalizeGuestSelection,
  normalizeIsoDate,
  normalizeOptionalText,
  normalizeText,
} from '../lib/validation.js';
import { notifyAdmin, renderFields } from '../lib/notify.js';

const router = Router();
const INQUIRY_TYPES = new Set(['wine_tasting', 'live_music', 'private_event', 'contact']);
const INQUIRY_STATUSES = new Set(['new', 'read', 'replied']);

router.post('/', async (req, res) => {
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

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
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
      })
      .select()
      .single();

    if (error) throw error;

    const typeLabel = type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const { text, html } = renderFields([
      ['Type', typeLabel],
      ['Name', `${firstName} ${lastName}`],
      ['Email', email],
      ['Phone', phone || '—'],
      ['Date', date || 'Flexible'],
      ['Guests', guestSelection.display || '—'],
      ['Occasion', occasion || '—'],
      ['Message', message || '—'],
    ]);
    await notifyAdmin({
      subject: `New ${typeLabel} inquiry — ${firstName} ${lastName}`,
      text,
      html,
      replyTo: email,
    });

    res.status(201).json({ ok: true, id: data.id });
  } catch (error) {
    console.error('[inquiries/create]', error);
    res.status(500).json({ error: 'Unable to submit the inquiry.' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    let query = supabase.from('inquiries').select('*');

    const type = req.query.type ? normalizeText(req.query.type) : '';
    if (type) query = query.eq('type', type);

    const status = req.query.status ? normalizeText(req.query.status) : '';
    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[inquiries/list]', error);
    res.status(500).json({ error: 'Unable to load inquiries.' });
  }
});

// Bulk status change. Body: { ids: number[], status: string }.
// Defined BEFORE /:id so the literal /bulk-status path wins the route match.
router.put('/bulk-status', requireAuth, async (req, res) => {
  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids.map((v) => Number(v)).filter((n) => Number.isFinite(n))
    : [];
  const status = normalizeText(req.body?.status);

  if (ids.length === 0) return res.status(400).json({ error: 'Provide at least one id.' });
  if (!INQUIRY_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Status must be new, read, or replied.' });
  }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .select();
    if (error) throw error;
    res.json({ ok: true, updated: data?.length ?? 0, items: data || [] });
  } catch (error) {
    console.error('[inquiries/bulk-status]', error);
    res.status(500).json({ error: 'Unable to update inquiries.' });
  }
});

// Bulk delete. Body: { ids: number[] }.
router.delete('/bulk', requireAuth, async (req, res) => {
  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids.map((v) => Number(v)).filter((n) => Number.isFinite(n))
    : [];
  if (ids.length === 0) return res.status(400).json({ error: 'Provide at least one id.' });

  try {
    const { error } = await supabase.from('inquiries').delete().in('id', ids);
    if (error) throw error;
    res.json({ ok: true, deleted: ids.length });
  } catch (error) {
    console.error('[inquiries/bulk-delete]', error);
    res.status(500).json({ error: 'Unable to delete inquiries.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Body must be a plain object.' });
  }

  try {
    const inquiryId = Number(req.params.id);
    const { data: current } = await supabase.from('inquiries').select('*').eq('id', inquiryId).single();
    if (!current) return res.status(404).json({ error: 'Inquiry not found.' });

    if (req.body.status && !INQUIRY_STATUSES.has(normalizeText(req.body.status))) {
      return res.status(400).json({ error: 'Status must be new, read, or replied.' });
    }

    const guestSelection = req.body.guests !== undefined || req.body.guest_label !== undefined
      ? normalizeGuestSelection(req.body.guests ?? current.guests, req.body.guest_label ?? current.guest_label)
      : null;

    const updateData = cleanObject({
      status: req.body.status ? normalizeText(req.body.status) : undefined,
      phone: req.body.phone !== undefined ? normalizeOptionalText(req.body.phone) : undefined,
      date: req.body.date !== undefined ? normalizeIsoDate(req.body.date) : undefined,
      occasion: req.body.occasion !== undefined ? normalizeOptionalText(req.body.occasion) : undefined,
      message: req.body.message !== undefined ? normalizeOptionalText(req.body.message) : undefined,
      event_id: req.body.event_id !== undefined ? (req.body.event_id ? Number(req.body.event_id) : null) : undefined,
      guests: guestSelection?.display,
      guest_count: guestSelection?.count,
      guest_label: guestSelection?.label,
      updated_at: new Date().toISOString(),
    });

    const { data: updated, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (error) {
    console.error('[inquiries/update]', error);
    res.status(500).json({ error: 'Unable to update the inquiry.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('inquiries').delete().eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('[inquiries/delete]', error);
    res.status(500).json({ error: 'Unable to delete the inquiry.' });
  }
});

export default router;
