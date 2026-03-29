import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './Story.css';

export default function Story() {
  const story = useSection('story');
  const [ref, visible] = useInView();

  return (
    <section id="story" className="story" aria-labelledby="story-heading">
      <div className="container">
        <div className={`story__grid fade-up${visible ? ' visible' : ''}`} ref={ref}>

          {/* Left: text */}
          <div className="story__text">
            <p className="section-label">{story.label}</p>

            <blockquote className="story__quote">
              <p>{story.quote}</p>
            </blockquote>

            <div className="story__body">
              {story.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Stats */}
            <div className="story__stats">
              {[story.stat1, story.stat2, story.stat3].map((stat, i) => (
                <div key={i} className="story__stat">
                  <span className="story__stat-value">{stat.value}</span>
                  <span className="story__stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image */}
          <div className="story__visual">
            <div className="story__image-frame">
              <img
                src={story.imageUrl}
                alt={story.imageAlt}
                className="story__image"
                loading="lazy"
              />
            </div>
            {/* Decorative accent block */}
            <div className="story__accent-block" aria-hidden="true" />
          </div>

        </div>
      </div>
    </section>
  );
}
