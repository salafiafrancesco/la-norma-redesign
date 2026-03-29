import { Component } from 'react';
import './App.css';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ContentProvider } from './context/ContentContext';

/* Home sections */
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Story from './components/Story/Story';
import Specialties from './components/Specialties/Specialties';
import Experiences from './components/Experiences/Experiences';
import MenuHighlights from './components/MenuHighlights/MenuHighlights';
import ReservationBanner from './components/ReservationBanner/ReservationBanner';
import OrderOnline from './components/OrderOnline/OrderOnline';
import Testimonials from './components/Testimonials/Testimonials';
import VisitUs from './components/VisitUs/VisitUs';
import Footer from './components/Footer/Footer';

/* Other pages */
import CookingClassesPage from './pages/CookingClassesPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import WineTastingsPage from './pages/WineTastingsPage';
import LiveMusicPage from './pages/LiveMusicPage';
import PrivateEventsPage from './pages/PrivateEventsPage';

/* ── Error Boundary ─────────────────────────────────────────── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) {
    if (import.meta.env.DEV) console.error('Error boundary caught:', err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--cream)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', color: 'var(--charcoal)' }}>Something went wrong.</p>
          <p style={{ fontFamily: 'var(--ff-body)', color: 'var(--text-mid)' }}>Please refresh the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--ff-body)', fontSize: '0.875rem' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── App Content ────────────────────────────────────────────── */
function AppContent() {
  const { page } = useNavigation();

  if (page === 'cooking-classes') return <CookingClassesPage />;
  if (page === 'privacy-policy')  return <PrivacyPolicy />;
  if (page === 'wine-tastings')   return <WineTastingsPage />;
  if (page === 'live-music')      return <LiveMusicPage />;
  if (page === 'private-events')  return <PrivateEventsPage />;

  return (
    <div className="app">
      <Navbar />
      <main id="main-content">
        <Hero />
        <Story />
        <Specialties />
        <Experiences />
        <MenuHighlights />
        <ReservationBanner />
        <OrderOnline />
        <Testimonials />
        <VisitUs />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ContentProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </ContentProvider>
    </ErrorBoundary>
  );
}
