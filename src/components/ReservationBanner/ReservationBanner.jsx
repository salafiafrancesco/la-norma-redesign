import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './ReservationBanner.css';

export default function ReservationBanner() {
  const restaurant = useSection('restaurant');
  const links      = useSection('links');
  const [ref, visible] = useInView();

  return (
    <section id="reserve" className="reservation-banner" aria-labelledby="reserve-heading">
      <div className="reservation-banner__bg" aria-hidden="true" />

      <div className={`reservation-banner__inner container fade-up${visible ? ' visible' : ''}`} ref={ref}>
        <div className="reservation-banner__leaf" aria-hidden="true">
          {/* Decorative leaf SVG */}
          <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M40 110 C40 110 5 75 5 40 C5 18 21 5 40 5 C59 5 75 18 75 40 C75 75 40 110 40 110Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3"/>
            <path d="M40 110 C40 110 40 60 40 5" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
          </svg>
        </div>

        <p className="section-label reservation-banner__label">Reserve Your Table</p>

        <h2 id="reserve-heading" className="reservation-banner__heading">
          A Table Awaits.<br />
          <em>Make it Yours.</em>
        </h2>

        <p className="reservation-banner__body">
          Whether it's a quiet dinner for two or a celebration with friends — we'd be honored to set the table.
          Book directly or call us anytime.
        </p>

        <div className="reservation-banner__hours">
          <span>{restaurant.hours}</span>
          <span className="reservation-banner__sep" aria-hidden="true">·</span>
          <span>{restaurant.address}, {restaurant.city}</span>
        </div>

        <div className="reservation-banner__ctas">
          <a href={links.reserve} className="btn btn--primary reservation-banner__btn">
            Reserve Online
          </a>
          <a href={`tel:${restaurant.phone}`} className="btn btn--outline-light reservation-banner__btn">
            {restaurant.phone}
          </a>
        </div>

        <p className="reservation-banner__note">{restaurant.hoursNote}</p>
      </div>
    </section>
  );
}
