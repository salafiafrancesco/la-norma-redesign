import { whatsIncluded, classFormat } from '../../data/cookingClasses';
import { useInView } from '../../hooks/useInView';
import './ClassHighlights.css';

const audiences = [
  { icon: '💑', label: 'Couples' },
  { icon: '👯', label: 'Best Friends' },
  { icon: '👨‍👩‍👧‍👦', label: 'Families' },
  { icon: '🎂', label: 'Birthdays' },
  { icon: '💼', label: 'Team Building' },
  { icon: '🥂', label: 'Celebrations' },
];

export default function ClassHighlights() {
  const [refInc, visibleInc] = useInView();
  const [refFmt, visibleFmt] = useInView();
  const [refAud, visibleAud] = useInView();

  return (
    <>
      {/* ---- What's Included ---- */}
      <section id="format" className="class-included" aria-labelledby="included-heading">
        <div className="container">
          <div className={`class-included__header fade-up${visibleInc ? ' visible' : ''}`} ref={refInc}>
            <p className="section-label">What's Included</p>
            <h2 id="included-heading" className="class-included__heading">
              Everything You Need.<br />
              <em>Nothing You Don't.</em>
            </h2>
            <p className="class-included__subheading">
              Show up curious and hungry. We take care of everything else — ingredients, wines, recipes, and a kitchen that feels like home.
            </p>
          </div>

          <div className="class-included__grid">
            {whatsIncluded.map((item, i) => (
              <div
                key={item.label}
                className={`included-card fade-up delay-${(i % 4) + 1}${visibleInc ? ' visible' : ''}`}
              >
                <span className="included-card__icon" aria-hidden="true">{item.icon}</span>
                <h3 className="included-card__label">{item.label}</h3>
                <p className="included-card__detail">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Class Format / Timeline ---- */}
      <section className="class-format" aria-labelledby="format-heading">
        <div className="container">
          <div className="class-format__grid">
            <div className={`class-format__text fade-up${visibleFmt ? ' visible' : ''}`} ref={refFmt}>
              <p className="section-label">The Experience</p>
              <h2 id="format-heading" className="class-format__heading">
                A Morning in<br /><em>Our Kitchen</em>
              </h2>
              <p className="class-format__body">
                From the moment you tie on your apron to the last bite of what you've cooked together,
                every detail is designed to feel less like a class and more like an Italian Sunday morning.
                Relaxed, generous, and deeply satisfying.
              </p>
              <div className="class-format__price-note">
                <span className="class-format__price">$95</span>
                <span className="class-format__price-desc">per person · all inclusive</span>
              </div>
            </div>

            <ol className="class-timeline" aria-label="Class schedule">
              {classFormat.map((step, i) => (
                <li
                  key={step.time}
                  className={`timeline-step fade-up delay-${i + 1}${visibleFmt ? ' visible' : ''}`}
                >
                  <div className="timeline-step__time">{step.time}</div>
                  <div className="timeline-step__connector" aria-hidden="true">
                    <div className="timeline-step__dot" />
                    {i < classFormat.length - 1 && <div className="timeline-step__line" />}
                  </div>
                  <div className="timeline-step__content">
                    <h3 className="timeline-step__title">{step.title}</h3>
                    <p className="timeline-step__detail">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- Perfect For ---- */}
      <section className="class-audience" aria-labelledby="audience-heading">
        <div className="container">
          <div className={`class-audience__inner fade-up${visibleAud ? ' visible' : ''}`} ref={refAud}>
            <p className="section-label" style={{ color: 'var(--gold-light)' }}>Perfect For</p>
            <h2 id="audience-heading" className="class-audience__heading">
              Who Joins Our Classes
            </h2>
            <div className="audience-grid">
              {audiences.map((a) => (
                <div key={a.label} className="audience-pill">
                  <span className="audience-pill__icon" aria-hidden="true">{a.icon}</span>
                  <span className="audience-pill__label">{a.label}</span>
                </div>
              ))}
            </div>
            <p className="class-audience__note">
              Private class buyouts available for groups of 6–8.&nbsp;
              <a href="mailto:info@lanormarestaurant.com" className="class-audience__link">
                Contact us for arrangements →
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
