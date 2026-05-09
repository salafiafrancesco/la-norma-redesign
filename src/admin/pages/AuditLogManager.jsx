import { useEffect, useMemo, useState } from 'react';
import { auditLog as auditLogApi } from '../api/client';

const METHOD_COLORS = {
  POST:   { color: '#0369a1', bg: '#e0f2fe' },
  PUT:    { color: '#b45309', bg: '#fef3c7' },
  PATCH:  { color: '#b45309', bg: '#fef3c7' },
  DELETE: { color: '#dc2626', bg: '#fee2e2' },
};

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return iso;
  }
}

function statusColor(code) {
  if (!code) return '#6B7280';
  if (code >= 500) return '#dc2626';
  if (code >= 400) return '#b45309';
  if (code >= 300) return '#0369a1';
  return '#16a34a';
}

export default function AuditLogManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = {};
    if (methodFilter) params.method = methodFilter;
    auditLogApi.list(params)
      .then((data) => { if (!cancelled) setItems(Array.isArray(data) ? data : []); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [methodFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) =>
        (row.path || '').toLowerCase().includes(q) ||
        (row.username || '').toLowerCase().includes(q) ||
        (row.body_summary || '').toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h1 className="adm-section-title" style={{ margin: 0 }}>Audit log</h1>
          <p className="adm-text-muted adm-text-sm" style={{ margin: '0.2rem 0 0' }}>
            Latest {items.length} {items.length === 1 ? 'entry' : 'entries'}. Logged: any non-GET admin request.
          </p>
        </div>
        <div className="adm-flex adm-gap-2" style={{ flexWrap: 'wrap' }}>
          <select
            className="adm-select"
            style={{ width: 'auto', minWidth: 130 }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="">All methods</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input
            type="search"
            className="adm-input"
            placeholder="Search path / user / body"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />
        </div>
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <p className="adm-text-muted" style={{ margin: '1.5rem', textAlign: 'center' }}>
            {items.length === 0 ? 'No audit entries yet.' : 'No entries match the current filter.'}
          </p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>User</th>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const m = METHOD_COLORS[row.method] || { color: '#374151', bg: '#e5e7eb' };
                  return (
                    <tr key={row.id} style={{ cursor: row.body_summary ? 'pointer' : 'default' }} onClick={() => row.body_summary && setDetail(row)}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{formatDateTime(row.created_at)}</td>
                      <td>{row.username || '—'}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
                          color: m.color, background: m.bg,
                        }}>{row.method}</span>
                      </td>
                      <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '0.8125rem', wordBreak: 'break-all' }}>{row.path}</td>
                      <td style={{ color: statusColor(row.status_code), fontWeight: 600, fontSize: '0.875rem' }}>{row.status_code ?? '—'}</td>
                      <td>
                        {row.body_summary && (
                          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={(e) => { e.stopPropagation(); setDetail(row); }}>
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="adm-modal">
            <div className="adm-modal__header">
              <h3 className="adm-modal__title">Audit entry #{detail.id}</h3>
              <button className="adm-modal__close" onClick={() => setDetail(null)} aria-label="Close">×</button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-grid-2" style={{ marginBottom: '1.25rem' }}>
                {[
                  ['When', formatDateTime(detail.created_at)],
                  ['User', detail.username || '—'],
                  ['Method', detail.method],
                  ['Status', detail.status_code ?? '—'],
                  ['IP', detail.ip || '—'],
                  ['User agent', detail.user_agent || '—'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem', wordBreak: 'break-all' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.2rem' }}>Path</div>
                <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{detail.path}</div>
              </div>
              {detail.body_summary && (
                <div>
                  <div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.2rem' }}>Body summary (sensitive fields redacted)</div>
                  <pre style={{
                    background: 'var(--adm-bg, #f7f6f0)', borderRadius: 8, padding: '0.85rem 1rem',
                    fontSize: '0.8125rem', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                    maxHeight: '40vh', overflow: 'auto', margin: 0,
                  }}>{detail.body_summary}</pre>
                </div>
              )}
            </div>
            <div className="adm-modal__footer">
              <div style={{ flex: 1 }} />
              <button className="adm-btn adm-btn--primary" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
