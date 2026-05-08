import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ExperienceBooking from '../components/ExperienceBooking/ExperienceBooking';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { useNavigation } from '../context/NavigationContext';
import { PAGE_KEYS } from '../../shared/routes.js';
import './ExperiencePageLean.css';

const DESCRIPTION =
  'Reserve an intimate Sicilian cooking class at La Norma with Chef Marco — handmade pasta, wine, and a shared meal on Longboat Key.';

const INCLUDES = [
  { title: 'All ingredients', desc: 'Seasonal produce, pantry staples, and premium imports — everything is supplied.' },
  { title: 'Wine pairing', desc: 'A welcome pour and thoughtful pairings throughout the class and meal.' },
  { title: 'Recipe cards', desc: 'Take-home instructions so the class lives on in your kitchen.' },
  { title: 'Chef guidance', desc: 'Hands-on instruction from Chef Marco and the La Norma kitchen team.' },
];

const FAQ = [
  { q: 'Do I need any cooking experience?', a: 'No. Classes are designed to feel welcoming and hands-on whether you cook every day or almost never.' },
  { q: 'How long does each class last?', a: 'Expect around three and a half hours from welcome aperitivo to the shared meal at the end.' },
  { q: 'What is included in the price?', a: 'Ingredients, wine, printed recipes, the sit-down meal, and direct guidance from the kitchen team are all included.' },
  { q: 'How many guests attend each class?', a: 'We cap each session at eight guests so the experience stays personal and hands-on.' },
  { q: 'Can I reserve a private class?', a: 'Yes. Private buyouts are available for celebrations, team gatherings, and special occasions.' },
  { q: 'What is the cancellation policy?', a: 'Full refund up to 48 hours before. 50% up to 24 hours. No refund after that, but we can often reschedule.' },
];

const TESTIMONIALS = [
  { quote: 'The best morning we spent in Florida. Chef Marco made us feel like family, and the pasta was extraordinary.', author: 'Margaret S.', context: 'Sarasota, FL' },
  { quote: 'Worth every penny. We left with real skills and a deep appreciation for Sicilian cooking.', author: 'David & Claire K.', context: 'Chicago, IL' },
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function CookingClassesPage() {
  const { navigate } = useNavigation();
  const [includesRef, includesVisible] = useInView();
  const [faqRef, faqVisible] = useInView();

  usePageMetadata({
    title: 'Cooking Classes',
    description: DESCRIPTION,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',
    structuredData: [{
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'La Norma Sicilian Cooking Classes',
      description: DESCRIPTION,
      provider: { '@type': 'Restaurant', name: 'La Norma Ristorante & Pizzeria' },
      offers: { '@type': 'Offer', price: '95', priceCurrency: 'USD' },
    }],
  });

  return (
    <div className="xp">
      <Navbar />

      {/* ---- Hero ---- */}
      <header className="xp__hero">
        <div
          className="xp__hero-bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1800&q=80)' }}
          role="img"
          aria-label="Chef preparing fresh pasta in La Norma kitchen"
        />
        <div className="xp__hero-overlay" />

        <div className="xp__hero-content container">
          <p className="xp__hero-eyebrow">Saturday mornings at La Norma</p>
          <h1 className="xp__hero-heading">Cooking Classes</h1>
          <p className="xp__hero-sub">
            Cook like a Sicilian. Three and a half hours of hands-on pasta, wine, and a shared meal you made yourself.
          </p>

          <div className="xp__hero-actions">
            <button type="button" className="btn btn--primary" onClick={() => scrollToId('booking')}>
              Reserve My Spot
            </button>
            <button type="button" className="btn btn--outline-light" onClick={() => scrollToId('whats-included')}>
              What's included
            </button>
          </div>

          <div className="xp__stats">
            <div className="xp__stat">
              <span className="xp__stat-value">3.5 hrs</span>
              <span className="xp__stat-label">Duration</span>
            </div>
            <div className="xp__stat">
              <span className="xp__stat-value">$95</span>
              <span className="xp__stat-label">Per guest</span>
            </div>
            <div className="xp__stat">
              <span className="xp__stat-value">8 max</span>
              <span className="xp__stat-label">Guests per class</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ---- Booking ---- */}
        <section className="xp__section">
          <ExperienceBooking
            experienceType="cooking_class"
            paymentMode="request"
            minGuests={1}
            maxGuests={8}
            anchor="booking"
            copy={{
              label: 'Reserve your Saturday',
              heading: 'Book a cooking class',
              confirmationTitle: 'You\'re in!',
              confirmationMessage: 'We\'ll send a confirmation email within 24 hours with arrival details and what to expect.',
              submitLabel: 'Reserve My Spot',
            }}
          />
        </section>

        {/* ---- What's Included ---- */}
        <section className="xp__section xp__section--alt" id="whats-included">
          <div className="container">
            <div className={`fade-up${includesVisible ? ' visible' : ''}`} ref={includesRef}>
              <p className="xp__section-label">What's included</p>
              <h2 className="xp__section-heading">Everything you need for the morning</h2>
            </div>

            <div className="xp__includes-grid">
              {INCLUDES.map((item, i) => (
                <div key={item.title} className={`xp__include-card fade-up delay-${i + 1}${includesVisible ? ' visible' : ''}`}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>

            <div className={`xp__testimonials fade-up delay-2${includesVisible ? ' visible' : ''}`}>
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="xp__testimonial">
                  <p className="xp__testimonial-quote">"{t.quote}"</p>
                  <p className="xp__testimonial-author">{t.author}</p>
                  <p className="xp__testimonial-context">{t.context}</p>
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
              <h2 className="xp__section-heading">A few details before you reserve</h2>
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
            <h2>A morning worth clearing the calendar for.</h2>
            <p>Saturdays at La Norma are capped at eight. Reserve the one you want while there's still room.</p>
            <div className="xp__cta-actions">
              <button type="button" className="btn btn--primary" onClick={() => scrollToId('booking')}>Reserve My Spot</button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.home)}>Back to La Norma</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
