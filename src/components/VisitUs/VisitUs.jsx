import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './VisitUs.css';

const HOURS_ROWS = [
  { day: 'Monday', hours: '5:00 PM - 9:00 PM' },
  { day: 'Tuesday', hours: '5:00 PM - 9:00 PM' },
  { day: 'Wednesday', hours: '5:00 PM - 9:00 PM' },
  { day: 'Thursday', hours: '5:00 PM - 9:00 PM' },
  { day: 'Friday', hours: '5:00 PM - 9:00 PM' },
  { day: 'Saturday', hours: '5:00 PM - 9:00 PM' },
  { day: 'Sunday', hours: '5:00 PM - 9:00 PM' },
];

export default function VisitUs() {
  const restaurant = useSection('restaurant');
  const links = useSection('links');
  const [ref, visible] = useInView();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <section id="visit" className="visit-us" aria-labelledby="visit-heading">
      <div className="visit-us__bg" aria-hidden="true" />

      <div className="container">
        <div className={`visit-us__layout fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <div className="visit-us__intro">
            <p className="section-label" style={{ color: 'var(--gold-light)' }}>
              Visit us
            </p>
            <h2 id="visit-heading" className="visit-us__heading">
              Dinner on Longboat Key, shaped with polish and warmth.
            </h2>
            <p className="visit-us__copy">
              From first aperitivo to the final espresso, the evening is designed to feel relaxed, looked after,
              and quietly memorable.
            </p>

            <div className="visit-us__cards">
              <article className="visit-us__card">
                <p className="visit-us__card-label">Address</p>
                <p>{restaurant.address}</p>
                <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                <a href={restaurant.mapEmbedUrl} target="_blank" rel="noopener noreferrer">
                  Get directions
                </a>
              </article>

              <article className="visit-us__card">
                <p className="visit-us__card-label">Contact</p>
                <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
                <p>{restaurant.hoursNote}</p>
              </article>
            </div>

            <div className="visit-us__actions">
              <a href={links.reserve} className="btn btn--primary">
                Reserve a Table
              </a>
              <a href={restaurant.mapEmbedUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline-light">
                Get directions
              </a>
            </div>
          </div>

          <aside className="visit-us__hours-panel" aria-label="Opening hours">
            <div className="visit-us__hours-head">
              <p className="visit-us__hours-label">Opening hours</p>
              <p className="visit-us__hours-main">{restaurant.hours}</p>
            </div>

            <ul className="visit-us__hours-list">
              {HOURS_ROWS.map((row) => (
                <li
                  key={row.day}
                  className={`visit-us__hours-row${row.day === today ? ' is-today' : ''}`}
                >
                  <span className="visit-us__hours-day">
                    {row.day}
                    {row.day === today && <span className="visit-us__today-badge">Today</span>}
                  </span>
                  <span className="visit-us__hours-time">{row.hours}</span>
                </li>
              ))}
            </ul>

            <div className="visit-us__social">
              {Object.entries(restaurant.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-us__social-link"
                >
                  {platform}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
