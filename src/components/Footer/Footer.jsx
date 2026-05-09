import { useMemo, useState } from 'react';
import { PAGE_KEYS, resolveNavigationTarget } from '../../../shared/routes.js';
import { useNavigation } from '../../context/NavigationContext';
import { useSection } from '../../context/ContentContext';
import { useSiteNavigation } from '../../hooks/useSiteNavigation';
import API_BASE from '../../config/api';
import './Footer.css';

const FOOTER_COLUMNS_FALLBACK = [
  {
    label: 'About',
    links: [
      { label: 'Our story', page_key: PAGE_KEYS.about },
      { label: 'Journal', page_key: PAGE_KEYS.blog },
      { label: 'Private events', page_key: PAGE_KEYS.privateEvents },
      { label: 'Contact', page_key: PAGE_KEYS.contact },
    ],
  },
  {
    label: 'Experiences',
    links: [
      { label: 'Wine tastings', page_key: PAGE_KEYS.wineTastings },
      { label: 'Cooking classes', page_key: PAGE_KEYS.cookingClasses },
      { label: 'Live music', page_key: PAGE_KEYS.liveMusic },
      { label: 'Catering', page_key: PAGE_KEYS.catering },
    ],
  },
];

export default function Footer() {
  const restaurant = useSection('restaurant');
  const footerNav = useSection('footerNav');
  const { navigate, navigatePath, resolveHref } = useNavigation();
  const { footerColumns, footerColumnLinks, loaded: navLoaded } = useSiteNavigation();
  const currentYear = new Date().getFullYear();

  const columns = useMemo(() => {
    if (!navLoaded || footerColumns.length === 0) return FOOTER_COLUMNS_FALLBACK;
    return footerColumns
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((col) => ({
        label: col.label,
        links: footerColumnLinks
          .filter((l) => l.column_id === col.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      }));
  }, [footerColumns, footerColumnLinks, navLoaded]);

  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState('');

  const normalizeInternalHref = (href) => {
    const destination = resolveNavigationTarget(href);
    return destination.isInternal ? destination.href : href;
  };

  const handleNavClick = (event, href) => {
    if (!href) return;
    const destination = resolveNavigationTarget(href);
    if (destination.isInternal) {
      event.preventDefault();
      navigatePath(destination.href);
    }
  };

  const handleNewsletter = async (event) => {
    event.preventDefault();
    if (!nlEmail.trim() || nlStatus === 'sending') return;
    setNlStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/homepage-content/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail.trim() }),
      });
      if (!res.ok) throw new Error();
      setNlStatus('done');
      setNlEmail('');
    } catch {
      setNlStatus('error');
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__top container">
        <p className="footer__eyebrow-line">La Norma Hospitality &middot; Longboat Key</p>

        <div className="footer__grid">
          <section className="footer__panel">
            <p className="footer__panel-label">Visit</p>
            <address className="footer__address">
              <p>{restaurant.address}</p>
              <p>{restaurant.city}, {restaurant.state} {restaurant.zip}</p>
            </address>
            <a href={`tel:${restaurant.phone}`} className="footer__text-link">
              {restaurant.phone}
            </a>
            <a
              href={restaurant.mapEmbedUrl}
              className="footer__text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
            </a>
            <p className="footer__hours-note">{restaurant.hours}</p>
          </section>

          {columns.map((col) => (
            <section key={col.label} className="footer__panel">
              <p className="footer__panel-label">{col.label}</p>
              <ul className="footer__nav-list">
                {col.links.map((l, idx) => {
                  const key = `${col.label}-${l.page_key || l.href || idx}`;
                  const href = l.page_key ? resolveHref(l.page_key) : (l.href || '#');
                  const isExternal = !l.page_key && /^https?:/i.test(l.href || '');
                  return (
                    <li key={key}>
                      <a
                        href={href}
                        className="footer__text-link"
                        target={l.target || (isExternal ? '_blank' : undefined)}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          if (l.page_key) {
                            e.preventDefault();
                            navigate(l.page_key);
                          } else if (!isExternal && l.href) {
                            e.preventDefault();
                            navigatePath(l.href);
                          }
                        }}
                      >
                        {l.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <section className="footer__panel">
            <p className="footer__panel-label">Follow</p>
            <div className="footer__social">
              {Object.entries(restaurant.social || {}).map(([platform, url]) => (
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

        <section className="footer__newsletter" aria-labelledby="footer-newsletter-heading">
          <div className="footer__newsletter-copy">
            <p className="footer__panel-label" id="footer-newsletter-heading">Newsletter</p>
            <p className="footer__newsletter-tag">News from the kitchen. About monthly, never noise.</p>
          </div>
          <form className="footer__newsletter-form" onSubmit={handleNewsletter}>
            <label className="sr-only" htmlFor="footer-newsletter-email">Email address</label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              placeholder="your@email.com"
              value={nlEmail}
              onChange={(e) => setNlEmail(e.target.value)}
              disabled={nlStatus === 'sending' || nlStatus === 'done'}
            />
            <button type="submit" className="btn btn--primary" disabled={nlStatus === 'sending' || nlStatus === 'done'}>
              {nlStatus === 'sending' ? 'Subscribing…' : nlStatus === 'done' ? 'Subscribed' : 'Subscribe'}
            </button>
          </form>
          {nlStatus === 'error' && (
            <p className="footer__newsletter-msg footer__newsletter-msg--error">
              Something went wrong. Please try again.
            </p>
          )}
          {nlStatus === 'done' && (
            <p className="footer__newsletter-msg footer__newsletter-msg--ok">
              Thanks — see you in the inbox.
            </p>
          )}
        </section>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__legal">
            &copy; {currentYear} La Norma Ristorante &amp; Pizzeria. All rights reserved.
          </p>
          <div className="footer__legal-links">
            <button
              className="footer__legal-button"
              type="button"
              onClick={() => navigate(PAGE_KEYS.privacyPolicy)}
            >
              Privacy
            </button>
            <button
              className="footer__legal-button"
              type="button"
              onClick={() => navigate(PAGE_KEYS.contact)}
            >
              Accessibility
            </button>
            {footerNav?.length > 0 && (
              <a
                href={normalizeInternalHref(footerNav[0]?.href || '/')}
                className="footer__legal-button"
                onClick={(e) => handleNavClick(e, footerNav[0]?.href)}
              >
                Sitemap
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
