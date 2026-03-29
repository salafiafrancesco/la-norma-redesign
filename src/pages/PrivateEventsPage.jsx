import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import Footer from '../components/Footer/Footer';
import './EventPages.css';

const PACKAGES = [
  {
    icon: '🕯️',
    name: 'Intimate Dinner',
    capacity: 'Up to 12 guests',
    desc: 'A refined private dining experience in our secluded corner room. Ideal for anniversary dinners, birthday celebrations, or small business entertaining.',
    includes: ['Dedicated service team', 'Custom 3-course menu', 'Welcome prosecco', 'Décor coordination', 'Flexible seating arrangement'],
    featured: false,
  },
  {
    icon: '🥂',
    name: 'Celebration',
    capacity: 'Up to 20 guests',
    desc: 'Our most popular private event option — the full private dining room is yours. Perfect for milestone birthdays, rehearsal dinners, and family gatherings.',
    includes: ['Exclusive use of private room', 'Custom 4-course menu', 'Wine pairing options', 'Welcome cocktail reception', 'Décor & florals coordination', 'Live music available'],
    featured: true,
  },
  {
    icon: '🏛️',
    name: 'Full Buyout',
    capacity: 'Up to 30 guests',
    desc: 'Exclusive use of the entire La Norma dining room. Reserved for milestone events, corporate dinners, and celebrations that deserve the whole stage.',
    includes: ['Full restaurant buyout', 'Fully custom menu', 'Sommelier-led wine service', 'Cocktail reception & canapés', 'Live music coordination', 'Dedicated event planner'],
    featured: false,
  },
];

const FAQ = [
  { q: 'How far in advance should I book?', a: 'We recommend booking at least 3–4 weeks in advance for smaller groups and 6–8 weeks for full buyouts or events requiring custom menus. Contact us early — availability during peak season (January–April) is limited.' },
  { q: 'Can I bring my own cake?', a: 'Yes. You are welcome to bring an outside cake for birthdays and anniversaries. We ask that you let us know in advance so we can arrange proper service, plates, and a candle.' },
  { q: 'Is a deposit required?', a: 'Yes, a 25% deposit is required to confirm your booking. The balance is due on the day of the event. Deposits are refundable with at least 14 days\' notice.' },
  { q: 'Can you accommodate dietary restrictions?', a: 'Absolutely. Our private menus are fully custom and we work closely with each guest to accommodate vegetarian, vegan, gluten-free, and allergy requirements.' },
  { q: 'Is live music included?', a: 'Live music is available as an add-on for all packages. We have a roster of preferred musicians and can coordinate the performance as part of your event.' },
  { q: 'What is the minimum spend?', a: 'Minimum spends apply depending on the package and day of the week. We\'ll discuss this transparently during the inquiry process — there are no hidden fees.' },
];

const EMPTY = {
  first_name: '', last_name: '', email: '', phone: '',
  date: '', guests: '10', event_type: '', message: '',
};

export default function PrivateEventsPage() {
  const { navigate } = useNavigation();
  const _API = import.meta.env.VITE_API_URL ?? '';
  const [openFaq, setOpenFaq]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [formError, setFormError]   = useState('');

  useEffect(() => {
    document.title = 'Private Events — La Norma Ristorante & Pizzeria';
    return () => {
      document.title = 'La Norma Ristorante & Pizzeria | Authentic Sicilian Cuisine — Longboat Key, FL';
    };
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${_API}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          type: 'private_event',
          guests: Number(form.guests),
          message: [form.event_type ? `Event type: ${form.event_type}` : '', form.message].filter(Boolean).join('\n'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ep-page">
      {/* Hero */}
      <header className="ep-hero">
        <div
          className="ep-hero__bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1470042660615-51b9c62e8d28?w=1600&q=80)' }}
          role="img"
          aria-label="Elegantly set private dining table"
        />
        <div className="ep-hero__overlay" />
        <div className="ep-hero__content container">
          <button className="ep-hero__back" onClick={() => navigate('home')} aria-label="Back to homepage">
            ← Back to La Norma
          </button>
          <p className="ep-hero__eyebrow">By Arrangement</p>
          <h1 className="ep-hero__heading">
            Private Events<br />
            <em>& Celebrations</em>
          </h1>
          <p className="ep-hero__sub">
            Host your milestone event — anniversary, birthday, rehearsal dinner, or corporate occasion —
            in our private dining room, with a fully custom menu and dedicated service from the La Norma team.
          </p>
        </div>
      </header>

      <main id="main-content">
        {/* Packages */}
        <section className="ep-section">
          <div className="container">
            <p className="ep-section__label">Options</p>
            <h2 className="ep-section__heading">Choose Your Experience</h2>
            <p className="ep-section__sub">
              From an intimate dinner for 10 to a full restaurant buyout for 30 — every event is tailored to your vision.
            </p>
            <div className="ep-packages">
              {PACKAGES.map(pkg => (
                <div key={pkg.name} className={`ep-package${pkg.featured ? ' ep-package--featured' : ''}`}>
                  <div className="ep-package__icon">{pkg.icon}</div>
                  <h3 className="ep-package__name">{pkg.name}</h3>
                  <div className="ep-package__capacity">{pkg.capacity}</div>
                  <p className="ep-package__desc">{pkg.desc}</p>
                  <ul className="ep-package__includes">
                    {pkg.includes.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why La Norma */}
        <section className="ep-section ep-section--alt">
          <div className="container">
            <p className="ep-section__label">Why La Norma</p>
            <h2 className="ep-section__heading">The Details Matter</h2>
            <div className="ep-features">
              {[
                { icon: '👨‍🍳', title: 'Chef Marco Personally Involved', desc: 'Chef Marco collaborates directly on private menus, ensuring every dish reflects the occasion and the guest.' },
                { icon: '🍷', title: 'Expert Wine Curation', desc: 'Our sommelier curates wine selections specific to your menu and event, from aperitivo to digestivo.' },
                { icon: '🌿', title: 'Custom Menu Design', desc: 'Choose from signature dishes or request a bespoke menu — we accommodate dietary needs and personal preferences.' },
                { icon: '✨', title: 'Seamless Event Coordination', desc: 'We handle décor preferences, seating, timing, and every detail so you can be fully present on your occasion.' },
              ].map(f => (
                <div className="ep-feature" key={f.title}>
                  <div className="ep-feature__icon">{f.icon}</div>
                  <h3 className="ep-feature__title">{f.title}</h3>
                  <p className="ep-feature__desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry form */}
        <section className="ep-section" id="inquire">
          <div className="container">
            <p className="ep-section__label">Start Planning</p>
            <h2 className="ep-section__heading">Send Your Inquiry</h2>
            <p className="ep-section__sub">
              Share the details of your event and we'll follow up within 24 hours with availability, menu ideas, and pricing.
            </p>

            <div className="ep-form-wrap">
              {submitted ? (
                <div className="ep-form-success">
                  <div className="ep-form-success__icon">🥂</div>
                  <h3 className="ep-form-success__title">Inquiry received!</h3>
                  <p className="ep-form-success__sub">
                    Thank you, {form.first_name}. We'll contact you within 24 hours to begin planning your event.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {formError && <div className="ep-form-error">{formError}</div>}
                  <div className="ep-form-grid">
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="pe-first">First name *</label>
                      <input id="pe-first" className="ep-input" type="text" value={form.first_name}
                        onChange={e => set('first_name', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="pe-last">Last name *</label>
                      <input id="pe-last" className="ep-input" type="text" value={form.last_name}
                        onChange={e => set('last_name', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="pe-email">Email *</label>
                      <input id="pe-email" className="ep-input" type="email" value={form.email}
                        onChange={e => set('email', e.target.value)} required />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="pe-phone">Phone</label>
                      <input id="pe-phone" className="ep-input" type="tel" value={form.phone}
                        onChange={e => set('phone', e.target.value)} />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="pe-date">Event date</label>
                      <input id="pe-date" className="ep-input" type="date" value={form.date}
                        onChange={e => set('date', e.target.value)} />
                    </div>
                    <div className="ep-field">
                      <label className="ep-label" htmlFor="pe-guests">Guest count</label>
                      <select id="pe-guests" className="ep-select" value={form.guests}
                        onChange={e => set('guests', e.target.value)}>
                        {['1–6','7–12','13–20','21–30'].map(n => <option key={n} value={n}>{n} guests</option>)}
                      </select>
                    </div>
                    <div className="ep-field ep-field--span2">
                      <label className="ep-label" htmlFor="pe-type">Type of event</label>
                      <select id="pe-type" className="ep-select" value={form.event_type}
                        onChange={e => set('event_type', e.target.value)}>
                        <option value="">Select one…</option>
                        <option>Anniversary Dinner</option>
                        <option>Birthday Celebration</option>
                        <option>Rehearsal Dinner</option>
                        <option>Corporate Dinner</option>
                        <option>Family Gathering</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="ep-field ep-field--span2">
                      <label className="ep-label" htmlFor="pe-msg">Tell us about your event</label>
                      <textarea id="pe-msg" className="ep-textarea" value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder="e.g. preferred date flexibility, dietary needs, décor ideas, budget range, any special requests…"
                        style={{ minHeight: '130px' }}
                      />
                    </div>
                  </div>
                  <div className="ep-form-submit">
                    <button type="submit" className="btn btn--primary" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Send Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="ep-section ep-section--alt">
          <div className="container">
            <p className="ep-section__label">Questions</p>
            <h2 className="ep-section__heading">Frequently Asked</h2>
            <div className="ep-faq">
              {FAQ.map((item, i) => (
                <div key={i} className={`ep-faq__item${openFaq === i ? ' ep-faq__item--open' : ''}`}>
                  <button className="ep-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}>
                    {item.q}
                    <span className="ep-faq__q-icon" aria-hidden="true">+</span>
                  </button>
                  <div className="ep-faq__a" aria-hidden={openFaq !== i}>
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="ep-cta">
          <div className="container">
            <h2 className="ep-cta__heading">Your occasion deserves<br /><em>La Norma's full attention.</em></h2>
            <p className="ep-cta__sub">Private dining for 10 to 30 guests. Custom menus. Dedicated service.</p>
            <div className="ep-cta__actions">
              <a href="#inquire" className="btn btn--primary" onClick={e => { e.preventDefault(); document.getElementById('inquire')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Start Planning
              </a>
              <button className="btn btn--outline-light" onClick={() => navigate('home')}>
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
