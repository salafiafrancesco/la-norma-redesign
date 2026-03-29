import { useSection } from '../../context/ContentContext';
import './Hero.css';

export default function Hero() {
  const hero       = useSection('hero');
  const links      = useSection('links');
  const restaurant = useSection('restaurant');
  return (
    <section className="hero" aria-label="Welcome to La Norma">

      {/* Background */}
      <div className="hero__bg" aria-hidden="true">
        <img
          src={hero.imageUrl}
          alt={hero.imageAlt}
          className="hero__bg-img"
          loading="eager"
          fetchpriority="high"
        />
        <div className="hero__overlay" />
      </div>

      {/* Main content */}
      <div className="hero__stage">
        <div className="hero__content container">

          {/* Eyebrow */}
          <div className="hero__eyebrow-wrap">
            <span className="hero__eyebrow-line" aria-hidden="true" />
            <p className="hero__eyebrow">{hero.eyebrow}</p>
          </div>

          {/* Headline */}
          <h1 className="hero__headline">
            <span className="hero__headline-line hero__headline-line--upright">
              {hero.headline[0]}
            </span>
            <span className="hero__headline-line hero__headline-line--italic">
              {hero.headline[1]}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="hero__subheadline">{hero.subheadline}</p>

          {/* CTAs */}
          <div className="hero__ctas">
            <a href={links.reserve} className="btn btn--primary hero__cta-primary">
              Reserve a Table
            </a>
            <a href={links.menuPdf} className="btn btn--outline-light hero__cta-secondary">
              View Menu
            </a>
          </div>

        </div>
      </div>

      {/* Bottom info bar */}
      <div className="hero__infobar" aria-label="Quick restaurant info">
        <div className="container hero__infobar-inner">
          <div className="hero__infobar-item">
            <span className="hero__infobar-label">Hours</span>
            <span className="hero__infobar-value">Daily 5:00 – 9:00 PM</span>
          </div>
          <span className="hero__infobar-sep" aria-hidden="true" />
          <div className="hero__infobar-item">
            <span className="hero__infobar-label">Location</span>
            <span className="hero__infobar-value">{restaurant.address}, {restaurant.city}</span>
          </div>
          <span className="hero__infobar-sep" aria-hidden="true" />
          <div className="hero__infobar-item">
            <span className="hero__infobar-label">Reservations</span>
            <a href={`tel:${restaurant.phone}`} className="hero__infobar-value hero__infobar-link">
              {restaurant.phone}
            </a>
          </div>
          <span className="hero__infobar-sep hero__infobar-sep--hide-sm" aria-hidden="true" />
          <a href={links.orderDelivery} className="hero__infobar-order btn--ghost-cream btn hero__infobar-order-btn">
            Order Online
          </a>
        </div>
      </div>

    </section>
  );
}
