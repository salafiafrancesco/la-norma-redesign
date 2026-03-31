import { PAGE_KEYS, resolveNavigationTarget } from '../../../shared/routes.js';
import { useNavigation } from '../../context/NavigationContext';
import { useSection } from '../../context/ContentContext';
import './Footer.css';

export default function Footer() {
  const restaurant = useSection('restaurant');
  const links = useSection('links');
  const footer = useSection('footer');
  const footerNav = useSection('footerNav');
  const { navigate, navigatePath, resolveHref } = useNavigation();
  const currentYear = new Date().getFullYear();

  const normalizeInternalHref = (href) => {
    const destination = resolveNavigationTarget(href);
    return destination.isInternal ? destination.href : href;
  };

  const actionLinks = [
    {
      label: 'Reserve a table',
      href: normalizeInternalHref(
        links.reserve?.startsWith('#')
          ? resolveHref(PAGE_KEYS.home, links.reserve.slice(1))
          : links.reserve,
      ),
    },
    {
      label: 'View menu',
      href: resolveHref(PAGE_KEYS.menu),
    },
    {
      label: 'Private events',
      href: resolveHref(PAGE_KEYS.privateEvents),
    },
  ];

  const handleNavClick = (event, href) => {
    if (!href) return;

    const destination = resolveNavigationTarget(href);
    if (destination.isInternal) {
      event.preventDefault();
      navigatePath(destination.href);
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__top container">
        <div className="footer__intro">
          <p className="footer__eyebrow">La Norma hospitality</p>
          <h2 className="footer__headline">
            Sicilian warmth, Gulf Coast ease, and a room built for lingering.
          </h2>
          <p className="footer__copy">
            {footer.tagline || restaurant.description}
          </p>

          <div className="footer__actions">
              {actionLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="btn btn--outline-light"
                onClick={(event) => handleNavClick(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__grid">
          <section className="footer__panel">
            <p className="footer__panel-label">Visit</p>
            <div className="footer__brand">
              <span className="footer__brand-name">{restaurant.name}</span>
              <span className="footer__brand-tag">{restaurant.tagline}</span>
            </div>
            <address className="footer__address">
              <p>{restaurant.address}</p>
              <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
            </address>
            <a
              href={restaurant.mapEmbedUrl}
              className="footer__text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
            </a>
          </section>

          <section className="footer__panel">
            <p className="footer__panel-label">Contact</p>
            <a href={`tel:${restaurant.phone}`} className="footer__text-link">
              {restaurant.phone}
            </a>
            <a href={`mailto:${restaurant.email}`} className="footer__text-link">
              {restaurant.email}
            </a>
            <p className="footer__hours">{restaurant.hours}</p>
            <p className="footer__hours-note">{restaurant.hoursNote}</p>
          </section>

          <nav className="footer__panel" aria-label="Footer navigation">
            <p className="footer__panel-label">Explore</p>
            <ul className="footer__nav">
              {footerNav.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <a
                    href={normalizeInternalHref(link.href)}
                    className="footer__nav-link"
                    onClick={(event) => handleNavClick(event, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section className="footer__panel">
            <p className="footer__panel-label">Follow</p>
            <div className="footer__social">
              {Object.entries(restaurant.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  className="footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {platform}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__legal">
            Copyright {currentYear} La Norma Ristorante &amp; Pizzeria. All rights reserved.
          </p>
          <div className="footer__legal-links">
            <button
              className="footer__legal-button"
              type="button"
              onClick={() => navigate(PAGE_KEYS.privacyPolicy)}
            >
              Privacy policy
            </button>
            <button
              className="footer__legal-button"
              type="button"
              onClick={() => navigate(PAGE_KEYS.contact)}
            >
              Contact & accessibility
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
