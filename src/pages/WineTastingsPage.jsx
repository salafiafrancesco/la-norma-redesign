import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ExperienceBooking from '../components/ExperienceBooking/ExperienceBooking';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { useNavigation } from '../context/NavigationContext';
import { PAGE_KEYS } from '../../shared/routes.js';
import './ExperiencePageLean.css';

const DESCRIPTION =
  'Join a sommelier-led Friday wine tasting at La Norma — curated Italian pours, seasonal antipasti, and an intimate Longboat Key evening.';

const EXPECT_ITEMS = [
  '4–6 curated Italian pours with guided commentary',
  'Seasonal antipasti pairings crafted by the kitchen',
  'Background on regions, producers, and grape stories',
  'A relaxed, unhurried pace designed for conversation',
  'Take-home tasting notes and recommendations',
];

const SUITED_FOR = ['Date nights', 'Couples', 'Small groups', 'Celebrations', 'Wine curious'];

const FAQ = [
  { q: 'Do I need wine knowledge?', a: 'Not at all. The tasting is conversational and accessible — designed for enjoyment, not expertise.' },
  { q: 'What is included?', a: '4–6 pours, seasonal antipasti pairings, guided commentary, and tasting notes to take home.' },
  { q: 'Can the tasting be booked privately?', a: 'Yes. Private tastings can be arranged for groups of 6 or more — reach out by email.' },
  { q: 'How quickly do requests get confirmed?', a: 'Within 24 hours. We\'ll follow up with timing details and any final notes.' },
];

const TESTIMONIALS = [
  { quote: 'The best Friday evening we\'ve had since moving here. Intimate, personal, and genuinely educational.', author: 'Elena & Marcus', context: 'Longboat Key, FL' },
  { quote: 'Not pretentious at all. Just great wine, great food, and a sommelier who made everyone feel comfortable.', author: 'Tanya R.', context: 'Sarasota, FL' },
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function WineTastingsPage() {
  const { navigate } = useNavigation();
  const [expectRef, expectVisible] = useInView();
  const [faqRef, faqVisible] = useInView();

  usePageMetadata({
    title: 'Wine Tastings',
    description: DESCRIPTION,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80',
    structuredData: [{
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'La Norma Friday Wine Tasting',
      description: DESCRIPTION,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: { '@type': 'Restaurant', name: 'La Norma Ristorante & Pizzeria' },
    }],
  });

  return (
    <div className="xp">
      <Navbar />

      {/* ---- Hero ---- */}
      <header className="xp__hero">
        <div
          className="xp__hero-bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1800&q=80)' }}
          role="img"
          aria-label="Sommelier pouring wine during a tasting at La Norma"
        />
        <div className="xp__hero-overlay" />

        <div className="xp__hero-content container">
          <p className="xp__hero-eyebrow">Friday evenings at La Norma</p>
          <h1 className="xp__hero-heading">Wine Tastings</h1>
          <p className="xp__hero-sub">
            An intimate tasting that still feels like dinner, not a classroom. Guided pours, warm lighting, and an evening worth planning around.
          </p>

          <div className="xp__hero-actions">
            <button type="button" className="btn btn--primary" onClick={() => scrollToId('booking')}>
              Book Your Friday
            </button>
            <button type="button" className="btn btn--outline-light" onClick={() => scrollToId('what-to-expect')}>
              What to expect
            </button>
          </div>

          <div className="xp__stats">
            <div className="xp__stat">
              <span className="xp__stat-value">4–6</span>
              <span className="xp__stat-label">Curated pours</span>
            </div>
            <div className="xp__stat">
              <span className="xp__stat-value">14 max</span>
              <span className="xp__stat-label">Seats per tasting</span>
            </div>
            <div className="xp__stat">
              <span className="xp__stat-value">Friday</span>
              <span className="xp__stat-label">Weekly cadence</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ---- Booking ---- */}
        <section className="xp__section">
          <ExperienceBooking
            experienceType="wine_tasting"
            paymentMode="request"
            minGuests={1}
            maxGuests={8}
            anchor="booking"
            copy={{
              label: 'Reserve your Friday',
              heading: 'Book your Friday tasting',
              confirmationTitle: 'Request received!',
              confirmationMessage: 'We\'ll confirm your tasting reservation within 24 hours with timing and arrival details.',
              submitLabel: 'Request Reservation',
            }}
          />
        </section>

        {/* ---- What to expect ---- */}
        <section className="xp__section xp__section--dark" id="what-to-expect">
          <div className="container">
            <div className={`fade-up${expectVisible ? ' visible' : ''}`} ref={expectRef}>
              <p className="xp__section-label">Included in your reservation</p>
              <h2 className="xp__section-heading">What guests can expect each Friday</h2>
            </div>

            <div className={`xp__checklist fade-up delay-1${expectVisible ? ' visible' : ''}`}>
              {EXPECT_ITEMS.map((item) => (
                <div key={item} className="xp__checklist-item"><p>{item}</p></div>
              ))}
            </div>

            <div className={`xp__chips fade-up delay-2${expectVisible ? ' visible' : ''}`}>
              {SUITED_FOR.map((tag) => (
                <span key={tag} className="xp__chip">{tag}</span>
              ))}
            </div>

            <div className={`xp__testimonials fade-up delay-3${expectVisible ? ' visible' : ''}`} style={{ marginTop: '2rem' }}>
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="xp__testimonial" style={{ background: 'rgba(248,243,235,0.08)', borderColor: 'rgba(248,243,235,0.1)' }}>
                  <p className="xp__testimonial-quote" style={{ color: 'rgba(248,243,235,0.78)' }}>"{t.quote}"</p>
                  <p className="xp__testimonial-author" style={{ color: 'var(--cream)' }}>{t.author}</p>
                  <p className="xp__testimonial-context" style={{ color: 'rgba(248,243,235,0.5)' }}>{t.context}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className="xp__section" id="faq">
          <div className="container">
            <div className={`fade-up${faqVisible ? ' visible' : ''}`} ref={faqRef}>
              <p className="xp__section-label">Questions</p>
              <h2 className="xp__section-heading">A few details guests often ask</h2>
            </div>
            <div className="xp__faq-list">
              {FAQ.map((item) => (
                <details key={item.q} className="xp__faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---- CTA ---- */}
        <section className="xp__cta">
          <div className="container">
            <h2>An evening built for good company and better pours.</h2>
            <p>Fridays at La Norma are intentionally limited. Request the evening you want before it fills.</p>
            <div className="xp__cta-actions">
              <button type="button" className="btn btn--primary" onClick={() => scrollToId('booking')}>Book Your Friday</button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.home)}>Back to La Norma</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
