import { useEffect, useState } from 'react';
import { classes as classesApi, uploads as uploadsApi } from '../api/client';

const EMPTY_FORM = {
  date: '', time: '10:00 AM \u2013 1:30 PM', theme: '', short_theme: '',
  description: '', difficulty: 'All levels', price: 95,
  max_spots: 8, spots_left: 8, active: true, image_url: '',
};

export default function ClassesManager() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'create' | class object
  const [deleting, setDeleting] = useState(null);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    classesApi.list()
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class? RSVPs will keep the class info but the class will be removed.')) return;
    setDeleting(id);
    try {
      await classesApi.delete(id);
      setItems(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (cls) => {
    try {
      const updated = await classesApi.update(cls.id, { active: !cls.active });
      setItems(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">Cooking Classes</h2>
        <div className="adm-toolbar__spacer" />
        <button className="adm-btn adm-btn--primary" onClick={() => setModal(EMPTY_FORM)}>
          + New Class
        </button>
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
                  <th>Theme</th>
                  <th>Difficulty</th>
                  <th>Price</th>
                  <th>Spots Left</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan="7" className="adm-table__empty">No classes yet. Create one!</td></tr>
                )}
                {items.map(cls => (
                  <tr key={cls.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(cls.date)}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{cls.theme}</div>
                      <div className="adm-text-muted adm-text-sm">{cls.time}</div>
                    </td>
                    <td>{cls.difficulty}</td>
                    <td>${cls.price}</td>
                    <td>
                      <span className={cls.spots_left === 0 ? 'adm-badge adm-badge--booked' : ''}>
                        {cls.spots_left} / {cls.max_spots}
                      </span>
                    </td>
                    <td>
                      <label className="adm-toggle" title={cls.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
                        <input
                          type="checkbox"
                          checked={Boolean(cls.active)}
                          onChange={() => handleToggleActive(cls)}
                        />
                        <span className="adm-toggle__slider" />
                      </label>
                    </td>
                    <td>
                      <div className="adm-flex adm-gap-1">
                        <button
                          className="adm-btn adm-btn--ghost adm-btn--sm"
                          onClick={() => setModal({ ...cls })}
                        >
                          Edit
                        </button>
                        <button
                          className="adm-btn adm-btn--danger adm-btn--sm"
                          onClick={() => handleDelete(cls.id)}
                          disabled={deleting === cls.id}
                        >
                          {deleting === cls.id ? '…' : 'Delete'}
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
        <ClassModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            setItems(prev => {
              const exists = prev.find(c => c.id === saved.id);
              return exists ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved];
            });
            setModal(null);
          }}
        />
      )}
    </>
  );
}

// ── Class create/edit modal ───────────────────────────────────
function ClassModal({ initial, onClose, onSaved }) {
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
    if (!form.date || !form.theme) {
      setError('Date and theme are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price:     Number(form.price),
        max_spots: Number(form.max_spots),
        spots_left: Number(form.spots_left),
        active:    Boolean(form.active),
      };
      const saved = isEdit
        ? await classesApi.update(form.id, payload)
        : await classesApi.create(payload);
      onSaved(saved);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">{isEdit ? 'Edit Class' : 'New Cooking Class'}</h3>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="adm-modal__body">
            {error && <div className="adm-alert adm-alert--error">{error}</div>}

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
              <label className="adm-label">Theme / Title *</label>
              <input className="adm-input" type="text" value={form.theme} onChange={e => set('theme', e.target.value)} placeholder="e.g. Fresh Pasta & Slow Ragù" required />
            </div>

            <div className="adm-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="adm-field">
                <label className="adm-label">Short Theme</label>
                <input className="adm-input" type="text" value={form.short_theme || ''} onChange={e => set('short_theme', e.target.value)} placeholder="e.g. Fresh Pasta" />
              </div>
              <div className="adm-field">
                <label className="adm-label">Difficulty</label>
                <select className="adm-select" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                  <option>All levels</option>
                  <option>Beginner friendly</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Description</label>
              <textarea className="adm-textarea" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} />
            </div>

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

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Image</label>
              <div className="adm-img-upload">
                {form.image_url && <img src={form.image_url} className="adm-img-preview" alt="" />}
                <div>
                  <input className="adm-input" type="url" value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="https://..." style={{ marginBottom: '0.5rem' }} />
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
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Class'}
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
