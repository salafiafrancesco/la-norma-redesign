import { useAdmin } from '../context/AdminContext';

const NAV = [
  { key: 'dashboard', icon: '\u25A6', label: 'Dashboard' },
  { key: 'homepage',  icon: '\u2302', label: 'Homepage', group: 'Content' },
  { key: 'menu',      icon: '\u2634', label: 'Menu' },
  { key: 'content',   icon: '\u270E', label: 'Site Content' },
  { key: 'navigation', icon: '\u2630', label: 'Navigation' },
  { key: 'footer',    icon: '\u25A1', label: 'Footer' },
  { key: 'blog',      icon: '\u2756', label: 'Journal' },
  { key: 'experiences', icon: '\u2726', label: 'Experiences', group: 'Experiences' },
  { key: 'classes',   icon: '\u2605', label: 'Cooking Classes (legacy)' },
  { key: 'rsvp',      icon: '\u2713', label: 'RSVPs (legacy)' },
  { key: 'events',    icon: '\u266B', label: 'Events (legacy)' },
  { key: 'catering',  icon: '\u2615', label: 'Catering' },
  { key: 'inquiries', icon: '\u2709', label: 'Inquiries' },
  { key: 'images',    icon: '\u25A3', label: 'Images', group: 'Assets' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  homepage: 'Homepage',
  menu: 'Menu',
  content: 'Site Content',
  navigation: 'Navigation',
  footer: 'Footer',
  blog: 'Journal',
  classes: 'Cooking Classes',
  rsvp: 'RSVPs & Bookings',
  experiences: 'Experiences',
  events: 'Events (legacy)',
  catering: 'Catering',
  inquiries: 'Inquiries',
  images: 'Image Library',
};

export default function AdminLayout({ page, setPage, children }) {
  const { admin, logout } = useAdmin();
  const initial = admin?.username?.charAt(0) || 'A';

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <div className="adm-sidebar__dots" aria-hidden="true">
            <span className="adm-sidebar__dot adm-sidebar__dot--red" />
            <span className="adm-sidebar__dot adm-sidebar__dot--yellow" />
            <span className="adm-sidebar__dot adm-sidebar__dot--green" />
          </div>
          <div className="adm-sidebar__brand-text">
            <div className="adm-sidebar__brand-name">La Norma</div>
            <div className="adm-sidebar__brand-tag">Admin Console</div>
          </div>
        </div>

        <nav aria-label="Admin navigation">
          {NAV.map((item) => (
            <div key={item.key}>
              {item.group && <div className="adm-sidebar__label">{item.group}</div>}
              <ul className="adm-nav">
                <li className="adm-nav__item">
                  <button
                    className={`adm-nav__link${page === item.key ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => setPage(item.key)}
                  >
                    <span className="adm-nav__icon">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              </ul>
            </div>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <div className="adm-sidebar__avatar">{initial}</div>
          <div className="adm-sidebar__user-info">
            <div className="adm-sidebar__user-name">{admin?.username}</div>
            <button className="adm-logout-btn" type="button" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <span className="adm-topbar__title">{PAGE_TITLES[page] || ''}</span>
          <span className="adm-topbar__spacer" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="adm-topbar__link"
          >
            View site &rarr;
          </a>
        </div>

        <div className="adm-page">{children}</div>
      </main>
    </div>
  );
}
