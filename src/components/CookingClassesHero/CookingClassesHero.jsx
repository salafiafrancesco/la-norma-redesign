import { useNavigation } from '../../context/NavigationContext';
import './CookingClassesHero.css';

export default function CookingClassesHero() {
  const { navigate } = useNavigation();

  const scrollToBooking = (e) => {
    e.preventDefault();
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="cc-hero" aria-label="Cooking Classes at La Norma">

      {/* Background */}
      <div className="cc-hero__bg" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1800&q=85"
          alt="Italian kitchen cooking scene"
          className="cc-hero__bg-img"
          loading="eager"
          fetchpriority="high"
        />
        <div className="cc-hero__overlay" />
      </div>

      {/* Back navigation */}
      <div className="cc-hero__nav container--wide container">
        <button
          className="cc-hero__back"
          onClick={() => navigate('home')}
          aria-label="Back to homepage"
        >
          <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>La Norma</span>
        </button>

        <a href="#booking" className="cc-hero__nav-reserve btn btn--primary" onClick={scrollToBooking}>
          Reserve a Spot
        </a>
      </div>

      {/* Main content */}
      <div className="cc-hero__content container">
        <div className="cc-hero__eyebrow-wrap">
          <span className="cc-hero__eyebrow-line" aria-hidden="true" />
          <p className="cc-hero__eyebrow">Saturday Mornings · La Norma Kitchen</p>
        </div>

        <h1 className="cc-hero__headline">
          <span className="cc-hero__headline-line">Cook Like</span>
          <span className="cc-hero__headline-line cc-hero__headline-line--italic">a Sicilian.</span>
        </h1>

        <p className="cc-hero__subheadline">
          Step behind the pass with Chef Marco. Roll pasta by hand,
          master the slow ragù, fire your own pizza — and sit down to eat
          everything you've made. An intimate class. A meal to remember.
        </p>

        <div className="cc-hero__meta">
          <div className="cc-hero__meta-item">
            <span className="cc-hero__meta-label">Duration</span>
            <span className="cc-hero__meta-value">3.5 Hours</span>
          </div>
          <span className="cc-hero__meta-sep" aria-hidden="true" />
          <div className="cc-hero__meta-item">
            <span className="cc-hero__meta-label">Group Size</span>
            <span className="cc-hero__meta-value">Max 8 Guests</span>
          </div>
          <span className="cc-hero__meta-sep" aria-hidden="true" />
          <div className="cc-hero__meta-item">
            <span className="cc-hero__meta-label">Price</span>
            <span className="cc-hero__meta-value">$95 / person</span>
          </div>
          <span className="cc-hero__meta-sep cc-hero__meta-sep--hide-sm" aria-hidden="true" />
          <div className="cc-hero__meta-item cc-hero__meta-item--hide-sm">
            <span className="cc-hero__meta-label">Includes</span>
            <span className="cc-hero__meta-value">Ingredients · Wine · Meal</span>
          </div>
        </div>

        <div className="cc-hero__ctas">
          <a href="#booking" className="btn btn--primary cc-hero__cta-primary" onClick={scrollToBooking}>
            Reserve My Spot
          </a>
          <a href="#format" className="btn btn--outline-light cc-hero__cta-secondary">
            How It Works
          </a>
        </div>
      </div>

    </section>
  );
}
