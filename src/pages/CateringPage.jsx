import { useEffect, useId, useState } from 'react';
import API_BASE from '../config/api';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { PAGE_KEYS } from '../../shared/routes.js';
import { CATERING_EVENT_TYPES } from '../../shared/cateringDefaults.js';
import './CateringPage.css';

/* ------------------------------------------------------------------ */
/* SVG Icons — inline to match the project's SVG-custom pattern       */
/* ------------------------------------------------------------------ */
const ICONS = {
  yacht: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20" />
      <path d="M21 17H3l2.5-9.5L12 4l6.5 3.5L21 17Z" />
      <path d="M12 4v13" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  wine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8" />
      <path d="M12 15v7" />
      <path d="M5.2 9h13.6c.5 0 .9-.4.8-.9L18 2H6l-1.6 6.1c-.1.5.3.9.8.9Z" />
      <path d="M5.2 9a6.8 6.8 0 0 0 13.6 0" />
    </svg>
  ),
  champagne: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8" />
      <path d="M12 15v7" />
      <path d="M7 2h10l-1 9a5 5 0 0 1-8 0L7 2Z" />
      <path d="M17 5l3-1" />
      <path d="M20 8l2 1" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.65 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.28 1.54.52 2.35.65A2 2 0 0 1 22 16.92Z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

function getIcon(key) {
  return ICONS[key] || ICONS.champagne;
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function CateringPage() {
  const catering = useSection('catering');
  const restaurant = useSection('restaurant');
  const { navigate } = useNavigation();

  const [introRef, introVisible] = useInView();
  const [perfectRef, perfectVisible] = useInView();
  const [styleRef, styleVisible] = useInView();
  const [galleryRef, galleryVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();
  const [formRef, formVisible] = useInView();

  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Form state
  const fieldUid = useId();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    event_date: '',
    event_type: '',
    guests: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  usePageMetadata({
    title: catering.seoTitle || 'Catering — Private Events & Yacht Parties',
    description: catering.seoDescription,
    image: catering.seoOgImageUrl || catering.heroImageUrl,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'FoodService',
        name: `${restaurant.name} Catering`,
        description: catering.seoDescription,
        url: window.location.href,
        telephone: catering.contactPhone,
        provider: {
          '@type': 'Restaurant',
          name: restaurant.name,
        },
      },
    ],
  });

  // Lightbox keyboard handling
  useEffect(() => {
    if (lightboxIndex < 0) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxIndex(-1);
      if (event.key === 'ArrowRight') setLightboxIndex((i) => Math.min(i + 1, catering.gallery.length - 1));
      if (event.key === 'ArrowLeft') setLightboxIndex((i) => Math.max(i - 1, 0));
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, catering.gallery.length]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!isValidEmail(form.email.trim())) nextErrors.email = 'Please enter a valid email.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        event_date: form.event_date || undefined,
        event_type: form.event_type || undefined,
        guests: form.guests ? Number(form.guests) : undefined,
        message: form.message.trim() || undefined,
      };

      const response = await fetch(`${API_BASE}/api/catering/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to submit your request.');

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const heroStyle = catering.heroImageUrl
    ? { backgroundImage: `url(${catering.heroImageUrl})` }
    : {
        background:
          'linear-gradient(135deg, rgba(39, 61, 47, 0.25), rgba(26, 33, 32, 0.4)), url("https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1800&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };

  return (
    <div className="catering-page">
      <Navbar />

      {/* ---- Hero ---- */}
      <header className="catering-hero">
        <div className="catering-hero__bg" style={heroStyle} role="img" aria-label="La Norma catering presentation" />
        <div className="catering-hero__overlay" />

        <div className="catering-hero__content container">
          <p className="catering-hero__eyebrow">La Norma Ristorante & Pizzeria</p>
          <h1 className="catering-hero__heading">{catering.heroTitle}</h1>
          <p className="catering-hero__sub">{catering.heroSubtitle}</p>

          <div className="catering-hero__actions">
            <button type="button" className="btn btn--primary" onClick={() => scrollToId('catering-request')}>
              {catering.ctaButtonLabel}
            </button>
            <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.menu)}>
              View Our Menu
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ---- Intro ---- */}
        <section className="catering-section" id="catering-intro">
          <div className="container">
            <div className={`catering-intro fade-up${introVisible ? ' visible' : ''}`} ref={introRef}>
              <p className="catering-section__label">Our Catering</p>
              <p>{catering.introP1}</p>
              <p>{catering.introP2}</p>
            </div>
          </div>
        </section>

        {/* ---- Perfect For ---- */}
        {catering.perfectFor?.length > 0 && (
          <section className="catering-section" id="perfect-for">
            <div className="container">
              <div className={`fade-up${perfectVisible ? ' visible' : ''}`} ref={perfectRef}>
                <p className="catering-section__label">Perfect For</p>
                <h2 className="catering-section__heading">Every occasion deserves Italian elegance</h2>
              </div>

              <div className="catering-perfect-grid">
                {catering.perfectFor.map((item, index) => (
                  <div
                    key={item.label}
                    className={`catering-perfect-card fade-up delay-${(index % 5) + 1}${perfectVisible ? ' visible' : ''}`}
                  >
                    <div className="catering-perfect-card__icon">{getIcon(item.icon)}</div>
                    <p className="catering-perfect-card__label">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---- Our Style Includes ---- */}
        {catering.styleIncludes?.length > 0 && (
          <section className="catering-section" id="our-style">
            <div className="container">
              <div className={`fade-up${styleVisible ? ' visible' : ''}`} ref={styleRef}>
                <p className="catering-section__label">Our Style Includes</p>
                <h2 className="catering-section__heading">A curated Italian catering experience</h2>
              </div>

              <div className={`catering-style-list fade-up delay-1${styleVisible ? ' visible' : ''}`}>
                {catering.styleIncludes.map((text) => (
                  <div key={text} className="catering-style-item">
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---- Gallery ---- */}
        {catering.gallery?.length > 0 && (
          <section className="catering-section" id="catering-gallery">
            <div className="container">
              <div className={`fade-up${galleryVisible ? ' visible' : ''}`} ref={galleryRef}>
                <p className="catering-section__label">Gallery</p>
                <h2 className="catering-section__heading">A glimpse of what we do</h2>
              </div>

              <div className={`catering-gallery-grid fade-up delay-1${galleryVisible ? ' visible' : ''}`}>
                {catering.gallery.map((image, index) => (
                  <div
                    key={image.url}
                    className="catering-gallery-item"
                    onClick={() => setLightboxIndex(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${image.alt}`}
                    onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(index)}
                  >
                    <img src={image.url} alt={image.alt} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---- CTA ---- */}
        <section className="catering-section catering-cta" id="catering-cta">
          <div className="container">
            <div className={`fade-up${ctaVisible ? ' visible' : ''}`} ref={ctaRef}>
              <p className="catering-section__label" style={{ color: 'var(--gold-light, #E0C97F)' }}>Catering</p>
              <h2 className="catering-section__heading">{catering.ctaHeading}</h2>
              <p className="catering-cta__text">{catering.ctaText}</p>
              <button type="button" className="btn btn--primary" onClick={() => scrollToId('catering-request')}>
                {catering.ctaButtonLabel}
              </button>
            </div>
          </div>
        </section>

        {/* ---- Contact Block ---- */}
        <section className="catering-section" id="catering-contact">
          <div className="container">
            <div className="catering-contact">
              <div className="catering-contact__item">
                {ICONS.phone}
                <a href={`tel:${catering.contactPhone}`}>{catering.contactPhone}</a>
              </div>
              <div className="catering-contact__item">
                {ICONS.mail}
                <a href={`mailto:${catering.contactEmail}`}>{catering.contactEmail}</a>
              </div>
              <div className="catering-contact__item">
                {ICONS.globe}
                <span>{catering.contactWebsite}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Request Form ---- */}
        <section className="catering-section catering-form-section" id="catering-request">
          <div className="container">
            <div className={`fade-up${formVisible ? ' visible' : ''}`} ref={formRef}>
              <p className="catering-section__label">Request a Quote</p>
              <h2 className="catering-section__heading">Tell us about your event</h2>
            </div>

            <div className="catering-form-layout">
              <div className="catering-form-shell">
                {submitted ? (
                  <div className="catering-form-success" role="status" aria-live="polite">
                    <div className="catering-form-success__icon">{ICONS.check}</div>
                    <h3>Request Received</h3>
                    <p>
                      Thank you for your interest in La Norma catering. Our team will review your request and
                      get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3>Request Catering</h3>
                    <p>Fill out the form below and our events team will be in touch shortly.</p>

                    <form onSubmit={handleSubmit} noValidate>
                      {submitError && (
                        <div className="catering-field__error" role="alert" style={{ marginBottom: '1rem' }}>
                          {submitError}
                        </div>
                      )}

                      <div className="catering-form-grid">
                        {/* Name */}
                        <div className={`catering-field${errors.name ? ' catering-field--error' : ''}`}>
                          <label htmlFor={`${fieldUid}-name`}>Name <span>*</span></label>
                          <input
                            id={`${fieldUid}-name`}
                            type="text"
                            value={form.name}
                            onChange={(e) => setField('name', e.target.value)}
                            placeholder="Your full name"
                            autoComplete="name"
                            aria-invalid={Boolean(errors.name)}
                          />
                          {errors.name && <p className="catering-field__error" role="alert">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className={`catering-field${errors.email ? ' catering-field--error' : ''}`}>
                          <label htmlFor={`${fieldUid}-email`}>Email <span>*</span></label>
                          <input
                            id={`${fieldUid}-email`}
                            type="email"
                            value={form.email}
                            onChange={(e) => setField('email', e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            aria-invalid={Boolean(errors.email)}
                          />
                          {errors.email && <p className="catering-field__error" role="alert">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div className="catering-field">
                          <label htmlFor={`${fieldUid}-phone`}>Phone</label>
                          <input
                            id={`${fieldUid}-phone`}
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setField('phone', e.target.value)}
                            placeholder="(941) 000 0000"
                            autoComplete="tel"
                          />
                        </div>

                        {/* Event Date */}
                        <div className="catering-field">
                          <label htmlFor={`${fieldUid}-date`}>Event Date</label>
                          <input
                            id={`${fieldUid}-date`}
                            type="date"
                            value={form.event_date}
                            onChange={(e) => setField('event_date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        {/* Event Type */}
                        <div className="catering-field">
                          <label htmlFor={`${fieldUid}-type`}>Event Type</label>
                          <select
                            id={`${fieldUid}-type`}
                            value={form.event_type}
                            onChange={(e) => setField('event_type', e.target.value)}
                          >
                            <option value="">Select type...</option>
                            {CATERING_EVENT_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        {/* Number of Guests */}
                        <div className="catering-field">
                          <label htmlFor={`${fieldUid}-guests`}>Number of Guests</label>
                          <input
                            id={`${fieldUid}-guests`}
                            type="number"
                            min="1"
                            max="5000"
                            value={form.guests}
                            onChange={(e) => setField('guests', e.target.value)}
                            placeholder="Estimated headcount"
                          />
                        </div>

                        {/* Message */}
                        <div className="catering-field catering-field--full">
                          <label htmlFor={`${fieldUid}-message`}>Message</label>
                          <textarea
                            id={`${fieldUid}-message`}
                            value={form.message}
                            onChange={(e) => setField('message', e.target.value)}
                            placeholder="Tell us about your event, dietary requirements, or any specific requests..."
                          />
                        </div>
                      </div>

                      <div className="catering-form-actions">
                        <button type="submit" className="btn btn--primary" disabled={submitting}>
                          {submitting ? 'Sending...' : 'Send Request'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <aside className="catering-form-aside">
                <div className="catering-aside-card">
                  <p className="catering-aside-card__label">What happens next</p>
                  <ul className="catering-aside-card__list">
                    <li>We review your request within 24 hours</li>
                    <li>A team member calls to discuss your vision</li>
                    <li>We send a custom menu and presentation plan</li>
                    <li>Final details confirmed one week before</li>
                  </ul>
                </div>

                <div className="catering-aside-card">
                  <p className="catering-aside-card__label">Our promise</p>
                  <ul className="catering-aside-card__list">
                    <li>Fresh, handcrafted Italian specialties</li>
                    <li>Stunning visual presentation</li>
                    <li>Professional, attentive service</li>
                    <li>Fully customizable menus</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ---- Lightbox ---- */}
      {lightboxIndex >= 0 && catering.gallery[lightboxIndex] && (
        <div className="catering-lightbox" onClick={() => setLightboxIndex(-1)} role="dialog" aria-label="Image lightbox">
          <button className="catering-lightbox__close" onClick={() => setLightboxIndex(-1)} aria-label="Close lightbox">
            &times;
          </button>
          <img
            src={catering.gallery[lightboxIndex].url}
            alt={catering.gallery[lightboxIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
