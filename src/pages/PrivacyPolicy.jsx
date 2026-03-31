import { PAGE_KEYS } from '../../shared/routes.js';
import Navbar from '../components/Navbar/Navbar';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  const { navigate } = useNavigation();

  usePageMetadata({
    title: 'Privacy Policy',
    description: 'Read the La Norma privacy policy covering reservation inquiries, RSVPs, retention, and guest data handling.',
  });

  return (
    <div className="pp-page">
      <Navbar />

      <main id="main-content">
        <article className="pp-content container--narrow">
          <header className="pp-header">
            <button className="pp-back" type="button" onClick={() => navigate(PAGE_KEYS.home)}>
              Back to La Norma
            </button>
            <p className="section-label" style={{ color: 'var(--gold-light)' }}>Legal</p>
            <h1 className="pp-title">Privacy Policy</h1>
            <p className="pp-meta">Last updated: March 31, 2026</p>
          </header>

          <Section title="1. Who We Are">
            <p>
              La Norma Ristorante &amp; Pizzeria is located at 5370 Gulf of Mexico Drive, Longboat Key, FL 34228.
              You can reach us at <a href="mailto:info@lanormarestaurant.com">info@lanormarestaurant.com</a> or by phone at{' '}
              <a href="tel:+19415550192">+1 (941) 555-0192</a>.
            </p>
            <p>
              This policy explains what guest data we collect, why we collect it, how it is used, and the choices
              available to you.
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p>We collect personal information only when you choose to share it with us, including:</p>
            <ul>
              <li>reservation and RSVP details such as first name, last name, email address, phone number, guest count, and guest notes;</li>
              <li>event or experience inquiries submitted through the website;</li>
              <li>direct communication details when you contact the restaurant by email or phone.</li>
            </ul>
            <p>
              We do not use third-party advertising trackers, behavioral profiling tools, or unnecessary cookies on the site.
            </p>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>Information shared with us is used to:</p>
            <ul>
              <li>review and confirm reservations, RSVPs, and event requests;</li>
              <li>communicate about availability, changes, dietary notes, and arrival details;</li>
              <li>manage class capacity, event planning, and daily hospitality operations.</li>
            </ul>
            <p>We do not sell or rent guest data to third parties.</p>
          </Section>

          <Section title="4. Legal Basis">
            <p>
              When applicable, we process reservation and inquiry data based on legitimate interest in responding to your
              request and, where required, your consent at the point of submission.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Reservation, RSVP, and inquiry records are retained only as long as operationally necessary. We aim to review
              and clear older request data on a rolling basis and can delete personal data sooner upon request where appropriate.
            </p>
          </Section>

          <Section title="6. Security">
            <p>
              Access to the admin area is restricted to authorized staff. We apply password-protected administrative access and
              reasonable technical measures to reduce unauthorized access to guest records.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You may request access to, correction of, or deletion of personal data we hold about you.</p>
            <p>
              To make a request, email <a href="mailto:info@lanormarestaurant.com">info@lanormarestaurant.com</a>.
              We will respond as promptly as reasonably possible.
            </p>
          </Section>

          <Section title="8. Third-Party Links">
            <p>
              The site may link to map providers, social platforms, delivery services, or booking tools. Those services manage
              their own privacy practices, and we recommend reviewing them directly.
            </p>
          </Section>

          <Section title="9. Policy Updates">
            <p>
              We may update this policy from time to time. The latest version will always appear on this page with the most recent revision date.
            </p>
          </Section>

          <Section title="10. Contact">
            <address>
              La Norma Ristorante &amp; Pizzeria<br />
              5370 Gulf of Mexico Drive<br />
              Longboat Key, FL 34228<br />
              <a href="mailto:info@lanormarestaurant.com">info@lanormarestaurant.com</a><br />
              <a href="tel:+19415550192">+1 (941) 555-0192</a>
            </address>
          </Section>

          <div className="pp-footer-nav">
            <button className="btn btn--outline-dark" type="button" onClick={() => navigate(PAGE_KEYS.home)}>
              Return to La Norma
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="pp-section">
      <h2 className="pp-section-title">{title}</h2>
      {children}
    </section>
  );
}
