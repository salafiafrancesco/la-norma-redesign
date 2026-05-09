import { useEffect, useRef, useState } from 'react';
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
  {
    label: 'Experiences',
    dropdown: [
      { label: 'Cooking Classes', pageKey: PAGE_KEYS.cookingClasses },
      { label: 'Wine Tastings', pageKey: PAGE_KEYS.wineTastings },
      { label: 'Live Music', pageKey: PAGE_KEYS.liveMusic },
    ],
  },
  { label: 'Catering', pageKey: PAGE_KEYS.catering },
];

const SECONDARY_LINKS = [
  { label: 'About', pageKey: PAGE_KEYS.about },
  { label: 'Journal', pageKey: PAGE_KEYS.blog },
  { label: 'FAQ', pageKey: PAGE_KEYS.faq },
  { label: 'Contact', pageKey: PAGE_KEYS.contact },
  { label: 'Privacy Policy', pageKey: PAGE_KEYS.privacyPolicy },
];

const MOBILE_PRIMARY = [
  { label: 'Home', pageKey: PAGE_KEYS.home },
  { label: 'Menu', pageKey: PAGE_KEYS.menu },
  { label: 'Catering', pageKey: PAGE_KEYS.catering },
];

const MOBILE_EXPERIENCES = [
  { label: 'Cooking Classes', pageKey: PAGE_KEYS.cookingClasses },
  { label: 'Wine Tastings', pageKey: PAGE_KEYS.wineTastings },
  { label: 'Live Music', pageKey: PAGE_KEYS.liveMusic },
];

const MOBILE_SECONDARY = [
  { label: 'About', pageKey: PAGE_KEYS.about },
  { label: 'Journal', pageKey: PAGE_KEYS.blog },
  { label: 'Contact', pageKey: PAGE_KEYS.contact },
];

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const restaurant = useSection('restaurant');
  const links = useSection('links');
  const { navigate, page, resolveHref } = useNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock + ESC + focus trap while drawer open
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const drawer = drawerRef.current;
    const focusables = drawer
      ? Array.from(drawer.querySelectorAll(FOCUSABLE_SELECTOR))
      : [];
    focusables[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !drawer) return;

      const items = Array.from(drawer.querySelectorAll(FOCUSABLE_SELECTOR));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      hamburgerRef.current?.focus();
    };
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
    if (link.pageKey) return page === link.pageKey;
    if (link.dropdown) return link.dropdown.some((sub) => page === sub.pageKey);
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
            link.dropdown ? (
              <div key={link.label} className={`navbar__dropdown${isLinkActive(link) ? ' is-active' : ''}`}>
                <button type="button" className="navbar__link navbar__link--dropdown">
                  {link.label}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className="navbar__dropdown-menu">
                  {link.dropdown.map((sub) => (
                    <a
                      key={sub.label}
                      href={resolveHref(sub.pageKey)}
                      className={`navbar__dropdown-item${page === sub.pageKey ? ' is-active' : ''}`}
                      onClick={(event) => handlePageLink(event, sub.pageKey)}
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : link.pageKey ? (
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
          ref={hamburgerRef}
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
        <div
          className="navbar__mobile-shell"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="navbar__mobile-top">
            <span className="navbar__mobile-brand-label">{restaurant.name}</span>
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
            <div className="navbar__mobile-group">
              {MOBILE_PRIMARY.map((link) => (
                <a
                  key={link.label}
                  href={resolveHref(link.pageKey)}
                  className={`navbar__mobile-link${page === link.pageKey ? ' is-active' : ''}`}
                  onClick={(event) => handlePageLink(event, link.pageKey)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="navbar__mobile-group">
              <span className="navbar__mobile-group-label">Experiences</span>
              {MOBILE_EXPERIENCES.map((link) => (
                <a
                  key={link.label}
                  href={resolveHref(link.pageKey)}
                  className={`navbar__mobile-link navbar__mobile-link--sub${page === link.pageKey ? ' is-active' : ''}`}
                  onClick={(event) => handlePageLink(event, link.pageKey)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="navbar__mobile-group">
              {MOBILE_SECONDARY.map((link) => (
                <a
                  key={link.label}
                  href={resolveHref(link.pageKey)}
                  className={`navbar__mobile-link${page === link.pageKey ? ' is-active' : ''}`}
                  onClick={(event) => handlePageLink(event, link.pageKey)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="navbar__mobile-footer">
            <a
              href={OPENTABLE_RESERVATION_URL}
              className="btn btn--primary navbar__mobile-reserve"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              Reserve a table
            </a>
            <div className="navbar__mobile-contact">
              <a
                href={`tel:${restaurant.phone}`}
                className="navbar__mobile-phone"
                onClick={closeMenu}
              >
                {restaurant.phone}
              </a>
              <span className="navbar__mobile-hours">{restaurant.hours}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
