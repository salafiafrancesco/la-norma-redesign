import { useEffect, useId, useRef, useState } from 'react';
import API_BASE from '../config/api';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { PAGE_KEYS } from '../../shared/routes.js';
import {
  CATERING_EVENT_TYPES,
  CATERING_LOCATION_TYPES,
  CATERING_BUDGET_RANGES,
} from '../../shared/cateringDefaults.js';
import './CateringPage.css';

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* ================================================================== */
/* CateringPage                                                       */
/* ================================================================== */
export default function CateringPage() {
  const c = useSection('catering');
  const restaurant = useSection('restaurant');
  const { navigate } = useNavigation();
  const fieldUid = useId();

  // Dynamic content from API
  const [tiers, setTiers] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [processSteps, setProcessSteps] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Form
  const [form, setForm] = useState({ name: '', email: '', phone: '', event_date: '', event_type: '', guests: '', message: '', location_type: '', budget_range: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // InView refs
  const [stmtRef, stmtVis] = useInView();
  const [tiersRef, tiersVis] = useInView();
  const [yachtRef, yachtVis] = useInView();
  const [sigRef, sigVis] = useInView();
  const [galRef, galVis] = useInView();
  const [procRef, procVis] = useInView();
  const [portRef, portVis] = useInView();
  const [testRef, testVis] = useInView();
  const [faqRef, faqVis] = useInView();
  const [ctaRef, ctaVis] = useInView();

  usePageMetadata({
    title: c.seoTitle || 'Catering — Yacht Parties & Private Events',
    description: c.seoDescription,
    image: c.seoOgImageUrl || c.heroImageUrl,
    structuredData: [{
      '@context': 'https://schema.org',
      '@type': 'FoodService',
      name: `${restaurant.name} Catering`,
      description: c.seoDescription,
      url: window.location.href,
      telephone: c.contactPhone,
      areaServed: { '@type': 'Place', name: 'Sarasota County, FL' },
      provider: { '@type': 'Restaurant', name: restaurant.name },
    }],
  });

  // Fetch all catering content collections
  useEffect(() => {
    fetch(`${API_BASE}/api/catering-content/all`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setTiers(data.tiers || []);
        setSignatures(data.signatures || []);
        setGallery(data.gallery || []);
        setProcessSteps(data.process || []);
        setPortfolio(data.portfolio || []);
        setTestimonials(data.testimonials || []);
        setFaqs(data.faqs || []);
        setContentLoaded(true);
      })
      .catch(() => setContentLoaded(true));
  }, []);

  // Lightbox keyboard
  useEffect(() => {
    if (lightboxIndex < 0) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxIndex(-1);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => Math.min(i + 1, gallery.length - 1));
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => Math.max(i - 1, 0));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
  }, [lightboxIndex, gallery.length]);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!isValidEmail(form.email.trim())) errs.email = 'Please enter a valid email.';
    setErrors(errs);
    setSubmitError('');
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/catering/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          event_date: form.event_date || undefined,
          event_type: form.event_type || undefined,
          guests: form.guests ? Number(form.guests) : undefined,
          message: form.message.trim() || undefined,
          location_type: form.location_type || undefined,
          budget_range: form.budget_range || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to submit.');
      setSubmitted(true);
    } catch (err) { setSubmitError(err.message); }
    finally { setSubmitting(false); }
  };

  // Tiers carousel ref for mobile scroll
  const tiersScrollRef = useRef(null);

  return (
    <div className="cat-page">
      <Navbar />

      {/* ============================================================ */}
      {/* 1. HERO                                                      */}
      {/* ============================================================ */}
      <header className="cat-hero">
        <div className="cat-hero__bg" style={{ backgroundImage: `url(${c.heroImageUrl})` }} role="img" aria-label="La Norma catering presentation" />
        <div className="cat-hero__overlay" />
        <div className="cat-hero__content container">
          <p className="cat-hero__eyebrow">{c.heroEyebrow}</p>
          <h1 className="cat-hero__heading">{c.heroTitle}</h1>
          <p className="cat-hero__sub">{c.heroSubtitle}</p>
          <div className="cat-hero__actions">
            <button type="button" className="btn btn--primary" onClick={() => scrollToId('catering-request')}>Request a Quote</button>
            <button type="button" className="btn btn--outline-light" onClick={() => scrollToId('menu-gallery')}>View Sample Menu</button>
          </div>
          {c.heroStats?.length > 0 && (
            <div className="cat-hero__stats">
              {c.heroStats.map((s) => (
                <div key={s.label} className="cat-hero__stat">
                  <span className="cat-hero__stat-value">{s.value}</span>
                  <span className="cat-hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main id="main-content">

        {/* ============================================================ */}
        {/* 2. STATEMENT — Our Approach                                  */}
        {/* ============================================================ */}
        <section className="cat-section cat-section--alt" id="approach">
          <div className="container">
            <div className={`cat-statement fade-up${stmtVis ? ' visible' : ''}`} ref={stmtRef}>
              <div className="cat-statement__media">
                <img src={c.statementImageUrl} alt="Signature dish by La Norma" loading="lazy" />
              </div>
              <div className="cat-statement__copy">
                <p className="cat-section__eyebrow">{c.statementEyebrow}</p>
                <h2 className="cat-section__heading">{c.statementHeading}</h2>
                {c.statementBody.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="cat-statement__body">{p}</p>
                ))}
                {c.statementHighlights?.length > 0 && (
                  <ul className="cat-statement__highlights">
                    {c.statementHighlights.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. SERVICE TIERS                                             */}
        {/* ============================================================ */}
        {tiers.length > 0 && (
          <section className="cat-section" id="services">
            <div className="container">
              <div className={`fade-up${tiersVis ? ' visible' : ''}`} ref={tiersRef}>
                <p className="cat-section__eyebrow">How we cater</p>
                <h2 className="cat-section__heading">Choose the format that fits your occasion</h2>
              </div>
              <div className="cat-tiers" ref={tiersScrollRef}>
                {tiers.map((tier, i) => (
                  <article key={tier.id} className={`cat-tier fade-up delay-${i + 1}${tiersVis ? ' visible' : ''}`}>
                    <div className="cat-tier__media">
                      {tier.image_url && <img src={tier.image_url} alt={tier.title} loading="lazy" />}
                      {tier.badge_label && <span className="cat-tier__badge">{tier.badge_label}</span>}
                    </div>
                    <div className="cat-tier__body">
                      <h3 className="cat-tier__title">{tier.title}</h3>
                      <p className="cat-tier__range">{tier.range_label}</p>
                      <p className="cat-tier__desc">{tier.body}</p>
                      <p className="cat-tier__ideal"><strong>Ideal for:</strong> {tier.ideal_for}</p>
                      <button type="button" className="cat-tier__cta" onClick={() => { setField('event_type', tier.title); scrollToId('catering-request'); }}>
                        {tier.cta_label}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 4. YACHT PARTIES                                             */}
        {/* ============================================================ */}
        <section className="cat-section cat-yacht" id="yacht">
          <div className="cat-yacht__bg" style={{ backgroundImage: `url(${c.yachtImageUrl})` }} role="img" aria-label="Yacht catering on Sarasota Bay" />
          <div className="cat-yacht__overlay" />
          <div className="cat-yacht__content container">
            <div className={`cat-yacht__grid fade-up${yachtVis ? ' visible' : ''}`} ref={yachtRef}>
              <div className="cat-yacht__copy">
                <p className="cat-section__eyebrow" style={{ color: 'var(--gold-light, #E0C97F)' }}>{c.yachtEyebrow}</p>
                <h2 className="cat-section__heading" style={{ color: 'var(--cream)' }}>{c.yachtHeading}</h2>
                {c.yachtBody.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="cat-yacht__body">{p}</p>
                ))}
                <button type="button" className="btn btn--primary" onClick={() => { setField('event_type', 'Yacht Party'); scrollToId('catering-request'); }}>
                  {c.yachtCtaLabel}
                </button>
              </div>
              <aside className="cat-yacht__panel">
                <p className="cat-yacht__panel-label">What we handle</p>
                <ul className="cat-yacht__panel-list">
                  {c.yachtSidePanel.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </aside>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. SIGNATURE OFFERINGS                                       */}
        {/* ============================================================ */}
        {signatures.length > 0 && (
          <section className="cat-section cat-section--alt" id="offerings">
            <div className="container">
              <div className={`fade-up${sigVis ? ' visible' : ''}`} ref={sigRef}>
                <p className="cat-section__eyebrow">What we serve</p>
                <h2 className="cat-section__heading">Signature offerings</h2>
              </div>
              <div className="cat-offerings">
                {signatures.map((item, i) => (
                  <article key={item.id} className={`cat-offering fade-up delay-${(i % 3) + 1}${sigVis ? ' visible' : ''}`}>
                    {item.image_url && <img src={item.image_url} alt={item.title} loading="lazy" className="cat-offering__img" />}
                    <h3 className="cat-offering__title">{item.title}</h3>
                    <p className="cat-offering__desc">{item.description}</p>
                  </article>
                ))}
              </div>
              <p className="cat-offerings__note">Allergies, themes, or specific Sicilian regions? Our chef builds custom menus on request.</p>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 6. MENU GALLERY                                              */}
        {/* ============================================================ */}
        {gallery.length > 0 && (
          <section className="cat-section" id="menu-gallery">
            <div className="container">
              <div className={`fade-up${galVis ? ' visible' : ''}`} ref={galRef}>
                <p className="cat-section__eyebrow">Gallery</p>
                <h2 className="cat-section__heading">{c.menuGalleryHeading}</h2>
                <p className="cat-gallery__sub">{c.menuGallerySubheading}</p>
              </div>
              <div className={`cat-gallery fade-up delay-1${galVis ? ' visible' : ''}`}>
                {gallery.map((img, i) => (
                  <div key={img.id} className="cat-gallery__item" onClick={() => setLightboxIndex(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(i)} aria-label={`View ${img.dish_name || 'dish'}`}>
                    <img src={img.image_url} alt={img.alt_text || img.dish_name || 'La Norma catering dish'} loading="lazy" />
                    {img.dish_name && <span className="cat-gallery__caption">{img.dish_name}</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 7. PROCESS TIMELINE                                          */}
        {/* ============================================================ */}
        {processSteps.length > 0 && (
          <section className="cat-section cat-section--dark" id="process">
            <div className="container">
              <div className={`fade-up${procVis ? ' visible' : ''}`} ref={procRef}>
                <p className="cat-section__eyebrow" style={{ color: 'var(--gold-light, #E0C97F)' }}>{c.processHeading}</p>
                <h2 className="cat-section__heading" style={{ color: 'var(--cream)' }}>From first call to final course</h2>
              </div>
              <div className={`cat-process fade-up delay-1${procVis ? ' visible' : ''}`}>
                {processSteps.map((step) => (
                  <div key={step.id} className="cat-process__step">
                    <span className="cat-process__num">{String(step.step_number).padStart(2, '0')}</span>
                    <h3 className="cat-process__title">{step.title}</h3>
                    <p className="cat-process__desc">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 8. PORTFOLIO                                                 */}
        {/* ============================================================ */}
        {portfolio.length > 0 && (
          <section className="cat-section" id="portfolio">
            <div className="container">
              <div className={`fade-up${portVis ? ' visible' : ''}`} ref={portRef}>
                <p className="cat-section__eyebrow">{c.portfolioHeading}</p>
                <h2 className="cat-section__heading">{c.portfolioSubheading}</h2>
              </div>
              <div className="cat-portfolio">
                {portfolio.map((ev, i) => (
                  <article key={ev.id} className={`cat-portfolio__card fade-up delay-${(i % 2) + 1}${portVis ? ' visible' : ''}`}>
                    <div className="cat-portfolio__media">
                      <img src={ev.image_url} alt={ev.title} loading="lazy" />
                      {ev.tag && <span className="cat-portfolio__tag">{ev.tag}</span>}
                    </div>
                    <div className="cat-portfolio__info">
                      <h3>{ev.title}</h3>
                      {ev.headcount && <p>{ev.headcount}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 9. TESTIMONIALS                                              */}
        {/* ============================================================ */}
        {testimonials.length > 0 && (
          <section className="cat-section cat-section--alt" id="testimonials">
            <div className="container">
              <div className={`fade-up${testVis ? ' visible' : ''}`} ref={testRef}>
                <p className="cat-section__eyebrow">Client feedback</p>
                <h2 className="cat-section__heading">{c.testimonialsHeading}</h2>
              </div>
              <div className={`cat-testimonials fade-up delay-1${testVis ? ' visible' : ''}`}>
                {testimonials.map((t) => (
                  <blockquote key={t.id} className="cat-testimonial">
                    <p className="cat-testimonial__quote">&ldquo;{t.quote}&rdquo;</p>
                    <footer className="cat-testimonial__footer">
                      <strong>{t.author_name}</strong>
                      {t.author_role && <span>{t.author_role}</span>}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 10. FAQ                                                      */}
        {/* ============================================================ */}
        {faqs.length > 0 && (
          <section className="cat-section" id="faq">
            <div className="container">
              <div className={`fade-up${faqVis ? ' visible' : ''}`} ref={faqRef}>
                <p className="cat-section__eyebrow">Questions</p>
                <h2 className="cat-section__heading">{c.faqHeading}</h2>
              </div>
              <div className="cat-faq">
                {faqs.map((f) => (
                  <details key={f.id} className="cat-faq__item">
                    <summary>{f.question}</summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 11. CTA + FORM                                               */}
        {/* ============================================================ */}
        <section className="cat-section cat-section--dark cat-cta-section" id="catering-request">
          <div className="container">
            <div className={`cat-cta-header fade-up${ctaVis ? ' visible' : ''}`} ref={ctaRef}>
              <p className="cat-section__eyebrow" style={{ color: 'var(--gold-light, #E0C97F)' }}>{c.ctaEyebrow}</p>
              <h2 className="cat-section__heading" style={{ color: 'var(--cream)' }}>{c.ctaHeading}</h2>
              <p className="cat-cta-header__sub">{c.ctaSub}</p>
            </div>
          </div>
        </section>

        <section className="cat-section cat-form-section">
          <div className="container">
            <div className="cat-form-layout">
              <div className="cat-form-shell">
                {submitted ? (
                  <div className="cat-form-success" role="status" aria-live="polite">
                    <div className="cat-form-success__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3>Request Received</h3>
                    <p>Thank you for your interest. Our team will review your event details and respond within one business day with menu ideas and a transparent estimate.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="cat-form-shell__title">Request a Quote</h3>
                    <p className="cat-form-shell__sub">Tell us about your event and we&rsquo;ll get back to you within 24 hours.</p>
                    <form onSubmit={handleSubmit} noValidate>
                      {submitError && <div className="cat-form-error" role="alert">{submitError}</div>}
                      <div className="cat-form-grid">
                        <div className={`cat-field${errors.name ? ' cat-field--error' : ''}`}>
                          <label htmlFor={`${fieldUid}-name`}>Name <span>*</span></label>
                          <input id={`${fieldUid}-name`} type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Your full name" autoComplete="name" aria-invalid={Boolean(errors.name)} />
                          {errors.name && <p className="cat-field__error" role="alert">{errors.name}</p>}
                        </div>
                        <div className={`cat-field${errors.email ? ' cat-field--error' : ''}`}>
                          <label htmlFor={`${fieldUid}-email`}>Email <span>*</span></label>
                          <input id={`${fieldUid}-email`} type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} />
                          {errors.email && <p className="cat-field__error" role="alert">{errors.email}</p>}
                        </div>
                        <div className="cat-field">
                          <label htmlFor={`${fieldUid}-phone`}>Phone</label>
                          <input id={`${fieldUid}-phone`} type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(941) 000 0000" autoComplete="tel" />
                        </div>
                        <div className="cat-field">
                          <label htmlFor={`${fieldUid}-date`}>Event Date</label>
                          <input id={`${fieldUid}-date`} type="date" value={form.event_date} onChange={(e) => setField('event_date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="cat-field">
                          <label htmlFor={`${fieldUid}-type`}>Event Type</label>
                          <select id={`${fieldUid}-type`} value={form.event_type} onChange={(e) => setField('event_type', e.target.value)}>
                            <option value="">Select type...</option>
                            {CATERING_EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="cat-field">
                          <label htmlFor={`${fieldUid}-guests`}>Number of Guests</label>
                          <input id={`${fieldUid}-guests`} type="number" min="1" max="5000" value={form.guests} onChange={(e) => setField('guests', e.target.value)} placeholder="Estimated headcount" />
                        </div>
                        <div className="cat-field">
                          <label htmlFor={`${fieldUid}-location`}>Location Type</label>
                          <select id={`${fieldUid}-location`} value={form.location_type} onChange={(e) => setField('location_type', e.target.value)}>
                            <option value="">Select location...</option>
                            {CATERING_LOCATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="cat-field">
                          <label htmlFor={`${fieldUid}-budget`}>Budget Range</label>
                          <select id={`${fieldUid}-budget`} value={form.budget_range} onChange={(e) => setField('budget_range', e.target.value)}>
                            <option value="">Select range...</option>
                            {CATERING_BUDGET_RANGES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="cat-field cat-field--full">
                          <label htmlFor={`${fieldUid}-message`}>Message</label>
                          <textarea id={`${fieldUid}-message`} value={form.message} onChange={(e) => setField('message', e.target.value)} placeholder="Tell us about your event — dietary requirements, theme, specific requests..." />
                        </div>
                      </div>
                      <div className="cat-form-actions">
                        <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Sending...' : 'Send Request'}</button>
                      </div>
                    </form>
                  </>
                )}
              </div>

              <aside className="cat-form-aside">
                <div className="cat-aside-card">
                  <p className="cat-aside-card__label">What happens next</p>
                  <ul className="cat-aside-card__list">
                    <li>We review your request within 24 hours</li>
                    <li>A team member calls to discuss your vision</li>
                    <li>We send a custom menu and presentation plan</li>
                    <li>Final details confirmed one week before</li>
                  </ul>
                </div>
                <div className="cat-aside-card">
                  <p className="cat-aside-card__label">Our promise</p>
                  <ul className="cat-aside-card__list">
                    <li>Fresh, handcrafted Italian specialties</li>
                    <li>Stunning visual presentation</li>
                    <li>Professional, attentive service</li>
                    <li>Fully customizable menus</li>
                  </ul>
                </div>
                <div className="cat-aside-card">
                  <p className="cat-aside-card__label">Contact</p>
                  <ul className="cat-aside-card__list" style={{ listStyle: 'none' }}>
                    <li><a href={`tel:${c.contactPhone}`}>{c.contactPhone}</a></li>
                    <li><a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a></li>
                    <li>{c.contactWebsite}</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Lightbox */}
      {lightboxIndex >= 0 && gallery[lightboxIndex] && (
        <div className="cat-lightbox" onClick={() => setLightboxIndex(-1)} role="dialog" aria-label="Image lightbox">
          <button className="cat-lightbox__close" onClick={() => setLightboxIndex(-1)} aria-label="Close">&times;</button>
          <img src={gallery[lightboxIndex].image_url} alt={gallery[lightboxIndex].alt_text || gallery[lightboxIndex].dish_name || 'Catering dish'} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
