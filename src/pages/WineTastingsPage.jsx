import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import Footer from '../components/Footer/Footer';
import './EventPages.css';

const FAQ = [
  { q: 'Do I need a reservation for wine tastings?', a: 'Yes — seating is limited to ensure an intimate experience. We recommend booking at least a week in advance, especially for popular Friday evenings. Use the form below to reserve your spot.' },
  { q: 'What is included in the tasting?', a: 'Each tasting includes 4–6 curated wine pours guided by our sommelier, paired with artisan antipasti — seasonal cheeses, charcuterie, bruschette, and olives — designed to complement each wine.' },
  { q: 'Can I bring my own wine?', a: 'Our tastings feature wines selected specifically to tell a story. We don\'t accommodate outside bottles during tasting events, but our full wine list is available for regular dining.' },
  { q: 'Are the tastings suitable for beginners?', a: 'Absolutely. Our sommelier explains each wine in approachable, engaging language. You don\'t need any prior knowledge — just a curiosity and an appetite.' },
  { q: 'Can I book a private wine tasting for a group?', a: 'Yes. We offer private tastings for groups of 6–20 guests, fully tailored to your preferences. Submit an inquiry below and we\'ll get back to you within 24 hours.' },
];

function formatEventDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

const EMPTY = { first_name: '', last_name: '', email: '', phone: '', date: '', guests: '2', message: '' };

export default function WineTastingsPage() {
  const { navigate } = useNavigation();
  const [events, setEvents]     = useState([]);
  const [openFaq, setOpenFaq]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [formError, setFormError]   = useState('');

  const _API = import.meta.env.VITE_API_URL ?? '';

  useEffect(() => {
    document.title = 'Wine Tastings — La Norma Ristorante & Pizzeria';
    fetch(`${_API}/api/events?category=wine_tasting`)
      .then(r => r.json())
      .then(setEvents)
      .catch(() => {});
    return () => {
      document.title = 'La Norma Ristorante & Pizzeria | Authentic Sicilian Cuisine — Longboat Key, FL';
    };
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${_API}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'wine_tasting', guests: Number(form.guests) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ep-page">
      {/* Hero */}
      <header className="ep-hero">
        <div
          className="ep-hero__bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80)' }}
          role="img"
          aria-label="Wine glasses with Sicilian wine"
        />
        <div className="ep-hero__overlay" />
        <div className="ep-hero__content container">
          <button className="ep-hero__back" onClick={() => navigate('home')} aria-label="Back to homepage">
            ← Back to La Norma
          </button>
          <p className="ep-hero__eyebrow">Every Friday Evening</p>
          <h1 className="ep-hero__heading">
            Wine Tastings<br />
            <em>& Pairings</em>
          </h1>
          <p className="ep-hero__sub">
            Our sommelier guides you through a curated flight of Sicilian and southern Italian wines,
            paired with artisan antipasti crafted in our kitchen. An intimate experience for the curious palate.
          </p>
        </div>
      </header>

      <main id="main-content">
        {/* Upcoming Events */}
        <section className="ep-section">
          <div className="container">
            <p className="ep-section__label">Upcoming</p>
            <h2 className="ep-section__heading">Reserve Your Seat</h2>
            <p className="ep-section__sub">
              Each Friday we host a themed tasting for up to 14 guests. Spots fill quickly — book early to secure your place.
            </p>

            <div className="ep-events-grid">
              {events.length === 0 ? (
                <div className="ep-events-empty">
                  <p>No upcoming tastings listed yet — check back soon or send us an inquiry below.</p>
                </div>
              ) : events.map(ev => (
                <article className="ep-event-card" key={ev.id}>
                  <div
                    className="ep-event-card__image"
                    style={ev.image_url ? { backgroundImage: `url(${ev.image_url})` } : {}}
                  >
                    {!ev.image_url && <span className="ep-event-card__image-icon">🍷</span>}
                  </div>
                  <div className="ep-event-card__body">
                    <div className="ep-event-card__date">{formatEventDate(ev.date)} · {ev.time}</div>
                    <h3 className="ep-event-card__title">{ev.title}</h3>
                    <p className="ep-event-card__desc">{ev.description}</p>
                    <div className="ep-event-card__footer">
                      <span className="ep-event-card__price">${ev.price} / person</span>
                      {ev.spots_left > 3 ? (
                        <span className="ep-event-card__spots">{ev.spots_left} spots left</span>
                      ) : ev.spots_left > 0 ? (
                        <span className="ep-event-card__spots ep-event-card__spots--low">Only {ev.spots_left} left!</span>
                      ) : (
                        <span className="ep-event-card__spots ep-event-card__spots--full">Sold out</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* What to expect */}
        <section className="ep-section ep-section--alt">
          <div className="container">
            <p className="ep-section__label">The Experience</p>
            <h2 className="ep-section__heading">What to Expect</h2>
            <div className="ep-features">
              {[
                { icon: '🍷', title: '4–6 Curated Pours', desc: 'Each tasting features wines hand-selected by our sommelier to tell the story of a region, grape, or style.' },
                { icon: '🧀', title: 'Artisan Pairings', desc: 'Seasonal cheeses, charcuterie, bruschette, and small bites crafted in our kitchen to complement each wine.' },
                { icon: '🎓', title: 'Expert Guidance', desc: 'Our sommelier walks you through each pour with tasting notes, history, and pairing philosophy — approachable for all levels.' },
                { icon: '👥', title: 'Intimate Setting', desc: 'Tastings are capped at 14 guests to ensure a personal, unhurried experience in our private dining area.' },
              ].map(f => (
                <div className="ep-feature" key={f.title}>
                  <div className="ep-feature__icon">{f.icon}</div>
                  <h3 className="ep-feature__title">{f.title}</h3>
                  <p className="ep-feature__desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry form */}
        <section className="ep-section" id="reserve">
          <div className="container">
            <p className="ep-section__label">Book Your Spot</p>
            <h2 className="ep-section__heading">Reserve or Inquire</h2>
            <p className="ep-section__sub">
              Fill in the form below and we'll confirm your reservation by email within 24 hours.
              For private tastings or special requests, add a note in the message field.
            </p>

            <div className="ep-form-wrap">
              {submitted ? (
                <div className="ep-form-success">
                  <div className="ep-form-success__icon">🍷</div>
                  <h3 className="ep-form-success__title">Request received!</h3>
                  <p className="ep-form-success__sub">
                    Thank you, {form.first_name}. We'll confirm your wine tasting reservation by email within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {formError && <div className="ep-form-error">{formError}</div>}
                  <div className="ep-form-grid">
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="wt-first">First name *</label>
                      <input id="wt-first" className="ep-input" type="text" value={form.first_name}
                        onChange={e => set('first_name', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="wt-last">Last name *</label>
                      <input id="wt-last" className="ep-input" type="text" value={form.last_name}
                        onChange={e => set('last_name', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="wt-email">Email *</label>
                      <input id="wt-email" className="ep-input" type="email" value={form.email}
                        onChange={e => set('email', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="wt-phone">Phone</label>
                      <input id="wt-phone" className="ep-input" type="tel" value={form.phone}
                        onChange={e => set('phone', e.target.value)} />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="wt-date">Preferred date</label>
                      <input id="wt-date" className="ep-input" type="date" value={form.date}
                        onChange={e => set('date', e.target.value)} />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="wt-guests">Guests</label>
                      <select id="wt-guests" className="ep-select" value={form.guests}
                        onChange={e => set('guests', e.target.value)}>
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="ep-field ep-field--span2">
                      <label className="ep-label" htmlFor="wt-msg">Message or special requests</label>
                      <textarea id="wt-msg" className="ep-textarea" value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder="e.g. interested in a private tasting, dietary notes, occasion..." />
                    </div>
                  </div>
                  <div className="ep-form-submit">
                    <button type="submit" className="btn btn--primary" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Send Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ep-section ep-section--alt">
          <div className="container">
            <p className="ep-section__label">Questions</p>
            <h2 className="ep-section__heading">Frequently Asked</h2>
            <div className="ep-faq">
              {FAQ.map((item, i) => (
                <div key={i} className={`ep-faq__item${openFaq === i ? ' ep-faq__item--open' : ''}`}>
                  <button className="ep-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}>
                    {item.q}
                    <span className="ep-faq__q-icon" aria-hidden="true">+</span>
                  </button>
                  <div className="ep-faq__a" aria-hidden={openFaq !== i}>
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="ep-cta">
          <div className="container">
            <h2 className="ep-cta__heading">Come for the wine.<br /><em>Stay for the memories.</em></h2>
            <p className="ep-cta__sub">Every Friday evening at La Norma. Limited to 14 guests.</p>
            <div className="ep-cta__actions">
              <a href="#reserve" className="btn btn--primary" onClick={e => { e.preventDefault(); document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Reserve Now
              </a>
              <button className="btn btn--outline-light" onClick={() => navigate('home')}>
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
