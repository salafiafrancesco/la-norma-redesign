import { useEffect, useState } from 'react';
import {
  experienceEvents as eventsApi,
  bookings as bookingsApi,
} from '../api/client';

const TYPES = [
  { value: '', label: 'All types' },
  { value: 'cooking_class', label: 'Cooking Classes' },
  { value: 'wine_tasting', label: 'Wine Tastings' },
  { value: 'live_music', label: 'Live Music' },
];

const TYPE_COLORS = {
  cooking_class: { color: '#7c3aed', bg: '#ede9fe' },
  wine_tasting:  { color: '#9f1239', bg: '#ffe4e6' },
  live_music:    { color: '#0369a1', bg: '#e0f2fe' },
};

const STATUS_OPTIONS = ['draft', 'published', 'cancelled', 'sold_out'];
const BOOKING_STATUSES = ['pending', 'paid', 'confirmed', 'cancelled', 'refunded'];
const BOOKING_STATUS_COLORS = { pending: '#d97706', paid: '#0369a1', confirmed: '#16a34a', cancelled: '#6b7280', refunded: '#dc2626' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function exportBookingsCsv(items) {
  const headers = ['ID', 'Event', 'Date', 'Name', 'Email', 'Phone', 'Guests', 'Total', 'Status', 'Special Requests', 'Created'];
  const rows = items.map((b) => [
    b.id,
    `"${(b.experience_events?.title || '').replace(/"/g, '""')}"`,
    b.experience_events?.date || '',
    `"${(b.customer_name || '').replace(/"/g, '""')}"`,
    b.customer_email,
    b.customer_phone || '',
    b.guests,
    b.total_cents ? formatCents(b.total_cents) : '0',
    b.status,
    `"${(b.special_requests || '').replace(/"/g, '""')}"`,
    b.created_at,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ================================================================
// Events Tab
// ================================================================
function EventsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let c = false;
    const params = {};
    if (typeFilter) params.type = typeFilter;
    eventsApi.list(params)
      .then((d) => { if (!c) setItems(d); })
      .catch((e) => { if (!c) setError(e.message); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, [typeFilter]);

  const handleSave = async (form) => {
    try {
      if (form.id) {
        const updated = await eventsApi.update(form.id, form);
        setItems((p) => p.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await eventsApi.create(form);
        setItems((p) => [created, ...p]);
      }
      setEditing(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventsApi.delete(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select className="adm-select" style={{ width: 'auto', minWidth: 160 }} value={typeFilter} onChange={(e) => { setLoading(true); setTypeFilter(e.target.value); }}>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => setEditing({ type: 'cooking_class', title: '', date: '', start_time: '10:00 AM', end_time: '', price_cents: 9500, capacity: 8, difficulty: 'All levels', status: 'published' })}>
          + New Event
        </button>
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Date</th><th>Title</th><th>Type</th><th>Price</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan="7" className="adm-table__empty">No events found.</td></tr>}
                {items.map((ev) => {
                  const tc = TYPE_COLORS[ev.type] || { color: '#555', bg: '#eee' };
                  return (
                    <tr key={ev.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{ev.date}</td>
                      <td style={{ fontWeight: 600 }}>{ev.title}</td>
                      <td><span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, color: tc.color, background: tc.bg }}>{ev.type.replace('_', ' ')}</span></td>
                      <td>{ev.price_cents > 0 ? formatCents(ev.price_cents) : '—'}</td>
                      <td>{ev.capacity > 0 ? `${ev.seats_booked}/${ev.capacity}` : '—'}</td>
                      <td><span style={{ fontSize: '0.8rem', color: ev.status === 'published' ? '#16a34a' : '#6b7280' }}>{ev.status}</span></td>
                      <td>
                        <div className="adm-flex adm-gap-1">
                          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setEditing(ev)}>Edit</button>
                          <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(ev.id)}>Delete</button>
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

      {editing && <EventModal event={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
    </>
  );
}

function EventModal({ event, onSave, onClose }) {
  const [form, setForm] = useState({ ...event });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">{form.id ? 'Edit Event' : 'New Event'}</h3>
          <button className="adm-modal__close" onClick={onClose}>&times;</button>
        </div>
        <div className="adm-modal__body">
          <div className="adm-grid-2">
            <div className="adm-field">
              <label className="adm-label">Type</label>
              <select className="adm-select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="cooking_class">Cooking Class</option>
                <option value="wine_tasting">Wine Tasting</option>
                <option value="live_music">Live Music</option>
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">Status</label>
              <select className="adm-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="adm-field"><label className="adm-label">Title</label><input className="adm-input" value={form.title} onChange={(e) => set('title', e.target.value)} /></div>
          <div className="adm-field"><label className="adm-label">Description</label><textarea className="adm-textarea" value={form.description || ''} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="adm-grid-2">
            <div className="adm-field"><label className="adm-label">Date</label><input className="adm-input" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
            <div className="adm-field"><label className="adm-label">Start Time</label><input className="adm-input" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} /></div>
          </div>
          <div className="adm-grid-2">
            <div className="adm-field"><label className="adm-label">End Time</label><input className="adm-input" value={form.end_time || ''} onChange={(e) => set('end_time', e.target.value)} /></div>
            <div className="adm-field"><label className="adm-label">Price (cents)</label><input className="adm-input" type="number" value={form.price_cents} onChange={(e) => set('price_cents', Number(e.target.value))} /></div>
          </div>
          <div className="adm-grid-2">
            <div className="adm-field"><label className="adm-label">Capacity</label><input className="adm-input" type="number" value={form.capacity} onChange={(e) => set('capacity', Number(e.target.value))} /></div>
            <div className="adm-field"><label className="adm-label">Difficulty</label><input className="adm-input" value={form.difficulty || ''} onChange={(e) => set('difficulty', e.target.value)} placeholder="e.g. All levels" /></div>
          </div>
          <div className="adm-field"><label className="adm-label">Image URL</label><input className="adm-input" value={form.image_url || ''} onChange={(e) => set('image_url', e.target.value)} /></div>
        </div>
        <div className="adm-modal__footer">
          <button className="adm-btn adm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="adm-btn adm-btn--primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Bookings Tab
// ================================================================
function BookingsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let c = false;
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    bookingsApi.list(params)
      .then((d) => { if (!c) setItems(d); })
      .catch((e) => { if (!c) setError(e.message); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, [statusFilter, search]);

  const handleStatus = async (id, status) => {
    try {
      const updated = await bookingsApi.update(id, { status });
      setItems((p) => p.map((i) => (i.id === id ? { ...i, ...updated } : i)));
      if (detail?.id === id) setDetail({ ...detail, ...updated });
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await bookingsApi.delete(id);
      setItems((p) => p.filter((i) => i.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (e) { setError(e.message); }
  };

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select className="adm-select" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={(e) => { setLoading(true); setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <input className="adm-input" style={{ width: 'auto', minWidth: 200 }} placeholder="Search name or email…" value={search} onChange={(e) => { setLoading(true); setSearch(e.target.value); }} />
        <div style={{ flex: 1 }} />
        {pendingCount > 0 && <span style={{ fontSize: '0.85rem', color: '#d97706', alignSelf: 'center' }}>{pendingCount} pending</span>}
        <button className="adm-btn adm-btn--secondary adm-btn--sm" onClick={() => exportBookingsCsv(items)} disabled={items.length === 0}>Export CSV</button>
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Date</th><th>Guest</th><th>Event</th><th>Guests</th><th>Total</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan="7" className="adm-table__empty">No bookings found.</td></tr>}
                {items.map((b) => (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(b)}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{formatDate(b.created_at)}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.customer_name}</div>
                      <div className="adm-text-muted adm-text-sm">{b.customer_email}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{b.experience_events?.title || '—'}<br/><span className="adm-text-muted adm-text-sm">{b.experience_events?.date || ''}</span></td>
                    <td>{b.guests}</td>
                    <td>{b.total_cents > 0 ? formatCents(b.total_cents) : '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select className="adm-select" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8125rem', color: BOOKING_STATUS_COLORS[b.status] }} value={b.status} onChange={(e) => handleStatus(b.id, e.target.value)}>
                        {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="adm-flex adm-gap-1">
                        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setDetail(b)}>View</button>
                        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(b.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="adm-modal">
            <div className="adm-modal__header">
              <h3 className="adm-modal__title">Booking #{detail.id}</h3>
              <button className="adm-modal__close" onClick={() => setDetail(null)}>&times;</button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-grid-2" style={{ marginBottom: '1.25rem' }}>
                {[
                  ['Name', detail.customer_name],
                  ['Email', detail.customer_email],
                  ['Phone', detail.customer_phone || '—'],
                  ['Guests', detail.guests],
                  ['Event', detail.experience_events?.title || '—'],
                  ['Event Date', detail.experience_events?.date || '—'],
                  ['Total', detail.total_cents > 0 ? formatCents(detail.total_cents) : '—'],
                  ['Payment Mode', detail.payment_mode],
                ].map(([l, v]) => (
                  <div key={l}><div className="adm-text-muted adm-text-sm">{l}</div><div style={{ fontWeight: 500 }}>{v}</div></div>
                ))}
              </div>
              {detail.special_requests && (
                <div style={{ marginBottom: '1rem' }}>
                  <div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.3rem' }}>Special Requests</div>
                  <div style={{ background: 'var(--adm-bg)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{detail.special_requests}</div>
                </div>
              )}
              <div className="adm-field">
                <label className="adm-label">Status</label>
                <select className="adm-select" style={{ width: 'auto', minWidth: 160 }} value={detail.status} onChange={(e) => handleStatus(detail.id, e.target.value)}>
                  {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn adm-btn--danger" onClick={() => { handleDelete(detail.id); setDetail(null); }}>Delete</button>
              <div style={{ flex: 1 }} />
              <a className="adm-btn adm-btn--secondary" href={`mailto:${detail.customer_email}?subject=Your La Norma booking`}>Reply by Email</a>
              <button className="adm-btn adm-btn--primary" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ================================================================
// Main
// ================================================================
export default function ExperiencesManager() {
  const [tab, setTab] = useState('events');

  return (
    <>
      <div className="adm-toolbar">
        <h2 className="adm-section-title">Experiences</h2>
        <div className="adm-toolbar__spacer" />
      </div>

      <div className="adm-tabs" style={{ marginBottom: '1.5rem' }}>
        <button type="button" className={`adm-tab${tab === 'events' ? ' is-active' : ''}`} onClick={() => setTab('events')}>Events</button>
        <button type="button" className={`adm-tab${tab === 'bookings' ? ' is-active' : ''}`} onClick={() => setTab('bookings')}>Bookings</button>
      </div>

      {tab === 'events' && <EventsTab />}
      {tab === 'bookings' && <BookingsTab />}
    </>
  );
}
