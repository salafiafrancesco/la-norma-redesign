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

const TONIGHT_SLOTS = ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];

const STATS_FALLBACK = [
  { id: 'years', value: '18 years', label: 'Family-run since 2008' },
  { id: 'wines', value: '70+ wines', label: 'Italian wine list' },
  { id: 'seats', value: '250+ seats', label: 'Served weekly' },
];

const BEYOND_FALLBACK = [
  {
    id: 'wine',
    title: 'Wine Tastings',
    body: 'A guided Friday flight through Italy with composed pairings.',
    link: '/wine-tastings',
    cta_label: 'Discover',
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cooking',
    title: 'Cooking Classes',
    body: 'Saturday mornings with Chef Marco — small group, hands-on.',
    link: '/cooking-classes',
    cta_label: 'Discover',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'music',
    title: 'Live Music',
    body: 'Wednesday and Saturday evenings, woven into dinner not on top of it.',
    link: '/live-music',
    cta_label: 'Discover',
    image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'catering',
    title: 'Catering',
    body: 'Off-premise events, private gatherings, and yacht parties.',
    link: '/catering',
    cta_label: 'Discover',
    image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80',
  },
];

const VOICES_FALLBACK_RATINGS = [
  { id: 'g', source: 'Google', rating: 4.8, review_count: 520, link: 'https://g.page/lanormarestaurant/review' },
  { id: 't', source: 'TripAdvisor', rating: 4.7, review_count: 340, link: 'https://www.tripadvisor.com/' },
  { id: 'y', source: 'Yelp', rating: 4.9, review_count: 180, link: 'https://www.yelp.com/' },
];

const VOICES_FALLBACK_QUOTES = [
  { id: 'q1', text: 'The room feels refined without ever becoming stiff. Excellent wine guidance, beautiful pacing, and a Pasta alla Norma I am still thinking about.', author_name: 'Margaret S.', author_role: 'Sarasota, FL' },
  { id: 'q2', text: 'Pacing was perfect. We hosted an anniversary dinner and every detail felt considered. Service was polished, warm, and genuinely memorable.', author_name: 'James & Patricia K.', author_role: 'Longboat Key, FL' },
  { id: 'q3', text: "One of the most memorable evenings we've booked on Longboat Key. The Friday wine tasting was intimate, unhurried, and clearly curated by people who care.", author_name: 'Thomas R.', author_role: 'Chicago, IL' },
];

const HOME_DESCRIPTION =
  'A refined Sicilian restaurant on Longboat Key offering handmade pasta, wood-fired pizza, curated wine tastings, cooking classes, and private dining.';

const DAY_ABBR = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

function parseHourToken(token) {
  const m = token.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function isOpenAt(row, now) {
  if (!row || row.closed || !row.hours) return false;
  const parts = row.hours.split(/[–—-]/);
  if (parts.length !== 2) return false;
  const start = parseHourToken(parts[0]);
  const end = parseHourToken(parts[1]);
  if (start == null || end == null) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= start && cur < end;
}

function compactHours(hours) {
  if (!hours) return '';
  return hours.replace(/\s*[–—-]\s*/, '–').replace(/\s+/g, ' ').replace(/:00\s*(AM|PM)/gi, '$1');
}

export default function HomePage() {
  const hero = useSection('hero');
  const restaurant = useSection('restaurant');
  const story = useSection('story');
  const menuHighlights = useSection('menuHighlights');
  const general = useSection('general');
  const { navigate, navigatePath } = useNavigation();
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const hoursRows = general?.hoursWeekly || [];
  const todayRow = hoursRows.find((r) => r.day === todayName);
  const openNow = isOpenAt(todayRow, new Date());
  const schemaOrg = general?.schemaOrg || {};

  // Dynamic collections from API
  const [stats, setStats] = useState([]);
  const [beyondCards, setBeyondCards] = useState([]);
  const [aggregators, setAggregators] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [visitNotes, setVisitNotes] = useState([]);

  // Menu tabs
  const categories = menuHighlights.categories || [];
  const [activeTab, setActiveTab] = useState(0);
  const swipeStart = useRef(null);

  const handleTabSwipeStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    swipeStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTabSwipeEnd = (event) => {
    if (!swipeStart.current) return;
    const touch = event.changedTouches?.[0];
    if (!touch) {
      swipeStart.current = null;
      return;
    }
    const dx = touch.clientX - swipeStart.current.x;
    const dy = touch.clientY - swipeStart.current.y;
    const dt = Math.max(Date.now() - swipeStart.current.time, 1);
    swipeStart.current = null;

    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    const velocity = Math.abs(dx) / dt;
    if (Math.abs(dx) < 80 && velocity < 0.3) return;

    setActiveTab((current) => {
      if (dx < 0) return Math.min(current + 1, categories.length - 1);
      return Math.max(current - 1, 0);
    });
  };

  const handleTabKey = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActiveTab((current) => Math.min(current + 1, categories.length - 1));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActiveTab((current) => Math.max(current - 1, 0));
    }
  };

  // Sticky bar
  const heroRef = useRef(null);
  const visitRef = useRef(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  // InView refs
  const [sigRef, sigVis] = useInView();
  const [menuRef, menuVis] = useInView();
  const [atmoRef, atmoVis] = useInView();
  const [beyondRef, beyondVis] = useInView();

  // Beyond Dinner — mobile carousel state (autoscroll + dots)
  const beyondScrollRef = useRef(null);
  const beyondPauseTimer = useRef(null);
  const beyondProgrammaticUntil = useRef(0); // timestamp until which onScroll events should be ignored
  const [beyondActive, setBeyondActive] = useState(0);
  const [beyondPaused, setBeyondPaused] = useState(false);
  // Continuous in-viewport flag — distinct from `beyondVis` (the one-shot
  // fade-in flag). The autoplay must pause whenever the section leaves the
  // viewport, otherwise programmatic scrolls of the carousel keep firing on
  // an off-screen container and iOS Safari drags the document back to it.
  const [beyondOnScreen, setBeyondOnScreen] = useState(false);
  const beyondList = beyondCards.length > 0 ? beyondCards : BEYOND_FALLBACK;
  const beyondCount = beyondList.length;

  useEffect(() => {
    const container = beyondScrollRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      setBeyondOnScreen(entry.isIntersecting);
    }, { threshold: 0.25 });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-advance every 4.5s on mobile, only when section is in view + not paused.
  // Re-evaluate on resize so resizing past the breakpoint starts/stops the loop.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (beyondPaused || !beyondOnScreen || beyondCount < 2) return undefined;

    let intervalId = null;
    const start = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        setBeyondActive((i) => (i + 1) % beyondCount);
      }, 4500);
    };
    const stop = () => {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
    };

    const mq = window.matchMedia('(max-width: 980px)');
    const sync = () => (mq.matches ? start() : stop());
    sync();

    if (mq.addEventListener) mq.addEventListener('change', sync);
    else mq.addListener?.(sync);

    return () => {
      stop();
      if (mq.removeEventListener) mq.removeEventListener('change', sync);
      else mq.removeListener?.(sync);
    };
  }, [beyondPaused, beyondVis, beyondCount]);

  // Programmatic scroll when active card changes.
  // We deliberately do NOT use scrollIntoView: it scrolls every scrollable
  // ancestor (the document included) to reveal the card. We also avoid
  // smooth scrolling on the container itself: with `scroll-snap-type: x
  // mandatory` + `-webkit-overflow-scrolling: touch`, iOS Safari can
  // sometimes scroll the document to "reveal" the snap target while a
  // smooth programmatic scroll is in flight. Setting `scrollLeft` directly
  // on the carousel keeps the page completely still — the snap engine then
  // animates the snap visually on its own.
  useEffect(() => {
    const container = beyondScrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('.hp__beyond-card');
    const card = cards[beyondActive];
    if (!card) return;

    // Tell the onScroll handler to ignore the next ~500 ms of scroll events,
    // otherwise the snap-induced scroll fires onScroll, which would call
    // setBeyondActive back to whatever is "nearest" mid-animation, creating
    // a feedback loop.
    beyondProgrammaticUntil.current = Date.now() + 500;

    const targetLeft = card.getBoundingClientRect().left
      - container.getBoundingClientRect().left
      + container.scrollLeft;

    container.scrollLeft = targetLeft;
  }, [beyondActive]);

  // Pause autoscroll on user interaction, resume after 7s of inactivity.
  // Note: NOT bound to onTouchStart anymore — that fired on every vertical
  // page scroll over the carousel and silently killed the loop. We only pause
  // on direct interaction with the dots / the cards (click).
  const handleBeyondInteract = () => {
    setBeyondPaused(true);
    clearTimeout(beyondPauseTimer.current);
    beyondPauseTimer.current = setTimeout(() => setBeyondPaused(false), 7000);
  };

  // Track manual scroll to keep active dot in sync.
  // Skip while a programmatic scroll is in flight (see ref above).
  const handleBeyondScroll = () => {
    if (Date.now() < beyondProgrammaticUntil.current) return;
    const container = beyondScrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('.hp__beyond-card');
    if (!cards.length) return;
    const containerRect = container.getBoundingClientRect();
    let nearest = 0;
    let minDist = Infinity;
    cards.forEach((c, i) => {
      const dist = Math.abs(c.getBoundingClientRect().left - containerRect.left);
      if (dist < minDist) { minDist = dist; nearest = i; }
    });
    if (nearest !== beyondActive) setBeyondActive(nearest);
  };
  const [voicesRef, voicesVis] = useInView();
  const [visitInRef, visitInVis] = useInView();
  const [mapRef, mapVis] = useInView({ rootMargin: '200px' });

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
      servesCuisine: schemaOrg.cuisine,
      priceRange: schemaOrg.priceRange,
      acceptsReservations: schemaOrg.acceptsReservations,
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
        dayOfWeek: schemaOrg.dayOfWeek,
        opens: schemaOrg.opens,
        closes: schemaOrg.closes,
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

  // Sticky bar: visible after hero, hidden while visit section is in view
  useEffect(() => {
    const heroEl = heroRef.current;
    const visitEl = visitRef.current;
    if (!heroEl) return undefined;

    let heroOut = false;
    let visitIn = false;

    const sync = () => setStickyVisible(heroOut && !visitIn);

    const heroObs = new IntersectionObserver(([entry]) => {
      heroOut = !entry.isIntersecting;
      sync();
    }, { threshold: 0.1 });

    const visitObs = visitEl ? new IntersectionObserver(([entry]) => {
      visitIn = entry.isIntersecting;
      sync();
    }, { threshold: 0.3 }) : null;

    heroObs.observe(heroEl);
    if (visitEl && visitObs) visitObs.observe(visitEl);

    return () => {
      heroObs.disconnect();
      visitObs?.disconnect();
    };
  }, []);

  return (
    <div className="app">
      <Navbar />

      {/* ============================================================ */}
      {/* 1. HERO                                                      */}
      {/* ============================================================ */}
      <header className="hp__hero" ref={heroRef}>
        <div className="hp__hero-bg" style={{ backgroundImage: `url(${hero.imageUrl})` }} role="img" aria-label={hero.imageAlt} />
        {hero.videoUrl && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(hero.videoUrl) && (
          <video
            className="hp__hero-video"
            src={hero.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        )}
        <div className="hp__hero-overlay" />
        <div className="hp__hero-content container">
          <div className="hp__hero-text">
            <p className="hp__hero-eyebrow">{hero.eyebrow} · Since 2008</p>
            <h1 className="hp__hero-h1">{hero.headline[0]}<br />{hero.headline[1]}</h1>
            <p className="hp__hero-sub">{hero.subheadline}</p>
            <div className="hp__hero-actions">
              <a href={OPENTABLE_RESERVATION_URL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">Reserve a Table</a>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.menu)}>View Menu</button>
            </div>
          </div>
          <aside className="hp__hero-side">
            <div className="hp__tonight-widget" role="group" aria-label="Tonight's availability">
            <div className="hp__tonight-widget__head">
              <span className="hp__tonight-widget__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
              <div className="hp__tonight-widget__meta">
                <span className="hp__tonight-widget__title">Tonight</span>
                <span className="hp__tonight-widget__sub">
                  <span className="hp__tonight-dot" aria-hidden="true" />
                  Tables available
                </span>
              </div>
            </div>
            <div className="hp__tonight-widget__slots" role="list">
              {TONIGHT_SLOTS.map((slot) => (
                <a
                  key={slot}
                  href={OPENTABLE_RESERVATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hp__tonight-widget__slot"
                  role="listitem"
                >
                  {slot}
                </a>
              ))}
              <a
                href={OPENTABLE_RESERVATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hp__tonight-widget__more"
                aria-label="See all available times on OpenTable"
              >
                &rarr;
              </a>
            </div>
            </div>
          </aside>
        </div>
        <a href="#signature" className="hp__hero-scroll" aria-label="Scroll to next section">
          <span>Scroll</span>
          <span className="hp__hero-scroll__line" aria-hidden="true" />
        </a>
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
              <div className="hp__sig-stats">
                {(stats.length > 0 ? stats : STATS_FALLBACK).map((s, i) => (
                  <div key={s.id} className={`hp__sig-stat hp__sig-stat--${i + 1}`}>
                    <span className="hp__sig-stat-mark" aria-hidden="true" />
                    <span className="hp__sig-stat-value">{s.value}</span>
                    <span className="hp__sig-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. MENU PREVIEW                                              */}
        {/* ============================================================ */}
        <section className="hp__section hp__section--alt" id="menu-preview">
          <div className="container">
            <div className={`hp__menu-inner fade-up${menuVis ? ' visible' : ''}`} ref={menuRef}>
              <header className="hp__menu-header">
                <p className="hp__eyebrow">{menuHighlights.label}</p>
                <h2 className="hp__menu-heading" style={{ whiteSpace: 'pre-line' }}>{menuHighlights.headline}</h2>
              </header>

              <figure className="hp__menu-figure">
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80"
                  alt="La Norma signature dish — close-up, moody lighting"
                  className="hp__menu-image"
                  loading="lazy"
                  width="1600"
                  height="2000"
                />
                <figcaption className="hp__menu-caption">
                  <span className="hp__menu-caption__label">La specialità</span>
                  <span className="hp__menu-caption__name">Pasta alla Norma</span>
                  <span className="hp__menu-caption__detail">Eggplant · San Marzano · salted ricotta</span>
                </figcaption>
              </figure>

              {categories.length > 0 && (
                <div className="hp__menu-text">
                  <div
                    className="hp__menu-tabs"
                    role="tablist"
                    aria-label="Menu categories"
                    onKeyDown={handleTabKey}
                  >
                    {categories.map((cat, i) => (
                      <button
                        key={cat.name}
                        type="button"
                        role="tab"
                        aria-selected={i === activeTab}
                        tabIndex={i === activeTab ? 0 : -1}
                        className={`hp__menu-tab${i === activeTab ? ' is-active' : ''}`}
                        onClick={() => setActiveTab(i)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div
                    className="hp__menu-swipe"
                    onTouchStart={handleTabSwipeStart}
                    onTouchEnd={handleTabSwipeEnd}
                  >
                    <div
                      key={activeTab}
                      className={`hp__menu-list fade-up delay-1${menuVis ? ' visible' : ''}`}
                      role="tabpanel"
                      aria-live="polite"
                    >
                      {(() => {
                        const items = categories[activeTab]?.items || [];
                        const visible = items.slice(0, 5);
                        const remaining = items.length - visible.length;
                        return (
                          <>
                            {visible.map((item, idx) => (
                              <div key={item.name} className="hp__menu-item">
                                <span className="hp__menu-item-num" aria-hidden="true">{String(idx + 1).padStart(2, '0')}</span>
                                <div className="hp__menu-item-info">
                                  <div className="hp__menu-item-row">
                                    <p className="hp__menu-item-name">{item.name}</p>
                                    <span className="hp__menu-item-leader" aria-hidden="true" />
                                    <span className="hp__menu-item-price">{item.price}</span>
                                  </div>
                                  {item.desc && <p className="hp__menu-item-desc">{item.desc}</p>}
                                </div>
                              </div>
                            ))}
                            {remaining > 0 && (
                              <button
                                type="button"
                                className="hp__menu-item hp__menu-item--more"
                                onClick={() => navigate(PAGE_KEYS.menu)}
                              >
                                <span className="hp__menu-item-name">View {remaining} more</span>
                                <span className="hp__menu-item-price">&rarr;</span>
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="hp__menu-cta">
                    <button
                      type="button"
                      className="hp__menu-cta-btn"
                      onClick={() => navigate(PAGE_KEYS.menu)}
                    >
                      Browse the full menu &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. ATMOSPHERE (Story snippet)                                 */}
        {/* ============================================================ */}
        <section className="hp__section hp__section--story" id="atmosphere">
          <div className="container">
            <div className={`hp__story fade-up${atmoVis ? ' visible' : ''}`} ref={atmoRef}>
              <div className="hp__story-media">
                <div className="hp__story-media__frame">
                  <img
                    src={story.imageUrl}
                    alt={story.imageAlt}
                    className="hp__story-img"
                    loading="lazy"
                  />
                </div>
                <div className="hp__story-est" aria-label="Established 2008">
                  <span className="hp__story-est__label">Established</span>
                  <span className="hp__story-est__year">2008</span>
                </div>
              </div>

              <div className="hp__story-copy">
                <p className="hp__eyebrow">{story.label}</p>
                <h2 className="hp__heading hp__story-heading">Sicilian cooking, served with patience, polish, and a sense of occasion.</h2>

                {story.quote && (
                  <blockquote className="hp__story-pullquote">
                    <p>{story.quote}</p>
                  </blockquote>
                )}

                <p className="hp__story-body hp__story-body--first">{story.body[0]}</p>
                <p className="hp__story-body">{story.body[1]}</p>

                <div className="hp__story-stats" role="list">
                  {[story.stat1, story.stat2, story.stat3]
                    .filter((s) => s && s.value)
                    .map((s, i) => (
                      <div className="hp__story-stat" role="listitem" key={s.label || i}>
                        <span className="hp__story-stat__value">{s.value}</span>
                        <span className="hp__story-stat__label">{s.label}</span>
                      </div>
                    ))}
                </div>

                <button
                  type="button"
                  className="hp__story-link"
                  onClick={() => navigate(PAGE_KEYS.about)}
                >
                  <span className="hp__story-link__text">Read our story</span>
                  <span className="hp__story-link__arrow" aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. BEYOND DINNER (Experiences + Catering unified)            */}
        {/* ============================================================ */}
        <section className="hp__section hp__section--alt" id="beyond">
          <div className="container">
            <div className={`fade-up${beyondVis ? ' visible' : ''}`} ref={beyondRef}>
              <p className="hp__eyebrow">Beyond dinner</p>
              <h2 className="hp__heading">Four ways to extend the table.</h2>
              <p className="hp__beyond-sub">
                From Friday wine evenings to yacht catering, the kitchen and dining room move with you.
              </p>
            </div>

            <div
              className="hp__beyond-grid"
              ref={beyondScrollRef}
              onScroll={handleBeyondScroll}
            >
              {beyondList.map((card, i) => (
                <article
                  key={card.id}
                  className={`hp__beyond-card fade-up delay-${(i % 2) + 1}${beyondVis ? ' visible' : ''}`}
                  onClick={() => navigatePath(card.link)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigatePath(card.link); }}
                >
                  {card.image_url && (
                    <img className="hp__beyond-card__bg" src={card.image_url} alt="" loading="lazy" aria-hidden="true" />
                  )}
                  <div className="hp__beyond-card__overlay" aria-hidden="true" />
                  <span className="hp__beyond-card__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div className="hp__beyond-card__inner">
                    <h3 className="hp__beyond-card__title">{card.title}</h3>
                    <p className="hp__beyond-card__desc">{card.body}</p>
                    <span className="hp__beyond-card__cta">
                      <span className="hp__beyond-card__cta-label">{card.cta_label || 'Discover'}</span>
                      <span className="hp__beyond-card__cta-arrow" aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="hp__beyond-dots" role="tablist" aria-label="Carousel pagination">
              {beyondList.map((card, i) => (
                <button
                  key={card.id}
                  type="button"
                  role="tab"
                  aria-selected={i === beyondActive}
                  aria-label={`Go to ${card.title}`}
                  className={`hp__beyond-dot${i === beyondActive ? ' is-active' : ''}`}
                  onClick={() => { setBeyondActive(i); handleBeyondInteract(); }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. VOICES (ratings + quotes)                                 */}
        {/* ============================================================ */}
        <section className="hp__section hp__section--voices" id="voices">
          <div className="container">
            <div className={`hp__voices fade-up${voicesVis ? ' visible' : ''}`} ref={voicesRef}>
              <p className="hp__eyebrow hp__eyebrow--center">Guest perspectives</p>
              <h2 className="hp__heading hp__heading--center hp__voices-heading">In their words.</h2>

              <div className="hp__voices-ratings">
                {(aggregators.length > 0 ? aggregators : VOICES_FALLBACK_RATINGS).map((a) => (
                  <a key={a.id} href={a.link} className="hp__voices-rating" target="_blank" rel="noopener noreferrer">
                    <span className="hp__voices-rating__star" aria-hidden="true">&#9733;</span>
                    <span className="hp__voices-rating__value">{a.rating}</span>
                    <span className="hp__voices-rating__source">{a.source}</span>
                  </a>
                ))}
              </div>

              <div className="hp__voices-quotes">
                {(quotes.length > 0 ? quotes : VOICES_FALLBACK_QUOTES).slice(0, 2).map((q) => (
                  <blockquote key={q.id} className="hp__voice-quote">
                    <p className="hp__voice-quote__text">{q.text}</p>
                    <footer className="hp__voice-quote__footer">
                      <span className="hp__voice-quote__author">{q.author_name}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. VISIT (consolidated hours/address/booking)                */}
        {/* ============================================================ */}
        <section className="hp__section hp__section--alt hp__section--visit" id="visit" ref={visitRef}>
          <div className="container">
            <div className={`hp__visit-head fade-up${visitInVis ? ' visible' : ''}`} ref={visitInRef}>
              <p className="hp__eyebrow hp__eyebrow--center">Visit us</p>
              <h2 className="hp__heading hp__heading--center">Dinner on Longboat Key, shaped with polish and warmth.</h2>
            </div>

            <div className={`hp__visit-stage fade-up delay-1${visitInVis ? ' visible' : ''}`}>
              {/* LEFT — info pane */}
              <div className="hp__visit-pane">
                <div className="hp__hours-feature" aria-label="Opening hours">
                  <div className="hp__hours-feature__head">
                    <p className="hp__hours-feature__eyebrow">
                      Tonight <span className="hp__hours-feature__sep" aria-hidden="true">·</span> {todayName}
                    </p>
                    <span className={`hp__hours-status${openNow ? ' is-open' : ''}`}>
                      <span className="hp__hours-status__dot" aria-hidden="true" />
                      {openNow ? 'Open now' : 'Closed now'}
                    </span>
                  </div>
                  <p className="hp__hours-feature__time">
                    {todayRow?.closed ? 'Closed today' : (todayRow?.hours || restaurant.hours)}
                  </p>

                  <ul className="hp__hours-strip" aria-label="Weekly hours">
                    {hoursRows.map((row) => (
                      <li
                        key={row.day}
                        className={`hp__hours-strip__day${row.day === todayName ? ' is-today' : ''}${row.closed ? ' is-closed' : ''}`}
                      >
                        <span className="hp__hours-strip__abbr">{DAY_ABBR[row.day] || row.day.slice(0, 3)}</span>
                        <span className="hp__hours-strip__time">
                          {row.closed ? 'Closed' : compactHours(row.hours)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {visitNotes.length > 0 && (
                    <div className="hp__visit-specials">
                      {visitNotes.map((n) => (
                        <span key={n.id} className="hp__visit-special">{n.day_label} — {n.note}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hp__visit-meta">
                  <div className="hp__visit-meta__col">
                    <span className="hp__visit-meta__label">Find us</span>
                    <p className="hp__visit-meta__line">{restaurant.address}</p>
                    <p className="hp__visit-meta__line">{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                    <a className="hp__visit-meta__link" href={restaurant.mapEmbedUrl} target="_blank" rel="noopener noreferrer">
                      Get directions <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                  <div className="hp__visit-meta__col">
                    <span className="hp__visit-meta__label">Reach us</span>
                    <p className="hp__visit-meta__line"><a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a></p>
                    <p className="hp__visit-meta__line"><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></p>
                  </div>
                </div>
              </div>

              {/* RIGHT — atmospheric map + floating reserve card */}
              <div className="hp__visit-frame">
                <div className="hp__visit-map" ref={mapRef}>
                  {mapVis ? (
                    <iframe
                      title="La Norma Ristorante location"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(`${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zip}`)}&output=embed`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="hp__visit-map__placeholder" aria-hidden="true" />
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zip}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hp__visit-map__open"
                  >
                    Open in Google Maps <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>

                <div className="hp__visit-reserve">
                  <p className="hp__visit-reserve__eyebrow">Reservations</p>
                  <h3 className="hp__visit-reserve__title">A table reserved for you.</h3>
                  <p className="hp__visit-reserve__copy">Weekends fill early — secure your time on OpenTable.</p>
                  <div className="hp__visit-reserve__actions">
                    <a href={OPENTABLE_RESERVATION_URL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                      Book on OpenTable
                    </a>
                    <a href={`tel:${restaurant.phone}`} className="hp__visit-reserve__call">
                      Or call <span>{restaurant.phone}</span>
                    </a>
                  </div>
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
