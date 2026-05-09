import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { PAGE_KEYS } from '../../shared/routes.js';
import { OPENTABLE_RESERVATION_URL } from '../utils/hospitalityMedia';
import './AboutPage.css';

const CHAPTERS = [
  {
    num: 'I',
    title: 'The opening night',
    body: 'La Norma opened on Longboat Key with a single promise: cook generously, serve calmly, and treat every guest like family.',
  },
  {
    num: 'II',
    title: 'A wine list with a passport',
    body: 'The cellar grew past seventy Italian bottles, anchored by Sicilian and Southern producers chosen by hand.',
  },
  {
    num: 'III',
    title: 'The kitchen opens its doors',
    body: 'Saturday cooking classes began — small group, hands-on, capped at eight guests to keep the room intimate.',
  },
  {
    num: 'IV',
    title: 'A wider hospitality',
    body: 'Wine tastings, live music evenings, and private events joined the dining room as full extensions of the house.',
  },
];

const GALLERY = [
  {
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    alt: 'Chef plating a Sicilian dish in the open kitchen',
    area: 'a',
  },
  {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    alt: 'Hand-rolled pasta resting on a marble counter',
    area: 'b',
  },
  {
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80',
    alt: 'Candlelit dining room at twilight',
    area: 'c',
  },
  {
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    alt: 'A glass of red wine being poured tableside',
    area: 'd',
  },
];

export default function AboutPage() {
  const story = useSection('story');
  const restaurant = useSection('restaurant');
  const aboutPage = useSection('aboutPage');
  const { navigate } = useNavigation();

  const [heroRef, heroVis] = useInView();
  const [manifestoRef, manifestoVis] = useInView();
  const [storyRef, storyVis] = useInView();
  const [chaptersRef, chaptersVis] = useInView();
  const [valuesRef, valuesVis] = useInView();
  const [galleryRef, galleryVis] = useInView();
  const [signRef, signVis] = useInView();
  const [visitRef, visitVis] = useInView();

  usePageMetadata({
    title: 'About La Norma',
    description:
      'Discover the story behind La Norma, a refined Sicilian restaurant on Longboat Key shaped by warm hospitality, handmade food, and thoughtful experiences.',
  });

  const heroEyebrow = aboutPage?.hero?.eyebrow || 'About La Norma';
  const heroHeadline = aboutPage?.hero?.headline || 'A Sicilian dining room on Longboat Key.';
  const values = aboutPage?.values || [];
  const nextSteps = aboutPage?.next_steps || {};

  return (
    <div className="ap">
      <Navbar />

      <main id="main-content" className="ap__main">
        {/* ============================================================ */}
        {/* 1. CINEMATIC HERO                                            */}
        {/* ============================================================ */}
        <header className="ap-hero" ref={heroRef}>
          <div
            className="ap-hero__bg"
            style={{ backgroundImage: `url(${story.imageUrl})` }}
            aria-hidden="true"
          />
          <div className="ap-hero__overlay" aria-hidden="true" />
          <div className="container ap-hero__content">
            <span className="ap-hero__rule" aria-hidden="true" />
            <p className={`ap-hero__eyebrow fade-up${heroVis ? ' visible' : ''}`}>{heroEyebrow}</p>
            <h1 className={`ap-hero__heading fade-up delay-1${heroVis ? ' visible' : ''}`}>
              {heroHeadline}
            </h1>
            <p className={`ap-hero__sub fade-up delay-2${heroVis ? ' visible' : ''}`}>
              Family-run on Longboat Key. Sicilian roots, attentive hospitality, and a kitchen that takes its time.
            </p>
            <div className={`ap-hero__actions fade-up delay-3${heroVis ? ' visible' : ''}`}>
              <a
                href={OPENTABLE_RESERVATION_URL}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Reserve dinner
              </a>
              <button
                type="button"
                className="btn btn--outline-light"
                onClick={() => navigate(PAGE_KEYS.cookingClasses)}
              >
                Explore experiences
              </button>
            </div>
          </div>
          <a href="#manifesto" className="ap-hero__scroll" aria-label="Scroll to story">
            <span>Story</span>
            <span className="ap-hero__scroll-line" aria-hidden="true" />
          </a>
        </header>

        {/* ============================================================ */}
        {/* 2. MANIFESTO PULL QUOTE                                      */}
        {/* ============================================================ */}
        <section className="ap-section ap-manifesto" id="manifesto" ref={manifestoRef}>
          <div className="container">
            <div className={`ap-manifesto__inner fade-up${manifestoVis ? ' visible' : ''}`}>
              <span className="ap-manifesto__mark" aria-hidden="true">&#8220;</span>
              <p className="ap-manifesto__quote">
                {story.quote || 'Every dish carries the memory of a kitchen in Sicily.'}
              </p>
              <span className="ap-manifesto__line" aria-hidden="true" />
              <p className="ap-manifesto__author">The La Norma kitchen</p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. THE STORY — editorial portrait                            */}
        {/* ============================================================ */}
        <section className="ap-section ap-story" ref={storyRef}>
          <div className="container">
            <div className="ap-story__grid">
              <div className={`ap-story__media fade-up${storyVis ? ' visible' : ''}`}>
                <div className="ap-story__media-frame">
                  <img src={story.imageUrl} alt={story.imageAlt} loading="lazy" />
                </div>
                <div className="ap-story__est" aria-label="Established 2008">
                  <span className="ap-story__est-label">Established</span>
                  <span className="ap-story__est-year">2008</span>
                </div>
              </div>

              <div className={`ap-story__copy fade-up delay-1${storyVis ? ' visible' : ''}`}>
                <p className="ap-eyebrow">{story.label || 'Our Story'}</p>
                <h2 className="ap-heading">A kitchen built around generosity.</h2>
                <p className="ap-story__body ap-story__body--first">{story.body?.[0]}</p>
                <p className="ap-story__body">{story.body?.[1]}</p>

                <div className="ap-story__stats">
                  {[story.stat1, story.stat2, story.stat3]
                    .filter((s) => s && s.value)
                    .map((s, i) => (
                      <div key={s.label || i} className="ap-story__stat">
                        <span className="ap-story__stat-value">{s.value}</span>
                        <span className="ap-story__stat-label">{s.label}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. CHAPTERS — vertical timeline                              */}
        {/* ============================================================ */}
        <section className="ap-section ap-chapters" ref={chaptersRef}>
          <div className="container">
            <div className={`ap-chapters__head fade-up${chaptersVis ? ' visible' : ''}`}>
              <p className="ap-eyebrow ap-eyebrow--center">In four chapters</p>
              <h2 className="ap-heading ap-heading--center">How the dining room came together.</h2>
            </div>
            <ol className="ap-chapters__list">
              {CHAPTERS.map((c, i) => (
                <li
                  key={c.num}
                  className={`ap-chapter fade-up delay-${(i % 4) + 1}${chaptersVis ? ' visible' : ''}`}
                >
                  <div className="ap-chapter__rail" aria-hidden="true">
                    <span className="ap-chapter__num">{c.num}</span>
                    <span className="ap-chapter__line" />
                  </div>
                  <div className="ap-chapter__body">
                    <h3 className="ap-chapter__title">{c.title}</h3>
                    <p className="ap-chapter__copy">{c.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. VALUES — house principles                                 */}
        {/* ============================================================ */}
        <section className="ap-section ap-values" ref={valuesRef}>
          <div className="container">
            <div className={`ap-values__head fade-up${valuesVis ? ' visible' : ''}`}>
              <p className="ap-eyebrow ap-eyebrow--center">House principles</p>
              <h2 className="ap-heading ap-heading--center">What shapes the room.</h2>
            </div>
            <div className="ap-values__grid">
              {values.map((v, i) => (
                <article
                  key={v.title}
                  className={`ap-value fade-up delay-${(i % 3) + 1}${valuesVis ? ' visible' : ''}`}
                >
                  <span className="ap-value__index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ap-value__rule" aria-hidden="true" />
                  <h3 className="ap-value__title">{v.title}</h3>
                  <p className="ap-value__body">{v.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. SENSORY GALLERY — asymmetric grid                         */}
        {/* ============================================================ */}
        <section className="ap-section ap-gallery" ref={galleryRef}>
          <div className="container">
            <div className={`ap-gallery__head fade-up${galleryVis ? ' visible' : ''}`}>
              <p className="ap-eyebrow">A glimpse inside</p>
              <h2 className="ap-heading">Slow service, candlelight, and Sicilian ingredients.</h2>
            </div>
            <div className="ap-gallery__grid">
              {GALLERY.map((img, i) => (
                <figure
                  key={img.url}
                  className={`ap-gallery__item ap-gallery__item--${img.area} fade-up delay-${(i % 4) + 1}${galleryVis ? ' visible' : ''}`}
                >
                  <img src={img.url} alt={img.alt} loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. CHEF SIGNATURE                                            */}
        {/* ============================================================ */}
        <section className="ap-section ap-signature" ref={signRef}>
          <div className="container">
            <div className={`ap-signature__inner fade-up${signVis ? ' visible' : ''}`}>
              <p className="ap-signature__greeting">A note from the kitchen</p>
              <p className="ap-signature__quote">
                We started this dining room with one idea — that food made with patience deserves to be served with care. That has not changed. Thank you for sharing your evenings with us.
              </p>
              <p className="ap-signature__sign">Chef Marco &amp; the La Norma family</p>
              <span className="ap-signature__flourish" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 8. INVITATION / VISIT                                        */}
        {/* ============================================================ */}
        <section className="ap-section ap-visit" ref={visitRef}>
          <div className="container">
            <div className={`ap-visit__card fade-up${visitVis ? ' visible' : ''}`}>
              <div className="ap-visit__col">
                <p className="ap-eyebrow">{nextSteps.heading || 'Next steps'}</p>
                <h2 className="ap-heading">An invitation.</h2>
                <p className="ap-visit__body">
                  {nextSteps.body || 'Whether you are planning dinner, a class, or a celebration, the team is happy to help shape the evening with you.'}
                </p>
                <div className="ap-visit__actions">
                  <a
                    href={OPENTABLE_RESERVATION_URL}
                    className="btn btn--primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {nextSteps.primary_label || 'Reserve a table'}
                  </a>
                  <button
                    type="button"
                    className="btn btn--outline-dark"
                    onClick={() => navigate(PAGE_KEYS.contact)}
                  >
                    {nextSteps.secondary_label || 'Get in touch'}
                  </button>
                </div>
              </div>

              <div className="ap-visit__details">
                <div className="ap-visit__detail">
                  <span className="ap-visit__label">Find us</span>
                  <p>{restaurant.address}</p>
                  <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                </div>
                <div className="ap-visit__detail">
                  <span className="ap-visit__label">Contact</span>
                  <p><a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a></p>
                  <p><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></p>
                </div>
                <div className="ap-visit__detail">
                  <span className="ap-visit__label">Hours</span>
                  <p>{restaurant.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
