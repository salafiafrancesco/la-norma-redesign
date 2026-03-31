import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { ABOUT_VALUES } from '../data/sitePages';
import { PAGE_KEYS } from '../../shared/routes.js';
import './EditorialPage.css';

export default function AboutPage() {
  const story = useSection('story');
  const restaurant = useSection('restaurant');
  const { navigate } = useNavigation();

  usePageMetadata({
    title: 'About La Norma',
    description:
      'Discover the story behind La Norma, a refined Sicilian restaurant on Longboat Key shaped by warm hospitality, handmade food, and thoughtful experiences.',
  });

  return (
    <div className="editorial-page">
      <Navbar />

      <main id="main-content" className="editorial-main">
        <div className="container">
          <header className="editorial-hero">
            <p className="editorial-hero__eyebrow">About La Norma</p>
            <h1 className="editorial-hero__heading">A Sicilian restaurant designed to feel generous, polished, and personal.</h1>
            <p className="editorial-hero__subheading">
              {story.quote} The aim is simple: serve food with regional integrity, keep the room warm, and let guests
              feel looked after from first arrival to final course.
            </p>
            <div className="editorial-hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                Reserve dinner
              </button>
              <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.cookingClasses)}>
                Explore experiences
              </button>
            </div>
          </header>

          <div className="editorial-grid">
            <section className="editorial-card">
              <h2 className="editorial-card__title">What shapes the room</h2>
              <div className="editorial-card__body">
                <p>{story.body[0]}</p>
                <p style={{ marginTop: '1rem' }}>{story.body[1]}</p>
              </div>

              <div className="editorial-value-grid" style={{ marginTop: '1.5rem' }}>
                {ABOUT_VALUES.map((item) => (
                  <article key={item.title} className="editorial-value-card">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="editorial-side-stack">
              <section className="editorial-side-card">
                <h2 className="editorial-side-card__title">Visit the restaurant</h2>
                <div className="editorial-side-card__body">
                  <p>{restaurant.address}</p>
                  <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                  <p style={{ marginTop: '0.85rem' }}>{restaurant.hours}</p>
                </div>
              </section>

              <section className="editorial-side-card">
                <h2 className="editorial-side-card__title">Best next steps</h2>
                <div className="editorial-side-card__body">
                  <p>If you are visiting for dinner, reserve early for the timing you actually want.</p>
                  <p style={{ marginTop: '0.8rem' }}>
                    If you want something more memorable, the cooking classes, wine tastings, and private events extend
                    the same hospitality beyond a standard table booking.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
