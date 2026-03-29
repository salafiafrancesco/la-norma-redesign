import { useState, useEffect } from 'react';
import { useSection } from '../../context/ContentContext';
import { useNavigation } from '../../context/NavigationContext';
import './Navbar.css';

export default function Navbar() {
  const restaurant = useSection('restaurant');
  const links      = useSection('links');

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { navigate } = useNavigation();

  const navLinks = [
    { label: 'Menu',        href: links.menuPdf },
    { label: 'Experiences', href: '#experiences' },
    { label: 'About',       href: '#story' },
    { label: 'Visit Us',    href: '#visit' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const goToClasses = (e) => {
    e.preventDefault();
    close();
    navigate('cooking-classes');
  };

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="banner">
      <div className="navbar__inner container--wide container">

        {/* Logo */}
        <a href="/" className="navbar__logo" aria-label="La Norma — Home" onClick={close}>
          <span className="navbar__logo-name">{restaurant.name}</span>
          <span className="navbar__logo-tag">{restaurant.tagline}</span>
        </a>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
          <a href="#cooking-classes" className="navbar__link navbar__link--highlight" onClick={goToClasses}>
            Cooking Classes
          </a>
        </nav>

        {/* Desktop CTAs */}
        <div className="navbar__ctas">
          <a href={links.reserve} className="btn btn--outline-light navbar__btn-reserve">
            Reserve
          </a>
          <a href={links.menuPdf} className="btn btn--primary navbar__btn-menu">
            View Menu
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile overlay */}
      <div className={`navbar__mobile-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="navbar__mobile-link" onClick={close}>
              {link.label}
            </a>
          ))}
          <a href="#cooking-classes" className="navbar__mobile-link navbar__mobile-link--gold" onClick={goToClasses}>
            Cooking Classes
          </a>
        </nav>
        <div className="navbar__mobile-ctas">
          <a href={links.reserve} className="btn btn--primary" onClick={close}>
            Reserve a Table
          </a>
          <a href={links.menuPdf} className="btn btn--outline-light" onClick={close}>
            View Menu
          </a>
          <a href={links.orderDelivery} className="btn btn--outline-light" onClick={close}>
            Order Online
          </a>
        </div>
        <p className="navbar__mobile-hours">{restaurant.hours}</p>
      </div>
    </header>
  );
}
