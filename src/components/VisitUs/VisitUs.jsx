import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './VisitUs.css';

const hoursData = [
  { day: 'Monday', hours: '5:00 PM – 9:00 PM' },
  { day: 'Tuesday', hours: '5:00 PM – 9:00 PM' },
  { day: 'Wednesday', hours: '5:00 PM – 9:00 PM' },
  { day: 'Thursday', hours: '5:00 PM – 9:00 PM' },
  { day: 'Friday', hours: '5:00 PM – 9:00 PM' },
  { day: 'Saturday', hours: '5:00 PM – 9:00 PM' },
  { day: 'Sunday', hours: '5:00 PM – 9:00 PM' },
];

export default function VisitUs() {
  const restaurant = useSection('restaurant');
  const [ref, visible] = useInView();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <section id="visit" className="visit-us" aria-labelledby="visit-heading">
      <div className="visit-us__bg" aria-hidden="true" />

      <div className="container">
        <div className={`visit-us__grid fade-up${visible ? ' visible' : ''}`} ref={ref}>

          {/* Left: info */}
          <div className="visit-us__info">
            <p className="section-label" style={{ color: 'var(--gold-light)' }}>Come See Us</p>

            <h2 id="visit-heading" className="visit-us__heading">
              Find Us on<br /><em>Longboat Key</em>
            </h2>

            <div className="visit-us__address">
              <div className="visit-us__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <div>
                <p className="visit-us__address-line">{restaurant.address}</p>
                <p className="visit-us__address-line">{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                <a
                  href={restaurant.mapEmbedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-us__map-link"
                >
                  Get Directions →
                </a>
              </div>
            </div>

            <div className="visit-us__contact">
              <a href={`tel:${restaurant.phone}`} className="visit-us__contact-item">
                <span className="visit-us__contact-label">Phone</span>
                <span className="visit-us__contact-value">{restaurant.phone}</span>
              </a>
              <a href={`mailto:${restaurant.email}`} className="visit-us__contact-item">
                <span className="visit-us__contact-label">Email</span>
                <span className="visit-us__contact-value">{restaurant.email}</span>
              </a>
            </div>

            <div className="visit-us__social">
              {Object.entries(restaurant.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-us__social-link"
                  aria-label={`Follow us on ${platform}`}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          </div>

          {/* Right: hours */}
          <div className="visit-us__hours-panel">
            <h3 className="visit-us__hours-title">Hours of Operation</h3>
            <ul className="visit-us__hours-list">
              {hoursData.map((row) => (
                <li key={row.day} className={`visit-us__hours-row${row.day === today ? ' is-today' : ''}`}>
                  <span className="visit-us__hours-day">
                    {row.day}
                    {row.day === today && <span className="visit-us__today-badge">Today</span>}
                  </span>
                  <span className="visit-us__hours-time">{row.hours}</span>
                </li>
              ))}
            </ul>
            <p className="visit-us__hours-note">{restaurant.hoursNote}</p>
          </div>

        </div>
      </div>
    </section>
  );
}
