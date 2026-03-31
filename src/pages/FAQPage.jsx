import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { GENERAL_FAQS } from '../data/sitePages';
import { PAGE_KEYS } from '../../shared/routes.js';
import './EditorialPage.css';

export default function FAQPage() {
  const { navigate } = useNavigation();

  usePageMetadata({
    title: 'FAQ',
    description:
      'Read the most common questions about La Norma reservations, dietary requests, live music, cooking classes, wine tastings, and private events.',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: GENERAL_FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  });

  return (
    <div className="editorial-page">
      <Navbar />

      <main id="main-content" className="editorial-main">
        <div className="container">
          <header className="editorial-hero">
            <p className="editorial-hero__eyebrow">FAQ</p>
            <h1 className="editorial-hero__heading">Answers guests usually want before they decide to book.</h1>
            <p className="editorial-hero__subheading">
              The essentials on reservations, experiences, dietary requests, and planning a more intentional evening at
              La Norma.
            </p>
            <div className="editorial-hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                Reserve dinner
              </button>
              <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.contact)}>
                Contact the team
              </button>
            </div>
          </header>

          <div className="editorial-faq-list">
            {GENERAL_FAQS.map((item) => (
              <details key={item.question} className="editorial-faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>

          <section className="editorial-support">
            <h2 className="editorial-support__title">Need help with something more specific?</h2>
            <p className="editorial-support__body">
              Guests planning a tasting, a private event, or a celebratory dinner often need a faster recommendation.
              The team can help direct you to the right format quickly.
            </p>
            <div className="editorial-support__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                Private events
              </button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.wineTastings)}>
                Wine tastings
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
