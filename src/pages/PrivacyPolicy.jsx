import { useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  const { navigate } = useNavigation();

  useEffect(() => {
    document.title = 'Privacy Policy — La Norma Ristorante & Pizzeria';
    window.scrollTo({ top: 0 });
    return () => {
      document.title = 'La Norma Ristorante & Pizzeria | Authentic Sicilian Cuisine — Longboat Key, FL';
    };
  }, []);

  return (
    <div className="pp-page">
      <div className="pp-topbar">
        <button className="pp-back" onClick={() => navigate('home')}>
          ← Back to La Norma
        </button>
      </div>

      <article className="pp-content container--narrow">
        <header className="pp-header">
          <p className="section-label" style={{ color: 'var(--gold-light)' }}>Legal</p>
          <h1 className="pp-title">Privacy Policy</h1>
          <p className="pp-meta">Last updated: March 2026</p>
        </header>

        <Section title="1. Who We Are">
          <p>La Norma Ristorante &amp; Pizzeria ("La Norma", "we", "us") is located at 5370 Gulf of Mexico Drive, Longboat Key, FL 34228. You can reach us at <a href="mailto:info@lanormarestaurant.com">info@lanormarestaurant.com</a> or by phone at <a href="tel:+19415550192">+1 (941) 555-0192</a>.</p>
          <p>This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and what rights you have regarding your data.</p>
        </Section>

        <Section title="2. Data We Collect">
          <p>We collect personal data only when you voluntarily provide it to us, specifically:</p>
          <ul>
            <li><strong>RSVP / Booking form:</strong> first name, last name, email address, phone number (optional), number of guests, and any special requests or notes you choose to include.</li>
            <li><strong>Contact enquiries:</strong> name and email when you write to us directly.</li>
          </ul>
          <p>We do not collect data through cookies beyond what is technically necessary to operate the website. We do not use tracking pixels, third-party analytics, or ad-network cookies.</p>
        </Section>

        <Section title="3. How We Use Your Data">
          <p>The data you provide through the booking form is used exclusively to:</p>
          <ul>
            <li>Process and confirm your cooking class reservation.</li>
            <li>Contact you with booking details, reminders, and updates related to your specific reservation.</li>
            <li>Manage class capacity and scheduling.</li>
          </ul>
          <p>We will never sell, rent, or share your personal data with third parties for marketing purposes.</p>
        </Section>

        <Section title="4. Legal Basis (for EU/EEA visitors)">
          <p>If you are located in the European Union or EEA, our legal basis for processing your data is <strong>legitimate interest</strong> (processing your reservation request) and, where applicable, your explicit <strong>consent</strong> at the time of submission.</p>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain booking and RSVP data for a maximum of 24 months from the date of the event, after which it is permanently deleted from our systems. You may request earlier deletion at any time (see Section 7).</p>
        </Section>

        <Section title="6. Data Security">
          <p>Your data is stored securely on our servers. Access to booking records is restricted to authorised staff only, using password-protected administrative access. We use industry-standard measures to protect data in transit and at rest.</p>
        </Section>

        <Section title="7. Your Rights">
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> the personal data we hold about you.</li>
            <li><strong>Correct</strong> inaccurate or incomplete data.</li>
            <li><strong>Delete</strong> your data at any time.</li>
            <li><strong>Withdraw consent</strong> for any processing based on consent.</li>
            <li><strong>Object</strong> to processing based on legitimate interest.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:info@lanormarestaurant.com">info@lanormarestaurant.com</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="8. External Links">
          <p>Our website may contain links to third-party services (reservation platforms, delivery services). We are not responsible for the privacy practices of those services and recommend reviewing their privacy policies independently.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this policy occasionally. The "Last updated" date at the top will reflect any changes. Continued use of our website after changes constitutes acceptance of the revised policy.</p>
        </Section>

        <Section title="10. Contact">
          <p>For any privacy-related questions, please contact:</p>
          <address>
            La Norma Ristorante &amp; Pizzeria<br />
            5370 Gulf of Mexico Drive<br />
            Longboat Key, FL 34228<br />
            <a href="mailto:info@lanormarestaurant.com">info@lanormarestaurant.com</a><br />
            <a href="tel:+19415550192">+1 (941) 555-0192</a>
          </address>
        </Section>

        <div className="pp-footer-nav">
          <button className="btn btn--outline-dark" onClick={() => navigate('home')}>
            ← Return to La Norma
          </button>
        </div>
      </article>
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
