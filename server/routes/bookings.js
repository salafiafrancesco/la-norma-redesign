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
import { notifyAdmin, renderFields } from '../lib/notify.js';

const router = Router();
const VALID_STATUSES = new Set(['pending', 'paid', 'confirmed', 'cancelled', 'refunded']);
const VALID_PAYMENT_MODES = new Set(['stripe', 'request']);

function generateToken() {
  return crypto.randomBytes(24).toString('base64url');
}

// Escape special chars used by Postgres ILIKE pattern (% _) and the comma /
// parens that Supabase uses to delimit OR filter conditions. Without this,
// a search containing % can match unintended records, and a comma can break
// the OR query parser.
function escapeIlikePattern(value) {
  return String(value || '')
    .replace(/[\\%_]/g, (m) => `\\${m}`)
    .replace(/[(),]/g, ' ');
}

// Atomic seat reservation via RPC. Returns the updated event row, or null
// if the event is sold out / not published / not found. Falls back to a
// non-atomic read+update path when the RPC is missing on the database.
async function reserveSeats(eventId, guests) {
  const { data, error } = await supabase.rpc('book_seats', {
    p_event_id: eventId,
    p_guests: guests,
  });

  if (error) {
    if (/function.*does not exist|book_seats.*not found|Could not find the function/i.test(error.message)) {
      return { fallback: true };
    }
    throw error;
  }

  if (Array.isArray(data) && data.length > 0) {
    return { event: data[0] };
  }
  return { event: null };
}

async function releaseSeatsRpc(eventId, guests) {
  const { error } = await supabase.rpc('release_seats', {
    p_event_id: eventId,
    p_guests: guests,
  });
  if (error && /function.*does not exist|release_seats.*not found|Could not find the function/i.test(error.message)) {
    return { fallback: true };
  }
  if (error) throw error;
  return { fallback: false };
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

    // Validate event and reserve capacity atomically (single round-trip via
    // book_seats RPC). On databases where the RPC is missing, fall back to
    // the non-atomic read+update path with a sold-out window check.
    if (eventId) {
      const reservation = await reserveSeats(eventId, guests);

      if (reservation.fallback) {
        const { data: event, error: eventError } = await supabase
          .from('experience_events').select('*').eq('id', eventId).single();
        if (eventError || !event) return res.status(404).json({ error: 'Event not found.' });
        if (event.status !== 'published') return res.status(400).json({ error: 'This event is not available for booking.' });
        if (event.capacity > 0) {
          const seatsAvailable = event.capacity - event.seats_booked;
          if (seatsAvailable < guests) {
            return res.status(400).json({
              error: seatsAvailable <= 0
                ? 'This event is sold out.'
                : `Only ${seatsAvailable} seat${seatsAvailable === 1 ? '' : 's'} remaining.`,
            });
          }
          await supabase.from('experience_events').update({
            seats_booked: event.seats_booked + guests,
            updated_at: new Date().toISOString(),
          }).eq('id', eventId);
        }
        totalCents = event.price_cents * guests;
        currency = event.currency || 'USD';
      } else if (!reservation.event) {
        const { data: event } = await supabase
          .from('experience_events').select('status, seats_booked, capacity').eq('id', eventId).single();
        if (!event) return res.status(404).json({ error: 'Event not found.' });
        if (event.status !== 'published') return res.status(400).json({ error: 'This event is not available for booking.' });
        const seatsAvailable = (event.capacity || 0) - (event.seats_booked || 0);
        return res.status(400).json({
          error: seatsAvailable <= 0
            ? 'This event is sold out.'
            : `Only ${seatsAvailable} seat${seatsAvailable === 1 ? '' : 's'} remaining.`,
        });
      } else {
        totalCents = (reservation.event.price_cents || 0) * guests;
        currency = reservation.event.currency || 'USD';
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

    // Resolve event title for the notification (best-effort).
    let eventTitle = null;
    if (eventId) {
      const { data: ev } = await supabase
        .from('experience_events')
        .select('title')
        .eq('id', eventId)
        .single();
      eventTitle = ev?.title || null;
    }
    const formattedTotal = totalCents > 0
      ? `${(totalCents / 100).toFixed(2)} ${currency}`
      : 'Pending';
    const { text, html } = renderFields([
      ['Experience', eventTitle || 'General booking'],
      ['Customer', customerName],
      ['Email', customerEmail],
      ['Phone', customerPhone || '—'],
      ['Guests', guests],
      ['Total', formattedTotal],
      ['Payment', paymentMode],
      ['Status', initialStatus],
      ['Special requests', specialRequests || '—'],
    ]);
    await notifyAdmin({
      subject: `New booking — ${customerName}${eventTitle ? ` for ${eventTitle}` : ''}`,
      text,
      html,
      replyTo: customerEmail,
    });

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

    const searchRaw = normalizeOptionalText(req.query.search);
    if (searchRaw) {
      const safe = escapeIlikePattern(searchRaw);
      query = query.or(`customer_name.ilike.%${safe}%,customer_email.ilike.%${safe}%`);
    }

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

    // Handle capacity changes on status transitions atomically.
    if (newStatus && current.event_id && newStatus !== current.status) {
      const wasActive = current.status !== 'cancelled' && current.status !== 'refunded';
      const willBeActive = newStatus !== 'cancelled' && newStatus !== 'refunded';

      if (wasActive && !willBeActive) {
        const result = await releaseSeatsRpc(current.event_id, current.guests);
        if (result.fallback) {
          const { data: event } = await supabase.from('experience_events').select('seats_booked').eq('id', current.event_id).single();
          if (event) {
            await supabase.from('experience_events').update({
              seats_booked: Math.max(0, event.seats_booked - current.guests),
              updated_at: new Date().toISOString(),
            }).eq('id', current.event_id);
          }
        }
      } else if (!wasActive && willBeActive) {
        const reservation = await reserveSeats(current.event_id, current.guests);
        if (reservation.fallback) {
          const { data: event } = await supabase.from('experience_events').select('seats_booked, capacity').eq('id', current.event_id).single();
          if (event) {
            await supabase.from('experience_events').update({
              seats_booked: Math.min(event.capacity || 9999, event.seats_booked + current.guests),
              updated_at: new Date().toISOString(),
            }).eq('id', current.event_id);
          }
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

    // Release seats atomically if booking was active.
    if (current?.event_id && current.status !== 'cancelled' && current.status !== 'refunded') {
      const result = await releaseSeatsRpc(current.event_id, current.guests);
      if (result.fallback) {
        const { data: event } = await supabase.from('experience_events').select('seats_booked').eq('id', current.event_id).single();
        if (event) {
          await supabase.from('experience_events').update({
            seats_booked: Math.max(0, event.seats_booked - current.guests),
            updated_at: new Date().toISOString(),
          }).eq('id', current.event_id);
        }
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
