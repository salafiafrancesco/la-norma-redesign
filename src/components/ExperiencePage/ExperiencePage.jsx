import { useEffect, useId, useMemo, useState } from 'react';
import API_BASE from '../../config/api';
import Footer from '../Footer/Footer';
import Navbar from '../Navbar/Navbar';
import { useNavigation } from '../../context/NavigationContext';
import { PAGE_KEYS } from '../../../shared/routes.js';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { useResponsiveCardLimit } from '../../hooks/useResponsiveCardLimit';
import { getEventImage, getPackageImage } from '../../utils/hospitalityMedia';
import { sortByNearestUpcomingDate } from '../../utils/schedule';
import './ExperiencePage.css';

const CONTACT_FIELD_NAMES = new Set(['first_name', 'last_name', 'email', 'phone']);
const REVIEW_FIELD_NAMES = new Set(['message']);

// Maps an `experience_events` row to the shape this catalog UI expects.
// Bridges the legacy `events` schema (replaced) and the unified
// `experience_events` schema used by the Experiences admin + booking flow.
function adaptExperienceEvent(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const capacity = Number.isFinite(raw.capacity) ? raw.capacity : 0;
  const seatsBooked = Number.isFinite(raw.seats_booked) ? raw.seats_booked : 0;
  const time = raw.start_time && raw.end_time
    ? `${raw.start_time} - ${raw.end_time}`
    : raw.start_time || '';
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    date: raw.date,
    time,
    price: Number.isFinite(raw.price_cents) ? Math.round(raw.price_cents / 100) : 0,
    max_spots: capacity,
    spots_left: Math.max(0, capacity - seatsBooked),
    image_url: raw.image_url || '',
    category: raw.type,
    active: raw.status === 'published',
  };
}

function formatEventDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function parseGuestsValue(value) {
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    return { guests: asNumber, guestLabel: '' };
  }

  return { guests: 0, guestLabel: value };
}

function validateFields(fields, values) {
  const errors = {};

  fields.forEach((field) => {
    const rawValue = values[field.name];
    const trimmedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    if (field.required && !trimmedValue) {
      errors[field.name] = `${field.label} is required.`;
      return;
    }

    if (field.type === 'email' && trimmedValue) {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
      if (!validEmail) {
        errors[field.name] = 'Please enter a valid email address.';
      }
    }
  });

  return errors;
}

function buildStructuredData(config) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: config.meta.title,
      description: config.meta.description,
      url: window.location.href,
    },
  ];
}

function getFieldStepIndex(field) {
  if (CONTACT_FIELD_NAMES.has(field.name)) return 1;
  if (REVIEW_FIELD_NAMES.has(field.name)) return 2;
  return 0;
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function ExperiencePage({ config }) {
  const { navigate } = useNavigation();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(Boolean(config.events));
  const [formValues, setFormValues] = useState(config.form.initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAllSelectableEvents, setShowAllSelectableEvents] = useState(false);
  const [showAllEventCards, setShowAllEventCards] = useState(false);
  const fieldUid = useId();
  const visibleCardCount = useResponsiveCardLimit();

  usePageMetadata({
    ...config.meta,
    structuredData: buildStructuredData(config),
  });

  useEffect(() => {
    setFormValues(config.form.initialValues);
    setErrors({});
    setSubmitError('');
    setSubmitted(false);
    setCurrentStep(0);
    setShowAllSelectableEvents(false);
    setShowAllEventCards(false);
  }, [config]);

  useEffect(() => {
    if (!config.events) {
      setEvents([]);
      setEventsLoading(false);
      return;
    }

    let cancelled = false;
    setEvents([]);
    setEventsLoading(true);

    fetch(`${API_BASE}/api/experience-events?type=${config.events.category}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load events right now.');
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) setEvents(Array.isArray(data) ? data.map(adaptExperienceEvent) : []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config.events]);

  const formSteps = useMemo(() => {
    const labels = config.form.progressLabels ?? ['Plan your visit', 'Your details', 'Review and send'];
    const steps = [
      { id: 'plan', label: labels[0], heading: labels[0], description: 'Choose the details that help us confirm the right reservation quickly.', fields: [] },
      { id: 'details', label: labels[1], heading: labels[1], description: 'Share the best contact details so we can follow up personally.', fields: [] },
      { id: 'review', label: labels[2], heading: labels[2], description: 'Add any notes and send us the request when everything looks right.', fields: [] },
    ];

    config.form.fields.forEach((field) => {
      steps[getFieldStepIndex(field)].fields.push(field);
    });

    return steps;
  }, [config.form.fields, config.form.progressLabels]);

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.id) === String(formValues.selected_event_id)),
    [events, formValues.selected_event_id],
  );

  const sortedEvents = useMemo(
    () => sortByNearestUpcomingDate(events, (event) => event.date),
    [events],
  );

  const visibleSelectableEvents = useMemo(
    () => (showAllSelectableEvents ? sortedEvents : sortedEvents.slice(0, visibleCardCount)),
    [showAllSelectableEvents, sortedEvents, visibleCardCount],
  );

  const visibleEventCards = useMemo(
    () => (showAllEventCards ? sortedEvents : sortedEvents.slice(0, visibleCardCount)),
    [showAllEventCards, sortedEvents, visibleCardCount],
  );

  useEffect(() => {
    if (!formValues.selected_event_id) return;

    const selectedIndex = sortedEvents.findIndex((event) => String(event.id) === String(formValues.selected_event_id));
    if (selectedIndex >= visibleCardCount) {
      setShowAllSelectableEvents(true);
      setShowAllEventCards(true);
    }
  }, [formValues.selected_event_id, sortedEvents, visibleCardCount]);

  const summaryItems = useMemo(() => {
    const items = [];

    if (selectedEvent) {
      items.push({
        label: config.events?.label ?? 'Selected date',
        value: `${selectedEvent.title} | ${formatEventDate(selectedEvent.date)} | ${selectedEvent.time}`,
      });
    } else if (formValues.date) {
      items.push({
        label: 'Preferred date',
        value: new Date(`${formValues.date}T12:00:00`).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      });
    }

    if (formValues.guests) {
      items.push({ label: 'Guests', value: formValues.guests });
    }

    if (formValues.event_type) {
      items.push({ label: 'Occasion', value: formValues.event_type });
    }

    if (formValues.email) {
      items.push({ label: 'Confirmation', value: formValues.email });
    }

    return items;
  }, [config.events, formValues.date, formValues.email, formValues.event_type, formValues.guests, selectedEvent]);

  const handleChange = (fieldName, nextValue) => {
    setFormValues((current) => ({
      ...current,
      [fieldName]: nextValue,
    }));

    if (errors[fieldName]) {
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[fieldName];
        return nextErrors;
      });
    }
  };

  const validateStep = (stepIndex) => {
    const stepFields = formSteps[stepIndex]?.fields ?? [];
    const stepErrors = validateFields(stepFields, formValues);

    setErrors((current) => {
      const nextErrors = { ...current };
      stepFields.forEach((field) => {
        delete nextErrors[field.name];
      });

      return { ...nextErrors, ...stepErrors };
    });

    return stepErrors;
  };

  const moveToFirstErroredField = () => {
    const firstErroredField = document.querySelector('.ep-field--error, .ep-choice-grid--error');
    firstErroredField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleStepSubmit = async (event) => {
    event.preventDefault();

    if (currentStep < formSteps.length - 1) {
      const stepErrors = validateStep(currentStep);
      setSubmitError('');

      if (Object.keys(stepErrors).length > 0) {
        moveToFirstErroredField();
        return;
      }

      setCurrentStep((value) => Math.min(value + 1, formSteps.length - 1));
      return;
    }

    const validationErrors = validateFields(config.form.fields, formValues);
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) {
      const firstStepWithError = formSteps.findIndex((step) =>
        step.fields.some((field) => validationErrors[field.name]),
      );
      if (firstStepWithError >= 0) {
        setCurrentStep(firstStepWithError);
      }
      moveToFirstErroredField();
      return;
    }

    setSubmitting(true);

    try {
      const guestPayload = parseGuestsValue(formValues.guests);
      const payload = {
        type: config.inquiryType,
        first_name: formValues.first_name.trim(),
        last_name: formValues.last_name.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone?.trim() || '',
        date: formValues.date || selectedEvent?.date || '',
        guests: guestPayload.guests,
        guest_label: guestPayload.guestLabel,
        event_id: selectedEvent?.id || undefined,
        occasion: formValues.event_type || '',
        message: formValues.message?.trim() || '',
      };

      const response = await fetch(`${API_BASE}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'We could not submit your request right now.');
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSecondaryAction = () => {
    const secondaryAction = config.hero.secondaryAction;

    if (!secondaryAction) {
      navigate(PAGE_KEYS.home);
      return;
    }

    if (secondaryAction.anchor) {
      scrollToId(secondaryAction.anchor);
      return;
    }

    if (secondaryAction.pageKey) {
      navigate(secondaryAction.pageKey);
      return;
    }

    navigate(PAGE_KEYS.home);
  };

  const handleEventShortcut = (eventId) => {
    handleChange('selected_event_id', String(eventId));
    scrollToId(config.form.anchor);
  };

  const currentStepData = formSteps[currentStep];
  const isLastStep = currentStep === formSteps.length - 1;

  const renderField = (field) => {
    const fieldId = `${fieldUid}-${field.name}`;
    const fieldError = errors[field.name];
    const fieldValue = formValues[field.name] ?? '';
    const hintId = field.helper ? `${fieldId}-hint` : undefined;
    const errorId = fieldError ? `${fieldId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    if (field.type === 'event') {
      return (
        <div key={field.name} className={`ep-field ep-field--full${fieldError ? ' ep-field--error' : ''}`}>
          <div className="ep-label-wrap">
            <label className="ep-label" htmlFor={fieldId}>
              {field.label}
              {field.required && <span> *</span>}
            </label>
            {field.helper && !fieldError && (
              <p id={hintId} className="ep-help">
                {field.helper}
              </p>
            )}
          </div>

          <button
            type="button"
            className={`ep-flex-choice${fieldValue === '' ? ' is-selected' : ''}`}
            onClick={() => handleChange(field.name, '')}
          >
            <span className="ep-flex-choice__eyebrow">Flexible request</span>
            <span className="ep-flex-choice__title">Let the team recommend the best available date</span>
            <span className="ep-flex-choice__copy">
              {field.helper || 'We will recommend the best available date.'}
            </span>
          </button>

          <div
            id={fieldId}
            className={`ep-choice-grid ep-choice-grid--event${fieldError ? ' ep-choice-grid--error' : ''}`}
            role="group"
            aria-describedby={describedBy}
          >
            {eventsLoading && (
              <div className="ep-choice-card ep-choice-card--ghost">
                <span className="ep-choice-card__eyebrow">Loading</span>
                <span className="ep-choice-card__title">Checking upcoming dates...</span>
              </div>
            )}

            {!eventsLoading &&
              visibleSelectableEvents.map((entry) => {
                const soldOut = config.events?.availabilityMode === 'limited' && entry.spots_left <= 0;
                const eventImage = entry.image_url || getEventImage(entry.category, entry.title);

                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`ep-choice-card${String(fieldValue) === String(entry.id) ? ' is-selected' : ''}${soldOut ? ' is-disabled' : ''}`}
                    onClick={() => !soldOut && handleChange(field.name, String(entry.id))}
                    disabled={soldOut}
                    aria-pressed={String(fieldValue) === String(entry.id)}
                  >
                    <span
                      className="ep-choice-card__media"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(14, 20, 18, 0.12), rgba(14, 20, 18, 0.68)), linear-gradient(135deg, rgba(196, 151, 58, 0.14), transparent), url(${eventImage})`,
                      }}
                      aria-hidden="true"
                    />
                    <span className="ep-choice-card__content">
                      <span className="ep-choice-card__eyebrow">{formatEventDate(entry.date)}</span>
                      <span className="ep-choice-card__title">{entry.title}</span>
                      <span className="ep-choice-card__copy">{entry.time}</span>
                      <span className="ep-choice-card__meta">
                        {config.events?.availabilityMode === 'limited'
                          ? `${entry.spots_left} seats left | $${entry.price} per guest`
                          : 'Reservations recommended'}
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>

          {!eventsLoading && sortedEvents.length > visibleCardCount && (
            <div className="ep-grid-toggle-wrap">
              <button
                type="button"
                className="ep-grid-toggle"
                onClick={() => setShowAllSelectableEvents((value) => !value)}
                aria-expanded={showAllSelectableEvents}
              >
                {showAllSelectableEvents
                  ? 'Show fewer dates'
                  : `Show ${sortedEvents.length - visibleCardCount} more dates`}
              </button>
            </div>
          )}

          {fieldError && (
            <p id={errorId} className="ep-help ep-help--error" role="alert">
              {fieldError}
            </p>
          )}
        </div>
      );
    }

    if (field.type === 'select' && field.options?.length <= 8) {
      return (
        <div key={field.name} className={`ep-field ep-field--full${fieldError ? ' ep-field--error' : ''}`}>
          <div className="ep-label-wrap">
            <label className="ep-label" htmlFor={fieldId}>
              {field.label}
              {field.required && <span> *</span>}
            </label>
            {field.helper && !fieldError && (
              <p id={hintId} className="ep-help">
                {field.helper}
              </p>
            )}
          </div>

          <div
            id={fieldId}
            className={`ep-option-grid${fieldError ? ' ep-choice-grid--error' : ''}`}
            role="group"
            aria-describedby={describedBy}
          >
            {field.options.map((option) => (
              <button
                key={option}
                type="button"
                className={`ep-option-pill${fieldValue === option ? ' is-selected' : ''}`}
                onClick={() => handleChange(field.name, option)}
                aria-pressed={fieldValue === option}
              >
                {option}
              </button>
            ))}
          </div>

          {fieldError && (
            <p id={errorId} className="ep-help ep-help--error" role="alert">
              {fieldError}
            </p>
          )}
        </div>
      );
    }

    return (
      <div
        key={field.name}
        className={`ep-field${field.type === 'textarea' ? ' ep-field--full' : ''}${fieldError ? ' ep-field--error' : ''}`}
      >
        <label className="ep-label" htmlFor={fieldId}>
          {field.label}
          {field.required && <span> *</span>}
        </label>

        {field.type === 'textarea' ? (
          <textarea
            id={fieldId}
            className="ep-textarea"
            value={fieldValue}
            onChange={(changeEvent) => handleChange(field.name, changeEvent.target.value)}
            placeholder={field.placeholder}
            aria-describedby={describedBy}
            aria-invalid={Boolean(fieldError)}
          />
        ) : (
          <input
            id={fieldId}
            className="ep-input"
            type={field.type}
            value={fieldValue}
            onChange={(changeEvent) => handleChange(field.name, changeEvent.target.value)}
            placeholder={field.placeholder}
            autoComplete={field.type === 'email' ? 'email' : undefined}
            min={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
            aria-describedby={describedBy}
            aria-invalid={Boolean(fieldError)}
          />
        )}

        {field.helper && !fieldError && (
          <p id={hintId} className="ep-help">
            {field.helper}
          </p>
        )}

        {fieldError && (
          <p id={errorId} className="ep-help ep-help--error" role="alert">
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  const inquiryFormSection = (
    <section className="ep-section ep-section--form" id={config.form.anchor}>
      <div className="container">
        <div className="ep-section__header">
          <p className="ep-section__label">{config.form.label}</p>
          <h2 className="ep-section__heading">{config.form.heading}</h2>
          <p className="ep-section__sub">{config.form.subheading}</p>
        </div>

        <div className="ep-form-layout">
          <aside className="ep-form-sidebar">
            <div className="ep-sidebar-card">
              <p className="ep-sidebar-card__label">{config.form.asideTitle}</p>
              <ul className="ep-sidebar-card__list">
                {config.form.asideItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="ep-sidebar-card ep-sidebar-card--summary">
              <p className="ep-sidebar-card__label">Current request</p>
              {summaryItems.length > 0 ? (
                <dl className="ep-sidebar-summary">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="ep-sidebar-summary__row">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="ep-sidebar-card__empty">
                  Choose the essentials first and your request summary will build here automatically.
                </p>
              )}
            </div>

            {config.form.trustItems?.length > 0 && (
              <div className="ep-sidebar-trust">
                {config.form.trustItems.map((item) => (
                  <div key={item} className="ep-sidebar-trust__item">
                    <span aria-hidden="true" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>

          <div className="ep-form-shell">
            {submitted ? (
              <div className="ep-form-success" role="status" aria-live="polite">
                <p className="ep-form-success__eyebrow">Request received</p>
                <h3>{config.form.successTitle}</h3>
                <p>{config.form.successBody}</p>
                {selectedEvent && (
                  <div className="ep-form-success__summary">
                    <span>{selectedEvent.title}</span>
                    <span>{formatEventDate(selectedEvent.date)}</span>
                    <span>{selectedEvent.time}</span>
                  </div>
                )}
                <div className="ep-form-success__actions">
                  <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home)}>
                    Back to La Norma
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="ep-form-progress" aria-label="Inquiry steps">
                  {formSteps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      className={`ep-form-progress__step${index === currentStep ? ' is-active' : ''}${index < currentStep ? ' is-complete' : ''}`}
                      onClick={() => {
                        if (index <= currentStep) {
                          setCurrentStep(index);
                        }
                      }}
                      disabled={index > currentStep}
                    >
                      <span className="ep-form-progress__num">{index + 1}</span>
                      <span className="ep-form-progress__copy">{step.label}</span>
                    </button>
                  ))}
                </div>

                <div className="ep-form-step-header">
                  <p className="ep-form-step-header__eyebrow">Step {currentStep + 1}</p>
                  <h3>{currentStepData.heading}</h3>
                  <p>{currentStepData.description}</p>
                </div>

                <form onSubmit={handleStepSubmit} noValidate>
                  {submitError && (
                    <div className="ep-form-error" role="alert">
                      {submitError}
                    </div>
                  )}

                  <div className="ep-form-grid">
                    {currentStepData.fields.map((field) => renderField(field))}
                  </div>

                  {currentStepData.id === 'review' && (
                    <div className="ep-review-card">
                      <p className="ep-review-card__label">Before you send</p>
                      <div className="ep-review-card__grid">
                        {summaryItems.length > 0 ? (
                          summaryItems.map((item) => (
                            <div key={item.label} className="ep-review-card__item">
                              <span>{item.label}</span>
                              <strong>{item.value}</strong>
                            </div>
                          ))
                        ) : (
                          <div className="ep-review-card__item">
                            <span>Request summary</span>
                            <strong>We will shape the details around your notes.</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="ep-form-actions">
                    {currentStep > 0 ? (
                      <button
                        type="button"
                        className="btn btn--outline-dark"
                        onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}
                      >
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    <button type="submit" className="btn btn--primary" disabled={submitting}>
                      {submitting ? 'Sending...' : isLastStep ? config.form.submitLabel : 'Continue'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="ep-page">
      <Navbar />

      <header className="ep-hero">
        <div
          className="ep-hero__bg"
          style={{ backgroundImage: `url(${config.hero.image})` }}
          role="img"
          aria-label={config.hero.imageAlt}
        />
        <div className="ep-hero__overlay" />
        <div className="ep-hero__aura ep-hero__aura--left" />
        <div className="ep-hero__aura ep-hero__aura--right" />

        <div className="ep-hero__content container">
          <div className="ep-hero__grid">
            <div className="ep-hero__copy">
              <p className="ep-hero__eyebrow">{config.hero.eyebrow}</p>
              <h1 className="ep-hero__heading">
                {config.hero.title}
                <span>{config.hero.accent}</span>
              </h1>
              <p className="ep-hero__sub">{config.hero.description}</p>

              {config.hero.trustPills?.length > 0 && (
                <div className="ep-hero__trust" aria-label="Experience trust markers">
                  {config.hero.trustPills.map((item) => (
                    <span key={item} className="ep-hero__trust-pill">
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <div className="ep-hero__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => scrollToId(config.form.anchor)}
                >
                  {config.hero.primaryActionLabel ?? config.form.submitLabel}
                </button>
                <button type="button" className="btn btn--outline-light" onClick={handleSecondaryAction}>
                  {config.hero.secondaryAction?.label ?? 'Back to La Norma'}
                </button>
              </div>
            </div>

            {config.hero.spotlight && (
              <aside className="ep-hero__spotlight">
                <p className="ep-hero__spotlight-label">{config.hero.spotlight.eyebrow}</p>
                <h2 className="ep-hero__spotlight-title">{config.hero.spotlight.title}</h2>
                <p className="ep-hero__spotlight-body">{config.hero.spotlight.body}</p>
                <ul className="ep-hero__spotlight-list">
                  {config.hero.spotlight.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </aside>
            )}
          </div>

          <div className="ep-hero__metrics" aria-label="Experience highlights">
            {config.hero.metrics.map((item) => (
              <div key={item.label} className="ep-metric">
                <span className="ep-metric__value">{item.value}</span>
                <span className="ep-metric__label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main id="main-content">
        {config.proofStrip?.length > 0 && (
          <section className="ep-proof">
            <div className="container">
              <div className="ep-proof__grid">
                {config.proofStrip.map((item) => (
                  <article key={item.label} className="ep-proof__card">
                    <p className="ep-proof__value">{item.value}</p>
                    <h2 className="ep-proof__label">{item.label}</h2>
                    <p className="ep-proof__detail">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {inquiryFormSection}

        {config.events && (
          <section className="ep-section ep-section--events" id={config.events.anchor ?? 'upcoming-evenings'}>
            <div className="container">
              <div className="ep-section__header">
                <p className="ep-section__label">{config.events.label}</p>
                <h2 className="ep-section__heading">{config.events.heading}</h2>
                <p className="ep-section__sub">{config.events.subheading}</p>
              </div>

              <div className="ep-events-grid">
                {eventsLoading && (
                  <div className="ep-events-empty">
                    <p>Loading upcoming dates...</p>
                  </div>
                )}

                {!eventsLoading && events.length === 0 && (
                  <div className="ep-events-empty">
                    <h3>{config.events.emptyTitle}</h3>
                    <p>{config.events.emptyBody}</p>
                  </div>
                )}

                {!eventsLoading &&
                  visibleEventCards.map((entry, index) => {
                    const limited = config.events.availabilityMode === 'limited';
                    const soldOut = limited && entry.spots_left <= 0;
                    const eventImage = entry.image_url || getEventImage(entry.category, entry.title, index);

                    return (
                      <article key={entry.id} className="ep-event-card">
                        <div
                          className="ep-event-card__image"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(16, 22, 20, 0.18), rgba(16, 22, 20, 0.72)), linear-gradient(135deg, rgba(196, 151, 58, 0.16), transparent), url(${eventImage})`,
                          }}
                        >
                          <span>{entry.category === 'wine_tasting' ? 'Wine' : 'Event'}</span>
                        </div>

                        <div className="ep-event-card__body">
                          <div className="ep-event-card__date">
                            <span>{formatEventDate(entry.date)}</span>
                            <span>{entry.time}</span>
                          </div>
                          <h3 className="ep-event-card__title">{entry.title}</h3>
                          <p className="ep-event-card__desc">{entry.description}</p>

                          <div className="ep-event-card__footer">
                            {limited ? (
                              <>
                                <span className="ep-event-card__price">${entry.price} per guest</span>
                                <span className={`ep-event-card__spots${entry.spots_left <= 3 ? ' is-low' : ''}`}>
                                  {entry.spots_left > 0 ? `${entry.spots_left} seats left` : 'Fully requested'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="ep-event-card__price ep-event-card__price--muted">Included with dinner</span>
                                <span className="ep-event-card__spots">Reservations recommended</span>
                              </>
                            )}
                          </div>

                          <button
                            type="button"
                            className="ep-event-card__button"
                            onClick={() => {
                              if (soldOut) {
                                handleChange('selected_event_id', '');
                                scrollToId(config.form.anchor);
                                return;
                              }

                              handleEventShortcut(entry.id);
                            }}
                          >
                            {soldOut ? 'Join with a flexible request' : config.events.ctaLabel ?? 'Request this date'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>

              {!eventsLoading && sortedEvents.length > visibleCardCount && (
                <div className="ep-grid-toggle-wrap ep-grid-toggle-wrap--section">
                  <button
                    type="button"
                    className="ep-grid-toggle"
                    onClick={() => setShowAllEventCards((value) => !value)}
                    aria-expanded={showAllEventCards}
                  >
                    {showAllEventCards
                      ? 'Show fewer event dates'
                      : `Show ${sortedEvents.length - visibleCardCount} more event dates`}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {config.sections.map((section) => (
          <section
            key={section.heading}
            id={section.anchor}
            className={`ep-section${section.theme ? ` ep-section--${section.theme}` : ''}`}
          >
            <div className="container">
              <div className="ep-section__header">
                <p className="ep-section__label">{section.label}</p>
                <h2 className="ep-section__heading">{section.heading}</h2>
                <p className="ep-section__sub">{section.subheading}</p>
              </div>

              {section.type === 'features' && (
                <div className="ep-features">
                  {section.items.map((item) => (
                    <article key={item.title} className="ep-feature">
                      <div className="ep-feature__icon">{item.icon}</div>
                      <h3 className="ep-feature__title">{item.title}</h3>
                      <p className="ep-feature__desc">{item.desc}</p>
                    </article>
                  ))}
                </div>
              )}

              {section.type === 'story-grid' && (
                <div className="ep-story-grid">
                  {section.items.map((item) => (
                    <article key={item.title} className="ep-story-card">
                      <span className="ep-story-card__eyebrow">{item.eyebrow}</span>
                      <h3 className="ep-story-card__title">{item.title}</h3>
                      <p className="ep-story-card__desc">{item.desc}</p>
                    </article>
                  ))}
                </div>
              )}

              {section.type === 'checklist' && (
                <div className="ep-checklist">
                  <div className="ep-checklist__items">
                    {section.items.map((item) => (
                      <div key={item} className="ep-checklist__item">
                        <span className="ep-checklist__dot" aria-hidden="true" />
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>

                  <aside className="ep-checklist__aside">
                    <p className="ep-checklist__aside-label">{section.asideTitle}</p>
                    <p className="ep-checklist__aside-body">{section.asideBody}</p>
                    {section.asideItems?.length > 0 && (
                      <div className="ep-checklist__tags">
                        {section.asideItems.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    )}
                  </aside>
                </div>
              )}

              {section.type === 'packages' && (
                <div className="ep-packages">
                  {section.items.map((item, index) => (
                    <article key={item.name} className={`ep-package${item.featured ? ' ep-package--featured' : ''}`}>
                      <div
                        className="ep-package__media"
                        style={{
                          backgroundImage: `linear-gradient(180deg, rgba(18, 23, 22, 0.14), rgba(18, 23, 22, 0.68)), linear-gradient(135deg, rgba(196, 151, 58, 0.16), transparent), url(${item.image || getPackageImage(item.name, index)})`,
                        }}
                      >
                        <div className="ep-package__icon">{item.icon}</div>
                      </div>
                      <div className="ep-package__body">
                        <h3 className="ep-package__name">{item.name}</h3>
                        <p className="ep-package__capacity">{item.capacity}</p>
                        <p className="ep-package__desc">{item.desc}</p>
                        <ul className="ep-package__includes">
                          {item.includes.map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="ep-package__button"
                          onClick={() => {
                            scrollToId(config.form.anchor);
                            handleChange('event_type', item.name);
                          }}
                        >
                          Ask about this format
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {section.type === 'testimonials' && (
                <div className="ep-testimonials">
                  {section.items.map((item) => (
                    <article key={`${item.name}-${item.context}`} className="ep-testimonial">
                      <p className="ep-testimonial__quote">"{item.quote}"</p>
                      <div className="ep-testimonial__meta">
                        <span>{item.name}</span>
                        <span>{item.context}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

        <section className="ep-section ep-section--faq">
          <div className="container">
            <div className="ep-section__header">
              <p className="ep-section__label">Questions</p>
              <h2 className="ep-section__heading">A few details guests often ask about</h2>
            </div>

            <div className="ep-faq">
              {config.faq.map((item) => (
                <details key={item.q} className="ep-faq__item">
                  <summary className="ep-faq__question">{item.q}</summary>
                  <p className="ep-faq__answer">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ep-cta">
          <div className="container">
            <h2>{config.cta.heading}</h2>
            <p>{config.cta.subheading}</p>
            <div className="ep-cta__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => scrollToId(config.cta.primaryAnchor)}
              >
                {config.cta.primaryLabel}
              </button>
              <button className="btn btn--outline-light" type="button" onClick={() => navigate(PAGE_KEYS.home)}>
                {config.cta.secondaryLabel}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
