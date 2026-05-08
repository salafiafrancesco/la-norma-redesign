import { useEffect, useState } from 'react';
import { useSection } from '../../context/ContentContext';
import { useNavigation } from '../../context/NavigationContext';
import { PAGE_KEYS } from '../../../shared/routes.js';
import { OPENTABLE_RESERVATION_URL } from '../../utils/hospitalityMedia';
import './Navbar.css';

const IMMERSIVE_PAGES = new Set([
  PAGE_KEYS.home,
  PAGE_KEYS.cookingClasses,
  PAGE_KEYS.wineTastings,
  PAGE_KEYS.liveMusic,
  PAGE_KEYS.privateEvents,
  PAGE_KEYS.catering,
]);

const NAV_LINKS = [
  { label: 'Home', pageKey: PAGE_KEYS.home },
  { label: 'Menu', pageKey: PAGE_KEYS.menu },
  { label: 'Cooking Classes', pageKey: PAGE_KEYS.cookingClasses },
  { label: 'Wine Tasting', pageKey: PAGE_KEYS.wineTastings },
  { label: 'Live Music', pageKey: PAGE_KEYS.liveMusic },
  { label: 'Catering', pageKey: PAGE_KEYS.catering },
];

const SECONDARY_LINKS = [
  { label: 'About', pageKey: PAGE_KEYS.about },
  { label: 'Journal', pageKey: PAGE_KEYS.blog },
  { label: 'FAQ', pageKey: PAGE_KEYS.faq },
  { label: 'Contact', pageKey: PAGE_KEYS.contact },
  { label: 'Privacy Policy', pageKey: PAGE_KEYS.privacyPolicy },
];

export default function Navbar() {
  const restaurant = useSection('restaurant');
  const links = useSection('links');
  const { navigate, page, resolveHref } = useNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const useFloatingStyle = IMMERSIVE_PAGES.has(page);

  const handleHomeAnchor = (event, anchor) => {
    event.preventDefault();
    closeMenu();
    navigate(PAGE_KEYS.home, { anchor });
  };

  const handlePageLink = (event, pageKey) => {
    event.preventDefault();
    closeMenu();
    navigate(pageKey);
  };

  const isLinkActive = (link) => {
    if (link.pageKey) {
      return page === link.pageKey;
    }

    return false;
  };

  return (
    <header className={`navbar${scrolled || !useFloatingStyle ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--menu-open' : ''}`}>
      <div className="navbar__inner container">
        <a
          href={resolveHref(PAGE_KEYS.home)}
          className="navbar__logo"
          aria-label="Go to La Norma homepage"
          onClick={(event) => handlePageLink(event, PAGE_KEYS.home)}
        >
          <span className="navbar__logo-mark" aria-hidden="true">LN</span>
          <span className="navbar__logo-copy">{restaurant.name}</span>
        </a>

        <nav className="navbar__nav" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            link.pageKey ? (
              <a
                key={link.label}
                href={resolveHref(link.pageKey)}
                className={`navbar__link${isLinkActive(link) ? ' is-active' : ''}`}
                onClick={(event) => handlePageLink(event, link.pageKey)}
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={resolveHref(PAGE_KEYS.home, link.anchor)}
                className={`navbar__link${isLinkActive(link) ? ' is-active' : ''}`}
                onClick={(event) => handleHomeAnchor(event, link.anchor)}
              >
                {link.label}
              </a>
            )
          ))}
        </nav>

        <div className="navbar__actions" aria-label="Primary actions">
          <a
            href={links.menuPdf?.startsWith('#') ? resolveHref(PAGE_KEYS.home, links.menuPdf.slice(1)) : links.menuPdf}
            className="btn btn--outline-light navbar__action"
            onClick={(event) => {
              if (links.menuPdf?.startsWith('#')) {
                handleHomeAnchor(event, links.menuPdf.slice(1));
              }
            }}
          >
            View Menu
          </a>
          <a
            href={OPENTABLE_RESERVATION_URL}
            className="btn btn--primary navbar__action"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reserve Now
          </a>
        </div>

        <button
          className={`navbar__hamburger${menuOpen ? ' is-open' : ''}`}
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`navbar__mobile-menu${menuOpen ? ' is-open' : ''}`}
        id="mobile-nav"
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      >
        <div className="navbar__mobile-shell" onClick={(event) => event.stopPropagation()}>
          <div className="navbar__mobile-top">
            <div className="navbar__mobile-brand">
              <span className="navbar__mobile-brand-mark" aria-hidden="true">LN</span>
              <div>
                <p className="navbar__mobile-eyebrow">La Norma</p>
                <p className="navbar__mobile-kicker">Navigation</p>
              </div>
            </div>

            <button
              className="navbar__mobile-close"
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
            >
              <span />
              <span />
            </button>
          </div>

          <nav className="navbar__mobile-nav" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              link.pageKey ? (
                <a
                  key={link.label}
                  href={resolveHref(link.pageKey)}
                  className={`navbar__mobile-link${isLinkActive(link) ? ' is-active' : ''}`}
                  onClick={(event) => handlePageLink(event, link.pageKey)}
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.label}
                  href={resolveHref(PAGE_KEYS.home, link.anchor)}
                  className={`navbar__mobile-link${isLinkActive(link) ? ' is-active' : ''}`}
                  onClick={(event) => handleHomeAnchor(event, link.anchor)}
                >
                  {link.label}
                </a>
              )
            ))}

            {SECONDARY_LINKS.map((link) => (
              <a
                key={link.label}
                href={resolveHref(link.pageKey)}
                className="navbar__mobile-link navbar__mobile-link--subtle"
                onClick={(event) => handlePageLink(event, link.pageKey)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="navbar__mobile-ctas">
            <a
              href={resolveHref(PAGE_KEYS.home, 'reserve')}
              className="btn btn--outline-light"
              onClick={(event) => handleHomeAnchor(event, 'reserve')}
            >
              View dinner booking
            </a>
            <a
              href={OPENTABLE_RESERVATION_URL}
              className="btn btn--primary"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              Reserve on OpenTable
            </a>
          </div>

          <div className="navbar__mobile-meta">
            <p>{restaurant.hours}</p>
            <p>{restaurant.address}, {restaurant.city}</p>
            <a href={`tel:${restaurant.phone}`} className="navbar__mobile-phone" onClick={closeMenu}>
              {restaurant.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
