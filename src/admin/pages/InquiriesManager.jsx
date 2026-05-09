import { useEffect, useState } from 'react';
import { inquiries as inquiriesApi } from '../api/client';

const TYPE_LABELS = {
  wine_tasting:  { label: 'Wine Tasting',   color: '#7c3aed', bg: '#ede9fe' },
  live_music:    { label: 'Live Music',      color: '#b45309', bg: '#fef3c7' },
  private_event: { label: 'Private Event',   color: '#0369a1', bg: '#e0f2fe' },
  contact:       { label: 'Contact',         color: '#047857', bg: '#d1fae5' },
};

const STATUS_OPTIONS = ['new', 'read', 'replied'];
const STATUS_COLORS  = { new: '#dc2626', read: '#d97706', replied: '#16a34a' };

export default function InquiriesManager() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail]   = useState(null);
  const [error, setError]     = useState('');

  const load = () => {
    let cancelled = false;
    const params = {};
    if (typeFilter)   params.type   = typeFilter;
    if (statusFilter) params.status = statusFilter;
    inquiriesApi.list(params)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  };

  useEffect(load, [typeFilter, statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await inquiriesApi.update(id, { status });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      if (detail?.id === id) setDetail(updated);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await inquiriesApi.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const newCount = items.filter(i => i.status === 'new').length;

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">
          Inquiries
          {newCount > 0 && (
            <span style={{
              marginLeft: '0.75rem',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '1.5rem', height: '1.5rem',
              borderRadius: '50%', background: '#dc2626', color: '#fff',
              fontSize: '0.75rem', fontWeight: 700,
            }}>{newCount}</span>
          )}
        </h2>
        <div className="adm-toolbar__spacer" />
      </div>

      {/* Filters */}
      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select className="adm-select" style={{ width: 'auto', minWidth: 160 }} value={typeFilter} onChange={e => { setLoading(true); setTypeFilter(e.target.value); }}>
          <option value="">All types</option>
          <option value="contact">Contact</option>
          <option value="wine_tasting">Wine Tasting</option>
          <option value="live_music">Live Music</option>
          <option value="private_event">Private Event</option>
        </select>
        <select className="adm-select" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={e => { setLoading(true); setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
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
                  <th>Type</th>
                  <th>Event Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan="7" className="adm-table__empty">No inquiries found.</td></tr>
                )}
                {items.map(inq => {
                  const typeInfo = TYPE_LABELS[inq.type] || { label: inq.type, color: '#555', bg: '#eee' };
                  return (
                    <tr key={inq.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(inq)}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{formatDate(inq.created_at)}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inq.first_name} {inq.last_name}</div>
                        <div className="adm-text-muted adm-text-sm">{inq.email}</div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                          fontSize: '0.75rem', fontWeight: 600,
                          color: typeInfo.color, background: typeInfo.bg,
                        }}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td>{inq.date || '—'}</td>
                      <td>{inq.guests}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          className="adm-select"
                          style={{
                            width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8125rem',
                            color: STATUS_COLORS[inq.status],
                          }}
                          value={inq.status}
                          onChange={e => handleStatusChange(inq.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="adm-flex adm-gap-1">
                          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setDetail(inq)}>View</button>
                          <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(inq.id)}>Delete</button>
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
        <InquiryDetail
          inquiry={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

function InquiryDetail({ inquiry: inq, onClose, onStatusChange, onDelete }) {
  const typeInfo = TYPE_LABELS[inq.type] || { label: inq.type, color: '#555', bg: '#eee' };

  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">Inquiry #{inq.id}</h3>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="adm-modal__body">
          <div className="adm-flex adm-gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 4,
              fontSize: '0.8125rem', fontWeight: 600,
              color: typeInfo.color, background: typeInfo.bg,
            }}>
              {typeInfo.label}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              Submitted: {formatDateTime(inq.created_at)}
            </span>
          </div>

          <div className="adm-grid-2" style={{ marginBottom: '1.25rem' }}>
            {[
              ['Name', `${inq.first_name} ${inq.last_name}`],
              ['Email', inq.email],
              ['Phone', inq.phone || '—'],
              ['Guests', inq.guests],
              ['Event Date', inq.date || '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{val}</div>
              </div>
            ))}
          </div>

          {inq.message && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.4rem' }}>Message</div>
              <div style={{
                background: 'var(--adm-bg)', borderRadius: 8, padding: '0.875rem 1rem',
                fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}>
                {inq.message}
              </div>
            </div>
          )}

          <div className="adm-field">
            <label className="adm-label">Status</label>
            <select
              className="adm-select"
              style={{ width: 'auto', minWidth: 160 }}
              value={inq.status}
              onChange={e => onStatusChange(inq.id, e.target.value)}
            >
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>

        <div className="adm-modal__footer">
          <button
            className="adm-btn adm-btn--danger"
            onClick={() => { onDelete(inq.id); onClose(); }}
          >
            Delete
          </button>
          <div style={{ flex: 1 }} />
          <a
            className="adm-btn adm-btn--secondary"
            href={`mailto:${inq.email}?subject=Re: Your ${TYPE_LABELS[inq.type]?.label || ''} inquiry at La Norma`}
          >
            Reply by Email
          </a>
          <button className="adm-btn adm-btn--primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}
