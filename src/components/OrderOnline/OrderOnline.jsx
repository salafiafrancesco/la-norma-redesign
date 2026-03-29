import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './OrderOnline.css';

const DeliveryIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 16h36v22a4 4 0 01-4 4H10a4 4 0 01-4-4V16z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M6 16l4-10h28l4 10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="17" cy="38" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="31" cy="38" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M24 6v10M16 22h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const PickupIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M24 4a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 44c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M20 12l2.5 2.5L27 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function OrderOnline() {
  const links      = useSection('links');
  const [ref, visible] = useInView();

  const options = [
    {
      id: 'delivery',
      icon: <DeliveryIcon />,
      label: 'Order Delivery',
      headline: 'La Norma, Delivered.',
      description:
        'Our handmade pasta, wood-fired pizza, and signature mains — brought directly to your door. Because the best evenings deserve the best food.',
      cta: 'Order for Delivery',
      href: links.orderDelivery,
      note: 'Via DoorDash & Uber Eats',
      accent: 'var(--terracotta)',
    },
    {
      id: 'pickup',
      icon: <PickupIcon />,
      label: 'Quick Pickup',
      headline: 'Ready When You Are.',
      description:
        'Order ahead, skip the wait. Your full La Norma experience — ready for pick up at the restaurant at your chosen time.',
      cta: 'Order for Pickup',
      href: links.orderPickup,
      note: 'Ready in 20–30 min',
      accent: 'var(--olive)',
    },
  ];

  return (
    <section id="order" className="order-online" aria-labelledby="order-heading">
      <div className="container">
        <div className={`order-online__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label">Order Online</p>
          <h2 id="order-heading" className="order-online__heading">
            Take La Norma Home
          </h2>
          <p className="order-online__subheading">
            Every dish travels with the same care it&apos;s given in our kitchen.
          </p>
        </div>

        <div className="order-online__grid">
          {options.map((opt, i) => (
            <article
              key={opt.id}
              className={`order-card fade-up delay-${i + 1}${visible ? ' visible' : ''}`}
              style={{ '--card-accent': opt.accent }}
            >
              <div className="order-card__icon-wrap">
                {opt.icon}
              </div>
              <p className="order-card__label">{opt.label}</p>
              <h3 className="order-card__headline">{opt.headline}</h3>
              <p className="order-card__desc">{opt.description}</p>
              <a href={opt.href} className="btn btn--primary order-card__btn">
                {opt.cta}
              </a>
              <p className="order-card__note">{opt.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
