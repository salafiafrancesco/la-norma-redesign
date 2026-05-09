import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import API_BASE from '../../config/api';
import { useNavigation } from '../../context/NavigationContext';
import { PAGE_KEYS } from '../../../shared/routes.js';
import './ExperienceBooking.css';

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const STEPS = ['SELECT_DATE', 'SELECT_GUESTS', 'CONTACT_DETAILS', 'PAYMENT', 'CONFIRMATION'];
const STORAGE_PREFIX = 'ln_booking_';

function formatEventDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate(),
    full: d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }),
  };
}

function formatCents(cents, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* ------------------------------------------------------------------ */
/* Persistence helpers                                                */
/* ------------------------------------------------------------------ */
function loadPersistedState(key) {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistState(key, state) {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(state));
  } catch { /* ignore */ }
}

function clearPersistedState(key) {
  try { sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`); } catch { /* */ }
}

/* ================================================================== */
/* Main component                                                     */
/* ================================================================== */

/**
 * @param {object}  props
 * @param {string}  props.experienceType   'cooking_class' | 'wine_tasting' | 'live_music'
 * @param {string}  props.paymentMode      'stripe' | 'request'
 * @param {number}  props.minGuests        default 1
 * @param {number}  props.maxGuests        default 8
 * @param {object}  props.copy             { label, heading, confirmationTitle, confirmationMessage }
 * @param {string}  [props.anchor]         id for scroll anchoring (default 'booking')
 */
export default function ExperienceBooking({
  experienceType,
  paymentMode = 'request',
  minGuests = 1,
  maxGuests = 8,
  copy = {},
  anchor = 'booking',
}) {
  const uid = useId();
  const { navigate } = useNavigation();
  const sectionRef = useRef(null);

  // -- Events --
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);

  // -- Booking state (persisted) --
  const persisted = useMemo(() => loadPersistedState(experienceType), [experienceType]);
  const [selectedEventId, setSelectedEventId] = useState(persisted?.selectedEventId ?? null);
  const [guests, setGuests] = useState(persisted?.guests ?? Math.min(2, maxGuests));
  const [contact, setContact] = useState(persisted?.contact ?? { name: '', email: '', phone: '' });
  const [specialRequests, setSpecialRequests] = useState(persisted?.specialRequests ?? '');

  // -- Step machine --
  const skipPayment = paymentMode !== 'stripe';
  const stepList = skipPayment ? STEPS.filter((s) => s !== 'PAYMENT') : STEPS;
  const [stepIndex, setStepIndex] = useState(persisted?.stepIndex ?? 0);
  const currentStep = stepList[stepIndex] || 'SELECT_DATE';

  // -- UI state --
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  // -- Selected event derived --
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId],
  );

  const seatsAvailable = selectedEvent
    ? (selectedEvent.capacity > 0 ? selectedEvent.capacity - selectedEvent.seats_booked : 999)
    : 999;

  const effectiveMaxGuests = Math.min(maxGuests, seatsAvailable);
  const totalCents = selectedEvent ? selectedEvent.price_cents * guests : 0;

  // -- Persist on change --
  useEffect(() => {
    if (currentStep === 'CONFIRMATION') return;
    persistState(experienceType, { selectedEventId, guests, contact, specialRequests, stepIndex });
  }, [experienceType, selectedEventId, guests, contact, specialRequests, stepIndex, currentStep]);

  // -- Fetch events --
  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);

    fetch(`${API_BASE}/api/experience-events?type=${experienceType}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { if (!cancelled) setEvents(data); })
      .catch(() => { if (!cancelled) setEvents([]); })
      .finally(() => { if (!cancelled) setEventsLoading(false); });

    return () => { cancelled = true; };
  }, [experienceType]);

  // -- Sticky bar visibility (IntersectionObserver) --
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(entry.isIntersecting && currentStep !== 'CONFIRMATION'),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentStep]);

  // -- Clamp guests when event changes --
  useEffect(() => {
    if (guests > effectiveMaxGuests) setGuests(effectiveMaxGuests);
    if (guests < minGuests) setGuests(minGuests);
  }, [effectiveMaxGuests, guests, minGuests]);

  // -- Navigation --
  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, stepList.length - 1));
  }, [stepList.length]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const setField = useCallback((key, value) => {
    setContact((c) => ({ ...c, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }, [errors]);

  // -- Validation --
  const validateSelectDate = () => {
    if (!selectedEventId) return { event: 'Please select an event date.' };
    return {};
  };

  const validateGuests = () => {
    if (guests < minGuests || guests > effectiveMaxGuests) return { guests: 'Invalid guest count.' };
    return {};
  };

  const validateContact = () => {
    const e = {};
    if (!contact.name.trim()) e.name = 'Name is required.';
    if (!contact.email.trim()) e.email = 'Email is required.';
    else if (!isValidEmail(contact.email.trim())) e.email = 'Please enter a valid email.';
    return e;
  };

  const handleContinue = () => {
    let stepErrors = {};
    if (currentStep === 'SELECT_DATE') stepErrors = validateSelectDate();
    else if (currentStep === 'SELECT_GUESTS') stepErrors = validateGuests();
    else if (currentStep === 'CONTACT_DETAILS') stepErrors = validateContact();

    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    // If CONTACT_DETAILS and paymentMode=request → submit
    if (currentStep === 'CONTACT_DETAILS' && skipPayment) {
      handleSubmit();
      return;
    }

    goNext();
  };

  // -- Submit --
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        event_id: selectedEventId,
        customer_name: contact.name.trim(),
        customer_email: contact.email.trim(),
        customer_phone: contact.phone.trim() || undefined,
        guests,
        special_requests: specialRequests.trim() || undefined,
        payment_mode: paymentMode,
      };

      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to complete your booking.');

      setBookingResult(data);
      clearPersistedState(experienceType);

      // Move to confirmation step
      const confirmIdx = stepList.indexOf('CONFIRMATION');
      if (confirmIdx >= 0) setStepIndex(confirmIdx);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Summary text for sticky bar --
  const summaryText = useMemo(() => {
    const parts = [];
    if (totalCents > 0) parts.push(formatCents(totalCents));
    if (guests > 0) parts.push(`${guests} guest${guests !== 1 ? 's' : ''}`);
    if (selectedEvent) parts.push(formatEventDate(selectedEvent.date).full);
    return parts.join(' · ') || 'Select an event to begin';
  }, [totalCents, guests, selectedEvent]);

  // -- Visible events --
  const visibleEvents = showAllEvents ? events : events.slice(0, 4);
  const hasMoreEvents = events.length > 4;

  // -- Render helpers --
  const renderSelectDate = () => (
    <>
      <div className="xb__step-header">
        <h3 className="xb__step-title">Choose your date</h3>
        <p className="xb__step-sub">Select the session that works best for you.</p>
      </div>

      {eventsLoading && <p style={{ color: 'var(--text-mid)' }}>Loading upcoming dates...</p>}

      {!eventsLoading && events.length === 0 && (
        <p style={{ color: 'var(--text-mid)' }}>No upcoming dates are available right now. Please check back soon.</p>
      )}

      {errors.event && <p className="xb__field-error" role="alert">{errors.event}</p>}

      <div className="xb__events-grid" role="radiogroup" aria-label="Available dates">
        {visibleEvents.map((event) => {
          const date = formatEventDate(event.date);
          const isSoldOut = event.capacity > 0 && event.seats_booked >= event.capacity;
          const seatsLeft = event.capacity > 0 ? event.capacity - event.seats_booked : null;
          const isSelected = selectedEventId === event.id;

          return (
            <div
              key={event.id}
              className={`xb__event-card${isSelected ? ' is-selected' : ''}${isSoldOut ? ' is-disabled' : ''}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSoldOut ? -1 : 0}
              onClick={() => !isSoldOut && setSelectedEventId(event.id)}
              onKeyDown={(e) => e.key === 'Enter' && !isSoldOut && setSelectedEventId(event.id)}
            >
              <div className="xb__event-date-badge">
                <span className="xb__event-date-badge__month">{date.month}</span>
                <span className="xb__event-date-badge__day">{date.day}</span>
              </div>
              <div className="xb__event-info">
                <p className="xb__event-title">{event.title}</p>
                <p className="xb__event-meta">
                  {event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}
                  {event.price_cents > 0 && ` · ${formatCents(event.price_cents)}/guest`}
                </p>
              </div>
              <div>
                {isSoldOut ? (
                  <span className="xb__event-seats xb__event-seats--sold-out">Sold out</span>
                ) : seatsLeft !== null ? (
                  <span className={`xb__event-seats ${seatsLeft <= 3 ? 'xb__event-seats--low' : 'xb__event-seats--ok'}`}>
                    {seatsLeft} left
                  </span>
                ) : (
                  <span className="xb__event-seats xb__event-seats--ok">Open</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMoreEvents && (
        <button
          type="button"
          className="xb__show-more"
          onClick={() => setShowAllEvents((v) => !v)}
        >
          {showAllEvents ? 'Show fewer' : `Show ${events.length - 4} more dates`}
        </button>
      )}
    </>
  );

  const renderSelectGuests = () => (
    <>
      <div className="xb__step-header">
        <h3 className="xb__step-title">How many guests?</h3>
        <p className="xb__step-sub">
          {selectedEvent?.title} · {selectedEvent && formatEventDate(selectedEvent.date).full}
        </p>
      </div>

      {errors.guests && <p className="xb__field-error" role="alert">{errors.guests}</p>}

      <div className="xb__guests">
        <p className="xb__guests-label">Number of guests</p>
        <div className="xb__stepper" role="group" aria-label="Guest count">
          <button
            type="button"
            className="xb__stepper-btn"
            onClick={() => setGuests((g) => Math.max(minGuests, g - 1))}
            disabled={guests <= minGuests}
            aria-label="Decrease guests"
          >
            −
          </button>
          <span className="xb__stepper-value" aria-live="polite">{guests}</span>
          <button
            type="button"
            className="xb__stepper-btn"
            onClick={() => setGuests((g) => Math.min(effectiveMaxGuests, g + 1))}
            disabled={guests >= effectiveMaxGuests}
            aria-label="Increase guests"
          >
            +
          </button>
        </div>
        {seatsAvailable < 999 && seatsAvailable <= 5 && (
          <p style={{ fontSize: '0.8rem', color: '#c53030', marginTop: '0.4rem' }}>
            Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {totalCents > 0 && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', background: 'rgba(39,61,47,0.04)', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-mid)' }}>{formatCents(selectedEvent.price_cents)} × {guests}</span>
            <strong style={{ color: 'var(--charcoal)' }}>{formatCents(totalCents)}</strong>
          </div>
        </div>
      )}
    </>
  );

  const renderContactDetails = () => (
    <>
      <div className="xb__step-header">
        <h3 className="xb__step-title">Your details</h3>
        <p className="xb__step-sub">We use this to confirm your booking.</p>
      </div>

      <div className="xb__fields">
        <div className={`xb__field${errors.name ? ' xb__field--error' : ''}`}>
          <label htmlFor={`${uid}-name`}>Name <span>*</span></label>
          <input
            id={`${uid}-name`}
            type="text"
            value={contact.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="xb__field-error" role="alert">{errors.name}</p>}
        </div>

        <div className={`xb__field${errors.email ? ' xb__field--error' : ''}`}>
          <label htmlFor={`${uid}-email`}>Email <span>*</span></label>
          <input
            id={`${uid}-email`}
            type="email"
            value={contact.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="xb__field-error" role="alert">{errors.email}</p>}
        </div>

        <div className="xb__field">
          <label htmlFor={`${uid}-phone`}>Phone</label>
          <input
            id={`${uid}-phone`}
            type="tel"
            value={contact.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="(941) 000 0000"
            autoComplete="tel"
          />
        </div>

        <div className="xb__field xb__field--full">
          <label htmlFor={`${uid}-notes`}>Special requests</label>
          <textarea
            id={`${uid}-notes`}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Dietary restrictions, celebrations, seating preferences..."
          />
        </div>
      </div>
    </>
  );

  const renderPaymentPlaceholder = () => (
    <>
      <div className="xb__step-header">
        <h3 className="xb__step-title">Payment</h3>
        <p className="xb__step-sub">Secure checkout via Stripe.</p>
      </div>
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-mid)' }}>
        <p>Stripe payment integration coming soon.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          For now, your booking will be confirmed as a request and the team will follow up.
        </p>
        <button type="button" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Processing...' : 'Complete Booking'}
        </button>
      </div>
    </>
  );

  const renderConfirmation = () => {
    const token = bookingResult?.confirmation_token;
    const bookingUrl = token
      ? (typeof window !== 'undefined' ? `${window.location.origin}/booking/${token}` : `/booking/${token}`)
      : '';

    const copyBookingLink = async () => {
      if (!bookingUrl) return;
      try {
        await navigator.clipboard?.writeText(bookingUrl);
      } catch {
        // Ignore clipboard errors silently — link is also visible
      }
    };

    return (
      <div className="xb__confirmation" role="status" aria-live="polite">
        <div className="xb__confirmation-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3>{copy.confirmationTitle || 'Booking Confirmed'}</h3>
        <p>{copy.confirmationMessage || 'Thank you! We\'ll send a confirmation to your email within 24 hours.'}</p>

        {selectedEvent && (
          <dl className="xb__confirmation-details">
            <div className="xb__confirmation-detail">
              <dt>Event</dt>
              <dd>{selectedEvent.title}</dd>
            </div>
            <div className="xb__confirmation-detail">
              <dt>Date</dt>
              <dd>{formatEventDate(selectedEvent.date).full}</dd>
            </div>
            <div className="xb__confirmation-detail">
              <dt>Guests</dt>
              <dd>{guests}</dd>
            </div>
            {totalCents > 0 && (
              <div className="xb__confirmation-detail">
                <dt>Total</dt>
                <dd>{formatCents(totalCents)}</dd>
              </div>
            )}
          </dl>
        )}

        {token && (
          <div className="xb__confirmation-link">
            <p className="xb__confirmation-link__label">Save this link to view your booking later:</p>
            <div className="xb__confirmation-link__row">
              <a href={`/booking/${token}`} className="xb__confirmation-link__url" target="_blank" rel="noopener noreferrer">
                {bookingUrl}
              </a>
              <button type="button" className="btn btn--outline-light btn--sm" onClick={copyBookingLink}>
                Copy link
              </button>
            </div>
          </div>
        )}

        <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home)}>
          Back to La Norma
        </button>
      </div>
    );
  };

  // -- Current step content --
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'SELECT_DATE': return renderSelectDate();
      case 'SELECT_GUESTS': return renderSelectGuests();
      case 'CONTACT_DETAILS': return renderContactDetails();
      case 'PAYMENT': return renderPaymentPlaceholder();
      case 'CONFIRMATION': return renderConfirmation();
      default: return null;
    }
  };

  const isConfirmation = currentStep === 'CONFIRMATION';
  const ctaLabel = currentStep === 'CONTACT_DETAILS' && skipPayment
    ? (submitting ? 'Sending...' : (copy.submitLabel || 'Complete Booking'))
    : 'Continue';

  return (
    <section className="xb" id={anchor} ref={sectionRef} aria-label="Booking">
      <div className="container">
        <div className="xb__header">
          <p className="xb__label">{copy.label || 'Reserve your spot'}</p>
          <h2 className="xb__heading">{copy.heading || 'Book your experience'}</h2>
        </div>

        {/* Step indicator */}
        {!isConfirmation && (
          <div className="xb__steps" aria-label="Booking progress">
            {stepList.filter((s) => s !== 'CONFIRMATION').map((step, i) => (
              <div
                key={step}
                className={`xb__step-dot${i === stepIndex ? ' is-active' : ''}${i < stepIndex ? ' is-complete' : ''}`}
              />
            ))}
          </div>
        )}

        <div className="xb__layout">
          {/* Main form */}
          <div className="xb__form-shell">
            {submitError && <div className="xb__error-banner" role="alert">{submitError}</div>}
            {renderCurrentStep()}

            {/* Actions */}
            {!isConfirmation && currentStep !== 'PAYMENT' && (
              <div className="xb__actions">
                {stepIndex > 0 ? (
                  <button type="button" className="btn btn--outline-dark" onClick={goBack}>Back</button>
                ) : <div />}
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleContinue}
                  disabled={submitting}
                >
                  {ctaLabel}
                </button>
              </div>
            )}

            {/* Trust badges */}
            {!isConfirmation && (
              <div className="xb__trust">
                <span className="xb__trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Secure
                </span>
                <span className="xb__trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Confirmation within 24h
                </span>
                <span className="xb__trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  Mobile friendly
                </span>
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          {!isConfirmation && (
            <aside className="xb__sidebar">
              <div className="xb__sidebar-card">
                <p className="xb__sidebar-card__label">Your selection</p>
                {selectedEvent ? (
                  <dl className="xb__sidebar-summary">
                    <div><dt>Event</dt><dd>{selectedEvent.title}</dd></div>
                    <div><dt>Date</dt><dd>{formatEventDate(selectedEvent.date).full}</dd></div>
                    <div><dt>Guests</dt><dd>{guests}</dd></div>
                    {totalCents > 0 && <div><dt>Total</dt><dd>{formatCents(totalCents)}</dd></div>}
                  </dl>
                ) : (
                  <p className="xb__sidebar-empty">Choose an event date to get started.</p>
                )}
              </div>

              <div className="xb__sidebar-card">
                <p className="xb__sidebar-card__label">What happens next</p>
                <dl className="xb__sidebar-summary">
                  <div><dt>1.</dt><dd>We confirm within 24 hours</dd></div>
                  <div><dt>2.</dt><dd>Arrival details by email</dd></div>
                  <div><dt>3.</dt><dd>Show up and enjoy</dd></div>
                </dl>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className={`xb__sticky-bar${stickyVisible && !isConfirmation ? ' is-visible' : ''}`}>
        <div className="xb__sticky-bar__summary" onClick={() => setSheetOpen(true)}>
          <strong>{totalCents > 0 ? formatCents(totalCents) : (selectedEvent?.title || 'Select a date')}</strong>
          {summaryText}
        </div>
        <button type="button" className="btn btn--primary" onClick={handleContinue} disabled={submitting}>
          {ctaLabel}
        </button>
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <div className="xb__sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="xb__sheet" onClick={(e) => e.stopPropagation()}>
            <div className="xb__sheet-handle" />
            <h3 style={{ fontFamily: 'var(--ff-display)', marginBottom: '1rem' }}>Booking Summary</h3>
            {selectedEvent ? (
              <dl className="xb__sidebar-summary">
                <div><dt>Event</dt><dd>{selectedEvent.title}</dd></div>
                <div><dt>Date</dt><dd>{formatEventDate(selectedEvent.date).full}</dd></div>
                <div><dt>Time</dt><dd>{selectedEvent.start_time}{selectedEvent.end_time ? ` – ${selectedEvent.end_time}` : ''}</dd></div>
                <div><dt>Guests</dt><dd>{guests}</dd></div>
                {selectedEvent.price_cents > 0 && (
                  <>
                    <div><dt>Price per guest</dt><dd>{formatCents(selectedEvent.price_cents)}</dd></div>
                    <div><dt>Total</dt><dd><strong>{formatCents(totalCents)}</strong></dd></div>
                  </>
                )}
              </dl>
            ) : (
              <p style={{ color: 'var(--text-mid)' }}>No event selected yet.</p>
            )}
            <button
              type="button"
              className="btn btn--primary"
              style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={() => setSheetOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
