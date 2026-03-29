import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import Footer from '../components/Footer/Footer';
import API_BASE from '../config/api';
import './EventPages.css';

const FAQ = [
  { q: 'When does live music take place?', a: 'Live performances are held every Wednesday and Saturday evening, typically from 7:00 PM to 9:30 PM. The schedule below shows confirmed upcoming acts.' },
  { q: 'Is there a cover charge for live music?', a: 'There is no cover charge. Live music is included as part of the La Norma dining experience. Simply make a dinner reservation for a music evening and enjoy.' },
  { q: 'What kind of music can I expect?', a: 'We feature jazz duos, acoustic Italian songbook, classical strings, and occasionally flamenco and bossa nova. The common thread is warmth, intimacy, and the Mediterranean spirit.' },
  { q: 'Can I book a table specifically for a music night?', a: 'Yes — when making your reservation, mention that you\'d like to be seated in the dining room during the performance. We\'ll do our best to accommodate.' },
  { q: 'Can I hire a musician or act for a private event?', a: 'Yes. We can arrange dedicated live music for private dining and events. Contact us via the inquiry form and we\'ll discuss the options.' },
];

function formatEventDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

const EMPTY = { first_name: '', last_name: '', email: '', phone: '', date: '', guests: '2', message: '' };

export default function LiveMusicPage() {
  const { navigate } = useNavigation();
  const [events, setEvents]     = useState([]);
  const [openFaq, setOpenFaq]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [formError, setFormError]   = useState('');

  useEffect(() => {
    document.title = 'Live Music — La Norma Ristorante & Pizzeria';
    fetch(`${API_BASE}/api/events?category=live_music`)
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
      const res = await fetch(`${API_BASE}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'live_music', guests: Number(form.guests) }),
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
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&q=80)' }}
          role="img"
          aria-label="Live jazz performance in a warm restaurant setting"
        />
        <div className="ep-hero__overlay" />
        <div className="ep-hero__content container">
          <button className="ep-hero__back" onClick={() => navigate('home')} aria-label="Back to homepage">
            ← Back to La Norma
          </button>
          <p className="ep-hero__eyebrow">Wednesday & Saturday Evenings</p>
          <h1 className="ep-hero__heading">
            Live Music<br />
            <em>& Atmosphere</em>
          </h1>
          <p className="ep-hero__sub">
            Enjoy live jazz, acoustic Italian classics, and the warm sound of strings as the soundtrack
            to your evening — intimate, unhurried, unforgettable. No cover charge.
          </p>
        </div>
      </header>

      <main id="main-content">
        {/* Upcoming Schedule */}
        <section className="ep-section">
          <div className="container">
            <p className="ep-section__label">Upcoming</p>
            <h2 className="ep-section__heading">This Month's Performers</h2>
            <p className="ep-section__sub">
              No cover charge — simply dine with us on a music evening. Reservations recommended as tables fill quickly on performance nights.
            </p>

            <div className="ep-events-grid">
              {events.length === 0 ? (
                <div className="ep-events-empty">
                  <p>Schedule coming soon. Sign up below and we'll keep you informed.</p>
                </div>
              ) : events.map(ev => (
                <article className="ep-event-card" key={ev.id}>
                  <div
                    className="ep-event-card__image"
                    style={ev.image_url ? { backgroundImage: `url(${ev.image_url})` } : { background: '#1a1a14' }}
                  >
                    {!ev.image_url && <span className="ep-event-card__image-icon">🎵</span>}
                  </div>
                  <div className="ep-event-card__body">
                    <div className="ep-event-card__date">{formatEventDate(ev.date)} · {ev.time}</div>
                    <h3 className="ep-event-card__title">{ev.title}</h3>
                    <p className="ep-event-card__desc">{ev.description}</p>
                    <div className="ep-event-card__footer">
                      <span className="ep-event-card__price" style={{ color: 'var(--gold)' }}>
                        Free with dinner
                      </span>
                      <span className="ep-event-card__spots">Res. recommended</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* What makes it special */}
        <section className="ep-section ep-section--dark">
          <div className="container">
            <p className="ep-section__label" style={{ color: 'var(--gold-light)' }}>The Atmosphere</p>
            <h2 className="ep-section__heading">Music as Part of the Meal</h2>
            <div className="ep-features">
              {[
                { icon: '🎷', title: 'Curated Acts', desc: 'Every performer is personally selected for their ability to elevate — not overpower — the dining experience.' },
                { icon: '🕯️', title: 'Intimate Setting', desc: 'Our dining room seats under 50. Every table is close enough to feel the music, far enough to hold a conversation.' },
                { icon: '🍷', title: 'Full Menu Available', desc: 'Music nights feature our complete dinner menu and wine list. No fixed-price menus or minimum spend on music evenings.' },
                { icon: '🎶', title: 'No Cover Charge', desc: 'Live music is simply part of the La Norma experience — no ticket, no surcharge, no booking fee.' },
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
            <p className="ep-section__label">Get in Touch</p>
            <h2 className="ep-section__heading">Reserve a Table or Inquire</h2>
            <p className="ep-section__sub">
              Want to join us on a specific music evening, or interested in private event music? Let us know below.
            </p>

            <div className="ep-form-wrap">
              {submitted ? (
                <div className="ep-form-success">
                  <div className="ep-form-success__icon">🎵</div>
                  <h3 className="ep-form-success__title">We'll be in touch!</h3>
                  <p className="ep-form-success__sub">
                    Thanks, {form.first_name}. We'll confirm your table or answer your inquiry within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {formError && <div className="ep-form-error">{formError}</div>}
                  <div className="ep-form-grid">
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="lm-first">First name *</label>
                      <input id="lm-first" className="ep-input" type="text" value={form.first_name}
                        onChange={e => set('first_name', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="lm-last">Last name *</label>
                      <input id="lm-last" className="ep-input" type="text" value={form.last_name}
                        onChange={e => set('last_name', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="lm-email">Email *</label>
                      <input id="lm-email" className="ep-input" type="email" value={form.email}
                        onChange={e => set('email', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="lm-phone">Phone</label>
                      <input id="lm-phone" className="ep-input" type="tel" value={form.phone}
                        onChange={e => set('phone', e.target.value)} />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="lm-date">Preferred date</label>
                      <input id="lm-date" className="ep-input" type="date" value={form.date}
                        onChange={e => set('date', e.target.value)} />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="lm-guests">Guests</label>
                      <select id="lm-guests" className="ep-select" value={form.guests}
                        onChange={e => set('guests', e.target.value)}>
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="ep-field ep-field--span2">
                      <label className="ep-label" htmlFor="lm-msg">Message</label>
                      <textarea id="lm-msg" className="ep-textarea" value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder="e.g. interested in a specific music night, private event inquiry..." />
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
            <h2 className="ep-cta__heading">Dinner, wine, and live music.<br /><em>The full La Norma evening.</em></h2>
            <p className="ep-cta__sub">Every Wednesday and Saturday. No cover charge. Reservations recommended.</p>
            <div className="ep-cta__actions">
              <a href="#reserve" className="btn btn--primary" onClick={e => { e.preventDefault(); document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Reserve a Table
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
