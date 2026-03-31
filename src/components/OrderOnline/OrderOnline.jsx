import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './OrderOnline.css';

const DeliveryIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 16h36v22a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V16Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M6 16 10 6h28l4 10" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="17" cy="38" r="4" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="31" cy="38" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M24 6v10M16 22h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const PickupIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M24 4a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 44c0-8.84 7.16-16 16-16s16 7.16 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="m20 12 2.5 2.5L27 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function OrderOnline() {
  const links = useSection('links');
  const orderOnline = useSection('orderOnline');
  const [ref, visible] = useInView();

  const options = [
    {
      id: 'delivery',
      icon: <DeliveryIcon />,
      label: 'Order delivery',
      headline: 'Delivered with the essentials handled.',
      description:
        'Our most-loved dishes travel with care, from house-made pasta to wood-fired pizza and composed mains.',
      cta: 'Order for delivery',
      href: links.orderDelivery,
      note: 'Ideal for evenings in',
      accent: 'var(--terracotta)',
    },
    {
      id: 'pickup',
      icon: <PickupIcon />,
      label: 'Pickup',
      headline: 'Ready when your evening is.',
      description:
        'Order ahead and collect a polished dinner without losing the feeling of a properly cooked meal.',
      cta: 'Order for pickup',
      href: links.orderPickup,
      note: 'Prepared for easy collection',
      accent: 'var(--olive)',
    },
  ];

  return (
    <section id="order" className="order-online" aria-labelledby="order-heading">
      <div className="container">
        <div className={`order-online__header fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label">{orderOnline.eyebrow}</p>
          <h2 id="order-heading" className="order-online__heading">
            {orderOnline.headline}
          </h2>
          <p className="order-online__subheading">{orderOnline.sub}</p>
        </div>

        <div className="order-online__grid">
          {options.map((option, index) => (
            <article
              key={option.id}
              className={`order-card fade-up delay-${index + 1}${visible ? ' visible' : ''}`}
              style={{ '--card-accent': option.accent }}
            >
              <div className="order-card__icon-wrap">
                {option.icon}
              </div>
              <p className="order-card__label">{option.label}</p>
              <h3 className="order-card__headline">{option.headline}</h3>
              <p className="order-card__desc">{option.description}</p>
              <a href={option.href} className="btn btn--primary order-card__btn">
                {option.cta}
              </a>
              <p className="order-card__note">{option.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
