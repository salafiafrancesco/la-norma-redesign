import { useEffect, useId, useMemo, useState } from 'react';
import API_BASE from '../../config/api';
import BookingConfirmation from '../BookingConfirmation/BookingConfirmation';
import { getCookingClassImage } from '../../utils/hospitalityMedia';
import { useResponsiveCardLimit } from '../../hooks/useResponsiveCardLimit';
import { sortByNearestUpcomingDate } from '../../utils/schedule';
import './BookingForm.css';

function formatClass(entry, index = 0) {
  const rawDate = entry.date || entry.dateISO;
  const date = new Date(`${rawDate}T12:00:00`);
  const spotsLeft = entry.spots_left ?? entry.spotsLeft ?? 0;
  const theme = entry.theme || entry.shortTheme || 'Cooking class';

  return {
    id: entry.id,
    theme,
    shortTheme: entry.short_theme || entry.shortTheme || theme,
    description: entry.description,
    difficulty: entry.difficulty,
    price: entry.price,
    time: entry.time,
    spotsLeft,
    isAvailable: spotsLeft > 0,
    displayDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dateISO: rawDate,
    imageUrl: entry.image_url || entry.imageUrl || getCookingClassImage(theme, index),
  };
}

async function submitRsvp(payload) {
  const response = await fetch(`${API_BASE}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Submission failed.');
  }

  return data;
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

function validateSelection(form) {
  const errors = {};
  if (!form.selectedClassId) errors.selectedClassId = 'Please choose a class date.';
  if (!form.guests || form.guests < 1) errors.guests = 'Please choose the number of guests.';
  return errors;
}

function validateDetails(form) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';

  if (!form.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  return errors;
}

function validateAll(form) {
  return { ...validateSelection(form), ...validateDetails(form) };
}

export default function BookingForm() {
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [step, setStep] = useState(0);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const uid = useId();
  const visibleClassCount = useResponsiveCardLimit();

  useEffect(() => {
    fetch(`${API_BASE}/api/classes`)
      .then((response) => response.json())
      .then((data) => setClasses(data.map((entry, index) => formatClass(entry, index))))
      .catch(() => {
        import('../../data/cookingClasses').then(({ generateUpcomingClasses }) => {
          setClasses(generateUpcomingClasses(6).map((entry, index) => formatClass(entry, index)));
        });
      })
      .finally(() => setLoadingClasses(false));
  }, []);

  const selectedClass = useMemo(
    () => classes.find((entry) => entry.id === form.selectedClassId) ?? null,
    [classes, form.selectedClassId],
  );

  const sortedClasses = useMemo(
    () => sortByNearestUpcomingDate(classes, (entry) => entry.dateISO),
    [classes],
  );

  const visibleClasses = useMemo(
    () => (showAllClasses ? sortedClasses : sortedClasses.slice(0, visibleClassCount)),
    [showAllClasses, sortedClasses, visibleClassCount],
  );

  useEffect(() => {
    if (!form.selectedClassId) return;

    const selectedIndex = sortedClasses.findIndex((entry) => entry.id === form.selectedClassId);
    if (selectedIndex >= visibleClassCount) {
      setShowAllClasses(true);
    }
  }, [form.selectedClassId, sortedClasses, visibleClassCount]);

  const maxGuests = selectedClass ? Math.min(8, selectedClass.spotsLeft) : 8;
  const totalPrice = selectedClass ? selectedClass.price * form.guests : 0;

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[field];
        return nextErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    const nextErrors = step === 0 ? validateSelection(form) : step === 1 ? validateDetails(form) : {};

    setErrors((current) => {
      const updated = { ...current };
      Object.keys(nextErrors).forEach((key) => {
        updated[key] = nextErrors[key];
      });

      if (step === 0) {
        delete updated.firstName;
        delete updated.lastName;
        delete updated.email;
      }

      if (step === 1) {
        delete updated.selectedClassId;
        delete updated.guests;
      }

      return updated;
    });

    return nextErrors;
  };

  const moveToError = () => {
    document.querySelector('.bf-field--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateAll(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.selectedClassId || validationErrors.guests) {
        setStep(0);
      } else if (validationErrors.firstName || validationErrors.lastName || validationErrors.email) {
        setStep(1);
      }

      moveToError();
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await submitRsvp({
        class_id: form.selectedClassId,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        guests: form.guests,
        notes: form.notes.trim(),
      });

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = (event) => {
    event.preventDefault();

    if (step < 2) {
      const nextErrors = validateCurrentStep();
      if (Object.keys(nextErrors).length > 0) {
        moveToError();
        return;
      }

      setStep((value) => value + 1);
      return;
    }

    handleSubmit(event);
  };

  if (submitted) {
    return <BookingConfirmation booking={{ ...form, selectedClass }} />;
  }

  return (
    <section id="booking" className="booking-section" aria-labelledby="booking-heading">
      <div className="container">
        <div className="booking-section__header">
          <p className="section-label">Reserve your place</p>
          <h2 id="booking-heading" className="booking-section__heading">
            Reserve the Saturday you actually want, with a booking flow that feels as polished as the class itself.
          </h2>
          <p className="booking-section__subheading">
            Choose your date, add your guest details, and send a direct RSVP to the restaurant. We confirm each request
            personally within 24 hours.
          </p>
        </div>

        <div className="booking-shell">
          <aside className="booking-sidebar">
            <div className="booking-sidebar__card">
              <p className="booking-sidebar__label">What happens next</p>
              <ul className="booking-sidebar__list">
                <li>We confirm availability and reply personally within 24 hours.</li>
                <li>Your class is held while we send final details and payment instructions.</li>
                <li>Dietary restrictions and celebration notes are reviewed by the team before class day.</li>
              </ul>
            </div>

            <div className="booking-sidebar__card booking-sidebar__card--summary">
              <p className="booking-sidebar__label">Current selection</p>
              {selectedClass ? (
                <div className="booking-sidebar__summary">
                  <strong>{selectedClass.theme}</strong>
                  <span>{selectedClass.displayDate}</span>
                  <span>{selectedClass.time}</span>
                  <span>{form.guests} {form.guests === 1 ? 'guest' : 'guests'}</span>
                  <span>${totalPrice} estimated total</span>
                </div>
              ) : (
                <p className="booking-sidebar__empty">Choose a class date to build your summary here.</p>
              )}
            </div>

            <div className="booking-sidebar__trust">
              <span>No payment required to submit</span>
              <span>Secure and private</span>
              <span>Designed for mobile and quick completion</span>
            </div>
          </aside>

          <div className="booking-form-shell">
            <div className="booking-progress" aria-label="Booking steps">
              {['Choose your class', 'Your details', 'Review and send'].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`booking-progress__step${index === step ? ' is-active' : ''}${index < step ? ' is-complete' : ''}`}
                  onClick={() => index <= step && setStep(index)}
                  disabled={index > step}
                >
                  <span className="booking-progress__num">{index + 1}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <form className="booking-form" onSubmit={handleContinue} aria-label="Cooking class reservation form" noValidate>
              {step === 0 && (
                <>
                  <div className="booking-step-header">
                    <p className="booking-step-header__eyebrow">Step 1</p>
                    <h3>Choose the class date and guest count</h3>
                    <p>Saturday mornings fill quickly, so we show the most current availability first.</p>
                  </div>

                  {loadingClasses && (
                    <p className="bf-hint bf-hint--center">Loading available classes...</p>
                  )}

                  <div className={`bf-date-grid${errors.selectedClassId ? ' bf-field--error' : ''}`} role="radiogroup">
                    {visibleClasses.map((entry) => (
                      <label
                        key={entry.id}
                        className={`date-card${!entry.isAvailable ? ' date-card--sold-out' : ''}${form.selectedClassId === entry.id ? ' date-card--selected' : ''}`}
                        aria-disabled={!entry.isAvailable}
                      >
                        <input
                          type="radio"
                          name="classDate"
                          value={entry.id}
                          checked={form.selectedClassId === entry.id}
                          onChange={() => entry.isAvailable && setField('selectedClassId', entry.id)}
                          disabled={!entry.isAvailable}
                          className="sr-only"
                        />
                        <div className="date-card__top">
                          <span className="date-card__short-date">{entry.shortDate}</span>
                          {entry.isAvailable ? (
                            <span className={`date-card__spots${entry.spotsLeft <= 2 ? ' date-card__spots--low' : ''}`}>
                              {entry.spotsLeft} left
                            </span>
                          ) : (
                            <span className="date-card__sold-out-badge">Full</span>
                          )}
                        </div>
                        <div
                          className="date-card__media"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(17, 22, 21, 0.12), rgba(17, 22, 21, 0.62)), linear-gradient(135deg, rgba(196, 151, 58, 0.16), transparent), url(${entry.imageUrl})`,
                          }}
                          aria-hidden="true"
                        />
                        <div className="date-card__content">
                          <p className="date-card__theme">{entry.shortTheme}</p>
                          <p className="date-card__time">{entry.time}</p>
                          <p className="date-card__difficulty">{entry.difficulty}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {sortedClasses.length > visibleClassCount && (
                    <div className="bf-grid-toggle-wrap">
                      <button
                        type="button"
                        className="bf-grid-toggle"
                        onClick={() => setShowAllClasses((value) => !value)}
                        aria-expanded={showAllClasses}
                      >
                        {showAllClasses ? 'Show fewer dates' : `Show ${sortedClasses.length - visibleClassCount} more dates`}
                      </button>
                    </div>
                  )}

                  {errors.selectedClassId && <p className="bf-error-msg" role="alert">{errors.selectedClassId}</p>}

                  {selectedClass && (
                    <div className="selected-class-detail">
                      <div
                        className="selected-class-detail__visual"
                        style={{
                          backgroundImage: `linear-gradient(180deg, rgba(18, 23, 22, 0.18), rgba(18, 23, 22, 0.66)), url(${selectedClass.imageUrl})`,
                        }}
                        aria-hidden="true"
                      />
                      <div className="selected-class-detail__inner">
                        <span className="selected-class-detail__badge">Selected class</span>
                        <p className="selected-class-detail__heading">{selectedClass.theme}</p>
                        <p className="selected-class-detail__info">
                          {selectedClass.displayDate} | {selectedClass.time} | ${selectedClass.price} per guest
                        </p>
                        <p className="selected-class-detail__desc">{selectedClass.description}</p>
                      </div>
                    </div>
                  )}

                  <div className={`bf-guest-card${errors.guests ? ' bf-field--error' : ''}`}>
                    <div>
                      <p className="bf-guest-card__label">Guests</p>
                      <h4>How many people are joining?</h4>
                    </div>
                    <div className="bf-stepper" role="group" aria-labelledby={`${uid}-guests`}>
                      <button
                        type="button"
                        className="bf-stepper__btn"
                        onClick={() => setField('guests', Math.max(1, form.guests - 1))}
                        disabled={form.guests <= 1}
                        aria-label="Decrease guests"
                      >
                        -
                      </button>
                      <output id={`${uid}-guests`} className="bf-stepper__value" aria-live="polite">
                        {form.guests} {form.guests === 1 ? 'person' : 'people'}
                      </output>
                      <button
                        type="button"
                        className="bf-stepper__btn"
                        onClick={() => setField('guests', Math.min(maxGuests, form.guests + 1))}
                        disabled={form.guests >= maxGuests}
                        aria-label="Increase guests"
                      >
                        +
                      </button>
                    </div>
                    {selectedClass && (
                      <p className="bf-hint">
                        {selectedClass.spotsLeft} spots remaining | max {Math.min(8, selectedClass.spotsLeft)} per booking
                      </p>
                    )}
                    {errors.guests && <p className="bf-error-msg" role="alert">{errors.guests}</p>}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="booking-step-header">
                    <p className="booking-step-header__eyebrow">Step 2</p>
                    <h3>Tell us who should receive the confirmation</h3>
                    <p>We use these details only to confirm your reservation and any practical notes before class day.</p>
                  </div>

                  <div className="bf-row">
                    <div className={`bf-field${errors.firstName ? ' bf-field--error' : ''}`}>
                      <label htmlFor={`${uid}-first`} className="bf-label">First name *</label>
                      <input
                        id={`${uid}-first`}
                        type="text"
                        className="bf-input"
                        value={form.firstName}
                        onChange={(event) => setField('firstName', event.target.value)}
                        placeholder="Sofia"
                        autoComplete="given-name"
                      />
                      {errors.firstName && <p className="bf-error-msg" role="alert">{errors.firstName}</p>}
                    </div>

                    <div className={`bf-field${errors.lastName ? ' bf-field--error' : ''}`}>
                      <label htmlFor={`${uid}-last`} className="bf-label">Last name *</label>
                      <input
                        id={`${uid}-last`}
                        type="text"
                        className="bf-input"
                        value={form.lastName}
                        onChange={(event) => setField('lastName', event.target.value)}
                        placeholder="Ricci"
                        autoComplete="family-name"
                      />
                      {errors.lastName && <p className="bf-error-msg" role="alert">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="bf-row">
                    <div className={`bf-field${errors.email ? ' bf-field--error' : ''}`}>
                      <label htmlFor={`${uid}-email`} className="bf-label">Email address *</label>
                      <input
                        id={`${uid}-email`}
                        type="email"
                        className="bf-input"
                        value={form.email}
                        onChange={(event) => setField('email', event.target.value)}
                        placeholder="sofia@email.com"
                        autoComplete="email"
                        inputMode="email"
                      />
                      <p className="bf-hint">We send the final confirmation here.</p>
                      {errors.email && <p className="bf-error-msg" role="alert">{errors.email}</p>}
                    </div>

                    <div className="bf-field">
                      <label htmlFor={`${uid}-phone`} className="bf-label">Phone number</label>
                      <input
                        id={`${uid}-phone`}
                        type="tel"
                        className="bf-input"
                        value={form.phone}
                        onChange={(event) => setField('phone', event.target.value)}
                        placeholder="+1 (941) 555-0192"
                        autoComplete="tel"
                        inputMode="tel"
                      />
                      <p className="bf-hint">Optional, but useful for time-sensitive follow-up.</p>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="booking-step-header">
                    <p className="booking-step-header__eyebrow">Step 3</p>
                    <h3>Add any notes and send your RSVP</h3>
                    <p>Share dietary restrictions, celebration details, or anything helpful before we confirm.</p>
                  </div>

                  <div className="bf-field">
                    <label htmlFor={`${uid}-notes`} className="bf-label">Dietary notes or requests</label>
                    <textarea
                      id={`${uid}-notes`}
                      className="bf-textarea"
                      value={form.notes}
                      onChange={(event) => setField('notes', event.target.value)}
                      placeholder="Allergies, dietary restrictions, a celebration note, or anything else we should know..."
                      rows={5}
                    />
                    <p className="bf-hint">We read every note and do our best to accommodate with care.</p>
                  </div>

                  <div className="bf-review">
                    <p className="bf-review__label">Booking summary</p>
                    <div className="bf-review__grid">
                      <div className="bf-review__item">
                        <span>Selected class</span>
                        <strong>{selectedClass ? selectedClass.theme : 'No class selected yet'}</strong>
                      </div>
                      <div className="bf-review__item">
                        <span>Guest count</span>
                        <strong>{form.guests} {form.guests === 1 ? 'person' : 'people'}</strong>
                      </div>
                      <div className="bf-review__item">
                        <span>Confirmation email</span>
                        <strong>{form.email || 'Add your details in step 2'}</strong>
                      </div>
                      <div className="bf-review__item">
                        <span>Estimated total</span>
                        <strong>{selectedClass ? `$${totalPrice}` : 'Shown after selecting a class'}</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {submitError && (
                <div className="bf-submit-error" role="alert">
                  <p>{submitError}</p>
                </div>
              )}

              <div className="bf-submit-wrap">
                {step > 0 ? (
                  <button type="button" className="btn btn--outline-dark bf-back-btn" onClick={() => setStep((value) => value - 1)}>
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className={`btn btn--primary bf-submit-btn${submitting ? ' bf-submit-btn--loading' : ''}`}
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? 'Sending your RSVP...' : step === 2 ? 'Reserve My Spot' : 'Continue'}
                </button>
              </div>

              <p className="bf-submit-note">
                By submitting, you agree to our cancellation policy. Full refund is available when plans change 72+ hours before class.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
