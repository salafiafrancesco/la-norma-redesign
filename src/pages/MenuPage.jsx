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
    <div className="editorial-page">
      <Navbar />

      <main id="main-content" className="editorial-main">
        <div className="container">
          <header className="editorial-hero">
            <p className="editorial-hero__eyebrow">The menu</p>
            <h1 className="editorial-hero__heading">A Sicilian menu with enough range to plan dinner properly.</h1>
            <p className="editorial-hero__subheading">
              Signature pasta, wood-fired pizza, seafood, antipasti, and desserts shaped around a warm, polished dinner
              service rather than a generic list of options.
            </p>
            <div className="editorial-hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                Reserve dinner
              </button>
              <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                Plan a private dinner
              </button>
            </div>
          </header>
        </div>

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
