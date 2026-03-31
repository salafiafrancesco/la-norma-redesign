import { PAGE_KEYS } from '../../../shared/routes.js';
import { useSection } from '../../context/ContentContext';
import { useNavigation } from '../../context/NavigationContext';
import { useInView } from '../../hooks/useInView';
import './MenuHighlights.css';

export default function MenuHighlights({
  limitPerCategory = 3,
  showHeaderActions = true,
  showFooterNote = false,
}) {
  const menuHighlights = useSection('menuHighlights');
  const links = useSection('links');
  const { navigate } = useNavigation();
  const [ref, visible] = useInView();

  return (
    <section id="menu" className="menu-highlights" aria-labelledby="menu-heading">
      <div className="menu-highlights__header container">
        <div className={`menu-highlights__header-inner fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label menu-highlights__label">{menuHighlights.label}</p>
          <h2 id="menu-heading" className="menu-highlights__heading">
            {menuHighlights.headline}
          </h2>

          {showHeaderActions && (
            <div className="menu-highlights__header-actions">
              <button type="button" className="btn btn--outline-light menu-highlights__cta" onClick={() => navigate(PAGE_KEYS.menu)}>
                Browse the menu
              </button>
              <a href={links.reserve} className="btn btn--primary menu-highlights__cta">
                Reserve a table
              </a>
            </div>
          )}

          <div className="menu-highlights__rule" aria-hidden="true">
            <span />
            <span className="menu-highlights__rule-dot" />
            <span />
          </div>
        </div>
      </div>

      <div className="menu-highlights__body container">
        <div className="menu-highlights__grid">
          {menuHighlights.categories.map((category, index) => (
            <div
              key={category.name}
              className={`menu-col fade-up delay-${index + 1}${visible ? ' visible' : ''}`}
            >
              <header className="menu-col__header">
                <h3 className="menu-col__title">{category.name}</h3>
              </header>

              <ul className="menu-col__list">
                {(limitPerCategory > 0 ? category.items.slice(0, limitPerCategory) : category.items).map((item) => (
                  <li key={item.name} className="menu-item">
                    <div className="menu-item__row">
                      <span className="menu-item__name">{item.name}</span>
                      <span className="menu-item__price">{item.price}</span>
                    </div>
                    <p className="menu-item__desc">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`menu-highlights__footer fade-up delay-4${visible ? ' visible' : ''}`}>
          {showFooterNote && <p className="menu-highlights__note">{menuHighlights.note}</p>}

          <div className="menu-highlights__actions">
            {limitPerCategory > 0 && (
              <button type="button" className="btn btn--outline-light menu-highlights__cta" onClick={() => navigate(PAGE_KEYS.menu)}>
                View full menu
              </button>
            )}
            <a href={links.reserve} className="btn btn--primary menu-highlights__cta">
              Reserve a table
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
