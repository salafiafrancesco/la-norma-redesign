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

export default function WineTastingsPage() {
  const { navigate } = useNavigation();
  const page = useSection('wineTastingsPage');
  const [expectRef, expectVisible] = useInView();
  const [faqRef, faqVisible] = useInView();

  const { hero, booking_copy, expect_section, testimonials, faq_section, cta, description } = page;

  usePageMetadata({
    title: 'Wine Tastings',
    description,
    image: hero.image_url,
    structuredData: [{
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'La Norma Friday Wine Tasting',
      description,
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
            <button type="button" className="btn btn--outline-light" onClick={() => scrollToId('what-to-expect')}>
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
        {/* ---- Booking ---- */}
        <section className="xp__section">
          <ExperienceBooking
            experienceType="wine_tasting"
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

        {/* ---- What to expect ---- */}
        <section className="xp__section xp__section--dark" id="what-to-expect">
          <div className="container">
            <div className={`fade-up${expectVisible ? ' visible' : ''}`} ref={expectRef}>
              <p className="xp__section-label">{expect_section.label}</p>
              <h2 className="xp__section-heading">{expect_section.heading}</h2>
            </div>

            <div className={`xp__checklist fade-up delay-1${expectVisible ? ' visible' : ''}`}>
              {expect_section.items.map((item) => (
                <div key={item} className="xp__checklist-item"><p>{item}</p></div>
              ))}
            </div>

            <div className={`xp__chips fade-up delay-2${expectVisible ? ' visible' : ''}`}>
              {expect_section.suited_for.map((tag) => (
                <span key={tag} className="xp__chip">{tag}</span>
              ))}
            </div>

            <div className={`xp__testimonials fade-up delay-3${expectVisible ? ' visible' : ''}`} style={{ marginTop: '2rem' }}>
              {testimonials.map((t) => (
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
