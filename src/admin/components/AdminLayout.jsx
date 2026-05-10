import { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';

const NAV = [
  { key: 'dashboard', icon: '▦', label: 'Dashboard' },
  { key: 'homepage',  icon: '⌂', label: 'Homepage', group: 'Content' },
  { key: 'menu',      icon: '☴', label: 'Menu' },
  { key: 'content',   icon: '✎', label: 'Site Content' },
  { key: 'navigation', icon: '☰', label: 'Navigation' },
  { key: 'footer',    icon: '□', label: 'Footer' },
  { key: 'blog',      icon: '❖', label: 'Journal' },
  { key: 'experiences', icon: '✦', label: 'Experiences', group: 'Experiences' },
  { key: 'catering',  icon: '☕', label: 'Catering' },
  { key: 'inquiries', icon: '✉', label: 'Inquiries', group: 'Leads' },
  { key: 'newsletter', icon: '✆', label: 'Newsletter' },
  { key: 'images',    icon: '▣', label: 'Images', group: 'Assets' },
  { key: 'theme',     icon: '◐', label: 'Theme & Colors' },
  { key: 'auditlog',  icon: '⌧', label: 'Audit Log', group: 'System' },
  { key: 'account',   icon: '☂', label: 'Account & Security' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  homepage: 'Homepage',
  menu: 'Menu',
  content: 'Site Content',
  navigation: 'Navigation',
  footer: 'Footer',
  blog: 'Journal',
  experiences: 'Experiences',
  catering: 'Catering',
  inquiries: 'Inquiries',
  newsletter: 'Newsletter Subscribers',
  images: 'Image Library',
  theme: 'Theme & Colors',
  auditlog: 'Audit Log',
  account: 'Account & Security',
};

const NOTIFICATION_KEYS = new Set(['inquiries', 'catering', 'newsletter', 'experiences']);

function formatBadge(count) {
  if (count > 99) return '99+';
  return String(count);
}

export default function AdminLayout({ page, setPage, children }) {
  const { admin, logout, notifications, notificationsLoading, refreshNotifications, markTabSeen } = useAdmin();
  const initial = admin?.username?.charAt(0) || 'A';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNav = (key) => {
    setPage(key);
    setSidebarOpen(false);
    if (NOTIFICATION_KEYS.has(key)) {
      markTabSeen(key);
    }
  };

  // Lock body scroll while the mobile sidebar is open.
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [sidebarOpen]);

  const totalUnread = (notifications?.inquiries || 0)
    + (notifications?.catering || 0)
    + (notifications?.newsletter || 0)
    + (notifications?.experiences || 0);

  return (
    <div className="adm-shell">
      <aside className={`adm-sidebar${sidebarOpen ? ' is-open' : ''}`}>
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
          {NAV.map((item) => {
            const count = NOTIFICATION_KEYS.has(item.key) ? (notifications?.[item.key] || 0) : 0;
            return (
              <div key={item.key}>
                {item.group && <div className="adm-sidebar__label">{item.group}</div>}
                <ul className="adm-nav">
                  <li className="adm-nav__item">
                    <button
                      className={`adm-nav__link${page === item.key ? ' is-active' : ''}`}
                      type="button"
                      onClick={() => handleNav(item.key)}
                    >
                      <span className="adm-nav__icon">{item.icon}</span>
                      <span className="adm-nav__label">{item.label}</span>
                      {count > 0 && (
                        <span
                          className="adm-nav__badge"
                          aria-label={`${count} ${count === 1 ? 'item' : 'items'} to review`}
                        >
                          {formatBadge(count)}
                        </span>
                      )}
                    </button>
                  </li>
                </ul>
              </div>
            );
          })}
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

      {sidebarOpen && (
        <div
          className="adm-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="adm-main">
        <div className="adm-topbar">
          <button
            type="button"
            className="adm-topbar__burger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <span className="adm-topbar__title">{PAGE_TITLES[page] || ''}</span>
          <span className="adm-topbar__spacer" />
          <button
            type="button"
            className={`adm-topbar__refresh${notificationsLoading ? ' is-loading' : ''}`}
            onClick={() => refreshNotifications()}
            disabled={notificationsLoading}
            aria-label={`Refresh notifications${totalUnread ? ` (${totalUnread} pending)` : ''}`}
            title="Refresh notifications"
          >
            <span aria-hidden="true">{'⟳'}</span>
          </button>
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
