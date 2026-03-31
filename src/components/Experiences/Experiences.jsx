import { PAGE_KEYS, resolveNavigationTarget } from '../../../shared/routes.js';
import { useNavigation } from '../../context/NavigationContext';
import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import { getExperienceImage } from '../../utils/hospitalityMedia';
import './Experiences.css';

function getExperienceBadge(icon, title) {
  const normalized = String(icon || '').toLowerCase();

  if (normalized.includes('wine')) return 'Wine';
  if (normalized.includes('kitchen')) return 'Chef';
  if (normalized.includes('music')) return 'Live';
  if (normalized.includes('celebration')) return 'Event';

  return title.split(' ').slice(0, 2).join(' ');
}

export default function Experiences() {
  const experiences = useSection('experiences');
  const { navigate, navigatePath } = useNavigation();
  const [ref, visible] = useInView();

  const handleExperienceNavigation = (ctaHref) => {
    const destination = resolveNavigationTarget(ctaHref);

    if (destination.isInternal) {
      navigatePath(destination.href);
      return;
    }

    if (ctaHref) {
      window.location.assign(ctaHref);
    }
  };

  return (
    <section id="experiences" className="experiences" aria-labelledby="experiences-heading">
      <div className="experiences__bg" aria-hidden="true" />

      <div className="container">
        <div className={`experiences__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label experiences__label">Beyond the plate</p>
          <h2 id="experiences-heading" className="experiences__heading">
            Experiences that extend the mood of the dining room.
          </h2>
          <p className="experiences__subheading">
            Wine tastings, cooking classes, live music, and private hospitality let guests move from dinner into something more memorable without losing the tone of La Norma.
          </p>
          <div className="experiences__actions">
            <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
              Reserve a table
            </button>
            <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'visit' })}>
              Plan your evening
            </button>
          </div>
        </div>

        <div className="experiences__grid">
          {experiences.map((experience, index) => {
            const experienceImage = getExperienceImage(experience.title, index);

            return (
              <article
                key={experience.id}
                className={`exp-card fade-up delay-${(index % 4) + 1}${visible ? ' visible' : ''}`}
              >
                <div
                  className="exp-card__media"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(13, 18, 17, 0.12), rgba(13, 18, 17, 0.74)), linear-gradient(135deg, rgba(196, 151, 58, 0.12), transparent), url(${experienceImage})`,
                  }}
                  aria-hidden="true"
                />

                <div className="exp-card__body">
                  <div className="exp-card__top">
                    <div className="exp-card__badge" aria-hidden="true">
                      {getExperienceBadge(experience.icon, experience.title)}
                    </div>
                    <div className="exp-card__label">{experience.label}</div>
                  </div>

                  <h3 className="exp-card__title">{experience.title}</h3>
                  <p className="exp-card__desc">{experience.description}</p>

                  <button
                    type="button"
                    className="btn btn--ghost-cream exp-card__cta"
                    onClick={() => handleExperienceNavigation(experience.ctaHref)}
                  >
                    {experience.cta}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M1 7h12M8 2l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
