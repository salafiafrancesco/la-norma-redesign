import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { PAGE_KEYS } from '../../shared/routes.js';

export default function BookingSuccessPage() {
  const { navigate } = useNavigation();

  usePageMetadata({ title: 'Booking Confirmed', description: 'Your La Norma booking has been confirmed.' });

  return (
    <div className="app">
      <Navbar />
      <main id="main-content" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '28rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', margin: '0 auto 1.25rem', borderRadius: '50%', background: 'rgba(59,88,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--olive)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'var(--fs-lg)', color: 'var(--charcoal)', marginBottom: '0.75rem' }}>Booking Confirmed</h1>
          <p style={{ color: 'var(--text-mid)', marginBottom: '1.5rem' }}>
            Thank you! Your payment has been received and your booking is confirmed. Check your email for details and arrival instructions.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home)}>
            Back to La Norma
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
