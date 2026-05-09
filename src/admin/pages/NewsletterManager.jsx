import { useEffect, useMemo, useState } from 'react';
import { homepageContent as homepageContentApi } from '../api/client';

function downloadCsv(filename, rows) {
  const header = 'email,subscribed_at,source';
  const escape = (value) => {
    const v = value == null ? '' : String(value);
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  };
  const body = rows
    .map((row) => [escape(row.email), escape(row.subscribed_at || ''), escape(row.source || '')].join(','))
    .join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDate(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function NewsletterManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    homepageContentApi
      .listSubscribers()
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Unable to load subscribers.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) =>
        (row.email || '').toLowerCase().includes(q) ||
        (row.source || '').toLowerCase().includes(q),
    );
  }, [items, search]);

  if (loading) {
    return (
      <div className="adm-page-loader">
        <div className="adm-spinner" />
        Loading subscribers…
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="adm-section-title" style={{ margin: 0 }}>Newsletter subscribers</h1>
          <p className="adm-text-muted adm-text-sm" style={{ margin: '0.2rem 0 0' }}>
            {items.length} active {items.length === 1 ? 'subscriber' : 'subscribers'} · captured from the homepage footer form
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <input
            type="search"
            className="adm-input"
            placeholder="Search email or source"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: '16rem' }}
          />
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            disabled={items.length === 0}
            onClick={() => downloadCsv(`newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`, filtered)}
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {filtered.length === 0 ? (
        <div className="adm-card">
          <p className="adm-text-muted" style={{ margin: 0 }}>
            {items.length === 0
              ? 'No subscribers yet. Once visitors sign up via the footer form, they will appear here.'
              : 'No subscribers match the current search.'}
          </p>
        </div>
      ) : (
        <div className="adm-card adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Email</th>
                <th>Subscribed</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id || row.email}>
                  <td>
                    <a
                      href={`mailto:${row.email}`}
                      style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="adm-text-sm adm-text-muted">{formatDate(row.subscribed_at)}</td>
                  <td className="adm-text-sm adm-text-muted">{row.source || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
