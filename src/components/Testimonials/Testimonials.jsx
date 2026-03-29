import { useState } from 'react';
import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './Testimonials.css';

function Stars({ count }) {
  return (
    <div className="stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1l1.7 3.5L14 5.2l-3 2.9.7 4.1L8 10.5l-3.7 1.7.7-4.1-3-2.9 4.3-.7L8 1z"/>
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const testimonials = useSection('testimonials');
  const [active, setActive] = useState(0);
  const [ref, visible] = useInView();

  const goTo = (i) => setActive(i);
  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((a) => (a + 1) % testimonials.length);

  return (
    <section className="testimonials" aria-labelledby="testimonials-heading">
      <div className="container container--narrow">
        <div className={`testimonials__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label">What Guests Say</p>
          <h2 id="testimonials-heading" className="testimonials__heading">
            Stories From<br /><em>Our Table</em>
          </h2>
        </div>

        <div className="testimonials__carousel">
          {testimonials.map((t, i) => (
            <blockquote
              key={t.id}
              className={`testimonial${i === active ? ' testimonial--active' : ''}`}
              aria-hidden={i !== active}
            >
              <Stars count={t.rating} />
              <p className="testimonial__text">{t.text}</p>
              <footer className="testimonial__footer">
                <span className="testimonial__author">{t.author}</span>
                <span className="testimonial__sep" aria-hidden="true">·</span>
                <span className="testimonial__location">{t.location}</span>
                <span className="testimonial__sep" aria-hidden="true">·</span>
                <span className="testimonial__source">{t.source}</span>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Controls */}
        <div className="testimonials__controls">
          <button
            className="testimonials__arrow"
            onClick={prev}
            aria-label="Previous testimonial"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="testimonials__dots" role="tablist" aria-label="Testimonial navigation">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                className={`testimonials__dot${i === active ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === active}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="testimonials__arrow"
            onClick={next}
            aria-label="Next testimonial"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
