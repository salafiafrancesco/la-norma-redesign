import { useEffect, useState } from 'react';
import API_BASE from '../config/api';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { useInView } from '../hooks/useInView';
import { PAGE_KEYS } from '../../shared/routes.js';
import './PrivateEventsPage.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PackageMark({ roman }) {
  return <span className="pe-format__roman" aria-hidden="true">{roman}</span>;
}

export default function PrivateEventsPage() {
  const page = useSection('privateEventsPage');
  const restaurant = useSection('restaurant');
  const { navigate } = useNavigation();

  const [heroRef, heroVis] = useInView();
  const [manifestoRef, manifestoVis] = useInView();
  const [formatsRef, formatsVis] = useInView();
  const [curateRef, curateVis] = useInView();
  const [formRef, formVis] = useInView();
  const [testimonialsRef, testimonialsVis] = useInView();
  const [faqRef, faqVis] = useInView();
  const [invitationRef, invitationVis] = useInView();

  usePageMetadata({
    title: page.meta?.title || 'Private Events',
    description: page.meta?.description,
  });

  // ---- Form state -----------------------------------------------------
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    guests: '',
    date: '',
    occasion: '',
    format: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function setValue(name, v) {
    setValues((current) => ({ ...current, [name]: v }));
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  }

  function validateStep(idx) {
    const next = {};
    if (idx === 0) {
      if (!values.guests) next.guests = 'Choose a guest range.';
    }
    if (idx === 1) {
      if (!values.first_name.trim()) next.first_name = 'First name is required.';
      if (!values.last_name.trim()) next.last_name = 'Last name is required.';
      if (!values.email.trim()) next.email = 'Email is required.';
      else if (!EMAIL_RE.test(values.email.trim())) next.email = 'Please enter a valid email.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, 2));
  }

  function prevStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateStep(0) || !validateStep(1)) {
      // Jump back to first failing step
      const firstErrField = Object.keys(errors)[0];
      if (['guests'].includes(firstErrField)) setStep(0);
      else setStep(1);
      return;
    }
    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_BASE}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'private_event',
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || undefined,
          date: values.date || undefined,
          guests: values.guests,
          occasion: values.occasion || values.format || undefined,
          message: values.message.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${response.status}).`);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Pre-select format from a package card click
  function pickFormat(formatName) {
    setValues((c) => ({ ...c, format: formatName, occasion: c.occasion || formatName }));
    setTimeout(() => {
      const el = document.getElementById('inquire');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  const heroImage = page.hero?.image_url;
  const formatsItems = page.formats?.items || [];
  const curateItems = page.curate?.items || [];
  const testimonialsItems = page.testimonials?.items || [];
  const faqItems = page.faq?.items || [];
  const guestOptions = page.form?.guest_options || [];
  const occasionOptions = page.form?.occasion_options || [];
  const progressLabels = page.form?.progress_labels || ['Event basics', 'Your details', 'Review and send'];

  return (
    <div className="pe">
      <Navbar />

      <main id="main-content" className="pe__main">
        {/* ============================================================ */}
        {/* 1. CINEMATIC HERO                                            */}
        {/* ============================================================ */}
        <header className="pe-hero" ref={heroRef}>
          <div className="pe-hero__bg" style={{ backgroundImage: `url(${heroImage})` }} aria-hidden="true" />
          <div className="pe-hero__overlay" aria-hidden="true" />
          <div className="container pe-hero__content">
            <span className="pe-hero__rule" aria-hidden="true" />
            <p className={`pe-hero__eyebrow fade-up${heroVis ? ' visible' : ''}`}>{page.hero?.eyebrow}</p>
            <h1 className={`pe-hero__heading fade-up delay-1${heroVis ? ' visible' : ''}`}>{page.hero?.headline}</h1>
            <p className={`pe-hero__sub fade-up delay-2${heroVis ? ' visible' : ''}`}>{page.hero?.sub}</p>
            <div className={`pe-hero__actions fade-up delay-3${heroVis ? ' visible' : ''}`}>
              <a href="#inquire" className="btn btn--primary">{page.hero?.primary_cta_label || 'Start your inquiry'}</a>
              <a href="#formats" className="btn btn--outline-light">{page.hero?.secondary_cta_label || 'View formats'}</a>
            </div>
          </div>
          <a href="#manifesto" className="pe-hero__scroll" aria-label="Scroll to story">
            <span>Story</span>
            <span className="pe-hero__scroll-line" aria-hidden="true" />
          </a>
        </header>

        {/* ============================================================ */}
        {/* 2. MANIFESTO                                                 */}
        {/* ============================================================ */}
        <section className="pe-section pe-manifesto" id="manifesto" ref={manifestoRef}>
          <div className="container">
            <div className={`pe-manifesto__inner fade-up${manifestoVis ? ' visible' : ''}`}>
              <span className="pe-manifesto__mark" aria-hidden="true">&#8220;</span>
              <p className="pe-manifesto__quote">{page.manifesto?.quote}</p>
              <span className="pe-manifesto__line" aria-hidden="true" />
              <p className="pe-manifesto__author">{page.manifesto?.author}</p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. FORMATS                                                   */}
        {/* ============================================================ */}
        <section className="pe-section pe-formats" id="formats" ref={formatsRef}>
          <div className="container">
            <div className={`pe-formats__head fade-up${formatsVis ? ' visible' : ''}`}>
              <p className="pe-eyebrow pe-eyebrow--center">{page.formats?.eyebrow}</p>
              <h2 className="pe-heading pe-heading--center">{page.formats?.heading}</h2>
            </div>
            <div className="pe-formats__grid">
              {formatsItems.map((item, i) => (
                <article
                  key={item.id || i}
                  className={`pe-format${item.featured ? ' is-featured' : ''} fade-up delay-${(i % 3) + 1}${formatsVis ? ' visible' : ''}`}
                >
                  <header className="pe-format__head">
                    <PackageMark roman={item.roman} />
                    <h3 className="pe-format__name">{item.name}</h3>
                    <p className="pe-format__capacity">{item.capacity}</p>
                    <span className="pe-format__rule" aria-hidden="true" />
                  </header>
                  <p className="pe-format__body">{item.body}</p>
                  {Array.isArray(item.includes) && item.includes.length > 0 && (
                    <ul className="pe-format__includes">
                      {item.includes.map((line, idx) => (
                        <li key={idx}>
                          <span className="pe-format__bullet" aria-hidden="true" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="pe-format__cta"
                    onClick={() => pickFormat(item.name)}
                  >
                    Inquire about {item.name}
                    <span className="pe-format__cta-arrow" aria-hidden="true">&rarr;</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. WHAT WE CURATE                                            */}
        {/* ============================================================ */}
        <section className="pe-section pe-curate" ref={curateRef}>
          <div className="container">
            <div className={`pe-curate__head fade-up${curateVis ? ' visible' : ''}`}>
              <p className="pe-eyebrow pe-eyebrow--center">{page.curate?.eyebrow}</p>
              <h2 className="pe-heading pe-heading--center">{page.curate?.heading}</h2>
            </div>
            <div className="pe-curate__grid">
              {curateItems.map((item, i) => (
                <article
                  key={item.num || i}
                  className={`pe-curate__item fade-up delay-${(i % 4) + 1}${curateVis ? ' visible' : ''}`}
                >
                  <span className="pe-curate__num">{item.num}</span>
                  <span className="pe-curate__rule" aria-hidden="true" />
                  <h3 className="pe-curate__title">{item.title}</h3>
                  <p className="pe-curate__body">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. INQUIRY FORM                                              */}
        {/* ============================================================ */}
        <section className="pe-section pe-form" id="inquire" ref={formRef}>
          <div className="container">
            <div className={`pe-form__head fade-up${formVis ? ' visible' : ''}`}>
              <p className="pe-eyebrow pe-eyebrow--center">{page.form?.eyebrow}</p>
              <h2 className="pe-heading pe-heading--center">{page.form?.heading}</h2>
              {page.form?.sub && <p className="pe-form__sub">{page.form.sub}</p>}
            </div>

            {submitted ? (
              <div className={`pe-form__success fade-up${formVis ? ' visible' : ''}`}>
                <span className="pe-form__success-mark" aria-hidden="true">&#10003;</span>
                <h3>{page.form?.success_title || 'Inquiry received'}</h3>
                <p>{page.form?.success_body}</p>
              </div>
            ) : (
              <form
                className={`pe-form__card fade-up delay-1${formVis ? ' visible' : ''}`}
                onSubmit={handleSubmit}
                noValidate
              >
                {/* Step indicator */}
                <ol className="pe-stepper" aria-label="Form progress">
                  {progressLabels.map((label, idx) => (
                    <li
                      key={label}
                      className={`pe-stepper__step${idx === step ? ' is-active' : ''}${idx < step ? ' is-done' : ''}`}
                    >
                      <span className="pe-stepper__num">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="pe-stepper__label">{label}</span>
                    </li>
                  ))}
                </ol>

                {/* Step content */}
                <div className="pe-form__steps">
                  {step === 0 && (
                    <div className="pe-form__step">
                      <div className="pe-field">
                        <label htmlFor="pe-guests">Guest range <span className="pe-field__req">*</span></label>
                        <div className="pe-pillset" role="radiogroup" aria-label="Guest range">
                          {guestOptions.map((opt) => (
                            <button
                              type="button"
                              key={opt}
                              role="radio"
                              aria-checked={values.guests === opt}
                              className={`pe-pill${values.guests === opt ? ' is-active' : ''}`}
                              onClick={() => setValue('guests', opt)}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {errors.guests && <p className="pe-field__error">{errors.guests}</p>}
                      </div>

                      <div className="pe-field-row">
                        <div className="pe-field">
                          <label htmlFor="pe-date">Preferred date</label>
                          <input
                            id="pe-date"
                            type="date"
                            value={values.date}
                            onChange={(e) => setValue('date', e.target.value)}
                          />
                        </div>
                        <div className="pe-field">
                          <label htmlFor="pe-occasion">Occasion</label>
                          <select
                            id="pe-occasion"
                            value={values.occasion}
                            onChange={(e) => setValue('occasion', e.target.value)}
                          >
                            <option value="">Select occasion</option>
                            {occasionOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="pe-form__step">
                      <div className="pe-field-row">
                        <div className={`pe-field${errors.first_name ? ' has-error' : ''}`}>
                          <label htmlFor="pe-first">First name <span className="pe-field__req">*</span></label>
                          <input
                            id="pe-first"
                            type="text"
                            value={values.first_name}
                            onChange={(e) => setValue('first_name', e.target.value)}
                          />
                          {errors.first_name && <p className="pe-field__error">{errors.first_name}</p>}
                        </div>
                        <div className={`pe-field${errors.last_name ? ' has-error' : ''}`}>
                          <label htmlFor="pe-last">Last name <span className="pe-field__req">*</span></label>
                          <input
                            id="pe-last"
                            type="text"
                            value={values.last_name}
                            onChange={(e) => setValue('last_name', e.target.value)}
                          />
                          {errors.last_name && <p className="pe-field__error">{errors.last_name}</p>}
                        </div>
                      </div>

                      <div className={`pe-field${errors.email ? ' has-error' : ''}`}>
                        <label htmlFor="pe-email">Email <span className="pe-field__req">*</span></label>
                        <input
                          id="pe-email"
                          type="email"
                          autoComplete="email"
                          value={values.email}
                          onChange={(e) => setValue('email', e.target.value)}
                        />
                        {errors.email && <p className="pe-field__error">{errors.email}</p>}
                      </div>

                      <div className="pe-field">
                        <label htmlFor="pe-phone">Phone <span className="pe-field__hint">(optional)</span></label>
                        <input
                          id="pe-phone"
                          type="tel"
                          autoComplete="tel"
                          value={values.phone}
                          onChange={(e) => setValue('phone', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="pe-form__step">
                      <div className="pe-summary">
                        <div className="pe-summary__row">
                          <span className="pe-summary__label">Guests</span>
                          <span className="pe-summary__value">{values.guests || '—'}</span>
                        </div>
                        {values.date && (
                          <div className="pe-summary__row">
                            <span className="pe-summary__label">Date</span>
                            <span className="pe-summary__value">{values.date}</span>
                          </div>
                        )}
                        {values.occasion && (
                          <div className="pe-summary__row">
                            <span className="pe-summary__label">Occasion</span>
                            <span className="pe-summary__value">{values.occasion}</span>
                          </div>
                        )}
                        <div className="pe-summary__row">
                          <span className="pe-summary__label">Name</span>
                          <span className="pe-summary__value">{values.first_name} {values.last_name}</span>
                        </div>
                        <div className="pe-summary__row">
                          <span className="pe-summary__label">Email</span>
                          <span className="pe-summary__value">{values.email}</span>
                        </div>
                        {values.phone && (
                          <div className="pe-summary__row">
                            <span className="pe-summary__label">Phone</span>
                            <span className="pe-summary__value">{values.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="pe-field">
                        <label htmlFor="pe-message">Anything else? <span className="pe-field__hint">(optional)</span></label>
                        <textarea
                          id="pe-message"
                          rows="4"
                          value={values.message}
                          onChange={(e) => setValue('message', e.target.value)}
                          placeholder="Timing, dietary needs, music, decor, budget — anything useful for planning."
                        />
                      </div>

                      {submitError && <p className="pe-form__error">{submitError}</p>}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="pe-form__nav">
                  {step > 0 && (
                    <button type="button" className="pe-form__back" onClick={prevStep}>
                      <span aria-hidden="true">&larr;</span> Back
                    </button>
                  )}
                  <span className="pe-form__nav-spacer" />
                  {step < 2 ? (
                    <button type="button" className="btn btn--primary" onClick={nextStep}>
                      Continue <span aria-hidden="true">&rarr;</span>
                    </button>
                  ) : (
                    <button type="submit" className="btn btn--primary" disabled={submitting}>
                      {submitting ? 'Sending…' : (page.form?.submit_label || 'Send inquiry')}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. TESTIMONIALS                                              */}
        {/* ============================================================ */}
        {testimonialsItems.length > 0 && (
          <section className="pe-section pe-testimonials" ref={testimonialsRef}>
            <div className="container">
              <div className={`pe-testimonials__head fade-up${testimonialsVis ? ' visible' : ''}`}>
                <p className="pe-eyebrow pe-eyebrow--center">{page.testimonials?.eyebrow}</p>
                <h2 className="pe-heading pe-heading--center">{page.testimonials?.heading}</h2>
              </div>
              <div className="pe-testimonials__grid">
                {testimonialsItems.map((t, i) => (
                  <blockquote
                    key={t.author || i}
                    className={`pe-quote fade-up delay-${(i % 3) + 1}${testimonialsVis ? ' visible' : ''}`}
                  >
                    <p className="pe-quote__text">{t.quote}</p>
                    <footer className="pe-quote__footer">
                      <span className="pe-quote__author">{t.author}</span>
                      {t.role && <span className="pe-quote__role">{t.role}</span>}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 7. FAQ                                                       */}
        {/* ============================================================ */}
        {faqItems.length > 0 && (
          <section className="pe-section pe-faq" ref={faqRef}>
            <div className="container">
              <div className={`pe-faq__head fade-up${faqVis ? ' visible' : ''}`}>
                <p className="pe-eyebrow">{page.faq?.eyebrow}</p>
                <h2 className="pe-heading">{page.faq?.heading}</h2>
              </div>
              <div className="pe-faq__list">
                {faqItems.map((item, i) => (
                  <details
                    key={item.q || i}
                    className={`pe-faq__item fade-up delay-${(i % 4) + 1}${faqVis ? ' visible' : ''}`}
                  >
                    <summary>
                      <span>{item.q}</span>
                      <span className="pe-faq__chev" aria-hidden="true">+</span>
                    </summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* 8. INVITATION                                                */}
        {/* ============================================================ */}
        <section className="pe-section pe-invitation" ref={invitationRef}>
          <div className="container">
            <div className={`pe-invitation__card fade-up${invitationVis ? ' visible' : ''}`}>
              <div className="pe-invitation__copy">
                <p className="pe-eyebrow">{page.invitation?.eyebrow}</p>
                <h2 className="pe-heading">{page.invitation?.heading}</h2>
                <p className="pe-invitation__body">{page.invitation?.body}</p>
                <div className="pe-invitation__actions">
                  <a href="#inquire" className="btn btn--primary">{page.invitation?.primary_label}</a>
                  <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.contact)}>
                    {page.invitation?.secondary_label}
                  </button>
                </div>
              </div>
              <div className="pe-invitation__details">
                <div className="pe-invitation__detail">
                  <span className="pe-invitation__label">Phone</span>
                  <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                </div>
                <div className="pe-invitation__detail">
                  <span className="pe-invitation__label">Email</span>
                  <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
                </div>
                <div className="pe-invitation__detail">
                  <span className="pe-invitation__label">Find us</span>
                  <p>{restaurant.address}</p>
                  <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
