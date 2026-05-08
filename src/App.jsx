import { Component } from 'react';
import { ContentProvider } from './context/ContentContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import AboutPage from './pages/AboutPage';
import BlogArticlePage from './pages/BlogArticlePage';
import BlogPage from './pages/BlogPage';
import BookingCancelledPage from './pages/BookingCancelledPage';
import BookingDetailPage from './pages/BookingDetailPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import CateringPage from './pages/CateringPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import CookingClassesPage from './pages/CookingClassesPage';
import FAQPage from './pages/FAQPage';
import LiveMusicPage from './pages/LiveMusicPage';
import MenuPage from './pages/MenuPage';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivateEventsPage from './pages/PrivateEventsPage';
import WineTastingsPage from './pages/WineTastingsPage';
import { PAGE_KEYS } from '../shared/routes.js';
import './App.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('Error boundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            background: 'var(--cream)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: '1.5rem',
              color: 'var(--charcoal)',
            }}
          >
            Something went wrong.
          </p>
          <p style={{ fontFamily: 'var(--ff-body)', color: 'var(--text-mid)' }}>
            Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '0.5rem',
              padding: '0.6rem 1.5rem',
              background: 'var(--charcoal)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--ff-body)',
              fontSize: '0.875rem',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { page } = useNavigation();

  if (page === PAGE_KEYS.home) return <HomePage />;
  if (page === PAGE_KEYS.menu) return <MenuPage />;
  if (page === PAGE_KEYS.about) return <AboutPage />;
  if (page === PAGE_KEYS.faq) return <FAQPage />;
  if (page === PAGE_KEYS.contact) return <ContactPage />;
  if (page === PAGE_KEYS.blog) return <BlogPage />;
  if (page === PAGE_KEYS.blogArticle) return <BlogArticlePage />;
  if (page === PAGE_KEYS.cookingClasses) return <CookingClassesPage />;
  if (page === PAGE_KEYS.privacyPolicy) return <PrivacyPolicy />;
  if (page === PAGE_KEYS.wineTastings) return <WineTastingsPage />;
  if (page === PAGE_KEYS.liveMusic) return <LiveMusicPage />;
  if (page === PAGE_KEYS.privateEvents) return <PrivateEventsPage />;
  if (page === PAGE_KEYS.catering) return <CateringPage />;
  if (page === PAGE_KEYS.bookingSuccess) return <BookingSuccessPage />;
  if (page === PAGE_KEYS.bookingCancelled) return <BookingCancelledPage />;
  if (page === PAGE_KEYS.bookingDetail) return <BookingDetailPage />;

  return <NotFound />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ContentProvider>
        <NavigationProvider>
          <a className="skip-to-content" href="#main-content">Skip to main content</a>
          <AppContent />
        </NavigationProvider>
      </ContentProvider>
    </ErrorBoundary>
  );
}
