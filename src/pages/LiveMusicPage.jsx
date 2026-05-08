import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ExperienceBooking from '../components/ExperienceBooking/ExperienceBooking';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { useNavigation } from '../context/NavigationContext';
import { PAGE_KEYS } from '../../shared/routes.js';
import './ExperiencePageLean.css';

const DESCRIPTION =
  'Live jazz, acoustic sets, and evening performances woven into dinner at La Norma — no cover, just a better atmosphere on Longboat Key.';

const FAQ = [
  { q: 'Is there a cover charge?', a: 'No. Music is complimentary with dinner — no tickets or separate charge.' },
  { q: 'Can I request a specific part of the room?', a: 'Yes. Mention seating preferences in the notes and we\'ll do our best to accommodate.' },
  { q: 'What kind of music do you host?', a: 'Jazz, acoustic, bossa nova, and Mediterranean-influenced sets — chosen to complement the dining room, not compete with it.' },
  { q: 'Can musicians be booked for private events?', a: 'Yes. Reach out to discuss live music for private dinners, celebrations, or corporate evenings.' },
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LiveMusicPage() {
  const { navigate } = useNavigation();
  const [faqRef, faqVisible] = useInView();

  usePageMetadata({
    title: 'Live Music',
    description: DESCRIPTION,
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1600&q=80',
    structuredData: [{
      '@context': 'https://schema.org',
      '@type': 'MusicEvent',
      name: 'Live Music at La Norma',
      description: DESCRIPTION,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      isAccessibleForFree: true,
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
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1800&q=80)' }}
          role="img"
          aria-label="Musician performing live at La Norma"
        />
        <div className="xp__hero-overlay" />

        <div className="xp__hero-content container">
          <p className="xp__hero-eyebrow">Wednesday & Saturday evenings</p>
          <h1 className="xp__hero-heading">Live Music</h1>
          <p className="xp__hero-sub">
            Music woven into dinner, not layered on top of it. Jazz, acoustic, and elegant performances that elevate the room.
          </p>

          <div className="xp__hero-actions">
            <button type="button" className="btn btn--primary" onClick={() => scrollToId('booking')}>
              Reserve a Music Night
            </button>
            <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.menu)}>
              View Menu
            </button>
          </div>

          <div className="xp__stats">
            <div className="xp__stat">
              <span className="xp__stat-value">Free</span>
              <span className="xp__stat-label">No cover charge</span>
            </div>
            <div className="xp__stat">
              <span className="xp__stat-value">Wed + Sat</span>
              <span className="xp__stat-label">Most weeks</span>
            </div>
            <div className="xp__stat">
              <span className="xp__stat-value">50 seats</span>
              <span className="xp__stat-label">Intimate dining room</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ---- Booking (free reservation mode) ---- */}
        <section className="xp__section">
          <ExperienceBooking
            experienceType="live_music"
            paymentMode="request"
            minGuests={1}
            maxGuests={8}
            anchor="booking"
            copy={{
              label: 'Reserve your evening',
              heading: 'Reserve a music night',
              confirmationTitle: 'Request received!',
              confirmationMessage: 'We\'ll confirm your table within 24 hours. Music is complimentary with dinner — no separate charge.',
              submitLabel: 'Send Request',
            }}
          />
        </section>

        {/* ---- FAQ ---- */}
        <section className="xp__section" id="faq">
          <div className="container">
            <div className={`fade-up${faqVisible ? ' visible' : ''}`} ref={faqRef}>
              <p className="xp__section-label">Questions</p>
              <h2 className="xp__section-heading">A few things guests ask about</h2>
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
            <h2>Dinner first. Atmosphere always.</h2>
            <p>Ask about the next performance night and let us shape the evening around your table.</p>
            <div className="xp__cta-actions">
              <button type="button" className="btn btn--primary" onClick={() => scrollToId('booking')}>Reserve Your Table</button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.home)}>Back to La Norma</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
