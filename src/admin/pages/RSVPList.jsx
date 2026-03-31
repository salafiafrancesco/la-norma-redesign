import { useEffect, useState } from 'react';
import { rsvp as rsvpApi } from '../api/client';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'cancelled'];

export default function RSVPList() {
  const [items, setItems]     = useState([]);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const params = filter !== 'all' ? { status: filter } : {};
    rsvpApi.list(params)
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
  }, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await rsvpApi.updateStatus(id, status);
      setItems(prev => prev.map(r => r.id === id ? updated : r));
      if (selected?.id === id) setSelected(updated);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this RSVP?')) return;
    try {
      await rsvpApi.delete(id);
      setItems(prev => prev.filter(r => r.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const filtered = items.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.class_theme || '').toLowerCase().includes(q)
    );
  });

  const counts = {
    all:       items.length,
    pending:   items.filter(r => r.status === 'pending').length,
    confirmed: items.filter(r => r.status === 'confirmed').length,
    cancelled: items.filter(r => r.status === 'cancelled').length,
  };

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">RSVPs & Bookings</h2>
      </div>

      {/* Filter tabs */}
      <div className="adm-tabs">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            className={`adm-tab${filter === s ? ' is-active' : ''}`}
            onClick={() => {
              setLoading(true);
              setFilter(s);
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{ marginLeft: '0.35rem', fontSize: '0.7rem', opacity: 0.7 }}>
              ({counts[s]})
            </span>
          </button>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-toolbar" style={{ marginBottom: '1rem' }}>
          <input
            className="adm-search"
            type="search"
            placeholder="Search by name, email, class…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="adm-toolbar__spacer" />
          <span className="adm-text-muted adm-text-sm">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guest</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Class</th>
                  <th>Guests</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan="9" className="adm-table__empty">No RSVPs found.</td></tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
                    <td className="adm-text-muted">{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.first_name} {r.last_name}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || '—'}</td>
                    <td>
                      {r.class_date ? (
                        <>
                          <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{r.class_theme}</div>
                          <div className="adm-text-muted adm-text-sm">{formatDate(r.class_date)}</div>
                        </>
                      ) : '—'}
                    </td>
                    <td>{r.guests}</td>
                    <td className="adm-text-muted" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {formatDateTime(r.created_at)}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="adm-select"
                        style={{ width: 'auto', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        value={r.status}
                        onChange={e => handleStatusChange(r.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="adm-btn adm-btn--danger adm-btn--sm"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <RSVPDetail
          rsvp={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}

function RSVPDetail({ rsvp, onClose, onStatusChange }) {
  return (
    <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">RSVP #{rsvp.id}</h3>
          <button className="adm-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="adm-modal__body">
          <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem 1rem', fontSize: '0.875rem' }}>
            <Dl label="Name"   value={`${rsvp.first_name} ${rsvp.last_name}`} />
            <Dl label="Email"  value={rsvp.email} />
            <Dl label="Phone"  value={rsvp.phone || '—'} />
            <Dl label="Guests" value={rsvp.guests} />
            <Dl label="Class"  value={rsvp.class_theme || '—'} />
            <Dl label="Date"   value={rsvp.class_date ? formatDate(rsvp.class_date) : '—'} />
            <Dl label="Notes"  value={rsvp.notes || '—'} />
            <Dl label="Received" value={formatDateTime(rsvp.created_at)} />
          </dl>

          <div className="adm-divider" />

          <div className="adm-field">
            <label className="adm-label">Status</label>
            <select
              className="adm-select"
              value={rsvp.status}
              onChange={e => onStatusChange(rsvp.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="adm-modal__footer">
          <button className="adm-btn adm-btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Dl({ label, value }) {
  return (
    <>
      <dt style={{ color: 'var(--adm-muted)', fontWeight: 600 }}>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function formatDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
