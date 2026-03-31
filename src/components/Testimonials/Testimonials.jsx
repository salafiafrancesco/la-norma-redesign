import { useState } from 'react';
import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './Testimonials.css';

function Stars({ count }) {
  return (
    <div className="stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, index) => (
        <svg key={index} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1l1.7 3.5L14 5.2l-3 2.9.7 4.1L8 10.5l-3.7 1.7.7-4.1-3-2.9 4.3-.7L8 1z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const testimonialSection = useSection('testimonialSection');
  const links = useSection('links');
  const [active, setActive] = useState(0);
  const [ref, visible] = useInView();

  const testimonials = testimonialSection.items;

  const goTo = (index) => setActive(index);
  const previous = () => setActive((index) => (index - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((index) => (index + 1) % testimonials.length);

  return (
    <section className="testimonials" aria-labelledby="testimonials-heading">
      <div className="container container--narrow">
        <div className={`testimonials__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label">{testimonialSection.label}</p>
          <h2 id="testimonials-heading" className="testimonials__heading">
            {testimonialSection.headline}
          </h2>
          <p className="testimonials__subheading">
            Guests most often mention the pacing, the warmth of service, and how complete the evening feels from aperitivo to dessert.
          </p>
        </div>

        <div className="testimonials__carousel">
          {testimonials.map((testimonial, index) => (
            <blockquote
              key={testimonial.id}
              className={`testimonial${index === active ? ' testimonial--active' : ''}`}
              aria-hidden={index !== active}
            >
              <Stars count={testimonial.rating} />
              <p className="testimonial__text">{testimonial.text}</p>
              <footer className="testimonial__footer">
                <span className="testimonial__author">{testimonial.author}</span>
                <span className="testimonial__sep" aria-hidden="true">|</span>
                <span className="testimonial__location">{testimonial.location}</span>
                <span className="testimonial__sep" aria-hidden="true">|</span>
                <span className="testimonial__source">{testimonial.source}</span>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="testimonials__controls">
          <button className="testimonials__arrow" type="button" onClick={previous} aria-label="Previous testimonial">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="testimonials__dots" role="tablist" aria-label="Testimonial navigation">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                className={`testimonials__dot${index === active ? ' is-active' : ''}`}
                type="button"
                onClick={() => goTo(index)}
                role="tab"
                aria-selected={index === active}
                aria-label={`Show testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button className="testimonials__arrow" type="button" onClick={next} aria-label="Next testimonial">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="testimonials__actions">
          <a href={links.reserve} className="btn btn--primary">
            Reserve your evening
          </a>
        </div>
      </div>
    </section>
  );
}
