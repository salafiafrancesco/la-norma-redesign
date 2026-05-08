import { useEffect, useMemo, useState } from 'react';
import {
  content as contentApi,
  cateringRequests as requestsApi,
  uploads as uploadsApi,
} from '../api/client';

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];
const STATUS_COLORS = { new: '#dc2626', contacted: '#d97706', closed: '#16a34a' };

const EVENT_TYPE_LABELS = {
  'Yacht Party':        { color: '#0369a1', bg: '#e0f2fe' },
  'Private Gathering':  { color: '#7c3aed', bg: '#ede9fe' },
  'Corporate Event':    { color: '#475569', bg: '#f1f5f9' },
  'Wine Evening':       { color: '#9f1239', bg: '#ffe4e6' },
  'Celebration':        { color: '#b45309', bg: '#fef3c7' },
  'Other':              { color: '#555', bg: '#eee' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// ------------------------------------------------------------------
// CSV export
// ------------------------------------------------------------------
function exportToCsv(items) {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Event Date', 'Event Type', 'Guests', 'Message', 'Status', 'Created'];
  const rows = items.map((r) => [
    r.id,
    `"${(r.name || '').replace(/"/g, '""')}"`,
    r.email,
    r.phone || '',
    r.event_date || '',
    r.event_type || '',
    r.guests ?? '',
    `"${(r.message || '').replace(/"/g, '""')}"`,
    r.status,
    r.created_at,
  ]);

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `catering-requests-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ------------------------------------------------------------------
// Content Editor (inlined for the catering section)
// ------------------------------------------------------------------
function CateringContentEditor() {
  const [data, setData] = useState(null);
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingField, setUploadingField] = useState('');

  useEffect(() => {
    contentApi.getSection('catering')
      .then((sectionData) => {
        setData(sectionData);
        setJson(JSON.stringify(sectionData, null, 2));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const parsed = JSON.parse(json);
      await contentApi.updateSection('catering', parsed);
      setData(parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (fieldKey) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadingField(fieldKey);
      try {
        const result = await uploadsApi.upload(file);
        const parsed = JSON.parse(json);
        parsed[fieldKey] = result.url;
        setJson(JSON.stringify(parsed, null, 2));
      } catch (e) {
        setError(e.message);
      } finally {
        setUploadingField('');
      }
    };
    input.click();
  };

  if (loading) {
    return <div className="adm-page-loader"><div className="adm-spinner" /> Loading content…</div>;
  }

  return (
    <div>
      {error && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {saved && <div className="adm-alert adm-alert--success" style={{ marginBottom: '1rem' }}>Catering content saved.</div>}

      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          className="adm-btn adm-btn--secondary adm-btn--sm"
          disabled={!!uploadingField}
          onClick={() => handleImageUpload('hero_image_url')}
        >
          {uploadingField === 'hero_image_url' ? 'Uploading…' : 'Upload Hero Image'}
        </button>
        <button
          className="adm-btn adm-btn--secondary adm-btn--sm"
          disabled={!!uploadingField}
          onClick={() => handleImageUpload('seo_og_image_url')}
        >
          {uploadingField === 'seo_og_image_url' ? 'Uploading…' : 'Upload OG Image'}
        </button>
      </div>

      <div className="adm-field">
        <label className="adm-label">Catering Page Content (JSON)</label>
        <p className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.5rem' }}>
          Edit hero, intro paragraphs, perfect_for items, style_includes list, gallery images, CTA text, contact info, and SEO fields.
        </p>
        <textarea
          className="adm-textarea"
          style={{ fontFamily: 'monospace', fontSize: '0.82rem', minHeight: '24rem' }}
          value={json}
          onChange={(e) => setJson(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="adm-flex adm-gap-2" style={{ marginTop: '1rem' }}>
        <button
          className="adm-btn adm-btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Content'}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Requests List
// ------------------------------------------------------------------
function CateringRequestsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    let cancelled = false;
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.event_type = typeFilter;

    requestsApi.list(params)
      .then((data) => { if (!cancelled) setItems(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  };

  useEffect(load, [statusFilter, typeFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await requestsApi.update(id, { status });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      if (detail?.id === id) setDetail(updated);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this catering request?')) return;
    try {
      await requestsApi.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const newCount = items.filter((i) => i.status === 'new').length;

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-toolbar" style={{ marginBottom: '1rem' }}>
        <h3 className="adm-section-title" style={{ fontSize: '1.1rem' }}>
          Catering Requests
          {newCount > 0 && (
            <span style={{
              marginLeft: '0.75rem',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '1.5rem', height: '1.5rem',
              borderRadius: '50%', background: '#dc2626', color: '#fff',
              fontSize: '0.75rem', fontWeight: 700,
            }}>{newCount}</span>
          )}
        </h3>
        <div className="adm-toolbar__spacer" />
        <button
          className="adm-btn adm-btn--secondary adm-btn--sm"
          onClick={() => exportToCsv(items)}
          disabled={items.length === 0}
        >
          Export CSV
        </button>
      </div>

      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select className="adm-select" style={{ width: 'auto', minWidth: 160 }} value={typeFilter} onChange={(e) => { setLoading(true); setTypeFilter(e.target.value); }}>
          <option value="">All event types</option>
          <option value="Yacht Party">Yacht Party</option>
          <option value="Private Gathering">Private Gathering</option>
          <option value="Corporate Event">Corporate Event</option>
          <option value="Wine Evening">Wine Evening</option>
          <option value="Celebration">Celebration</option>
          <option value="Other">Other</option>
        </select>
        <select className="adm-select" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={(e) => { setLoading(true); setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Event Type</th>
                  <th>Event Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan="7" className="adm-table__empty">No catering requests found.</td></tr>
                )}
                {items.map((req) => {
                  const typeInfo = EVENT_TYPE_LABELS[req.event_type] || { color: '#555', bg: '#eee' };
                  return (
                    <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(req)}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{formatDate(req.created_at)}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.name}</div>
                        <div className="adm-text-muted adm-text-sm">{req.email}</div>
                      </td>
                      <td>
                        {req.event_type && (
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                            fontSize: '0.75rem', fontWeight: 600,
                            color: typeInfo.color, background: typeInfo.bg,
                          }}>
                            {req.event_type}
                          </span>
                        )}
                      </td>
                      <td>{req.event_date || '—'}</td>
                      <td>{req.guests ?? '—'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          className="adm-select"
                          style={{
                            width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8125rem',
                            color: STATUS_COLORS[req.status],
                          }}
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="adm-flex adm-gap-1">
                          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setDetail(req)}>View</button>
                          <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(req.id)}>Delete</button>
                        </div>
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
        <RequestDetail
          request={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

// ------------------------------------------------------------------
// Detail Modal
// ------------------------------------------------------------------
function RequestDetail({ request: req, onClose, onStatusChange, onDelete }) {
  const typeInfo = EVENT_TYPE_LABELS[req.event_type] || { color: '#555', bg: '#eee' };

  return (
    <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">Catering Request #{req.id}</h3>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="adm-modal__body">
          <div className="adm-flex adm-gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {req.event_type && (
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                fontSize: '0.8125rem', fontWeight: 600,
                color: typeInfo.color, background: typeInfo.bg,
              }}>
                {req.event_type}
              </span>
            )}
            <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              Submitted: {formatDateTime(req.created_at)}
            </span>
          </div>

          <div className="adm-grid-2" style={{ marginBottom: '1.25rem' }}>
            {[
              ['Name', req.name],
              ['Email', req.email],
              ['Phone', req.phone || '—'],
              ['Event Date', req.event_date || '—'],
              ['Guests', req.guests ?? '—'],
              ['Event Type', req.event_type || '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{val}</div>
              </div>
            ))}
          </div>

          {req.message && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.4rem' }}>Message</div>
              <div style={{
                background: 'var(--adm-bg)', borderRadius: 8, padding: '0.875rem 1rem',
                fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}>
                {req.message}
              </div>
            </div>
          )}

          <div className="adm-field">
            <label className="adm-label">Status</label>
            <select
              className="adm-select"
              style={{ width: 'auto', minWidth: 160 }}
              value={req.status}
              onChange={(e) => onStatusChange(req.id, e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="adm-modal__footer">
          <button
            className="adm-btn adm-btn--danger"
            onClick={() => { onDelete(req.id); onClose(); }}
          >
            Delete
          </button>
          <div style={{ flex: 1 }} />
          <a
            className="adm-btn adm-btn--secondary"
            href={`mailto:${req.email}?subject=Re: Your catering inquiry at La Norma`}
          >
            Reply by Email
          </a>
          <button className="adm-btn adm-btn--primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main component with tabs
// ------------------------------------------------------------------
export default function CateringManager() {
  const [tab, setTab] = useState('requests');

  return (
    <>
      <div className="adm-toolbar">
        <h2 className="adm-section-title">Catering</h2>
        <div className="adm-toolbar__spacer" />
      </div>

      <div className="adm-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`adm-tab${tab === 'requests' ? ' is-active' : ''}`}
          onClick={() => setTab('requests')}
        >
          Requests
        </button>
        <button
          type="button"
          className={`adm-tab${tab === 'content' ? ' is-active' : ''}`}
          onClick={() => setTab('content')}
        >
          Page Content
        </button>
      </div>

      {tab === 'requests' && <CateringRequestsList />}
      {tab === 'content' && <CateringContentEditor />}
    </>
  );
}
