import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import {
  isValidEmail,
  normalizeInteger,
  normalizeOptionalText,
  normalizeText,
} from '../lib/validation.js';

const router = Router();
const RSVP_STATUSES = new Set(['pending', 'confirmed', 'cancelled']);

async function findClass(classId) {
  const { data } = await supabase
    .from('cooking_classes')
    .select('*')
    .eq('id', Number(classId))
    .single();
  return data;
}

async function reserveSeats(classId, guests) {
  const selectedClass = await findClass(classId);
  if (!selectedClass || !selectedClass.active) {
    throw new Error('Selected class is no longer available.');
  }

  const safeGuests = Math.max(1, guests);
  if (selectedClass.spots_left < safeGuests) {
    throw new Error(`Only ${selectedClass.spots_left} spot(s) remain for this class.`);
  }

  const { error } = await supabase
    .from('cooking_classes')
    .update({ spots_left: Math.max(0, selectedClass.spots_left - safeGuests) })
    .eq('id', classId);

  if (error) throw error;
}

async function releaseSeats(classId, guests) {
  if (!classId) return;

  const selectedClass = await findClass(classId);
  if (!selectedClass) return;

  const safeGuests = Math.max(1, guests);
  const { error } = await supabase
    .from('cooking_classes')
    .update({
      spots_left: Math.min(selectedClass.max_spots, selectedClass.spots_left + safeGuests),
    })
    .eq('id', classId);

  if (error) throw error;
}

router.post('/', async (req, res) => {
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
    const selectedClass = await findClass(classId);
    if (!selectedClass || !selectedClass.active) {
      return res.status(404).json({ error: 'Selected class is no longer available.' });
    }
    classDate = selectedClass.date;
    classTheme = selectedClass.theme;
  }

  try {
    if (classId) {
      await reserveSeats(classId, guests);
    }

    const { data, error } = await supabase
      .from('rsvp')
      .insert({
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
        inventory_applied: Boolean(classId),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      id: data.id,
      message: 'Reservation received. We will confirm availability within 24 hours.',
      class_date: classDate,
      class_theme: classTheme,
    });
  } catch (error) {
    return res.status(409).json({ error: error.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    let query = supabase.from('rsvp').select('*');

    const status = req.query.status ? normalizeText(req.query.status) : '';
    if (status) query = query.eq('status', status);

    const classId = req.query.class_id ? Number(req.query.class_id) : null;
    if (classId) query = query.eq('class_id', classId);

    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[rsvp/list]', error);
    res.status(500).json({ error: 'Unable to load RSVPs.' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data } = await supabase.from('rsvp').select('*').eq('id', Number(req.params.id)).single();
    if (!data) return res.status(404).json({ error: 'RSVP not found.' });
    res.json(data);
  } catch (error) {
    console.error('[rsvp/get]', error);
    res.status(500).json({ error: 'Unable to load RSVP.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const nextStatus = normalizeText(req.body.status);
  if (!RSVP_STATUSES.has(nextStatus)) {
    return res.status(400).json({ error: 'Status must be pending, confirmed, or cancelled.' });
  }

  try {
    const { data: record } = await supabase.from('rsvp').select('*').eq('id', Number(req.params.id)).single();
    if (!record) return res.status(404).json({ error: 'RSVP not found.' });

    const wasHolding = record.inventory_applied && record.status !== 'cancelled';
    const shouldHold = nextStatus !== 'cancelled' && Boolean(record.class_id);

    if (wasHolding && !shouldHold) {
      await releaseSeats(record.class_id, record.guests);
    }
    if (!wasHolding && shouldHold) {
      await reserveSeats(record.class_id, record.guests);
    }

    const { data: updated, error } = await supabase
      .from('rsvp')
      .update({ status: nextStatus, inventory_applied: shouldHold })
      .eq('id', record.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(updated);
  } catch (error) {
    return res.status(409).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { data: record } = await supabase.from('rsvp').select('*').eq('id', Number(req.params.id)).single();
    if (!record) return res.status(404).json({ error: 'RSVP not found.' });

    if (record.inventory_applied && record.status !== 'cancelled') {
      await releaseSeats(record.class_id, record.guests);
    }

    const { error } = await supabase.from('rsvp').delete().eq('id', record.id);
    if (error) throw error;
    return res.json({ message: 'RSVP deleted.' });
  } catch (error) {
    console.error('[rsvp/delete]', error);
    return res.status(500).json({ error: 'Unable to delete the RSVP.' });
  }
});

export default router;
