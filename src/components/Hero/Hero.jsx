import { useEffect, useMemo, useState } from 'react';
import { useSection } from '../../context/ContentContext';
import './Hero.css';

const TRUST_ITEMS = [
  'House-made pasta and slow-risen pizza',
  'Polished service with Sicilian warmth',
  'Wine, experiences, and private hospitality',
];

export default function Hero() {
  const hero = useSection('hero');
  const links = useSection('links');
  const restaurant = useSection('restaurant');
  const story = useSection('story');
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = useMemo(
    () => (hero.gallery?.length ? hero.gallery : [hero.imageUrl]).filter(Boolean),
    [hero.gallery, hero.imageUrl],
  );
  const highlights = [story.stat1, story.stat2, story.stat3].filter(Boolean);
  const visibleSlideIndex = heroSlides.length > 0 ? activeSlide % heroSlides.length : 0;

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  return (
    <section className="hero" aria-label="Welcome to La Norma">
      <div className="hero__bg" aria-hidden="true">
        {heroSlides.map((imageUrl, index) => (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={hero.imageAlt}
            className={`hero__bg-img${index === visibleSlideIndex ? ' is-active' : ''}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : undefined}
          />
        ))}
        <div className="hero__overlay" />
        <div className="hero__aura hero__aura--left" />
        <div className="hero__aura hero__aura--right" />
      </div>

      <div className="hero__stage">
        <div className="hero__content container">
          <div className="hero__grid">
            <div className="hero__copy">
              <div className="hero__eyebrow-wrap">
                <span className="hero__eyebrow-line" aria-hidden="true" />
                <p className="hero__eyebrow">{hero.eyebrow}</p>
              </div>

              <h1 className="hero__headline">
                <span className="hero__headline-line hero__headline-line--upright">{hero.headline[0]}</span>
                <span className="hero__headline-line hero__headline-line--italic">{hero.headline[1]}</span>
              </h1>

              <p className="hero__subheadline">{hero.subheadline}</p>

              <div className="hero__trust">
                {TRUST_ITEMS.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <div className="hero__ctas">
                <a href={links.reserve} className="btn btn--primary hero__cta-primary">
                  Reserve a Table
                </a>
                <a href={links.menuPdf} className="btn btn--outline-light hero__cta-secondary">
                  Explore the Menu
                </a>
                <a href="#experiences" className="btn btn--ghost-cream hero__cta-tertiary">
                  Discover experiences
                </a>
              </div>
            </div>

            <aside className="hero__panel" aria-label="Quick booking details">
              <p className="hero__panel-label">Tonight at La Norma</p>
              <h2 className="hero__panel-heading">A dining room built for slower, more memorable evenings.</h2>
              <p className="hero__panel-copy">
                Reserve dinner, plan a Friday tasting, or arrange a private celebration with the same hospitality team.
              </p>

              <div className="hero__panel-grid">
                <div className="hero__panel-card">
                  <span className="hero__panel-card-label">Dinner service</span>
                  <strong>{restaurant.hours}</strong>
                </div>
                <div className="hero__panel-card">
                  <span className="hero__panel-card-label">Guest desk</span>
                  <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                </div>
                <div className="hero__panel-card hero__panel-card--full">
                  <span className="hero__panel-card-label">Location</span>
                  <strong>{restaurant.address}, {restaurant.city}</strong>
                </div>
              </div>

              <div className="hero__panel-actions">
                <a href={links.reserve} className="btn btn--primary">
                  Book now
                </a>
                <a href="#visit" className="btn btn--outline-light">
                  Plan your visit
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="hero__infobar" aria-label="Quick restaurant highlights">
        <div className="container hero__infobar-inner">
          {highlights.map((item, index) => (
            <article key={item.label} className="hero__infobar-item">
              <div className="hero__infobar-top">
                <span className="hero__infobar-index">0{index + 1}</span>
                <span className="hero__infobar-line" aria-hidden="true" />
              </div>
              <div className="hero__infobar-copy">
                <span className="hero__infobar-value">{item.value}</span>
                <span className="hero__infobar-label">{item.label}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
