import { classFormat, whatsIncluded } from '../../data/cookingClasses';
import { useInView } from '../../hooks/useInView';
import { getCookingClassImage } from '../../utils/hospitalityMedia';
import './ClassHighlights.css';

const testimonials = [
  {
    quote:
      'It felt less like a class and more like being welcomed into a beautiful kitchen with excellent food and real hospitality.',
    name: 'Natalie T.',
    context: 'Booked for a birthday weekend',
  },
  {
    quote:
      'The pacing was perfect. We learned a lot, but it never felt rushed or overly technical.',
    name: 'Michael & Jen',
    context: 'Saturday class guests',
  },
  {
    quote:
      'One of the most memorable experiences we booked on Longboat Key. Warm, polished, and genuinely worth planning around.',
    name: 'Caroline R.',
    context: 'Visiting guest',
  },
];

const storyPanels = [
  {
    eyebrow: 'Arrival',
    title: 'Aperitivo, introductions, and a room that immediately feels welcoming.',
    copy:
      'Guests settle in with a first pour and a short introduction before aprons go on and the kitchen comes to life.',
  },
  {
    eyebrow: 'Hands-on',
    title: 'Technique taught through doing, tasting, and asking questions in real time.',
    copy:
      'Nothing feels staged. Guests cook, adjust, taste, and build confidence as the menu comes together.',
  },
  {
    eyebrow: 'Finale',
    title: 'The class slows into a shared meal that feels earned and memorable.',
    copy:
      'Instead of ending at the counter, the experience resolves around the table with the dishes you made together.',
  },
];

export default function ClassHighlights() {
  const [includedRef, includedVisible] = useInView();
  const [formatRef, formatVisible] = useInView();
  const [testimonialRef, testimonialVisible] = useInView();

  return (
    <>
      <section id="format" className="class-included" aria-labelledby="included-heading">
        <div className="container">
          <div className={`class-included__header fade-up${includedVisible ? ' visible' : ''}`} ref={includedRef}>
            <p className="section-label">What is included</p>
            <h2 id="included-heading" className="class-included__heading">
              Everything needed for a generous morning in the kitchen.
            </h2>
            <p className="class-included__subheading">
              Show up curious and ready to cook. We handle the ingredients, the rhythm, the pairings, the recipes, and
              the table waiting at the end.
            </p>
          </div>

          <div className="class-included__grid">
            {whatsIncluded.map((item, index) => (
              <article
                key={item.label}
                className={`included-card fade-up delay-${(index % 4) + 1}${includedVisible ? ' visible' : ''}`}
              >
                <span className="included-card__icon" aria-hidden="true">{item.icon}</span>
                <h3 className="included-card__label">{item.label}</h3>
                <p className="included-card__detail">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="class-story" aria-labelledby="format-heading">
        <div className="container">
          <div className="class-story__grid">
            <div className={`class-story__copy fade-up${formatVisible ? ' visible' : ''}`} ref={formatRef}>
              <p className="section-label">The experience</p>
              <h2 id="format-heading" className="class-story__heading">
                A slower, more premium format than a typical cooking workshop.
              </h2>
              <p className="class-story__body">
                The class is practical, intimate, and paced like genuine hospitality. Guests cook, taste, ask
                questions, and then sit down together for the meal they have created.
              </p>

              <div className="class-story__timeline">
                {classFormat.map((step) => (
                  <div key={step.time} className="class-story__step">
                    <span className="class-story__time">{step.time}</span>
                    <div>
                      <h3 className="class-story__step-title">{step.title}</h3>
                      <p className="class-story__step-detail">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="class-story__visual">
              {storyPanels.map((panel, index) => (
                <article
                  key={panel.title}
                  className={`class-story__panel fade-up delay-${(index % 3) + 1}${formatVisible ? ' visible' : ''}`}
                >
                  <div
                    className="class-story__panel-media"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(18, 23, 22, 0.1), rgba(18, 23, 22, 0.54)), url(${getCookingClassImage(panel.title, index)})`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="class-story__panel-copy">
                    <span className="class-story__panel-eyebrow">{panel.eyebrow}</span>
                    <h3>{panel.title}</h3>
                    <p>{panel.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="class-testimonials" aria-labelledby="testimonial-heading">
        <div className="container">
          <div className={`class-testimonials__header fade-up${testimonialVisible ? ' visible' : ''}`} ref={testimonialRef}>
            <p className="section-label">Guest impressions</p>
            <h2 id="testimonial-heading" className="class-testimonials__heading">
              Why this experience feels worth reserving in advance.
            </h2>
          </div>

          <div className="class-testimonials__grid">
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                className={`class-testimonial fade-up delay-${(index % 3) + 1}${testimonialVisible ? ' visible' : ''}`}
              >
                <p className="class-testimonial__quote">"{item.quote}"</p>
                <div className="class-testimonial__meta">
                  <span>{item.name}</span>
                  <span>{item.context}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="class-testimonials__cta">
            <a href="#booking" className="btn btn--primary">
              View available Saturdays
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
