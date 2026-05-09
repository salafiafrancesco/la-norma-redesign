import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ExperienceBooking from '../components/ExperienceBooking/ExperienceBooking';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { useNavigation } from '../context/NavigationContext';
import { useSection } from '../context/ContentContext';
import { PAGE_KEYS } from '../../shared/routes.js';
import './ExperiencePageLean.css';

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LiveMusicPage() {
  const { navigate } = useNavigation();
  const page = useSection('liveMusicPage');
  const [faqRef, faqVisible] = useInView();

  const { hero, booking_copy, faq_section, cta, description } = page;

  usePageMetadata({
    title: 'Live Music',
    description,
    image: hero.image_url,
    structuredData: [{
      '@context': 'https://schema.org',
      '@type': 'MusicEvent',
      name: 'Live Music at La Norma',
      description,
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
          style={{ backgroundImage: `url(${hero.image_url})` }}
          role="img"
          aria-label={hero.image_alt}
        />
        <div className="xp__hero-overlay" />

        <div className="xp__hero-content container">
          <p className="xp__hero-eyebrow">{hero.eyebrow}</p>
          <h1 className="xp__hero-heading">{hero.headline}</h1>
          <p className="xp__hero-sub">{hero.sub}</p>

          <div className="xp__hero-actions">
            <button type="button" className="btn btn--primary" onClick={() => scrollToId('booking')}>
              {hero.primary_cta_label}
            </button>
            <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.menu)}>
              {hero.secondary_cta_label}
            </button>
          </div>

          <div className="xp__stats">
            {hero.stats.map((stat, idx) => (
              <div className="xp__stat" key={`${stat.label}-${idx}`}>
                <span className="xp__stat-value">{stat.value}</span>
                <span className="xp__stat-label">{stat.label}</span>
              </div>
            ))}
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
              label: booking_copy.label,
              heading: booking_copy.heading,
              confirmationTitle: booking_copy.confirmation_title,
              confirmationMessage: booking_copy.confirmation_message,
              submitLabel: booking_copy.submit_label,
            }}
          />
        </section>

        {/* ---- FAQ ---- */}
        <section className="xp__section" id="faq">
          <div className="container">
            <div className={`fade-up${faqVisible ? ' visible' : ''}`} ref={faqRef}>
              <p className="xp__section-label">{faq_section.label}</p>
              <h2 className="xp__section-heading">{faq_section.heading}</h2>
            </div>
            <div className="xp__faq-list">
              {faq_section.items.map((item) => (
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
            <h2>{cta.heading}</h2>
            <p>{cta.body}</p>
            <div className="xp__cta-actions">
              <button type="button" className="btn btn--primary" onClick={() => scrollToId('booking')}>{cta.primary_label}</button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.home)}>{cta.secondary_label}</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
