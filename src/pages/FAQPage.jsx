import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useNavigation } from '../context/NavigationContext';
import { useSection } from '../context/ContentContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { PAGE_KEYS } from '../../shared/routes.js';
import './EditorialPage.css';

export default function FAQPage() {
  const { navigate } = useNavigation();
  const faqPage = useSection('faqPage');

  usePageMetadata({
    title: 'FAQ',
    description:
      'Read the most common questions about La Norma reservations, dietary requests, live music, cooking classes, wine tastings, and private events.',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqPage.items.map((item) => ({
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
            <p className="editorial-hero__eyebrow">{faqPage.hero.eyebrow}</p>
            <h1 className="editorial-hero__heading">{faqPage.hero.headline}</h1>
            <p className="editorial-hero__subheading">{faqPage.hero.sub}</p>
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
            {faqPage.items.map((item) => (
              <details key={item.question} className="editorial-faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>

          <section className="editorial-support">
            <h2 className="editorial-support__title">{faqPage.editorial.heading}</h2>
            <p className="editorial-support__body">{faqPage.editorial.body}</p>
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
