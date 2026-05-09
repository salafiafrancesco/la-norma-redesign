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
  const [selected, setSelected] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

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

  // Clear selection whenever the visible list changes — stale ids could
  // refer to rows the current user is no longer looking at.
  useEffect(() => {
    setSelected(new Set());
  }, [typeFilter, statusFilter]);

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      if (prev.size === items.length) return new Set();
      return new Set(items.map((i) => i.id));
    });
  };

  const handleBulkStatus = async (status) => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      const ids = Array.from(selected);
      const result = await inquiriesApi.bulkStatus(ids, status);
      const updatedById = new Map((result.items || []).map((i) => [i.id, i]));
      setItems((prev) => prev.map((i) => updatedById.get(i.id) || i));
      setSelected(new Set());
    } catch (e) {
      setError(e.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} ${selected.size === 1 ? 'inquiry' : 'inquiries'}? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      const ids = Array.from(selected);
      await inquiriesApi.bulkDelete(ids);
      setItems((prev) => prev.filter((i) => !selected.has(i.id)));
      setSelected(new Set());
    } catch (e) {
      setError(e.message);
    } finally {
      setBulkBusy(false);
    }
  };

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

      {/* Bulk action bar — appears once at least one row is selected */}
      {selected.size > 0 && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
            background: 'var(--adm-bg, #f5f5f0)', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 8, padding: '0.65rem 0.85rem', marginBottom: '1rem',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {selected.size} selected
          </span>
          <button
            type="button"
            className="adm-btn adm-btn--secondary adm-btn--sm"
            onClick={() => handleBulkStatus('read')}
            disabled={bulkBusy}
          >
            Mark as read
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--secondary adm-btn--sm"
            onClick={() => handleBulkStatus('replied')}
            disabled={bulkBusy}
          >
            Mark as replied
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--secondary adm-btn--sm"
            onClick={() => handleBulkStatus('new')}
            disabled={bulkBusy}
          >
            Mark as new
          </button>
          <button
            type="button"
            className="adm-btn adm-btn--danger adm-btn--sm"
            onClick={handleBulkDelete}
            disabled={bulkBusy}
          >
            Delete selected
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={items.length > 0 && selected.size === items.length}
                      ref={(el) => {
                        if (el) el.indeterminate = selected.size > 0 && selected.size < items.length;
                      }}
                      onChange={toggleAll}
                    />
                  </th>
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
                  <tr><td colSpan="8" className="adm-table__empty">No inquiries found.</td></tr>
                )}
                {items.map(inq => {
                  const typeInfo = TYPE_LABELS[inq.type] || { label: inq.type, color: '#555', bg: '#eee' };
                  const isSelected = selected.has(inq.id);
                  return (
                    <tr
                      key={inq.id}
                      style={{ cursor: 'pointer', background: isSelected ? 'rgba(59,88,68,0.05)' : undefined }}
                      onClick={() => setDetail(inq)}
                    >
                      <td onClick={(e) => e.stopPropagation()} style={{ width: 36 }}>
                        <input
                          type="checkbox"
                          aria-label={`Select inquiry ${inq.id}`}
                          checked={isSelected}
                          onChange={() => toggleSelected(inq.id)}
                        />
                      </td>
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
