import { useEffect, useState } from 'react';
import { events as eventsApi, uploads as uploadsApi } from '../api/client';

const CATEGORIES = [
  { value: 'wine_tasting', label: 'Wine Tastings' },
  { value: 'live_music', label: 'Live Music' },
];

const EMPTY_FORM = {
  category: 'wine_tasting',
  title: '',
  description: '',
  date: '',
  time: '6:00 PM - 8:00 PM',
  price: 65,
  max_spots: 14,
  spots_left: 14,
  active: true,
  image_url: '',
};

export default function EventsManager() {
  const [tab, setTab] = useState('wine_tasting');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [source, setSource] = useState('admin');
  const readOnly = source !== 'admin';

  const load = () => {
    setLoading(true);
    setError('');

    eventsApi
      .listWithMeta({ category: tab })
      .then(({ items: nextItems, source: nextSource }) => {
        setItems(nextItems);
        setSource(nextSource);
      })
      .catch((entryError) => setError(entryError.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    setDeleting(id);

    try {
      await eventsApi.delete(id);
      setItems((current) => current.filter((entry) => entry.id !== id));
    } catch (entryError) {
      setError(entryError.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (entry) => {
    try {
      const updated = await eventsApi.update(entry.id, { active: !entry.active });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (entryError) {
      setError(entryError.message);
    }
  };

  const newForm = {
    ...EMPTY_FORM,
    category: tab,
    time: tab === 'wine_tasting' ? '6:00 PM - 8:00 PM' : '7:00 PM - 9:30 PM',
  };

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}
      {readOnly && (
        <div className="adm-alert adm-alert--info">
          Events are shown in read-only mode because the protected admin endpoint is unavailable on the connected backend.
        </div>
      )}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">Events</h2>
        <div className="adm-toolbar__spacer" />
        {!readOnly && (
          <button className="adm-btn adm-btn--primary" onClick={() => setModal(newForm)}>
            + New Event
          </button>
        )}
      </div>

      <div className="adm-tabs" style={{ marginBottom: '1.5rem' }}>
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            className={`adm-tab${tab === category.value ? ' is-active' : ''}`}
            onClick={() => setTab(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader">
            <div className="adm-spinner" /> Loading...
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Time</th>
                  {tab === 'wine_tasting' && (
                    <>
                      <th>Price</th>
                      <th>Spots</th>
                    </>
                  )}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan="8" className="adm-table__empty">No events found.</td>
                  </tr>
                )}

                {items.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(entry.date)}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{entry.title}</div>
                      <div className="adm-text-muted adm-text-sm" style={{ maxWidth: 280 }}>
                        {entry.description?.slice(0, 80)}
                        {entry.description?.length > 80 ? '...' : ''}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{entry.time}</td>
                    {tab === 'wine_tasting' && (
                      <>
                        <td>${entry.price}</td>
                        <td>
                          <span className={entry.spots_left === 0 ? 'adm-badge adm-badge--booked' : ''}>
                            {entry.spots_left} / {entry.max_spots}
                          </span>
                        </td>
                      </>
                    )}
                    <td>
                      {readOnly ? (
                        <span className={`adm-badge adm-badge--${entry.active ? 'active' : 'inactive'}`}>
                          {entry.active ? 'active' : 'inactive'}
                        </span>
                      ) : (
                        <label className="adm-toggle" title={entry.active ? 'Active' : 'Inactive'}>
                          <input type="checkbox" checked={Boolean(entry.active)} onChange={() => handleToggleActive(entry)} />
                          <span className="adm-toggle__slider" />
                        </label>
                      )}
                    </td>
                    <td>
                      {readOnly ? (
                        <span className="adm-text-muted adm-text-sm">Read only</span>
                      ) : (
                        <div className="adm-flex adm-gap-1">
                          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setModal({ ...entry })}>
                            Edit
                          </button>
                          <button
                            className="adm-btn adm-btn--danger adm-btn--sm"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleting === entry.id}
                          >
                            {deleting === entry.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && !readOnly && (
        <EventModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            if (saved.category === tab) {
              setItems((current) => {
                const exists = current.find((entry) => entry.id === saved.id);
                return exists
                  ? current.map((entry) => (entry.id === saved.id ? saved : entry))
                  : [...current, saved];
              });
            } else {
              setItems((current) => current.filter((entry) => entry.id !== saved.id));
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
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleImageUpload = async (file) => {
    try {
      const { url } = await uploadsApi.upload(file);
      setField('image_url', url);
    } catch (entryError) {
      setError(`Upload failed: ${entryError.message}`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date || !form.title) {
      setError('Date and title are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        max_spots: Number(form.max_spots) || 0,
        spots_left: Number(form.spots_left) || 0,
        active: Boolean(form.active),
      };

      const saved = isEdit
        ? await eventsApi.update(form.id, payload)
        : await eventsApi.create(payload);

      onSaved(saved);
    } catch (entryError) {
      setError(entryError.message);
      setSaving(false);
    }
  };

  const isWine = form.category === 'wine_tasting';

  return (
    <div className="adm-modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">{isEdit ? 'Edit Event' : 'New Event'}</h3>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">x</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="adm-modal__body">
            {error && <div className="adm-alert adm-alert--error">{error}</div>}

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Category</label>
              <select className="adm-select" value={form.category} onChange={(event) => setField('category', event.target.value)}>
                <option value="wine_tasting">Wine Tasting</option>
                <option value="live_music">Live Music</option>
              </select>
            </div>

            <div className="adm-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="adm-field">
                <label className="adm-label">Date *</label>
                <input className="adm-input" type="date" value={form.date} onChange={(event) => setField('date', event.target.value)} required />
              </div>
              <div className="adm-field">
                <label className="adm-label">Time</label>
                <input className="adm-input" type="text" value={form.time} onChange={(event) => setField('time', event.target.value)} />
              </div>
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Title *</label>
              <input className="adm-input" type="text" value={form.title} onChange={(event) => setField('title', event.target.value)} required />
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Description</label>
              <textarea className="adm-textarea" rows={3} value={form.description || ''} onChange={(event) => setField('description', event.target.value)} />
            </div>

            {isWine && (
              <div className="adm-grid-3" style={{ marginBottom: '1rem' }}>
                <div className="adm-field">
                  <label className="adm-label">Price ($)</label>
                  <input className="adm-input" type="number" min="0" value={form.price} onChange={(event) => setField('price', event.target.value)} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Max Spots</label>
                  <input className="adm-input" type="number" min="1" value={form.max_spots} onChange={(event) => setField('max_spots', event.target.value)} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Spots Left</label>
                  <input className="adm-input" type="number" min="0" value={form.spots_left} onChange={(event) => setField('spots_left', event.target.value)} />
                </div>
              </div>
            )}

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Image</label>
              <div className="adm-img-upload">
                {form.image_url && <img src={form.image_url} className="adm-img-preview" alt="" />}
                <div>
                  <input className="adm-input" type="url" value={form.image_url || ''} onChange={(event) => setField('image_url', event.target.value)} placeholder="https://..." style={{ marginBottom: '0.5rem' }} />
                  <label className="adm-btn adm-btn--secondary adm-btn--sm" style={{ cursor: 'pointer' }}>
                    Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => event.target.files?.[0] && handleImageUpload(event.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>

            <div className="adm-field adm-field--row">
              <label className="adm-toggle">
                <input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setField('active', event.target.checked)} />
                <span className="adm-toggle__slider" />
              </label>
              <span className="adm-label">Active (visible on site)</span>
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
