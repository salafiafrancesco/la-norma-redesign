import { useEffect, useState } from 'react';
import API_BASE from '../config/api';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { PAGE_KEYS, getBookingTokenFromPathname } from '../../shared/routes.js';

function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatCents(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default function BookingDetailPage() {
  const { navigate } = useNavigation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = getBookingTokenFromPathname(window.location.pathname);

  usePageMetadata({ title: 'Your Booking', description: 'View your La Norma booking details.' });

  useEffect(() => {
    if (!token) { setError('Invalid booking link.'); setLoading(false); return; }

    fetch(`${API_BASE}/api/bookings/token/${token}`)
      .then((r) => { if (!r.ok) throw new Error('Booking not found.'); return r.json(); })
      .then(setBooking)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const event = booking?.experience_events;

  return (
    <div className="app">
      <Navbar />
      <main id="main-content" style={{ minHeight: '60vh', padding: 'clamp(8rem, 14vw, 10rem) 1rem var(--section-py)' }}>
        <div className="container" style={{ maxWidth: '36rem' }}>
          {loading && <p style={{ color: 'var(--text-mid)', textAlign: 'center' }}>Loading booking details...</p>}
          {error && <p style={{ color: '#c53030', textAlign: 'center' }}>{error}</p>}

          {booking && (
            <>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'var(--fs-lg)', color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Your Booking</h1>
              <p style={{ color: 'var(--text-mid)', marginBottom: '2rem' }}>
                Booking #{booking.id} · Status: <strong style={{ textTransform: 'capitalize' }}>{booking.status}</strong>
              </p>

              <div style={{ display: 'grid', gap: '0.75rem', padding: '1.25rem', borderRadius: '1.2rem', background: 'rgba(39,61,47,0.04)', marginBottom: '1.5rem' }}>
                {event && (
                  <>
                    <Row label="Event" value={event.title} />
                    <Row label="Date" value={formatDate(event.date)} />
                    <Row label="Time" value={`${event.start_time}${event.end_time ? ` – ${event.end_time}` : ''}`} />
                  </>
                )}
                <Row label="Guests" value={booking.guests} />
                <Row label="Name" value={booking.customer_name} />
                <Row label="Email" value={booking.customer_email} />
                {booking.customer_phone && <Row label="Phone" value={booking.customer_phone} />}
                {booking.total_cents > 0 && <Row label="Total" value={formatCents(booking.total_cents)} />}
                {booking.special_requests && <Row label="Notes" value={booking.special_requests} />}
              </div>

              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home)}>
                Back to La Norma
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
      <span style={{ color: 'var(--text-mid)' }}>{label}</span>
      <strong style={{ color: 'var(--charcoal)', textAlign: 'right' }}>{value}</strong>
    </div>
  );
}
