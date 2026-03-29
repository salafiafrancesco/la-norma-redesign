import { useState, useEffect, useId } from 'react';
import BookingConfirmation from '../BookingConfirmation/BookingConfirmation';
import API_BASE from '../../config/api';
import './BookingForm.css';

// Transform API class record → shape expected by UI
function formatClass(cls) {
  const d = new Date(cls.date + 'T12:00:00');
  return {
    id:          cls.id,
    theme:       cls.theme,
    shortTheme:  cls.short_theme || cls.theme,
    description: cls.description,
    difficulty:  cls.difficulty,
    price:       cls.price,
    time:        cls.time,
    spotsLeft:   cls.spots_left,
    isAvailable: cls.spots_left > 0,
    displayDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    shortDate:   d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dateISO:     cls.date,
  };
}

async function submitRsvp(payload) {
  const res = await fetch(`${API_BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Submission failed');
  return data;
}

/* ---- Validation ---- */
function validate(form) {
  const errors = {};
  if (!form.selectedClassId) errors.selectedClassId = 'Please choose a class date.';
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!form.guests || form.guests < 1) {
    errors.guests = 'Please choose the number of guests.';
  }
  return errors;
}

const INITIAL_FORM = {
  selectedClassId: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  guests: 2,
  notes: '',
};

export default function BookingForm() {
  const [classes, setClasses]   = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/classes`)
      .then(r => r.json())
      .then(data => setClasses(data.map(formatClass)))
      .catch(() => {
        // Fallback: generate static classes if API unavailable
        import('../../data/cookingClasses').then(({ generateUpcomingClasses }) => {
          setClasses(generateUpcomingClasses(6));
        });
      })
      .finally(() => setLoadingClasses(false));
  }, []);

  const uid = useId();

  const selectedClass = classes.find((c) => c.id === form.selectedClassId) ?? null;

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user edits
    if (errors[field]) {
      setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
    }
  };

  const blur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched({ selectedClassId: true, firstName: true, lastName: true, email: true, guests: true });

    if (Object.keys(errs).length > 0) {
      // Scroll to first error
      const firstErrorEl = document.querySelector('.bf-field--error');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await submitRsvp({
        class_id:   form.selectedClassId,
        first_name: form.firstName.trim(),
        last_name:  form.lastName.trim(),
        email:      form.email.trim(),
        phone:      form.phone.trim(),
        guests:     form.guests,
        notes:      form.notes.trim(),
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <BookingConfirmation booking={{ ...form, selectedClass }} />;
  }

  const maxGuests = selectedClass ? Math.min(8, selectedClass.spotsLeft) : 8;

  return (
    <section id="booking" className="booking-section" aria-labelledby="booking-heading">
      <div className="container">
        <div className="booking-section__header">
          <p className="section-label">Reserve Your Spot</p>
          <h2 id="booking-heading" className="booking-section__heading">
            Join Us in the Kitchen
          </h2>
          <p className="booking-section__subheading">
            Spots fill up quickly — especially on Saturdays. Book early to secure your preferred class.
          </p>
        </div>

        <form
          className="booking-form"
          onSubmit={handleSubmit}
          aria-label="Cooking class reservation form"
          noValidate
        >
          {/* ---- STEP 1: Choose a date ---- */}
          <fieldset className="bf-fieldset">
            <legend className="bf-legend">
              <span className="bf-legend__step" aria-hidden="true">1</span>
              Choose Your Class
            </legend>

            {loadingClasses && (
              <p className="bf-hint" style={{ textAlign: 'center', padding: '1.5rem 0' }}>Loading available classes…</p>
            )}

            <div
              className={`bf-date-grid${touched.selectedClassId && errors.selectedClassId ? ' bf-field--error' : ''}`}
              role="radiogroup"
              aria-required="true"
              aria-label="Select a class date"
            >
              {classes.map((cls) => (
                <label
                  key={cls.id}
                  className={`date-card${!cls.isAvailable ? ' date-card--sold-out' : ''}${form.selectedClassId === cls.id ? ' date-card--selected' : ''}`}
                  aria-disabled={!cls.isAvailable}
                >
                  <input
                    type="radio"
                    name="classDate"
                    value={cls.id}
                    checked={form.selectedClassId === cls.id}
                    onChange={() => cls.isAvailable && set('selectedClassId', cls.id)}
                    disabled={!cls.isAvailable}
                    className="sr-only"
                    aria-label={`${cls.theme}, ${cls.displayDate}, ${cls.spotsLeft} spots left`}
                  />
                  <div className="date-card__top">
                    <span className="date-card__short-date">{cls.shortDate}</span>
                    {cls.isAvailable ? (
                      <span className={`date-card__spots${cls.spotsLeft <= 2 ? ' date-card__spots--low' : ''}`}>
                        {cls.spotsLeft} left
                      </span>
                    ) : (
                      <span className="date-card__sold-out-badge">Full</span>
                    )}
                  </div>
                  <p className="date-card__theme">{cls.shortTheme}</p>
                  <p className="date-card__time">{cls.time}</p>
                  <p className="date-card__difficulty">{cls.difficulty}</p>
                  <div className="date-card__check" aria-hidden="true">
                    <svg viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </label>
              ))}
            </div>

            {touched.selectedClassId && errors.selectedClassId && (
              <p className="bf-error-msg" role="alert">{errors.selectedClassId}</p>
            )}

            {/* Selected class details */}
            {selectedClass && (
              <div className="selected-class-detail">
                <div className="selected-class-detail__inner">
                  <span className="selected-class-detail__badge">Selected</span>
                  <p className="selected-class-detail__heading">{selectedClass.theme}</p>
                  <p className="selected-class-detail__info">
                    {selectedClass.displayDate} · {selectedClass.time} · ${selectedClass.price}/person
                  </p>
                  <p className="selected-class-detail__desc">{selectedClass.description}</p>
                </div>
              </div>
            )}
          </fieldset>

          {/* ---- STEP 2: Guest count ---- */}
          <fieldset className="bf-fieldset">
            <legend className="bf-legend">
              <span className="bf-legend__step" aria-hidden="true">2</span>
              Number of Guests
            </legend>

            <div className="bf-guests-wrap">
              <div className={`bf-field${touched.guests && errors.guests ? ' bf-field--error' : ''}`}>
                <label htmlFor={`${uid}-guests`} className="bf-label">
                  How many people are joining? <span className="bf-required" aria-hidden="true">*</span>
                </label>
                <div className="bf-stepper" role="group" aria-labelledby={`${uid}-guests`}>
                  <button
                    type="button"
                    className="bf-stepper__btn"
                    onClick={() => set('guests', Math.max(1, form.guests - 1))}
                    disabled={form.guests <= 1}
                    aria-label="Decrease guests"
                  >–</button>
                  <output id={`${uid}-guests`} className="bf-stepper__value" aria-live="polite">
                    {form.guests} {form.guests === 1 ? 'person' : 'people'}
                  </output>
                  <button
                    type="button"
                    className="bf-stepper__btn"
                    onClick={() => set('guests', Math.min(maxGuests, form.guests + 1))}
                    disabled={form.guests >= maxGuests}
                    aria-label="Increase guests"
                  >+</button>
                </div>
                {selectedClass && (
                  <p className="bf-hint">
                    {selectedClass.spotsLeft} spot{selectedClass.spotsLeft !== 1 ? 's' : ''} remaining · max {Math.min(8, selectedClass.spotsLeft)} per booking
                  </p>
                )}
                {touched.guests && errors.guests && (
                  <p className="bf-error-msg" role="alert">{errors.guests}</p>
                )}
              </div>

              {/* Price preview */}
              {selectedClass && form.guests >= 1 && (
                <div className="bf-price-preview">
                  <span className="bf-price-preview__amount">
                    ${selectedClass.price * form.guests}
                  </span>
                  <span className="bf-price-preview__breakdown">
                    {form.guests} × ${selectedClass.price}
                  </span>
                  <span className="bf-price-preview__note">Payable upon confirmation</span>
                </div>
              )}
            </div>
          </fieldset>

          {/* ---- STEP 3: Contact details ---- */}
          <fieldset className="bf-fieldset">
            <legend className="bf-legend">
              <span className="bf-legend__step" aria-hidden="true">3</span>
              Your Details
            </legend>

            <div className="bf-row">
              <div className={`bf-field${touched.firstName && errors.firstName ? ' bf-field--error' : ''}`}>
                <label htmlFor={`${uid}-first`} className="bf-label">
                  First Name <span className="bf-required" aria-hidden="true">*</span>
                </label>
                <input
                  id={`${uid}-first`}
                  type="text"
                  className="bf-input"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  onBlur={() => blur('firstName')}
                  placeholder="Sofia"
                  autoComplete="given-name"
                  aria-invalid={!!(touched.firstName && errors.firstName)}
                  aria-describedby={touched.firstName && errors.firstName ? `${uid}-first-err` : undefined}
                />
                {touched.firstName && errors.firstName && (
                  <p id={`${uid}-first-err`} className="bf-error-msg" role="alert">{errors.firstName}</p>
                )}
              </div>

              <div className={`bf-field${touched.lastName && errors.lastName ? ' bf-field--error' : ''}`}>
                <label htmlFor={`${uid}-last`} className="bf-label">
                  Last Name <span className="bf-required" aria-hidden="true">*</span>
                </label>
                <input
                  id={`${uid}-last`}
                  type="text"
                  className="bf-input"
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  onBlur={() => blur('lastName')}
                  placeholder="Ricci"
                  autoComplete="family-name"
                  aria-invalid={!!(touched.lastName && errors.lastName)}
                  aria-describedby={touched.lastName && errors.lastName ? `${uid}-last-err` : undefined}
                />
                {touched.lastName && errors.lastName && (
                  <p id={`${uid}-last-err`} className="bf-error-msg" role="alert">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="bf-row">
              <div className={`bf-field${touched.email && errors.email ? ' bf-field--error' : ''}`}>
                <label htmlFor={`${uid}-email`} className="bf-label">
                  Email Address <span className="bf-required" aria-hidden="true">*</span>
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  className="bf-input"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  onBlur={() => blur('email')}
                  placeholder="sofia@email.com"
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={!!(touched.email && errors.email)}
                  aria-describedby={`${uid}-email-hint${touched.email && errors.email ? ` ${uid}-email-err` : ''}`}
                />
                <p id={`${uid}-email-hint`} className="bf-hint">We'll send your confirmation here.</p>
                {touched.email && errors.email && (
                  <p id={`${uid}-email-err`} className="bf-error-msg" role="alert">{errors.email}</p>
                )}
              </div>

              <div className="bf-field">
                <label htmlFor={`${uid}-phone`} className="bf-label">
                  Phone Number <span className="bf-optional">(optional)</span>
                </label>
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  className="bf-input"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  onBlur={() => blur('phone')}
                  placeholder="+1 (941) 555-0192"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
            </div>

            <div className="bf-field">
              <label htmlFor={`${uid}-notes`} className="bf-label">
                Special Requests or Dietary Notes <span className="bf-optional">(optional)</span>
              </label>
              <textarea
                id={`${uid}-notes`}
                className="bf-textarea"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                onBlur={() => blur('notes')}
                placeholder="Allergies, dietary restrictions, a special occasion to celebrate, or anything else we should know…"
                rows={4}
              />
              <p className="bf-hint">We read every note and do our best to accommodate.</p>
            </div>
          </fieldset>

          {/* ---- Trust signals ---- */}
          <div className="bf-trust">
            <div className="bf-trust__item">
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M9 1l2 5.5H17l-4.5 3.3 1.7 5.4L9 12l-5.2 3.2 1.7-5.4L1 6.5h6L9 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              <span>No payment required to RSVP</span>
            </div>
            <div className="bf-trust__item">
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M15 6H3a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2zM5 6V4a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>Secure & private — we never share your information</span>
            </div>
            <div className="bf-trust__item">
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>Confirmation within 24 hours</span>
            </div>
          </div>

          {/* ---- Server error ---- */}
          {submitError && (
            <div className="bf-submit-error" role="alert">
              <p>{submitError}</p>
            </div>
          )}

          {/* ---- Submit ---- */}
          <div className="bf-submit-wrap">
            <button
              type="submit"
              className={`btn btn--primary bf-submit-btn${submitting ? ' bf-submit-btn--loading' : ''}`}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className="bf-spinner" aria-hidden="true" />
                  Sending your RSVP…
                </>
              ) : (
                <>
                  Reserve My Spot
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="bf-submit-icon">
                    <path d="M1 8h14M9 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
            <p className="bf-submit-note">
              By submitting, you agree to our cancellation policy. Full refund 72h+ before class.
            </p>
          </div>

        </form>
      </div>
    </section>
  );
}
