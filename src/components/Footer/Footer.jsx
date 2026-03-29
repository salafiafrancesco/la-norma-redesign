import { useSection } from '../../context/ContentContext';
import { useNavigation } from '../../context/NavigationContext';
import './Footer.css';

export default function Footer() {
  const restaurant = useSection('restaurant');
  const footerNav  = useSection('footerNav');
  const links      = useSection('links');
  const { navigate } = useNavigation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__main container">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-name">{restaurant.name}</span>
            <span className="footer__logo-tag">{restaurant.tagline}</span>
          </div>
          <p className="footer__brand-desc">
            {restaurant.description}
          </p>
          <div className="footer__social">
            {Object.entries(restaurant.social).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label={`Visit our ${platform} page`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
        </div>

        <nav className="footer__nav" aria-label="Footer navigation">
          <p className="footer__nav-title">Quick Links</p>
          <ul>
            {footerNav.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="footer__nav-link">{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__contact">
          <p className="footer__nav-title">Find Us</p>
          <address className="footer__address">
            <p>{restaurant.address}</p>
            <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
          </address>
          <div className="footer__contact-links">
            <a href={`tel:${restaurant.phone}`} className="footer__contact-link">
              {restaurant.phone}
            </a>
            <a href={`mailto:${restaurant.email}`} className="footer__contact-link">
              {restaurant.email}
            </a>
          </div>
          <div className="footer__hours-block">
            <span className="footer__hours-open" />
            <span>{restaurant.hours}</span>
          </div>
        </div>

        <div className="footer__ctas">
          <p className="footer__nav-title">Reservations</p>
          <div className="footer__cta-stack">
            <a href={links.reserve} className="btn btn--primary footer__btn">
              Reserve a Table
            </a>
            <a href={links.menuPdf} className="btn btn--outline-light footer__btn">
              View Menu
            </a>
            <a href={links.orderDelivery} className="btn btn--outline-light footer__btn">
              Order Delivery
            </a>
            <a href={links.orderPickup} className="btn btn--outline-light footer__btn">
              Order Pickup
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__legal">
            &copy; {year} La Norma Ristorante & Pizzeria. All rights reserved.
          </p>
          <div className="footer__legal-links">
            <button className="footer__legal-btn" onClick={() => navigate('privacy-policy')}>Privacy Policy</button>
            <span aria-hidden="true">·</span>
            <a href="#accessibility">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
