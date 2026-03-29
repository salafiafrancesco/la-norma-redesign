import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import { useNavigation } from '../../context/NavigationContext';
import './Experiences.css';

export default function Experiences() {
  const experiences = useSection('experiences');
  const [ref, visible] = useInView();
  const { navigate } = useNavigation();

  const PAGE_MAP = { 1: 'wine-tastings', 2: 'cooking-classes', 3: 'live-music', 4: 'private-events' };

  const handleCta = (e, exp) => {
    const dest = PAGE_MAP[exp.id];
    if (dest) {
      e.preventDefault();
      navigate(dest);
    }
  };

  return (
    <section id="experiences" className="experiences" aria-labelledby="experiences-heading">
      <div className="experiences__bg" aria-hidden="true" />

      <div className="container">
        <div className={`experiences__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label" style={{ color: 'var(--gold-light)' }}>
            Beyond the Plate
          </p>
          <h2 id="experiences-heading" className="experiences__heading">
            Curated Experiences<br />
            <em>Worth Savoring</em>
          </h2>
          <p className="experiences__subheading">
            From intimate wine tastings to hands-on cooking classes — La Norma invites you deeper into the Italian way of living.
          </p>
        </div>

        <div className="experiences__grid">
          {experiences.map((exp, i) => (
            <article
              key={exp.id}
              className={`exp-card fade-up delay-${i + 1}${visible ? ' visible' : ''}`}
            >
              <div className="exp-card__icon" aria-hidden="true">{exp.icon}</div>
              <div className="exp-card__label">{exp.label}</div>
              <h3 className="exp-card__title">{exp.title}</h3>
              <p className="exp-card__desc">{exp.description}</p>
              <a
                href={exp.ctaHref}
                className="btn btn--ghost-cream exp-card__cta"
                onClick={(e) => handleCta(e, exp)}
              >
                {exp.cta}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
