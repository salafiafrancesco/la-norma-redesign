import { useId, useState } from 'react';
import API_BASE from '../config/api';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { OPENTABLE_RESERVATION_URL } from '../utils/hospitalityMedia';
import { PAGE_KEYS } from '../../shared/routes.js';
import './EditorialPage.css';

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ContactPage() {
  const restaurant = useSection('restaurant');
  const page = useSection('contactPage');
  const { navigate } = useNavigation();
  const fid = useId();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required.';
    if (!form.last_name.trim())  errs.last_name  = 'Required.';
    if (!form.email.trim())      errs.email = 'Required.';
    else if (!isValidEmail(form.email.trim())) errs.email = 'Please enter a valid email.';
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = 'Please write at least a short message (10+ characters).';
    setErrors(errs);
    setSubmitError('');
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          message: form.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to submit.');
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  usePageMetadata({
    title: 'Contact La Norma',
    description:
      'Contact La Norma for dinner reservations, directions, cooking classes, wine tastings, live music evenings, and private event planning.',
  });

  return (
    <div className="editorial-page">
      <Navbar />

      <main id="main-content" className="editorial-main">
        <div className="container">
          <header className="editorial-hero">
            <p className="editorial-hero__eyebrow">{page.hero.eyebrow}</p>
            <h1 className="editorial-hero__heading">{page.hero.headline}</h1>
            <p className="editorial-hero__subheading">{page.hero.sub}</p>
            <div className="editorial-hero__actions">
              <a href={OPENTABLE_RESERVATION_URL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                {page.hero.primary_cta_label}
              </a>
              <a href={`tel:${restaurant.phone}`} className="btn btn--outline-dark">
                {page.hero.secondary_cta_label}
              </a>
            </div>
          </header>

          <section className="editorial-card">
            <h2 className="editorial-card__title">{page.details_title}</h2>
            <div className="editorial-info-grid">
              <article className="editorial-info-card">
                <h3 className="editorial-info-card__title">{page.info_cards.visit_title}</h3>
                <div className="editorial-info-card__body">
                  <p>{restaurant.address}</p>
                  <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                  <p style={{ marginTop: '0.9rem' }}>
                    <a href={restaurant.mapEmbedUrl} target="_blank" rel="noopener noreferrer">
                      Get directions
                    </a>
                  </p>
                </div>
              </article>

              <article className="editorial-info-card">
                <h3 className="editorial-info-card__title">{page.info_cards.reach_title}</h3>
                <div className="editorial-info-card__body">
                  <p><a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a></p>
                  <p><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></p>
                  <p style={{ marginTop: '0.9rem' }}>{restaurant.hours}</p>
                </div>
              </article>

              <article className="editorial-info-card">
                <h3 className="editorial-info-card__title">{page.info_cards.intent_title}</h3>
                <div className="editorial-info-card__body">
                  {page.info_cards.intent_lines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className="editorial-card editorial-contact-form" id="contact-form" aria-labelledby="contact-form-title">
            <h2 className="editorial-card__title" id="contact-form-title">{page.form.title}</h2>
            <p className="editorial-card__lead">{page.form.lead}</p>

            {submitted ? (
              <div className="editorial-contact-form__success" role="status" aria-live="polite">
                <h3>{page.form.success_title}</h3>
                <p>{page.form.success_message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="editorial-contact-form__form">
                {submitError && <div className="editorial-contact-form__error" role="alert">{submitError}</div>}

                <div className="editorial-contact-form__row">
                  <div className={`editorial-contact-form__field${errors.first_name ? ' has-error' : ''}`}>
                    <label htmlFor={`${fid}-first`}>First name <span aria-hidden="true">*</span></label>
                    <input id={`${fid}-first`} type="text" autoComplete="given-name" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} aria-invalid={Boolean(errors.first_name)} />
                    {errors.first_name && <p className="editorial-contact-form__field-error">{errors.first_name}</p>}
                  </div>
                  <div className={`editorial-contact-form__field${errors.last_name ? ' has-error' : ''}`}>
                    <label htmlFor={`${fid}-last`}>Last name <span aria-hidden="true">*</span></label>
                    <input id={`${fid}-last`} type="text" autoComplete="family-name" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} aria-invalid={Boolean(errors.last_name)} />
                    {errors.last_name && <p className="editorial-contact-form__field-error">{errors.last_name}</p>}
                  </div>
                </div>

                <div className="editorial-contact-form__row">
                  <div className={`editorial-contact-form__field${errors.email ? ' has-error' : ''}`}>
                    <label htmlFor={`${fid}-email`}>Email <span aria-hidden="true">*</span></label>
                    <input id={`${fid}-email`} type="email" autoComplete="email" value={form.email} onChange={(e) => setField('email', e.target.value)} aria-invalid={Boolean(errors.email)} />
                    {errors.email && <p className="editorial-contact-form__field-error">{errors.email}</p>}
                  </div>
                  <div className="editorial-contact-form__field">
                    <label htmlFor={`${fid}-phone`}>Phone</label>
                    <input id={`${fid}-phone`} type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(optional)" />
                  </div>
                </div>

                <div className={`editorial-contact-form__field${errors.message ? ' has-error' : ''}`}>
                  <label htmlFor={`${fid}-msg`}>Message <span aria-hidden="true">*</span></label>
                  <textarea id={`${fid}-msg`} rows={5} value={form.message} onChange={(e) => setField('message', e.target.value)} placeholder="Tell us what you need — dietary notes, group plans, feedback, anything else." aria-invalid={Boolean(errors.message)} />
                  {errors.message && <p className="editorial-contact-form__field-error">{errors.message}</p>}
                </div>

                <div className="editorial-contact-form__actions">
                  <button type="submit" className="btn btn--primary" disabled={submitting}>
                    {submitting ? 'Sending…' : page.form.submit_label}
                  </button>
                  <p className="editorial-contact-form__note">{page.form.note}</p>
                </div>
              </form>
            )}
          </section>

          <section className="editorial-support">
            <h2 className="editorial-support__title">{page.support.heading}</h2>
            <ul className="editorial-support__list">
              {page.support.items.map((item, idx) => (
                <li key={idx}>
                  <div>
                    <strong>{item.title}</strong>
                    <div>{item.body}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="editorial-support__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.cookingClasses)}>
                {page.support.primary_label}
              </button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                {page.support.secondary_label}
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
