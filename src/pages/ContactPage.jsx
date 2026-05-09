import { useEffect, useId, useRef, useState } from 'react';
import API_BASE from '../config/api';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { OPENTABLE_RESERVATION_URL } from '../utils/hospitalityMedia';
import { PAGE_KEYS } from '../../shared/routes.js';
import './EditorialPage.css';

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=85';

export default function ContactPage() {
  const restaurant = useSection('restaurant');
  const page = useSection('contactPage');
  const general = useSection('general');
  const { navigate } = useNavigation();
  const fid = useId();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Lazy-load the map iframe only when scrolled near it
  const [mapRef, mapVis] = useInView({ rootMargin: '300px' });
  const [tilesRef, tilesVis] = useInView();
  const [formRef, formVis] = useInView();

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const hoursRows = general?.hoursWeekly || [];

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required.';
    if (!form.last_name.trim())  errs.last_name  = 'Required.';
    if (!form.email.trim())      errs.email = 'Required.';
    else if (!isValidEmail(form.email.trim())) errs.email = 'Please enter a valid email.';
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = 'Please write at least a short message (10+ characters).';
    setErrors(errs);
    setSubmitError('');
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          message: form.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to submit.');
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  usePageMetadata({
    title: 'Contact La Norma',
    description:
      'Contact La Norma for dinner reservations, directions, cooking classes, wine tastings, live music evenings, and private event planning.',
  });

  return (
    <div className="editorial-page editorial-page--contact">
      <Navbar />

      {/* ============================================================== */}
      {/* HERO — full-bleed photographic, luxury monogram + stats bar    */}
      {/* ============================================================== */}
      <header className="cp-hero">
        <div className="cp-hero__bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} role="img" aria-label="La Norma dining room" />
        <div className="cp-hero__overlay" />
        <span className="cp-hero__monogram" aria-hidden="true">LN</span>

        <div className="cp-hero__content container">
          <span className="cp-hero__rule" aria-hidden="true" />
          <div className="cp-hero__copy">
            <p className="cp-hero__eyebrow">La Norma · Longboat Key</p>
            <h1 className="cp-hero__heading">Get in touch</h1>
            <h2 className="cp-hero__h2">We answer every message ourselves.</h2>
            <p className="cp-hero__sub">
              Reservations, planning, dietary notes, accessibility, feedback — choose the path that matches what you need, or write to us directly. Replies within one business day, always from the team.
            </p>
            <div className="cp-hero__actions">
              <a href={OPENTABLE_RESERVATION_URL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                Reserve on OpenTable
              </a>
              <a href={`tel:${restaurant.phone}`} className="btn btn--outline-light">
                Call {restaurant.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="cp-hero__stats-bar">
          <div className="container cp-hero__stats">
            <div className="cp-hero__stat" style={{ animationDelay: '0.4s' }}>
              <span className="cp-hero__stat-value">Within 1 day</span>
              <span className="cp-hero__stat-label">Reply time</span>
            </div>
            <div className="cp-hero__stat" style={{ animationDelay: '0.52s' }}>
              <span className="cp-hero__stat-value">Sarasota & LBK</span>
              <span className="cp-hero__stat-label">Service area</span>
            </div>
            <div className="cp-hero__stat" style={{ animationDelay: '0.64s' }}>
              <span className="cp-hero__stat-value">Since 2008</span>
              <span className="cp-hero__stat-label">Family-run</span>
            </div>
          </div>
        </div>

        <a href="#contact-tiles" className="cp-hero__scroll" aria-label="Scroll to next section">
          <span>Scroll</span>
          <span className="cp-hero__scroll-line" aria-hidden="true" />
        </a>
      </header>

      <main id="main-content" className="editorial-main editorial-main--no-top">
        {/* ============================================================ */}
        {/* QUICK ACTIONS — three luxury tiles                            */}
        {/* ============================================================ */}
        <section className="cp-tiles-section" id="contact-tiles">
          <div className="container">
            <div className={`cp-tiles fade-up${tilesVis ? ' visible' : ''}`} ref={tilesRef}>
              <a href={OPENTABLE_RESERVATION_URL} target="_blank" rel="noopener noreferrer" className="cp-tile">
                <span className="cp-tile__num" aria-hidden="true">01</span>
                <div className="cp-tile__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round"/><line x1="8" y1="3" x2="8" y2="7" strokeLinecap="round"/><line x1="16" y1="3" x2="16" y2="7" strokeLinecap="round"/></svg>
                </div>
                <h3 className="cp-tile__title">Reserve a table</h3>
                <p className="cp-tile__body">Instant confirmation through OpenTable. Best for dinner and walk-up evenings.</p>
                <span className="cp-tile__cta">Book now <span aria-hidden="true">&rarr;</span></span>
              </a>

              <a href={`tel:${restaurant.phone}`} className="cp-tile cp-tile--feature">
                <span className="cp-tile__num" aria-hidden="true">02</span>
                <div className="cp-tile__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="cp-tile__title">Call directly</h3>
                <p className="cp-tile__body">Speak with the host stand for last-minute, large parties, or accessibility needs.</p>
                <span className="cp-tile__cta cp-tile__cta--phone">{restaurant.phone}</span>
              </a>

              <a href={restaurant.mapEmbedUrl} target="_blank" rel="noopener noreferrer" className="cp-tile">
                <span className="cp-tile__num" aria-hidden="true">03</span>
                <div className="cp-tile__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" strokeLinecap="round"/></svg>
                </div>
                <h3 className="cp-tile__title">Visit us</h3>
                <p className="cp-tile__body">{restaurant.address}<br />{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                <span className="cp-tile__cta">Get directions <span aria-hidden="true">&rarr;</span></span>
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SEND A MESSAGE — split screen with concierge sidebar          */}
        {/* ============================================================ */}
        <section className="cp-form-section" id="contact-form" aria-labelledby="contact-form-title">
          <div className="container">
            <div className={`cp-form-layout fade-up${formVis ? ' visible' : ''}`} ref={formRef}>
              <div className="cp-form-shell">
                <p className="cp-form__eyebrow">
                  <span className="cp-form__eyebrow-mark" aria-hidden="true" />
                  Direct message
                </p>
                <h2 className="cp-form__title" id="contact-form-title">{page.form.title}</h2>
                <p className="cp-form__lead">{page.form.lead}</p>

                {submitted ? (
                  <div className="cp-form-success" role="status" aria-live="polite">
                    <div className="cp-form-success__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3>{page.form.success_title}</h3>
                    <p>{page.form.success_message}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="cp-form">
                    {submitError && <div className="cp-form__error" role="alert">{submitError}</div>}

                    <div className="cp-form__row">
                      <div className={`cp-form__field${errors.first_name ? ' has-error' : ''}`}>
                        <label htmlFor={`${fid}-first`}>First name <span aria-hidden="true">*</span></label>
                        <input id={`${fid}-first`} type="text" autoComplete="given-name" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} aria-invalid={Boolean(errors.first_name)} />
                        {errors.first_name && <p className="cp-form__field-error">{errors.first_name}</p>}
                      </div>
                      <div className={`cp-form__field${errors.last_name ? ' has-error' : ''}`}>
                        <label htmlFor={`${fid}-last`}>Last name <span aria-hidden="true">*</span></label>
                        <input id={`${fid}-last`} type="text" autoComplete="family-name" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} aria-invalid={Boolean(errors.last_name)} />
                        {errors.last_name && <p className="cp-form__field-error">{errors.last_name}</p>}
                      </div>
                    </div>

                    <div className="cp-form__row">
                      <div className={`cp-form__field${errors.email ? ' has-error' : ''}`}>
                        <label htmlFor={`${fid}-email`}>Email <span aria-hidden="true">*</span></label>
                        <input id={`${fid}-email`} type="email" autoComplete="email" value={form.email} onChange={(e) => setField('email', e.target.value)} aria-invalid={Boolean(errors.email)} />
                        {errors.email && <p className="cp-form__field-error">{errors.email}</p>}
                      </div>
                      <div className="cp-form__field">
                        <label htmlFor={`${fid}-phone`}>Phone <span className="cp-form__optional">(optional)</span></label>
                        <input id={`${fid}-phone`} type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(941) …" />
                      </div>
                    </div>

                    <div className={`cp-form__field${errors.message ? ' has-error' : ''}`}>
                      <label htmlFor={`${fid}-msg`}>Message <span aria-hidden="true">*</span></label>
                      <textarea id={`${fid}-msg`} rows={5} value={form.message} onChange={(e) => setField('message', e.target.value)} placeholder="Tell us what you need — dietary notes, group plans, feedback, anything else." aria-invalid={Boolean(errors.message)} />
                      {errors.message && <p className="cp-form__field-error">{errors.message}</p>}
                    </div>

                    <div className="cp-form__actions">
                      <button type="submit" className="cp-form__submit" disabled={submitting}>
                        <span>{submitting ? 'Sending…' : page.form.submit_label}</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <p className="cp-form__note">{page.form.note}</p>
                    </div>
                  </form>
                )}
              </div>

              <aside className="cp-concierge">
                <div className="cp-concierge__card">
                  <p className="cp-concierge__label">What happens next</p>
                  <ol className="cp-concierge__steps">
                    <li>
                      <span className="cp-concierge__step-num">01</span>
                      <span>Your message lands with the host team within seconds.</span>
                    </li>
                    <li>
                      <span className="cp-concierge__step-num">02</span>
                      <span>We read it ourselves — no auto-replies, no ticket queue.</span>
                    </li>
                    <li>
                      <span className="cp-concierge__step-num">03</span>
                      <span>You get a personal reply by email within one business day.</span>
                    </li>
                  </ol>
                </div>

                <div className="cp-concierge__card cp-concierge__card--hours">
                  <p className="cp-concierge__label">Opening hours</p>
                  <ul className="cp-concierge__hours">
                    {hoursRows.map((row) => (
                      <li key={row.day} className={`cp-concierge__hour-row${row.day === todayName ? ' is-today' : ''}`}>
                        <span className="cp-concierge__hour-day">
                          {row.day}
                          {row.day === todayName && <span className="cp-concierge__today-badge">Today</span>}
                        </span>
                        <span className="cp-concierge__hour-time">{row.closed ? 'Closed' : row.hours}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* MAP — embedded with overlay address card                     */}
        {/* ============================================================ */}
        <section className="cp-map-section">
          <div className="cp-map" ref={mapRef}>
            {mapVis ? (
              <iframe
                title="La Norma Ristorante location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zip}`)}&output=embed`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="cp-map__placeholder" aria-hidden="true" />
            )}
            <div className="cp-map__card">
              <p className="cp-map__eyebrow">Find us</p>
              <h3 className="cp-map__address">{restaurant.address}</h3>
              <p className="cp-map__city">{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zip}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cp-map__link"
              >
                Open in Google Maps &rarr;
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SUPPORT — best path by intent                                */}
        {/* ============================================================ */}
        <section className="editorial-main" style={{ paddingTop: 0 }}>
          <div className="container">
            <section className="cp-support">
              <p className="cp-support__eyebrow">Best path by intent</p>
              <h2 className="cp-support__heading">{page.support.heading}</h2>
              <ul className="cp-support__list">
                {page.support.items.map((item, idx) => (
                  <li key={idx}>
                    <span className="cp-support__num">{String(idx + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="cp-support__actions">
                <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.cookingClasses)}>
                  {page.support.primary_label}
                </button>
                <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                  {page.support.secondary_label}
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
