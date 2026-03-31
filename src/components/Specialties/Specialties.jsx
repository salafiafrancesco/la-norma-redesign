import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './Specialties.css';

function DishCard({ dish, featured }) {
  return (
    <article className={`dish-card${featured ? ' dish-card--featured' : ''}`}>
      <div className="dish-card__image-wrap">
        <img src={dish.imageUrl} alt={dish.imageAlt} className="dish-card__image" loading="lazy" />
        <span className="dish-card__tag">{dish.tag}</span>
      </div>
      <div className="dish-card__body">
        <h3 className="dish-card__name">{dish.name}</h3>
        <p className="dish-card__desc">{dish.description}</p>
        <div className="dish-card__footer">
          <span className="dish-card__price">{dish.price}</span>
        </div>
      </div>
    </article>
  );
}

export default function Specialties() {
  const specialties = useSection('specialties');
  const links = useSection('links');
  const [ref, visible] = useInView();
  const featured = specialties.find((dish) => dish.featured);
  const rest = specialties.filter((dish) => !dish.featured);

  return (
    <section id="specialties" className="specialties" aria-labelledby="specialties-heading">
      <div className="container">
        <div className={`specialties__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label">House Specialties</p>
          <h2 id="specialties-heading" className="specialties__heading">
            The dishes guests remember and re-order first.
          </h2>
          <p className="specialties__subheading">
            Signature pasta, wood-fired pizza, coastal secondi, and house desserts give the menu a clear point of view from the first course onward.
          </p>
          <div className="specialties__actions">
            <a href={links.menuPdf} className="btn btn--primary">View full menu</a>
            <a href={links.reserve} className="btn btn--outline-dark">Reserve a table</a>
          </div>
        </div>

        <div className="specialties__grid">
          {featured && (
            <div className={`specialties__featured fade-up delay-1${visible ? ' visible' : ''}`}>
              <DishCard dish={featured} featured />
            </div>
          )}

          <div className="specialties__secondary">
            {rest.map((dish, index) => (
              <div key={dish.id} className={`fade-up delay-${index + 2}${visible ? ' visible' : ''}`}>
                <DishCard dish={dish} featured={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
