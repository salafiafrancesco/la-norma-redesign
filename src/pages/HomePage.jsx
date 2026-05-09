import { useEffect, useRef, useState } from 'react';
import API_BASE from '../config/api';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { PAGE_KEYS } from '../../shared/routes.js';
import { OPENTABLE_RESERVATION_URL } from '../utils/hospitalityMedia';
import './HomePage.css';

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const HOME_DESCRIPTION =
  'A refined Sicilian restaurant on Longboat Key offering handmade pasta, wood-fired pizza, curated wine tastings, cooking classes, and private dining.';

export default function HomePage() {
  const hero = useSection('hero');
  const restaurant = useSection('restaurant');
  const links = useSection('links');
  const story = useSection('story');
  const menuHighlights = useSection('menuHighlights');
  const { navigate, navigatePath } = useNavigation();

  // Dynamic collections from API
  const [stats, setStats] = useState([]);
  const [beyondCards, setBeyondCards] = useState([]);
  const [aggregators, setAggregators] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [visitNotes, setVisitNotes] = useState([]);

  // Menu tabs
  const categories = menuHighlights.categories || [];
  const [activeTab, setActiveTab] = useState(0);

  // Sticky bar
  const heroRef = useRef(null);
  const visitRef = useRef(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  // Newsletter
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState(''); // '' | 'sending' | 'done' | 'error'

  // InView refs
  const [sigRef, sigVis] = useInView();
  const [menuRef, menuVis] = useInView();
  const [atmoRef, atmoVis] = useInView();
  const [beyondRef, beyondVis] = useInView();
  const [voicesRef, voicesVis] = useInView();
  const [visitInRef, visitInVis] = useInView();

  usePageMetadata({
    title: 'Sicilian dining on Longboat Key',
    description: HOME_DESCRIPTION,
    structuredData: [{
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: restaurant.name || 'La Norma Ristorante & Pizzeria',
      description: HOME_DESCRIPTION,
      url: window.location.origin,
      telephone: restaurant.phone,
      servesCuisine: ['Italian', 'Sicilian', 'Mediterranean'],
      priceRange: '$$$',
      acceptsReservations: true,
      address: {
        '@type': 'PostalAddress',
        streetAddress: restaurant.address,
        addressLocality: restaurant.city,
        addressRegion: restaurant.state,
        postalCode: restaurant.zip,
        addressCountry: 'US',
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '17:00',
        closes: '21:00',
      },
    }],
  });

  // Fetch homepage collections
  useEffect(() => {
    fetch(`${API_BASE}/api/homepage-content/all`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        setStats(d.stats || []);
        setBeyondCards(d.beyond || []);
        setAggregators(d.aggregators || []);
        setQuotes(d.quotes || []);
        setVisitNotes(d.visitNotes || []);
      })
      .catch(() => {});
  }, []);

  // Sticky bar: visible after hero, hidden at visit
  useEffect(() => {
    const heroEl = heroRef.current;
    const visitEl = visitRef.current;
    if (!heroEl) return undefined;

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setStickyVisible(true);
      else setStickyVisible(false);
    }, { threshold: 0.1 });

    const visitObs = visitEl ? new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStickyVisible(false);
    }, { threshold: 0.3 }) : null;

    obs.observe(heroEl);
    if (visitEl && visitObs) visitObs.observe(visitEl);

    return () => {
      obs.disconnect();
      visitObs?.disconnect();
    };
  }, []);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/homepage-content/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail.trim() }),
      });
      if (!res.ok) throw new Error();
      setNlStatus('done');
      setNlEmail('');
    } catch { setNlStatus('error'); }
  };

  return (
    <div className="app">
      <Navbar />

      {/* ============================================================ */}
      {/* 1. HERO                                                      */}
      {/* ============================================================ */}
      <header className="hp__hero" ref={heroRef}>
        <div className="hp__hero-bg" style={{ backgroundImage: `url(${hero.imageUrl})` }} role="img" aria-label={hero.imageAlt} />
        <div className="hp__hero-overlay" />
        <div className="hp__hero-content container">
          <p className="hp__hero-eyebrow">{hero.eyebrow} · Since 2008</p>
          <h1 className="hp__hero-h1">{hero.headline[0]}<br />{hero.headline[1]}</h1>
          <p className="hp__hero-sub">{hero.subheadline}</p>
          <div className="hp__hero-actions">
            <a href={OPENTABLE_RESERVATION_URL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">Reserve a Table</a>
            <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.menu)}>View Menu</button>
          </div>
          <a href={OPENTABLE_RESERVATION_URL} className="hp__tonight" target="_blank" rel="noopener noreferrer">
            <span className="hp__tonight-dot" />
            View tonight's availability on OpenTable
          </a>
        </div>
      </header>

      <main id="main-content">
        {/* ============================================================ */}
        {/* 2. SIGNATURE STRIP                                           */}
        {/* ============================================================ */}
        <section className="hp__section" id="signature">
          <div className="container">
            <div className={`hp__signature fade-up${sigVis ? ' visible' : ''}`} ref={sigRef}>
              <p className="hp__eyebrow">A Sicilian kitchen on Longboat Key</p>
              <p className="hp__signature-body">
                Family-run since 2008. Wood-fired oven, hand-rolled pasta, Italian wine list, and a dining room that's quiet enough for conversation.
              </p>
              {stats.length > 0 && (
                <div className="hp__sig-stats">
                  {stats.map((s) => (
                    <div key={s.id} className="hp__sig-stat">
                      <span className="hp__sig-stat-value">{s.value}</span>
                      <span className="hp__sig-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. MENU PREVIEW                                              */}
        {/* ============================================================ */}
        <section className="hp__section hp__section--alt" id="menu-preview">
          <div className="container">
            <div className={`fade-up${menuVis ? ' visible' : ''}`} ref={menuRef}>
              <p className="hp__eyebrow">{menuHighlights.label}</p>
              <h2 className="hp__heading" style={{ whiteSpace: 'pre-line' }}>{menuHighlights.headline}</h2>
            </div>

            {hero.imageUrl && (
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
                alt="La Norma signature dishes"
                className={`hp__menu-image fade-up delay-1${menuVis ? ' visible' : ''}`}
                loading="lazy"
              />
            )}

            {categories.length > 0 && (
              <>
                <div className="hp__menu-tabs" role="tablist">
                  {categories.map((cat, i) => (
                    <button
                      key={cat.name}
                      role="tab"
                      aria-selected={i === activeTab}
                      className={`hp__menu-tab${i === activeTab ? ' is-active' : ''}`}
                      onClick={() => setActiveTab(i)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className={`hp__menu-list fade-up delay-1${menuVis ? ' visible' : ''}`} role="tabpanel">
                  {(categories[activeTab]?.items || []).slice(0, 5).map((item) => (
                    <div key={item.name} className="hp__menu-item">
                      <div className="hp__menu-item-info">
                        <p className="hp__menu-item-name">{item.name}</p>
                        <p className="hp__menu-item-desc">{item.desc}</p>
                      </div>
                      <span className="hp__menu-item-price">{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="hp__menu-cta">
                  <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.menu)}>Browse the full menu</button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. ATMOSPHERE (Story snippet)                                 */}
        {/* ============================================================ */}
        <section className="hp__section" id="atmosphere">
          <div className="container">
            <div className={`hp__atmosphere fade-up${atmoVis ? ' visible' : ''}`} ref={atmoRef}>
              <div className="hp__atmosphere-copy">
                <p className="hp__eyebrow">{story.label}</p>
                <h2 className="hp__heading">Sicilian cooking, served with patience, polish, and a sense of occasion.</h2>
                <p className="hp__atmosphere-body">{story.body[0]}</p>
                <p className="hp__atmosphere-body">{story.body[1]}</p>
                <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.about)}>Read our story</button>
              </div>
              <img
                src={story.imageUrl}
                alt={story.imageAlt}
                className="hp__atmosphere-img"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. BEYOND DINNER (Experiences + Catering unified)            */}
        {/* ============================================================ */}
        {beyondCards.length > 0 && (
          <section className="hp__section hp__section--alt" id="beyond">
            <div className="container">
              <div className={`fade-up${beyondVis ? ' visible' : ''}`} ref={beyondRef}>
                <p className="hp__eyebrow">Beyond dinner</p>
                <h2 className="hp__heading">Four ways to extend the table.</h2>
                <p className="hp__beyond-sub">
                  From Friday wine evenings to yacht catering, the kitchen and dining room move with you.
                </p>
              </div>

              <div className="hp__beyond-grid">
                {beyondCards.map((card, i) => (
                  <article
                    key={card.id}
                    className={`hp__beyond-card fade-up delay-${(i % 2) + 1}${beyondVis ? ' visible' : ''}`}
                    onClick={() => navigatePath(card.link)}
                  >
                    <div className="hp__beyond-card__media">
                      {card.image_url && <img src={card.image_url} alt={card.title} loading="lazy" />}
                    </div>
                    <div className="hp__beyond-card__body">
                      <h3 className="hp__beyond-card__title">{card.title}</h3>
                      <p className="hp__beyond-card__desc">{card.body}</p>
                      <span className="hp__beyond-card__cta">{card.cta_label} &rarr;</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 6. VOICES (ratings + quotes)                                 */}
        {/* ============================================================ */}
        <section className="hp__section" id="voices">
          <div className="container">
            <div className={`fade-up${voicesVis ? ' visible' : ''}`} ref={voicesRef}>
              <p className="hp__eyebrow" style={{ textAlign: 'center' }}>Guest perspectives</p>
              <h2 className="hp__heading" style={{ textAlign: 'center' }}>The details guests mention after the last course</h2>
            </div>

            {aggregators.length > 0 && (
              <div className={`hp__voices-ratings fade-up delay-1${voicesVis ? ' visible' : ''}`}>
                {aggregators.map((a) => (
                  <a key={a.id} href={a.link} className="hp__voices-rating" target="_blank" rel="noopener noreferrer">
                    <span className="hp__voices-rating__star">&#9733;</span>
                    <span className="hp__voices-rating__value">{a.rating}</span>
                    <span className="hp__voices-rating__source">{a.source} ({a.review_count})</span>
                  </a>
                ))}
              </div>
            )}

            {quotes.length > 0 && (
              <div className={`hp__voices-quotes fade-up delay-2${voicesVis ? ' visible' : ''}`}>
                {quotes.map((q) => (
                  <blockquote key={q.id} className="hp__voice-quote">
                    <p className="hp__voice-quote__text">&ldquo;{q.text}&rdquo;</p>
                    <footer>
                      <p className="hp__voice-quote__author">{q.author_name}</p>
                      <p className="hp__voice-quote__role">{q.author_role}</p>
                    </footer>
                  </blockquote>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. VISIT (consolidated hours/address/booking)                */}
        {/* ============================================================ */}
        <section className="hp__section hp__section--alt" id="visit" ref={visitRef}>
          <div className="container">
            <div className={`fade-up${visitInVis ? ' visible' : ''}`} ref={visitInRef}>
              <p className="hp__eyebrow">Visit us</p>
              <h2 className="hp__heading">Dinner on Longboat Key, shaped with polish and warmth.</h2>
            </div>

            <div className={`hp__visit-grid fade-up delay-1${visitInVis ? ' visible' : ''}`}>
              <div className="hp__visit-info">
                <div className="hp__visit-group">
                  <h3>When</h3>
                  <p>{restaurant.hours}</p>
                  <p>{restaurant.hoursNote}</p>
                  {visitNotes.length > 0 && (
                    <div className="hp__visit-specials">
                      {visitNotes.map((n) => (
                        <span key={n.id} className="hp__visit-special">{n.day_label} — {n.note}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hp__visit-group">
                  <h3>Where</h3>
                  <p>{restaurant.address}</p>
                  <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                  <a href={restaurant.mapEmbedUrl} target="_blank" rel="noopener noreferrer">Get directions &rarr;</a>
                </div>

                <div className="hp__visit-group">
                  <h3>Contact</h3>
                  <p><a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a></p>
                  <p><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></p>
                </div>
              </div>

              <div className="hp__visit-booking">
                <h3>Reserve your table</h3>
                <p>Secure your preferred time on OpenTable — weekends fill early.</p>
                <div className="hp__visit-booking__actions">
                  <a href={OPENTABLE_RESERVATION_URL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">Reserve on OpenTable</a>
                  <a href={`tel:${restaurant.phone}`} className="btn btn--outline-dark">Call the host stand</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ============================================================ */}
      {/* STICKY MOBILE BAR                                             */}
      {/* ============================================================ */}
      <div className={`hp__sticky-bar${stickyVisible ? ' is-visible' : ''}`} role="navigation" aria-label="Quick actions">
        <a href={`tel:${restaurant.phone}`} className="hp__sticky-bar__action--secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.65 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.28 1.54.52 2.35.65A2 2 0 0 1 22 16.92Z"/></svg>
          Call
        </a>
        <a href={restaurant.mapEmbedUrl} className="hp__sticky-bar__action--secondary" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          Directions
        </a>
        <a href={OPENTABLE_RESERVATION_URL} className="hp__sticky-bar__action--primary" target="_blank" rel="noopener noreferrer">
          Reserve &rarr;
        </a>
      </div>
    </div>
  );
}
