import Footer from '../components/Footer/Footer';
import MenuHighlights from '../components/MenuHighlights/MenuHighlights';
import Navbar from '../components/Navbar/Navbar';
import Specialties from '../components/Specialties/Specialties';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { PAGE_KEYS } from '../../shared/routes.js';
import './EditorialPage.css';

const MENU_DESCRIPTION =
  'Explore the La Norma menu with Sicilian antipasti, house-made pasta, wood-fired pizza, seafood, and desserts on Longboat Key.';

export default function MenuPage() {
  const { navigate } = useNavigation();

  usePageMetadata({
    title: 'Menu',
    description: MENU_DESCRIPTION,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        name: 'La Norma Menu',
        description: MENU_DESCRIPTION,
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
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1800&q=85)' }}
          role="img"
          aria-label="House-made Sicilian pasta, plated"
        />
        <div className="mp-hero__overlay" />
        <div className="mp-hero__content container">
          <span className="mp-hero__rule" aria-hidden="true" />
          <div className="mp-hero__copy">
            <p className="mp-hero__eyebrow">La Norma Ristorante · Longboat Key</p>
            <h1 className="mp-hero__heading">The Menu</h1>
            <h2 className="mp-hero__h2">House-made pasta, wood-fired pizza, Sicilian classics.</h2>
            <p className="mp-hero__sub">
              Built around a warm, polished dinner service — antipasti through dessert, with seasonal Sicilian inflections and an Italian wine list.
            </p>
            <div className="mp-hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                Reserve dinner
              </button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                Plan a private dinner
              </button>
            </div>
          </div>
        </div>
        <div className="mp-hero__stats-bar">
          <div className="container mp-hero__stats">
            <div className="mp-hero__stat" style={{ animationDelay: '0.4s' }}>
              <span className="mp-hero__stat-value">Daily fresh</span>
              <span className="mp-hero__stat-label">Hand-rolled pasta</span>
            </div>
            <div className="mp-hero__stat" style={{ animationDelay: '0.52s' }}>
              <span className="mp-hero__stat-value">550°C</span>
              <span className="mp-hero__stat-label">Wood-fired oven</span>
            </div>
            <div className="mp-hero__stat" style={{ animationDelay: '0.64s' }}>
              <span className="mp-hero__stat-value">70+ wines</span>
              <span className="mp-hero__stat-label">Italian wine list</span>
            </div>
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
              <h2 className="editorial-support__title">Know the menu, then choose the right next step.</h2>
              <p className="editorial-support__body">
                If dinner is the plan, reserve now. If the evening needs more structure, the tastings, classes, and
                private-event formats give guests a clearer path.
              </p>
              <div className="editorial-support__actions">
                <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                  Reserve a table
                </button>
                <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.wineTastings)}>
                  Wine tastings
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
