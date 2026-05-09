import { useEffect, useState } from 'react';
import {
  blog as blogApi,
  bookings as bookingsApi,
  experienceEvents as eventsApi,
  inquiries as inquiriesApi,
  homepageContent as homepageContentApi,
} from '../api/client';

export default function Dashboard({ setPage }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      blogApi.listWithMeta(),
      bookingsApi.list(),
      eventsApi.listWithMeta(),
      inquiriesApi.list(),
      homepageContentApi.listSubscribers(),
    ])
      .then(([blogResult, bookingsResult, eventsResult, inquiriesResult, subscribersResult]) => {
        if (cancelled) return;

        const nextNotices = [];
        const blogPosts = blogResult.status === 'fulfilled' ? blogResult.value.items : [];
        const bookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : [];
        const events = eventsResult.status === 'fulfilled' ? eventsResult.value.items : [];
        const inquiries = inquiriesResult.status === 'fulfilled' ? inquiriesResult.value : [];
        const subscribers = subscribersResult.status === 'fulfilled' ? subscribersResult.value : [];

        if (blogResult.status === 'rejected') {
          nextNotices.push(`Journal posts could not be loaded: ${blogResult.reason.message}`);
        }
        if (bookingsResult.status === 'rejected') {
          nextNotices.push(`Bookings could not be loaded: ${bookingsResult.reason.message}`);
        }
        if (eventsResult.status === 'rejected') {
          nextNotices.push(`Events could not be loaded: ${eventsResult.reason.message}`);
        }
        if (inquiriesResult.status === 'rejected') {
          nextNotices.push(`Inquiries could not be loaded: ${inquiriesResult.reason.message}`);
        }
        if (subscribersResult.status === 'rejected') {
          nextNotices.push(`Newsletter subscribers could not be loaded: ${subscribersResult.reason.message}`);
        }

        setStats({
          posts: blogPosts.length,
          publishedPosts:
            blogResult.status === 'fulfilled' && blogResult.value.source === 'admin'
              ? blogPosts.filter((entry) => entry.status === 'published').length
              : blogPosts.length,
          bookings: bookings.length,
          pendingBookings: bookings.filter((entry) => entry.status === 'pending').length,
          events: events.length,
          inquiries: inquiries.length,
          newInquiries: inquiries.filter((entry) => entry.status === 'new').length,
          subscribers: subscribers.length,
        });
        setRecentBookings(bookings.slice(0, 5));
        setRecentInquiries(inquiries.slice(0, 5));
        setNotices(nextNotices);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="adm-page-loader">
        <div className="adm-spinner" />
        Loading dashboard...
      </div>
    );
  }

  const quickLinks = [
    { label: 'Edit homepage content', page: 'homepage' },
    { label: 'Manage journal posts', page: 'blog' },
    { label: 'Review bookings', page: 'experiences' },
    { label: 'Answer inquiries', page: 'inquiries' },
    { label: 'Newsletter subscribers', page: 'newsletter' },
    { label: 'Catering requests', page: 'catering' },
  ];

  return (
    <>
      {notices.map((notice) => (
        <div key={notice} className="adm-alert adm-alert--info">{notice}</div>
      ))}

      <h1 className="adm-section-title" style={{ marginBottom: '1.5rem' }}>
        Daily overview
      </h1>

      <div className="adm-stats">
        <StatCard label="Journal posts" value={stats.posts} accent />
        <StatCard label="Published posts" value={stats.publishedPosts} />
        <StatCard label="Total bookings" value={stats.bookings} accent />
        <StatCard label="Pending bookings" value={stats.pendingBookings} warn />
        <StatCard label="Upcoming events" value={stats.events} />
        <StatCard label="Total inquiries" value={stats.inquiries} />
        <StatCard label="New inquiries" value={stats.newInquiries} danger />
        <StatCard label="Newsletter subscribers" value={stats.subscribers} />
      </div>

      <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
        <div className="adm-card__title">Quick actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {quickLinks.map((link) => (
            <button
              key={link.page}
              className="adm-btn adm-btn--secondary"
              type="button"
              onClick={() => setPage(link.page)}
              style={{ justifyContent: 'flex-start', padding: '0.8rem 1rem' }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
        <div className="adm-card__title">
          Recent bookings
          <span className="adm-card__title-meta">latest five</span>
        </div>
        {recentBookings.length === 0 ? (
          <p className="adm-text-muted adm-text-sm">No bookings yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Experience</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.customer_name || '—'}</td>
                    <td>{entry.experience_events?.title || 'General booking'}</td>
                    <td>{entry.guests}</td>
                    <td>
                      <span className={`adm-badge adm-badge--${entry.status}`}>{entry.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-card">
        <div className="adm-card__title">
          Recent inquiries
          <span className="adm-card__title-meta">latest five</span>
        </div>
        {recentInquiries.length === 0 ? (
          <p className="adm-text-muted adm-text-sm">No inquiries yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.first_name} {entry.last_name}</td>
                    <td>{formatType(entry.type)}</td>
                    <td>{entry.date || 'Flexible'}</td>
                    <td>
                      <span className={`adm-badge adm-badge--${entry.status}`}>{entry.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, accent = false, warn = false, danger = false }) {
  const modifiers = [
    accent ? 'adm-stat--accent' : '',
    warn ? 'adm-stat--warn' : '',
    danger ? 'adm-stat--danger' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`adm-stat ${modifiers}`.trim()}>
      <div className="adm-stat__value">{value}</div>
      <div className="adm-stat__label">{label}</div>
    </div>
  );
}

function formatType(type) {
  return (type || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
