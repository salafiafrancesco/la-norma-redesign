import { useSection } from '../../context/ContentContext';
import { useInView } from '../../hooks/useInView';
import './MenuHighlights.css';

export default function MenuHighlights() {
  const menuHighlights = useSection('menuHighlights');
  const links          = useSection('links');
  const [ref, visible] = useInView();

  return (
    <section id="menu" className="menu-highlights" aria-labelledby="menu-heading">

      {/* Section header — centered, editorial */}
      <div className="menu-highlights__header container">
        <div className={`menu-highlights__header-inner fade-up${visible ? ' visible' : ''}`} ref={ref}>
          <p className="section-label menu-highlights__label">{menuHighlights.label}</p>
          <h2 id="menu-heading" className="menu-highlights__heading">
            <em>Honest Ingredients.</em><br />
            Unforgettable Flavors.
          </h2>
          <div className="menu-highlights__rule" aria-hidden="true">
            <span /><span className="menu-highlights__rule-dot" /><span />
          </div>
        </div>
      </div>

      {/* Menu body */}
      <div className="menu-highlights__body container">
        <div className="menu-highlights__grid">
          {menuHighlights.categories.map((cat, ci) => (
            <div
              key={cat.name}
              className={`menu-col fade-up delay-${ci + 1}${visible ? ' visible' : ''}`}
            >
              <header className="menu-col__header">
                <h3 className="menu-col__title">{cat.name}</h3>
              </header>
              <ul className="menu-col__list">
                {cat.items.map((item) => (
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
          <p className="menu-highlights__note">{menuHighlights.note}</p>
          <a href={links.menuPdf} className="btn btn--outline-light menu-highlights__cta">
            View Full Menu
          </a>
        </div>
      </div>

    </section>
  );
}
