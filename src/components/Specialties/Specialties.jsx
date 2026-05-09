import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './Specialties.css';

function DishCard({ dish, index, featured }) {
  return (
    <article className={`dish-card${featured ? ' dish-card--featured' : ''}`}>
      <div className="dish-card__media">
        <img
          src={dish.imageUrl}
          alt={dish.imageAlt}
          className="dish-card__image"
          loading="lazy"
        />
        {featured && (
          <span className="dish-card__star" aria-label="House signature">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.5l2.94 6.31 6.93.6-5.27 4.55 1.6 6.79L12 17.27l-6.2 3.48 1.6-6.79L2.13 9.41l6.93-.6L12 2.5z" />
            </svg>
          </span>
        )}
      </div>

      <div className="dish-card__caption">
        <p className="dish-card__index">
          <span className="dish-card__index-num">{String(index + 1).padStart(2, '0')}</span>
          <span className="dish-card__index-sep" aria-hidden="true" />
          <span className="dish-card__tag">{dish.tag}</span>
        </p>
        <h3 className="dish-card__name">{dish.name}</h3>
        <p className="dish-card__desc">{dish.description}</p>
        <p className="dish-card__price">{dish.price}</p>
      </div>
    </article>
  );
}

export default function Specialties() {
  const specialties = useSection('specialties');
  const links = useSection('links');
  const [ref, visible] = useInView();

  return (
    <section id="specialties" className="specialties" aria-labelledby="specialties-heading">
      <div className="container">
        <div className={`specialties__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label">House Specialties</p>
          <h2 id="specialties-heading" className="specialties__heading">
            The dishes guests remember.
          </h2>
          <p className="specialties__subheading">
            A few signatures that carry the menu — pasta, wood-fired pizza, Mediterranean secondi, and house dolci.
          </p>
          <div className="specialties__actions">
            <a href={links.menuPdf} className="btn btn--primary">View full menu</a>
            <a href={links.reserve} className="btn btn--outline-dark">Reserve a table</a>
          </div>
        </div>

        <ol className="specialties__row" aria-label="Featured dishes">
          {specialties.map((dish, index) => (
            <li
              key={dish.id}
              className={`specialties__cell fade-up delay-${(index % 4) + 1}${visible ? ' visible' : ''}`}
            >
              <DishCard dish={dish} index={index} featured={!!dish.featured} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
