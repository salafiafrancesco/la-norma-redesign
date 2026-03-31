import { useEffect, useState } from 'react';
import {
  blog as blogApi,
  classes as classesApi,
  events as eventsApi,
  inquiries as inquiriesApi,
  rsvp as rsvpApi,
} from '../api/client';

export default function Dashboard({ setPage }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentRsvps, setRecentRsvps] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      classesApi.listWithMeta(),
      blogApi.listWithMeta(),
      rsvpApi.list(),
      eventsApi.listWithMeta(),
      inquiriesApi.list(),
    ])
      .then(([classesResult, blogResult, rsvpResult, eventsResult, inquiriesResult]) => {
        if (cancelled) return;

        const nextNotices = [];
        const classes = classesResult.status === 'fulfilled' ? classesResult.value.items : [];
        const blogPosts = blogResult.status === 'fulfilled' ? blogResult.value.items : [];
        const rsvps = rsvpResult.status === 'fulfilled' ? rsvpResult.value : [];
        const events = eventsResult.status === 'fulfilled' ? eventsResult.value.items : [];
        const inquiries = inquiriesResult.status === 'fulfilled' ? inquiriesResult.value : [];

        if (classesResult.status === 'rejected') {
          nextNotices.push(`Cooking classes could not be loaded: ${classesResult.reason.message}`);
        }

        if (blogResult.status === 'rejected') {
          nextNotices.push(`Journal posts could not be loaded: ${blogResult.reason.message}`);
        }

        if (eventsResult.status === 'rejected') {
          nextNotices.push(`Events could not be loaded: ${eventsResult.reason.message}`);
        }

        if (rsvpResult.status === 'rejected') {
          nextNotices.push(`RSVP data could not be loaded: ${rsvpResult.reason.message}`);
        }

        if (inquiriesResult.status === 'rejected') {
          nextNotices.push(`Inquiries could not be loaded: ${inquiriesResult.reason.message}`);
        }

        setStats({
          posts: blogPosts.length,
          publishedPosts:
            blogResult.status === 'fulfilled' && blogResult.value.source === 'admin'
              ? blogPosts.filter((entry) => entry.status === 'published').length
              : blogPosts.length,
          classes: classes.length,
          rsvps: rsvps.length,
          pendingRsvps: rsvps.filter((entry) => entry.status === 'pending').length,
          events: events.length,
          inquiries: inquiries.length,
          newInquiries: inquiries.filter((entry) => entry.status === 'new').length,
        });
        setRecentRsvps(rsvps.slice(0, 5));
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
    { label: 'Edit homepage content', page: 'content' },
    { label: 'Manage journal posts', page: 'blog' },
    { label: 'Manage cooking classes', page: 'classes' },
    { label: 'Review RSVPs', page: 'rsvp' },
    { label: 'Manage events', page: 'events' },
    { label: 'Answer inquiries', page: 'inquiries' },
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
        <StatCard label="Upcoming classes" value={stats.classes} accent />
        <StatCard label="Total RSVPs" value={stats.rsvps} />
        <StatCard label="Pending RSVPs" value={stats.pendingRsvps} warn />
        <StatCard label="Upcoming events" value={stats.events} />
        <StatCard label="Total inquiries" value={stats.inquiries} />
        <StatCard label="New inquiries" value={stats.newInquiries} danger />
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
          Recent RSVPs
          <span className="adm-card__title-meta">latest five</span>
        </div>
        {recentRsvps.length === 0 ? (
          <p className="adm-text-muted adm-text-sm">No RSVPs yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Class</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRsvps.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.first_name} {entry.last_name}</td>
                    <td>{entry.class_theme || 'General request'}</td>
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
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
