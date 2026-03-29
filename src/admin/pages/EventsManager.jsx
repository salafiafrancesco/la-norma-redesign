import { useEffect, useState } from 'react';
import { events as eventsApi, uploads as uploadsApi } from '../api/client';

const CATEGORIES = [
  { value: 'wine_tasting', label: '🍷 Wine Tastings' },
  { value: 'live_music',   label: '🎵 Live Music' },
];

const EMPTY_FORM = {
  category: 'wine_tasting', title: '', description: '',
  date: '', time: '6:00 PM – 8:00 PM',
  price: 65, max_spots: 14, spots_left: 14, active: true, image_url: '',
};

export default function EventsManager() {
  const [tab, setTab]         = useState('wine_tasting');
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    eventsApi.list({ category: tab })
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    setDeleting(id);
    try {
      await eventsApi.delete(id);
      setItems(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (ev) => {
    try {
      const updated = await eventsApi.update(ev.id, { active: !ev.active });
      setItems(prev => prev.map(e => e.id === updated.id ? updated : e));
    } catch (e) {
      setError(e.message);
    }
  };

  const newForm = { ...EMPTY_FORM, category: tab, time: tab === 'wine_tasting' ? '6:00 PM – 8:00 PM' : '7:00 PM – 9:30 PM' };

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">Events</h2>
        <div className="adm-toolbar__spacer" />
        <button className="adm-btn adm-btn--primary" onClick={() => setModal(newForm)}>
          + New Event
        </button>
      </div>

      <div className="adm-tabs" style={{ marginBottom: '1.5rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`adm-tab${tab === cat.value ? ' is-active' : ''}`}
            onClick={() => setTab(cat.value)}
          >
            {cat.label}
          </button>
        ))}
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
                  <th>Title</th>
                  <th>Time</th>
                  {tab === 'wine_tasting' && <><th>Price</th><th>Spots</th></>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan="8" className="adm-table__empty">No events yet. Create one!</td></tr>
                )}
                {items.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(ev.date)}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ev.title}</div>
                      <div className="adm-text-muted adm-text-sm" style={{ maxWidth: 280 }}>{ev.description?.slice(0, 80)}{ev.description?.length > 80 ? '…' : ''}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{ev.time}</td>
                    {tab === 'wine_tasting' && (
                      <>
                        <td>${ev.price}</td>
                        <td>
                          <span className={ev.spots_left === 0 ? 'adm-badge adm-badge--booked' : ''}>
                            {ev.spots_left} / {ev.max_spots}
                          </span>
                        </td>
                      </>
                    )}
                    <td>
                      <label className="adm-toggle" title={ev.active ? 'Active' : 'Inactive'}>
                        <input type="checkbox" checked={Boolean(ev.active)} onChange={() => handleToggleActive(ev)} />
                        <span className="adm-toggle__slider" />
                      </label>
                    </td>
                    <td>
                      <div className="adm-flex adm-gap-1">
                        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setModal({ ...ev })}>Edit</button>
                        <button
                          className="adm-btn adm-btn--danger adm-btn--sm"
                          onClick={() => handleDelete(ev.id)}
                          disabled={deleting === ev.id}
                        >
                          {deleting === ev.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <EventModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            if (saved.category === tab) {
              setItems(prev => {
                const exists = prev.find(e => e.id === saved.id);
                return exists ? prev.map(e => e.id === saved.id ? saved : e) : [...prev, saved];
              });
            } else {
              setItems(prev => prev.filter(e => e.id !== saved.id));
            }
            setModal(null);
          }}
        />
      )}
    </>
  );
}

function EventModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm]     = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (file) => {
    try {
      const { url } = await uploadsApi.upload(file);
      set('image_url', url);
    } catch (e) {
      setError('Upload failed: ' + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.title) { setError('Date and title are required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price:     Number(form.price) || 0,
        max_spots: Number(form.max_spots) || 0,
        spots_left: Number(form.spots_left) || 0,
        active:    Boolean(form.active),
      };
      const saved = isEdit
        ? await eventsApi.update(form.id, payload)
        : await eventsApi.create(payload);
      onSaved(saved);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  const isWine = form.category === 'wine_tasting';

  return (
    <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">{isEdit ? 'Edit Event' : 'New Event'}</h3>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="adm-modal__body">
            {error && <div className="adm-alert adm-alert--error">{error}</div>}

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Category</label>
              <select className="adm-select" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="wine_tasting">Wine Tasting</option>
                <option value="live_music">Live Music</option>
              </select>
            </div>

            <div className="adm-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="adm-field">
                <label className="adm-label">Date *</label>
                <input className="adm-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="adm-field">
                <label className="adm-label">Time</label>
                <input className="adm-input" type="text" value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Title *</label>
              <input className="adm-input" type="text" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Description</label>
              <textarea className="adm-textarea" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} />
            </div>

            {isWine && (
              <div className="adm-grid-3" style={{ marginBottom: '1rem' }}>
                <div className="adm-field">
                  <label className="adm-label">Price ($)</label>
                  <input className="adm-input" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Max Spots</label>
                  <input className="adm-input" type="number" min="1" value={form.max_spots} onChange={e => set('max_spots', e.target.value)} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Spots Left</label>
                  <input className="adm-input" type="number" min="0" value={form.spots_left} onChange={e => set('spots_left', e.target.value)} />
                </div>
              </div>
            )}

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Image</label>
              <div className="adm-img-upload">
                {form.image_url && <img src={form.image_url} className="adm-img-preview" alt="" />}
                <div>
                  <input className="adm-input" type="url" value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="https://…" style={{ marginBottom: '0.5rem' }} />
                  <label className="adm-btn adm-btn--secondary adm-btn--sm" style={{ cursor: 'pointer' }}>
                    Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>

            <div className="adm-field adm-field--row">
              <label className="adm-toggle">
                <input type="checkbox" checked={Boolean(form.active)} onChange={e => set('active', e.target.checked)} />
                <span className="adm-toggle__slider" />
              </label>
              <span className="adm-label">Active (visible on site)</span>
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}
