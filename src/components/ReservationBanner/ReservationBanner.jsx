import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import { OPENTABLE_RESERVATION_URL } from '../../utils/hospitalityMedia';
import './ReservationBanner.css';

const DINNER_WINDOWS = ['5:00 PM', '6:30 PM', '8:00 PM'];
const RESERVATION_BENEFITS = [
  'Instant availability check on OpenTable',
  'Best way to secure weekend dinner times',
  'Ideal when planning wine nights, live music, or a celebratory evening',
];

export default function ReservationBanner() {
  const restaurant = useSection('restaurant');
  const reservationBanner = useSection('reservationBanner');
  const [ref, visible] = useInView();

  return (
    <section id="reserve" className="reservation-banner" aria-labelledby="reserve-heading">
      <div className="reservation-banner__bg" aria-hidden="true" />

      <div className={`reservation-banner__inner container fade-up${visible ? ' visible' : ''}`} ref={ref}>
        <div className="reservation-banner__copy">
          <p className="section-label reservation-banner__label">Dinner reservations</p>
          <div className="reservation-banner__partner-row">
            <span className="reservation-banner__partner">Powered by OpenTable</span>
            <span className="reservation-banner__status">Secure, live availability</span>
          </div>
          <h2 id="reserve-heading" className="reservation-banner__heading">
            Reserve dinner in a few taps, then let the rest of the evening unfold naturally.
          </h2>
          <p className="reservation-banner__body">
            {reservationBanner.sub} Use OpenTable for the fastest path to confirmed seating, then plan the rest of the
            night around music, wine, or a slower dinner pace.
          </p>

          <div className="reservation-banner__hours">
            <span>{restaurant.hours}</span>
            <span className="reservation-banner__sep" aria-hidden="true">|</span>
            <span>{restaurant.address}, {restaurant.city}</span>
          </div>

          <div className="reservation-banner__benefits">
            {RESERVATION_BENEFITS.map((item) => (
              <div key={item} className="reservation-banner__benefit">
                <span aria-hidden="true" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="reservation-banner__panel">
          <p className="reservation-banner__panel-label">OpenTable dinner booking</p>
          <h3 className="reservation-banner__panel-heading">Choose your time, confirm faster, arrive relaxed.</h3>
          <p className="reservation-banner__panel-copy">
            Dinner reservations are handled through OpenTable so guests can move from browsing to a confirmed table
            without extra back-and-forth.
          </p>

          <div className="reservation-banner__windows" aria-label="Popular dinner windows">
            {DINNER_WINDOWS.map((window) => (
              <span key={window} className="reservation-banner__window">
                {window}
              </span>
            ))}
          </div>

          <div className="reservation-banner__ctas">
            <a
              href={OPENTABLE_RESERVATION_URL}
              className="btn btn--primary reservation-banner__btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reserve on OpenTable
            </a>
            <a href={`tel:${restaurant.phone}`} className="btn btn--outline-light reservation-banner__btn">
              Call the host stand
            </a>
          </div>

          <p className="reservation-banner__note">
            {reservationBanner.note} Dinner reservations are confirmed on OpenTable; larger celebrations can still be
            arranged directly with the restaurant.
          </p>
        </aside>
      </div>
    </section>
  );
}
