import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useSection } from '../context/ContentContext';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { OPENTABLE_RESERVATION_URL } from '../utils/hospitalityMedia';
import { PAGE_KEYS } from '../../shared/routes.js';
import './EditorialPage.css';

export default function ContactPage() {
  const restaurant = useSection('restaurant');
  const { navigate } = useNavigation();

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
            <p className="editorial-hero__eyebrow">Contact</p>
            <h1 className="editorial-hero__heading">Know where to start, and the right next step becomes obvious.</h1>
            <p className="editorial-hero__subheading">
              Reserve dinner instantly on OpenTable, call the team directly, or choose the experience page that best
              matches what you are planning.
            </p>
            <div className="editorial-hero__actions">
              <a href={OPENTABLE_RESERVATION_URL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                Reserve on OpenTable
              </a>
              <a href={`tel:${restaurant.phone}`} className="btn btn--outline-dark">
                Call the restaurant
              </a>
            </div>
          </header>

          <section className="editorial-card">
            <h2 className="editorial-card__title">Contact details</h2>
            <div className="editorial-info-grid">
              <article className="editorial-info-card">
                <h3 className="editorial-info-card__title">Visit</h3>
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
                <h3 className="editorial-info-card__title">Reach us</h3>
                <div className="editorial-info-card__body">
                  <p><a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a></p>
                  <p><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></p>
                  <p style={{ marginTop: '0.9rem' }}>{restaurant.hours}</p>
                </div>
              </article>

              <article className="editorial-info-card">
                <h3 className="editorial-info-card__title">Best path by intent</h3>
                <div className="editorial-info-card__body">
                  <p>Dinner reservation: OpenTable</p>
                  <p>Cooking class RSVP: class page</p>
                  <p>Private events: inquiry page</p>
                </div>
              </article>
            </div>
          </section>

          <section className="editorial-support">
            <h2 className="editorial-support__title">Choose the page that fits what you need.</h2>
            <ul className="editorial-support__list">
              <li>
                <div>
                  <strong>Dinner reservations</strong>
                  <div>Fastest for everyday dining and planned evenings.</div>
                </div>
              </li>
              <li>
                <div>
                  <strong>Cooking classes and wine tastings</strong>
                  <div>Best when you want a premium experience with clearer booking context.</div>
                </div>
              </li>
              <li>
                <div>
                  <strong>Private events</strong>
                  <div>Use the inquiry flow when guest count, menu, and event format all matter.</div>
                </div>
              </li>
            </ul>
            <div className="editorial-support__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.cookingClasses)}>
                Cooking classes
              </button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                Private events
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
