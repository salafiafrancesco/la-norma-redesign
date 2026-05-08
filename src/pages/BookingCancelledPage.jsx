import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { PAGE_KEYS } from '../../shared/routes.js';

export default function BookingCancelledPage() {
  const { navigate } = useNavigation();

  usePageMetadata({ title: 'Booking Cancelled', description: 'Your checkout was cancelled.' });

  return (
    <div className="app">
      <Navbar />
      <main id="main-content" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '28rem' }}>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'var(--fs-lg)', color: 'var(--charcoal)', marginBottom: '0.75rem' }}>Checkout Cancelled</h1>
          <p style={{ color: 'var(--text-mid)', marginBottom: '1.5rem' }}>
            No payment was taken. Your booking has not been finalized. You can try again or explore other experiences.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.cookingClasses)}>
              Try Again
            </button>
            <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.home)}>
              Back to La Norma
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
