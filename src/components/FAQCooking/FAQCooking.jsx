import { useState } from 'react';
import { cookingClassFaqs } from '../../data/cookingClasses';
import { useInView } from '../../hooks/useInView';
import './FAQCooking.css';

export default function FAQCooking() {
  const [openId, setOpenId] = useState(null);
  const [ref, visible] = useInView();

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="container container--narrow">

        <div className={`faq-section__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label">Common Questions</p>
          <h2 id="faq-heading" className="faq-section__heading">
            A few practical details<br /><em>before you reserve</em>
          </h2>
        </div>

        <dl className="faq-list">
          {cookingClassFaqs.map((faq, i) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`faq-item fade-up delay-${(i % 4) + 1}${visible ? ' visible' : ''}${isOpen ? ' faq-item--open' : ''}`}
              >
                <dt>
                  <button
                    className="faq-item__question"
                    onClick={() => toggle(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-btn-${faq.id}`}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-item__icon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none">
                        <path d="M3 5.5L8 10.5L13 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                </dt>
                <dd
                  id={`faq-answer-${faq.id}`}
                  className="faq-item__answer"
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                  hidden={!isOpen}
                >
                  <p>{faq.answer}</p>
                </dd>
              </div>
            );
          })}
        </dl>

        <div className={`faq-section__footer fade-up${visible ? ' visible' : ''}`}>
          <p className="faq-section__footer-text">
            Planning a private class or booking for a celebration?
          </p>
          <a
            href="mailto:info@lanormarestaurant.com"
            className="btn btn--outline-light faq-section__cta"
          >
            Email the team directly
          </a>
        </div>

      </div>
    </section>
  );
}
