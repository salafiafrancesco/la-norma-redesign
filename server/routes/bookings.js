import crypto from 'crypto';
import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import {
  cleanObject,
  isPlainObject,
  isValidEmail,
  normalizeInteger,
  normalizeOptionalText,
  normalizeText,
} from '../lib/validation.js';

const router = Router();
const VALID_STATUSES = new Set(['pending', 'paid', 'confirmed', 'cancelled', 'refunded']);
const VALID_PAYMENT_MODES = new Set(['stripe', 'request']);

function generateToken() {
  return crypto.randomBytes(24).toString('base64url');
}

// ---------------------------------------------------------------------------
// Public — create a booking
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  const eventId = req.body.event_id ? Number(req.body.event_id) : null;
  const customerName = normalizeText(req.body.customer_name);
  const customerEmail = normalizeText(req.body.customer_email, { lowercase: true });
  const customerPhone = normalizeOptionalText(req.body.customer_phone);
  const guests = normalizeInteger(req.body.guests, { min: 1, max: 50, fallback: 1 });
  const specialRequests = normalizeOptionalText(req.body.special_requests);
  const paymentMode = VALID_PAYMENT_MODES.has(req.body.payment_mode) ? req.body.payment_mode : 'request';

  if (!customerName) return res.status(400).json({ error: 'Name is required.' });
  if (!customerEmail || !isValidEmail(customerEmail)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  try {
    let totalCents = 0;
    let currency = 'USD';

    // Validate event and check capacity
    if (eventId) {
      const { data: event, error: eventError } = await supabase
        .from('experience_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) return res.status(404).json({ error: 'Event not found.' });
      if (event.status !== 'published') return res.status(400).json({ error: 'This event is not available for booking.' });

      // Check capacity (0 = unlimited)
      if (event.capacity > 0) {
        const seatsAvailable = event.capacity - event.seats_booked;
        if (seatsAvailable < guests) {
          return res.status(400).json({
            error: seatsAvailable <= 0
              ? 'This event is sold out.'
              : `Only ${seatsAvailable} seat${seatsAvailable === 1 ? '' : 's'} remaining.`,
          });
        }
      }

      totalCents = event.price_cents * guests;
      currency = event.currency || 'USD';

      // Reserve seats
      if (event.capacity > 0) {
        const { error: updateError } = await supabase
          .from('experience_events')
          .update({
            seats_booked: event.seats_booked + guests,
            updated_at: new Date().toISOString(),
          })
          .eq('id', eventId);

        if (updateError) throw updateError;
      }
    }

    const confirmationToken = generateToken();
    const initialStatus = paymentMode === 'stripe' ? 'pending' : 'confirmed';

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        event_id: eventId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        guests,
        total_cents: totalCents,
        currency,
        status: initialStatus,
        payment_mode: paymentMode,
        special_requests: specialRequests,
        confirmation_token: confirmationToken,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      ok: true,
      id: booking.id,
      confirmation_token: confirmationToken,
      status: initialStatus,
      total_cents: totalCents,
      currency,
    });
  } catch (error) {
    console.error('[bookings/create]', error);
    res.status(500).json({ error: 'Unable to create booking.' });
  }
});

// ---------------------------------------------------------------------------
// Public — get booking by confirmation token
// ---------------------------------------------------------------------------
router.get('/token/:token', async (req, res) => {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, experience_events(*)')
      .eq('confirmation_token', req.params.token)
      .single();

    if (error || !booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (error) {
    console.error('[bookings/get-by-token]', error);
    res.status(500).json({ error: 'Unable to load booking.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — list all bookings
// ---------------------------------------------------------------------------
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = supabase
      .from('bookings')
      .select('*, experience_events(id, type, title, date, start_time)')
      .order('created_at', { ascending: false });

    const status = req.query.status ? normalizeText(req.query.status) : '';
    if (status && VALID_STATUSES.has(status)) query = query.eq('status', status);

    const eventId = req.query.event_id ? Number(req.query.event_id) : null;
    if (eventId) query = query.eq('event_id', eventId);

    const search = normalizeOptionalText(req.query.search);
    if (search) query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[bookings/list]', error);
    res.status(500).json({ error: 'Unable to load bookings.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — get single booking
// ---------------------------------------------------------------------------
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, experience_events(*)')
      .eq('id', Number(req.params.id))
      .single();

    if (error || !data) return res.status(404).json({ error: 'Booking not found.' });
    res.json(data);
  } catch (error) {
    console.error('[bookings/get]', error);
    res.status(500).json({ error: 'Unable to load booking.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — update booking status
// ---------------------------------------------------------------------------
router.put('/:id', requireAuth, async (req, res) => {
  if (!isPlainObject(req.body)) return res.status(400).json({ error: 'Body must be a plain object.' });

  try {
    const bookingId = Number(req.params.id);
    const { data: current } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
    if (!current) return res.status(404).json({ error: 'Booking not found.' });

    const newStatus = req.body.status ? normalizeText(req.body.status) : undefined;
    if (newStatus && !VALID_STATUSES.has(newStatus)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    // Handle capacity changes on status transitions
    if (newStatus && current.event_id && newStatus !== current.status) {
      const wasActive = current.status !== 'cancelled' && current.status !== 'refunded';
      const willBeActive = newStatus !== 'cancelled' && newStatus !== 'refunded';

      if (wasActive && !willBeActive) {
        // Release seats
        const { data: event } = await supabase.from('experience_events').select('seats_booked').eq('id', current.event_id).single();
        if (event) {
          await supabase.from('experience_events').update({
            seats_booked: Math.max(0, event.seats_booked - current.guests),
            updated_at: new Date().toISOString(),
          }).eq('id', current.event_id);
        }
      } else if (!wasActive && willBeActive) {
        // Re-reserve seats
        const { data: event } = await supabase.from('experience_events').select('seats_booked, capacity').eq('id', current.event_id).single();
        if (event) {
          await supabase.from('experience_events').update({
            seats_booked: Math.min(event.capacity || 9999, event.seats_booked + current.guests),
            updated_at: new Date().toISOString(),
          }).eq('id', current.event_id);
        }
      }
    }

    const updateData = cleanObject({
      status: newStatus,
      special_requests: req.body.special_requests !== undefined ? normalizeOptionalText(req.body.special_requests) : undefined,
      updated_at: new Date().toISOString(),
    });

    const { data: updated, error } = await supabase.from('bookings').update(updateData).eq('id', bookingId).select().single();
    if (error) throw error;
    res.json(updated);
  } catch (error) {
    console.error('[bookings/update]', error);
    res.status(500).json({ error: 'Unable to update booking.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — delete booking
// ---------------------------------------------------------------------------
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const { data: current } = await supabase.from('bookings').select('*').eq('id', bookingId).single();

    // Release seats if booking was active
    if (current?.event_id && current.status !== 'cancelled' && current.status !== 'refunded') {
      const { data: event } = await supabase.from('experience_events').select('seats_booked').eq('id', current.event_id).single();
      if (event) {
        await supabase.from('experience_events').update({
          seats_booked: Math.max(0, event.seats_booked - current.guests),
          updated_at: new Date().toISOString(),
        }).eq('id', current.event_id);
      }
    }

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('[bookings/delete]', error);
    res.status(500).json({ error: 'Unable to delete booking.' });
  }
});

export default router;
