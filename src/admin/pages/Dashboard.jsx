import { useEffect, useState } from 'react';
import { classes as classesApi, rsvp as rsvpApi } from '../api/client';

export default function Dashboard({ setPage }) {
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([classesApi.list(), rsvpApi.list()])
      .then(([cls, bookings]) => {
        const pending   = bookings.filter(r => r.status === 'pending').length;
        const confirmed = bookings.filter(r => r.status === 'confirmed').length;
        setStats({
          classes:   cls.length,
          rsvps:     bookings.length,
          pending,
          confirmed,
        });
        setRecent(bookings.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="adm-page-loader">
        <div className="adm-spinner" />
        Loading dashboard…
      </div>
    );
  }

  const quickLinks = [
    { label: 'Edit Hero & Story',  page: 'content',  icon: '✎' },
    { label: 'Manage Classes',      page: 'classes',  icon: '👨‍🍳' },
    { label: 'View RSVPs',          page: 'rsvp',     icon: '📋' },
    { label: 'Upload Images',       page: 'images',   icon: '🖼' },
  ];

  return (
    <>
      <h1 className="adm-section-title" style={{ marginBottom: '1.5rem' }}>
        Welcome back 👋
      </h1>

      {/* Stats */}
      <div className="adm-stats">
        <div className="adm-stat adm-stat--accent">
          <div className="adm-stat__value">{stats?.classes ?? '—'}</div>
          <div className="adm-stat__label">Upcoming Classes</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__value">{stats?.rsvps ?? '—'}</div>
          <div className="adm-stat__label">Total RSVPs</div>
        </div>
        <div className="adm-stat adm-stat--warn">
          <div className="adm-stat__value">{stats?.pending ?? '—'}</div>
          <div className="adm-stat__label">Pending</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__value">{stats?.confirmed ?? '—'}</div>
          <div className="adm-stat__label">Confirmed</div>
        </div>
      </div>

      {/* Quick links */}
      <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
        <div className="adm-card__title">Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {quickLinks.map(ql => (
            <button
              key={ql.page}
              className="adm-btn adm-btn--secondary"
              onClick={() => setPage(ql.page)}
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            >
              <span style={{ fontSize: '1.1rem' }}>{ql.icon}</span>
              {ql.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent RSVPs */}
      <div className="adm-card">
        <div className="adm-card__title">
          Recent RSVPs
          <span className="adm-card__title-meta">last 5</span>
        </div>
        {recent.length === 0 ? (
          <p className="adm-text-muted adm-text-sm">No RSVPs yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Email</th>
                  <th>Class Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id}>
                    <td>{r.first_name} {r.last_name}</td>
                    <td>{r.email}</td>
                    <td>{r.class_date ? formatDate(r.class_date) : '—'}</td>
                    <td>{r.guests}</td>
                    <td>
                      <span className={`adm-badge adm-badge--${r.status}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: '1rem' }}>
          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setPage('rsvp')}>
            View all RSVPs →
          </button>
        </div>
      </div>
    </>
  );
}

function formatDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
