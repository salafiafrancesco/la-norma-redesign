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

const TIERS = [
  {
    id: 'cocktail', title: 'Cocktail Reception',
    range_label: '15–60 guests · 2–3 hrs',
    body: "Passed hors d'oeuvres, a curated bar of antipasti, and just enough structure to keep the room flowing. Designed for evenings where guests should never wait, never sit down, and never feel rushed.",
    ideal_for: 'Cocktail parties, gallery openings, intimate celebrations',
    image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80',
    badge_label: '',
  },
  {
    id: 'grazing', title: 'Grazing Experience',
    range_label: '30–120 guests · 3–4 hrs',
    body: 'Our most photographed format. Elevated risers, marble boards, and a centerpiece grazing table dressed with Sicilian charcuterie, artisanal cheeses, fresh figs, and house-baked focaccia. Built to be the visual anchor of the event.',
    ideal_for: 'Yacht parties, wedding receptions, milestone events',
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=80',
    badge_label: 'Signature',
  },
  {
    id: 'full', title: 'Full Event Catering',
    range_label: '50–250 guests · 4–6 hrs',
    body: 'A complete service — from amuse-bouche through dessert, with kitchen team, servers, and front-of-house coordination. For events where the catering is the evening.',
    ideal_for: 'Corporate galas, large private events, multi-course seated dinners',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    badge_label: '',
  },
];

const SIGNATURES = [
  { id: 's1', title: 'Antipasto & charcuterie displays', description: 'Aged Parma, soppressata, Sicilian cheeses, fresh and dried fruit, on marble.', image_url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=700&q=80' },
  { id: 's2', title: 'Cocktail-style finger foods', description: 'Arancini al ragù, polpette, bruschette, sliders di porchetta — passed warm.', image_url: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=700&q=80' },
  { id: 's3', title: 'Mini Italian classics', description: 'Lasagna in single portions, eggplant parmigiana cups, risotto al limone.', image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=700&q=80' },
  { id: 's4', title: 'Individual portions & salad cups', description: 'Caprese skewers, panzanella jars, citrus-fennel salad — engineered for standing receptions.', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80' },
  { id: 's5', title: 'Artisanal cheeses & cured meats', description: 'Pecorino, Caciocavallo, Bresaola, Mortadella — sourced from named producers.', image_url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=700&q=80' },
  { id: 's6', title: 'Refined desserts & pastries', description: 'Cannoli filled à la minute, mini cassata, pistachio panna cotta.', image_url: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=700&q=80' },
];

const PROCESS = [
  { id: 'p1', step_number: 1, title: 'Tell us about your event', description: 'Date, headcount, vibe, location. A 2-minute form — or a phone call if easier.' },
  { id: 'p2', step_number: 2, title: 'We design your menu', description: 'Within 24–48 hours, our chef sends a custom menu and cost estimate. Revisions welcome.' },
  { id: 'p3', step_number: 3, title: 'We confirm one week out', description: 'Final headcount, allergies, timing, dock or address details. Locked in writing.' },
  { id: 'p4', step_number: 4, title: 'We host the day with you', description: 'Setup, service, breakdown. You stay with your guests.' },
];

const TESTIMONIALS = [
  { id: 't1', quote: 'They handled a 60-guest reception on a moving yacht like it was a sit-down dinner at home. Flawless.', author_name: 'Charter captain', author_role: 'Longboat Key' },
  { id: 't2', quote: 'The grazing table was the centerpiece of the night. Half my guests asked for the caterer’s name.', author_name: 'Private host', author_role: '50th birthday celebration' },
  { id: 't3', quote: "Custom menu, dietary restrictions handled silently, on-time to the minute. We've already rebooked.", author_name: 'Corporate event lead', author_role: 'Sarasota tech firm' },
];

const FAQS = [
  { id: 'f1', question: "What's the minimum guest count?", answer: 'Fifteen guests for off-premise catering. We also handle in-restaurant private events for smaller groups.' },
  { id: 'f2', question: 'How far in advance should I book?', answer: 'We accept events with 48 hours notice when possible, but 2–3 weeks ahead gives us full menu flexibility.' },
  { id: 'f3', question: 'Do you handle service staff?', answer: 'Yes — chefs, servers, and bartenders are included in our Full Event tier and available as add-ons for the others.' },
  { id: 'f4', question: "What's the service area?", answer: 'Sarasota County and Longboat Key are standard. We travel further on request.' },
  { id: 'f5', question: 'Can you accommodate dietary restrictions?', answer: 'Always. Gluten-free, vegan, kosher-style, and allergies are part of every menu we design.' },
  { id: 'f6', question: 'Do you provide rentals (linens, glassware)?', answer: 'We coordinate rentals through trusted local partners — billed transparently in your quote.' },
  { id: 'f7', question: "What's your cancellation policy?", answer: 'Sent with the menu proposal. Generally: full refund of deposit up to 14 days out.' },
  { id: 'f8', question: 'Do you offer tastings?', answer: 'Yes, for events of 50+ guests. Tasting fees credited toward the final bill.' },
];

/* ================================================================== */
/* CateringPage — 9-section editorial layout                          */
/* ================================================================== */
export default function CateringPage() {
  const c = useSection('catering');
  const restaurant = useSection('restaurant');
  const { navigate } = useNavigation();
  const fieldUid = useId();

  // Live data overrides (from CMS) — fall back to static arrays above when empty
  const [tiersData, setTiersData] = useState([]);
  const [signaturesData, setSignaturesData] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [testimonialsData, setTestimonialsData] = useState([]);
  const [faqsData, setFaqsData] = useState([]);

  // FAQ open state (controlled to support aria-expanded properly)
  const [openFaq, setOpenFaq] = useState(null);

  // Active tier in the HOW WE CATER showcase
  const [activeTier, setActiveTier] = useState(1); // default to Grazing (signature)

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
  const [procRef, procVis] = useInView();
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

  // Fetch live content (overrides static fallbacks when present)
  useEffect(() => {
    fetch(`${API_BASE}/api/catering-content/all`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setTiersData(data.tiers || []);
        setSignaturesData(data.signatures || []);
        setProcessData(data.process || []);
        setTestimonialsData(data.testimonials || []);
        setFaqsData(data.faqs || []);
      })
      .catch(() => {});
  }, []);

  // Pre-fill event_type from URL hash (#request-form?type=Yacht%20Party)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('event_type');
    if (t && CATERING_EVENT_TYPES.includes(t)) {
      setForm((f) => ({ ...f, event_type: t }));
    }
  }, []);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const goToForm = (eventType) => {
    if (eventType) setField('event_type', eventType);
    scrollToId('request-form');
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

  const tiersScrollRef = useRef(null);

  // Resolve final lists (live data wins over fallback)
  const tiers = tiersData.length > 0 ? tiersData : TIERS;
  const signatures = signaturesData.length > 0 ? signaturesData : SIGNATURES;
  const processSteps = processData.length > 0 ? processData : PROCESS;
  const testimonials = testimonialsData.length > 0 ? testimonialsData : TESTIMONIALS;
  const faqs = faqsData.length > 0 ? faqsData : FAQS;

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
          <span className="cat-hero__rule" aria-hidden="true" />
          <div className="cat-hero__copy">
            <p className="cat-hero__eyebrow">{c.heroEyebrow}</p>
            <h1 className="cat-hero__heading">{c.heroTitle}</h1>
            <h2 className="cat-hero__h2">{c.heroSubtitle}</h2>
            <p className="cat-hero__sub">{c.heroSub}</p>
            <div className="cat-hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => goToForm()}>Request a Quote</button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.menu)}>View Sample Menu</button>
            </div>
          </div>
        </div>
        {c.heroStats?.length > 0 && (
          <div className="cat-hero__stats-bar">
            <div className="container cat-hero__stats">
              {c.heroStats.map((s, i) => (
                <div key={s.label} className="cat-hero__stat" style={{ animationDelay: `${0.4 + i * 0.12}s` }}>
                  <span className="cat-hero__stat-value">{s.value}</span>
                  <span className="cat-hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <a href="#approach" className="cat-hero__scroll" aria-label="Scroll to next section">
          <span>Scroll</span>
          <span className="cat-hero__scroll-line" aria-hidden="true" />
        </a>
      </header>

      <main id="main-content">
        {/* ============================================================ */}
        {/* 2. STATEMENT                                                 */}
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
                {(c.statementBody || '').split('\n').filter(Boolean).map((p, i) => (
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
        {/* 3. HOW WE CATER — interactive showcase                       */}
        {/* ============================================================ */}
        <section className="cat-section cat-howwe" id="services">
          <div className="container">
            <div className={`cat-howwe__intro fade-up${tiersVis ? ' visible' : ''}`} ref={tiersRef}>
              <p className="cat-section__eyebrow">How we cater</p>
              <h2 className="cat-section__heading">Three formats, infinitely customizable.</h2>
              <p className="cat-section__sub">
                Pick the format that matches the room you&rsquo;re hosting.
              </p>
            </div>

            <div className={`cat-howwe__showcase fade-up delay-1${tiersVis ? ' visible' : ''}`} ref={tiersScrollRef}>
              {/* Numbered tab strip */}
              <div className="cat-howwe__tabs" role="tablist" aria-label="Catering formats">
                {tiers.map((tier, i) => {
                  const isActive = i === activeTier;
                  const tabId = `cat-tier-tab-${i}`;
                  const panelId = `cat-tier-panel-${i}`;
                  return (
                    <button
                      key={tier.id}
                      id={tabId}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={panelId}
                      tabIndex={isActive ? 0 : -1}
                      className={`cat-howwe__tab${isActive ? ' is-active' : ''}`}
                      onClick={() => setActiveTier(i)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          setActiveTier((current) => (current + 1) % tiers.length);
                        } else if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          setActiveTier((current) => (current - 1 + tiers.length) % tiers.length);
                        }
                      }}
                    >
                      <span className="cat-howwe__tab-num">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="cat-howwe__tab-name">{tier.title}</span>
                      {tier.badge_label && (
                        <span className="cat-howwe__tab-badge">{tier.badge_label}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Editorial panel */}
              {tiers.map((tier, i) => {
                if (i !== activeTier) return null;
                const panelId = `cat-tier-panel-${i}`;
                const tabId = `cat-tier-tab-${i}`;
                return (
                  <div
                    key={tier.id}
                    id={panelId}
                    role="tabpanel"
                    aria-labelledby={tabId}
                    className="cat-howwe__panel"
                  >
                    <div className="cat-howwe__media">
                      {tier.image_url && (
                        <img src={tier.image_url} alt={tier.title} loading="lazy" />
                      )}
                      <span className="cat-howwe__media-num" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="cat-howwe__media-frame" aria-hidden="true" />
                    </div>

                    <div className="cat-howwe__copy">
                      <span className="cat-howwe__range">{tier.range_label}</span>
                      <h3 className="cat-howwe__title">{tier.title}</h3>
                      <p className="cat-howwe__body">{tier.body}</p>

                      <div className="cat-howwe__ideal">
                        <span className="cat-howwe__ideal-label">Ideal for</span>
                        <span className="cat-howwe__ideal-text">{tier.ideal_for}</span>
                      </div>

                      <button
                        type="button"
                        className="cat-howwe__cta"
                        onClick={() => goToForm(tier.title)}
                      >
                        <span>Inquire about this format</span>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    <div className="cat-howwe__progress" aria-hidden="true">
                      {tiers.map((_, j) => (
                        <span
                          key={j}
                          className={`cat-howwe__progress-dot${j === activeTier ? ' is-active' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

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
                {(c.yachtBody || '').split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="cat-yacht__body">{p}</p>
                ))}
                <button type="button" className="btn btn--primary" onClick={() => goToForm('Yacht Party')}>
                  {c.yachtCtaLabel} &rarr;
                </button>
              </div>
              <aside className="cat-yacht__panel">
                <p className="cat-yacht__panel-label">What we handle</p>
                <ul className="cat-yacht__panel-list">
                  {(c.yachtSidePanel || []).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </aside>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* MID-PAGE CTA STRIP                                           */}
        {/* ============================================================ */}
        <section className="cat-midcta">
          <div className="container cat-midcta__inner">
            <div className="cat-midcta__copy">
              <p className="cat-midcta__eyebrow">Ready to plan?</p>
              <h2 className="cat-midcta__title">A 2-minute form. A custom menu within 48 hours.</h2>
            </div>
            <div className="cat-midcta__actions">
              <button type="button" className="btn btn--primary cat-midcta__btn" onClick={() => goToForm()}>
                Request a Quote &rarr;
              </button>
              <a href={`tel:${c.contactPhone}`} className="cat-midcta__phone">
                or call {c.contactPhone}
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. SIGNATURE OFFERINGS                                       */}
        {/* ============================================================ */}
        <section className="cat-section cat-section--alt" id="offerings">
          <div className="container">
            <div className={`fade-up${sigVis ? ' visible' : ''}`} ref={sigRef}>
              <p className="cat-section__eyebrow">What we serve</p>
              <h2 className="cat-section__heading">Signature offerings.</h2>
              <p className="cat-section__sub">Six pillars of every La Norma catering, customized to your event.</p>
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
            <p className="cat-offerings__note"><em>Allergies, themes, or specific Sicilian regions? Our chef builds custom menus on request.</em></p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. PROCESS TIMELINE                                          */}
        {/* ============================================================ */}
        <section className="cat-section cat-section--dark" id="process">
          <div className="container">
            <div className={`fade-up${procVis ? ' visible' : ''}`} ref={procRef}>
              <p className="cat-section__eyebrow" style={{ color: 'var(--gold-light, #E0C97F)' }}>How it works</p>
              <h2 className="cat-section__heading" style={{ color: 'var(--cream)' }}>From conversation to celebration.</h2>
              <p className="cat-section__sub" style={{ color: 'rgba(248, 243, 235, 0.72)' }}>Four steps, transparent timing, no surprises.</p>
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

        {/* ============================================================ */}
        {/* 7. TESTIMONIALS                                              */}
        {/* ============================================================ */}
        <section className="cat-section cat-section--dark cat-testimonials-section" id="testimonials">
          <div className="container">
            <div className={`fade-up${testVis ? ' visible' : ''}`} ref={testRef}>
              <p className="cat-section__eyebrow" style={{ color: 'var(--gold-light, #E0C97F)' }}>Guest voices</p>
              <h2 className="cat-section__heading" style={{ color: 'var(--cream)' }}>What hosts say.</h2>
            </div>
            <div className={`cat-testimonials cat-testimonials--dark fade-up delay-1${testVis ? ' visible' : ''}`}>
              {testimonials.map((t) => (
                <blockquote key={t.id} className="cat-testimonial">
                  <p className="cat-testimonial__quote">{t.quote}</p>
                  <footer className="cat-testimonial__footer">
                    <strong>{t.author_name}</strong>
                    {t.author_role && <span>{t.author_role}</span>}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 8. FAQ                                                       */}
        {/* ============================================================ */}
        <section className="cat-section" id="faq">
          <div className="container">
            <div className={`fade-up${faqVis ? ' visible' : ''}`} ref={faqRef}>
              <p className="cat-section__eyebrow">Questions</p>
              <h2 className="cat-section__heading">Common questions.</h2>
            </div>
            <div className="cat-faq" role="list">
              {faqs.map((f, i) => {
                const isOpen = openFaq === i;
                const panelId = `${fieldUid}-faq-panel-${i}`;
                const buttonId = `${fieldUid}-faq-btn-${i}`;
                return (
                  <div key={f.id} className={`cat-faq__item${isOpen ? ' is-open' : ''}`} role="listitem">
                    <button
                      type="button"
                      id={buttonId}
                      className="cat-faq__question"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                    >
                      <span>{f.question}</span>
                      <span className="cat-faq__chevron" aria-hidden="true" />
                    </button>
                    <div id={panelId} role="region" aria-labelledby={buttonId} className="cat-faq__answer" hidden={!isOpen}>
                      <p>{f.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 9. CTA + FORM                                                */}
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

        <section className="cat-section cat-form-section" id="request-form">
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
                  <ul className="cat-aside-card__list cat-aside-card__list--contact">
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
    </div>
  );
}
