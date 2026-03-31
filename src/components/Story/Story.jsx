import { PAGE_KEYS } from '../../../shared/routes.js';
import { useSection } from '../../context/ContentContext';
import { useNavigation } from '../../context/NavigationContext';
import { useInView } from '../../hooks/useInView';
import './Story.css';

export default function Story() {
  const story = useSection('story');
  const { navigate } = useNavigation();
  const [ref, visible] = useInView();

  return (
    <section id="story" className="story" aria-labelledby="story-heading">
      <div className="container">
        <div className={`story__grid fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <div className="story__content">
            <p className="section-label">{story.label}</p>
            <h2 id="story-heading" className="story__heading">
              Sicilian cooking, served with patience, polish, and a sense of occasion.
            </h2>
            <p className="story__lead">{story.quote}</p>

            <div className="story__body">
              {story.body.map((para, index) => (
                <p key={index}>{para}</p>
              ))}
            </div>

            <div className="story__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                Reserve a table
              </button>
              <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.about)}>
                Read our story
              </button>
            </div>
          </div>

          <div className="story__visual">
            <div className="story__image-frame">
              <img src={story.imageUrl} alt={story.imageAlt} className="story__image" loading="lazy" />
            </div>

            <div className="story__note-card">
              <p className="story__quote-card-label">The La Norma approach</p>
              <p className="story__quote-card-copy">
                Hospitality should feel calm, generous, and attentive. This section stays brief so guests can understand
                the tone quickly, then move to dinner, experiences, or the full story page without extra friction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
