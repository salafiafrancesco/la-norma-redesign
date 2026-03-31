import { PAGE_KEYS } from '../../../shared/routes.js';
import { useNavigation } from '../../context/NavigationContext';
import './BookingConfirmation.css';

export default function BookingConfirmation({ booking }) {
  const { navigate } = useNavigation();
  const { selectedClass, firstName, lastName, email, guests } = booking;

  return (
    <section className="booking-confirmation" aria-labelledby="confirm-heading">
      <div className="container">
        <div className="bc-card">
          <div className="bc-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" />
              <path d="m13 24 8 8 14-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="section-label bc-label">Request received</p>
          <h2 id="confirm-heading" className="bc-heading">
            You are on the list.
          </h2>

          <p className="bc-message">
            Thank you, <strong>{firstName}</strong>. We have received your request and will send a personal confirmation
            to <strong>{email}</strong> within 24 hours with the remaining details for class day.
          </p>

          {selectedClass && (
            <div className="bc-summary">
              <h3 className="bc-summary__title">Your booking summary</h3>
              <dl className="bc-summary__list">
                <div className="bc-summary__row">
                  <dt>Class</dt>
                  <dd>{selectedClass.theme}</dd>
                </div>
                <div className="bc-summary__row">
                  <dt>Date</dt>
                  <dd>{selectedClass.displayDate}</dd>
                </div>
                <div className="bc-summary__row">
                  <dt>Time</dt>
                  <dd>{selectedClass.time}</dd>
                </div>
                <div className="bc-summary__row">
                  <dt>Guests</dt>
                  <dd>{guests} {guests === 1 ? 'person' : 'people'}</dd>
                </div>
                <div className="bc-summary__row">
                  <dt>Name</dt>
                  <dd>{firstName} {lastName}</dd>
                </div>
                <div className="bc-summary__row bc-summary__row--total">
                  <dt>Estimated total</dt>
                  <dd>${selectedClass.price * guests}</dd>
                </div>
              </dl>
              <p className="bc-summary__note">
                Your place is being held while we send the final confirmation and next steps.
              </p>
            </div>
          )}

          <div className="bc-next">
            <h3 className="bc-next__title">What happens next</h3>
            <ol className="bc-next__steps">
              <li>
                <span className="bc-next__num" aria-hidden="true">1</span>
                <span>Look out for a confirmation email within 24 hours.</span>
              </li>
              <li>
                <span className="bc-next__num" aria-hidden="true">2</span>
                <span>Review the arrival details and payment instructions we send over.</span>
              </li>
              <li>
                <span className="bc-next__num" aria-hidden="true">3</span>
                <span>Arrive hungry on Saturday morning. We will have the aprons ready.</span>
              </li>
            </ol>
          </div>

          <div className="bc-actions">
            <a
              href={`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(`La Norma Cooking Class: ${selectedClass?.theme ?? ''}`)}&dates=${selectedClass?.dateISO?.replace(/-/g, '')}T100000/${selectedClass?.dateISO?.replace(/-/g, '')}T133000&location=${encodeURIComponent('5370 Gulf of Mexico Drive, Longboat Key, FL')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline-dark bc-btn-calendar"
            >
              Add to Google Calendar
            </a>
            <button className="btn btn--outline-dark bc-btn-back" type="button" onClick={() => navigate(PAGE_KEYS.home)}>
              Back to La Norma
            </button>
          </div>

          <p className="bc-contact-note">
            Questions? Call <a href="tel:+19415550192">+1 (941) 555-0192</a> or email{' '}
            <a href="mailto:info@lanormarestaurant.com">info@lanormarestaurant.com</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
