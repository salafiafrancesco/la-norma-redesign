import { useSection } from '../../context/ContentContext';
import { useNavigation } from '../../context/NavigationContext';
import { useInView } from '../../hooks/useInView';
import { PAGE_KEYS } from '../../../shared/routes.js';
import './CateringPromo.css';

const PROMO_IMAGE =
  'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80';

export default function CateringPromo() {
  const catering = useSection('catering');
  const { navigate } = useNavigation();
  const [ref, visible] = useInView();

  const imageUrl = catering.heroImageUrl || PROMO_IMAGE;

  return (
    <section id="catering" className="catering-promo" aria-labelledby="catering-promo-heading">
      <div className="container">
        <div className={`catering-promo__grid fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <div className="catering-promo__media">
            <img
              src={imageUrl}
              alt="Elegant Italian catering presentation by La Norma"
              loading="lazy"
            />
            <span className="catering-promo__badge">Catering</span>
          </div>

          <div className="catering-promo__content">
            <p className="catering-promo__eyebrow">Private events & yacht parties</p>
            <h2 id="catering-promo-heading" className="catering-promo__heading">
              Sicilian elegance, delivered to your occasion.
            </h2>
            <p className="catering-promo__body">
              {catering.introP1}
            </p>

            <div className="catering-promo__tags">
              {(catering.perfectFor || []).slice(0, 4).map((item) => (
                <span key={item.label} className="catering-promo__tag">{item.label}</span>
              ))}
            </div>

            <div className="catering-promo__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate(PAGE_KEYS.catering)}
              >
                Discover Catering
              </button>
              <button
                type="button"
                className="btn btn--outline-dark"
                onClick={() => navigate(PAGE_KEYS.catering, { anchor: 'catering-request' })}
              >
                Request a Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
