import Footer from '../components/Footer/Footer';
import MenuHighlights from '../components/MenuHighlights/MenuHighlights';
import Navbar from '../components/Navbar/Navbar';
import Specialties from '../components/Specialties/Specialties';
import { useNavigation } from '../context/NavigationContext';
import { useSection } from '../context/ContentContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { PAGE_KEYS } from '../../shared/routes.js';
import './EditorialPage.css';

export default function MenuPage() {
  const { navigate } = useNavigation();
  const page = useSection('menuPage');
  const { hero, support, description } = page;

  usePageMetadata({
    title: 'Menu',
    description,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        name: 'La Norma Menu',
        description,
        hasMenuSection: ['Antipasti', 'Primi & Pizze', 'Secondi & Dolci'].map((name) => ({
          '@type': 'MenuSection',
          name,
        })),
      },
    ],
  });

  return (
    <div className="editorial-page editorial-page--menu">
      <Navbar />

      <header className="mp-hero">
        <div
          className="mp-hero__bg"
          style={{ backgroundImage: `url(${hero.image_url})` }}
          role="img"
          aria-label={hero.image_alt}
        />
        <div className="mp-hero__overlay" />
        <div className="mp-hero__content container">
          <span className="mp-hero__rule" aria-hidden="true" />
          <div className="mp-hero__copy">
            <p className="mp-hero__eyebrow">{hero.eyebrow}</p>
            <h1 className="mp-hero__heading">{hero.headline}</h1>
            <h2 className="mp-hero__h2">{hero.h2}</h2>
            <p className="mp-hero__sub">{hero.sub}</p>
            <div className="mp-hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                {hero.primary_cta_label}
              </button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                {hero.secondary_cta_label}
              </button>
            </div>
          </div>
        </div>
        <div className="mp-hero__stats-bar">
          <div className="container mp-hero__stats">
            {hero.stats.map((stat, idx) => (
              <div className="mp-hero__stat" style={{ animationDelay: `${0.4 + idx * 0.12}s` }} key={`${stat.label}-${idx}`}>
                <span className="mp-hero__stat-value">{stat.value}</span>
                <span className="mp-hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <a href="#specialties" className="mp-hero__scroll" aria-label="Scroll to the menu">
          <span>Scroll</span>
          <span className="mp-hero__scroll-line" aria-hidden="true" />
        </a>
      </header>

      <main id="main-content" className="editorial-main editorial-main--no-top">
        <Specialties />
        <MenuHighlights limitPerCategory={0} showHeaderActions={false} showFooterNote />

        <section className="editorial-main" style={{ paddingTop: 0 }}>
          <div className="container">
            <section className="editorial-support">
              <h2 className="editorial-support__title">{support.heading}</h2>
              <p className="editorial-support__body">{support.body}</p>
              <div className="editorial-support__actions">
                <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                  {support.primary_label}
                </button>
                <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.wineTastings)}>
                  {support.secondary_label}
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
