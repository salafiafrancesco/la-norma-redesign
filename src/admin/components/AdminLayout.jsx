import { useAdmin } from '../context/AdminContext';

const NAV = [
  { key: 'dashboard', icon: 'DB', label: 'Dashboard' },
  { key: 'content', icon: 'CMS', label: 'Site Content', group: 'Content' },
  { key: 'blog', icon: 'JRN', label: 'Journal' },
  { key: 'classes', icon: 'CLS', label: 'Cooking Classes' },
  { key: 'rsvp', icon: 'RSVP', label: 'Bookings' },
  { key: 'events', icon: 'EVT', label: 'Events', group: 'Experiences' },
  { key: 'inquiries', icon: 'INQ', label: 'Inquiries' },
  { key: 'images', icon: 'IMG', label: 'Images', group: 'Assets' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  content: 'Site Content',
  blog: 'Journal',
  classes: 'Cooking Classes',
  rsvp: 'RSVPs & Bookings',
  events: 'Events',
  inquiries: 'Inquiries',
  images: 'Image Library',
};

export default function AdminLayout({ page, setPage, children }) {
  const { admin, logout } = useAdmin();

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <div className="adm-sidebar__brand-name">La Norma</div>
          <div className="adm-sidebar__brand-tag">Operations Console</div>
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
          <strong>{admin?.username}</strong>
          <button className="adm-logout-btn" type="button" onClick={logout}>
            Sign out
          </button>
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
            style={{ fontSize: '0.8125rem', color: 'var(--adm-muted)', textDecoration: 'none' }}
          >
            View public site
          </a>
        </div>

        <div className="adm-page">{children}</div>
      </main>
    </div>
  );
}
