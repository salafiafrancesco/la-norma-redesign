import './CookingClassesHero.css';

export default function CookingClassesHero() {
  const scrollToBooking = (event) => {
    event.preventDefault();
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFormat = (event) => {
    event.preventDefault();
    document.getElementById('format')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="cc-hero" aria-labelledby="cc-hero-heading">
      <div className="cc-hero__bg" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1800&q=85"
          alt="Chef preparing ingredients in an Italian kitchen"
          className="cc-hero__bg-img"
          loading="eager"
          fetchPriority="high"
        />
        <div className="cc-hero__overlay" />
        <div className="cc-hero__aura cc-hero__aura--left" />
        <div className="cc-hero__aura cc-hero__aura--right" />
      </div>

      <div className="cc-hero__content container">
        <div className="cc-hero__grid">
          <div className="cc-hero__copy">
            <p className="cc-hero__eyebrow">Saturday mornings in the La Norma kitchen</p>

            <h1 id="cc-hero-heading" className="cc-hero__headline">
              Cook like a Sicilian.
              <span>Hands-on, intimate, and designed to end around the table.</span>
            </h1>

            <p className="cc-hero__subheadline">
              Join Chef Marco for a premium small-group class built around technique, wine, conversation, and a long
              shared meal. It feels closer to being welcomed into the kitchen than attending a standard workshop.
            </p>

            <div className="cc-hero__trust">
              <span>Chef-led instruction</span>
              <span>Maximum 8 guests</span>
              <span>Wine, meal, and recipes included</span>
            </div>

            <div className="cc-hero__actions">
              <a href="#booking" className="btn btn--primary" onClick={scrollToBooking}>
                Reserve My Spot
              </a>
              <a href="#format" className="btn btn--outline-light" onClick={scrollToFormat}>
                See the class format
              </a>
            </div>
          </div>

          <aside className="cc-hero__spotlight">
            <p className="cc-hero__spotlight-label">Why guests book early</p>
            <h2 className="cc-hero__spotlight-heading">A slower, more memorable way to spend a Saturday.</h2>
            <p className="cc-hero__spotlight-body">
              Limited seats keep the room personal, the teaching attentive, and the final meal genuinely communal.
            </p>

            <div className="cc-hero__spotlight-grid">
              <div className="cc-hero__spotlight-item">
                <span className="cc-hero__spotlight-value">3.5 hrs</span>
                <span className="cc-hero__spotlight-copy">From aperitivo to shared lunch</span>
              </div>
              <div className="cc-hero__spotlight-item">
                <span className="cc-hero__spotlight-value">$95</span>
                <span className="cc-hero__spotlight-copy">Per guest, all inclusive</span>
              </div>
              <div className="cc-hero__spotlight-item">
                <span className="cc-hero__spotlight-value">Personal</span>
                <span className="cc-hero__spotlight-copy">Confirmation handled directly by the restaurant</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="cc-hero__metrics" aria-label="Cooking class highlights">
          <div className="cc-hero__metric">
            <span className="cc-hero__metric-label">Format</span>
            <span className="cc-hero__metric-value">Hands-on cooking plus a shared meal</span>
          </div>
          <div className="cc-hero__metric">
            <span className="cc-hero__metric-label">Best for</span>
            <span className="cc-hero__metric-value">Couples, celebrations, friends, and private groups</span>
          </div>
          <div className="cc-hero__metric">
            <span className="cc-hero__metric-label">Booking rhythm</span>
            <span className="cc-hero__metric-value">Saturday dates release in limited numbers and fill quickly</span>
          </div>
        </div>
      </div>
    </section>
  );
}
