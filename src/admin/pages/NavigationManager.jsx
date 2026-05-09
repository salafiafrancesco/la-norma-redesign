import { useEffect, useState } from 'react';
import { siteNavigation } from '../api/client';

const PAGE_KEY_OPTIONS = [
  '', 'home', 'menu', 'about', 'contact', 'faq', 'blog', 'catering',
  'cooking-classes', 'wine-tastings', 'live-music', 'private-events', 'privacy-policy',
];

const SCOPE_OPTIONS = ['both', 'desktop', 'mobile'];

const COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 60 } },
  { key: 'label', label: 'Label' },
  { key: 'page_key', label: 'Internal page', type: 'select', options: PAGE_KEY_OPTIONS },
  { key: 'href', label: 'External URL (if no page)' },
  { key: 'scope', label: 'Scope', type: 'select', options: SCOPE_OPTIONS },
  { key: 'is_dropdown_parent', label: 'Dropdown parent', type: 'checkbox' },
  { key: 'parent_id', label: 'Parent ID', type: 'number' },
  { key: 'target', label: 'Target (_blank for new tab)' },
];

const EMPTY_ROW = {
  sort_order: 0,
  label: '',
  page_key: '',
  href: '',
  scope: 'both',
  is_dropdown_parent: false,
  parent_id: null,
  target: '',
};

export default function NavigationManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    siteNavigation.getAll()
      .then((data) => setItems(data.navLinks || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      const payload = { ...editing };
      if (payload.parent_id === '' || payload.parent_id === null || Number.isNaN(Number(payload.parent_id))) {
        payload.parent_id = null;
      } else {
        payload.parent_id = Number(payload.parent_id);
      }
      if (editing.id) {
        const updated = await siteNavigation.updateNavLink(editing.id, payload);
        setItems((p) => p.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await siteNavigation.createNavLink(payload);
        setItems((p) => [...p, created]);
      }
      setEditing(null);
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this nav link? Children will be removed too.')) return;
    try {
      await siteNavigation.deleteNavLink(id);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="adm-section-title" style={{ marginBottom: '1rem' }}>
        Navigation links
        <p className="adm-text-muted" style={{ fontWeight: 400, fontSize: '0.85rem', marginTop: '0.4rem' }}>
          Manage Navbar (desktop + mobile drawer). Use <code>parent_id</code> to nest items under an Experiences-style dropdown.
          Set <code>scope</code> to <code>desktop</code>, <code>mobile</code> or <code>both</code>.
          Use <code>page_key</code> for internal pages, or <code>href</code> for external URLs.
        </p>
      </div>

      {error && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1rem' }}>
        <div style={{ flex: 1 }} />
        <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => setEditing({ ...EMPTY_ROW })}>+ New nav link</button>
      </div>

      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Order</th>
                  <th>Label</th>
                  <th>Page</th>
                  <th>External</th>
                  <th>Scope</th>
                  <th>Dropdown</th>
                  <th>Parent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={9} className="adm-table__empty">No nav links yet.</td></tr>}
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{item.id}</td>
                    <td>{item.sort_order}</td>
                    <td>{item.label}</td>
                    <td>{item.page_key || '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.href || '—'}</td>
                    <td>{item.scope}</td>
                    <td>{item.is_dropdown_parent ? '✓' : ''}</td>
                    <td>{item.parent_id || '—'}</td>
                    <td>
                      <div className="adm-flex adm-gap-1">
                        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setEditing({ ...item })}>Edit</button>
                        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="adm-modal">
            <div className="adm-modal__header">
              <h3 className="adm-modal__title">{editing.id ? 'Edit nav link' : 'New nav link'}</h3>
              <button className="adm-modal__close" onClick={() => setEditing(null)}>&times;</button>
            </div>
            <div className="adm-modal__body">
              {COLS.map((c) => (
                <div key={c.key} className="adm-field" style={{ marginBottom: '0.75rem' }}>
                  <label className="adm-label">{c.label}</label>
                  {c.type === 'select' ? (
                    <select
                      className="adm-select"
                      value={editing[c.key] || ''}
                      onChange={(e) => setEditing((p) => ({ ...p, [c.key]: e.target.value }))}
                    >
                      {c.options.map((opt) => <option key={opt} value={opt}>{opt || '— none —'}</option>)}
                    </select>
                  ) : c.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={Boolean(editing[c.key])}
                      onChange={(e) => setEditing((p) => ({ ...p, [c.key]: e.target.checked }))}
                    />
                  ) : c.type === 'number' ? (
                    <input
                      className="adm-input"
                      type="number"
                      value={editing[c.key] ?? ''}
                      onChange={(e) => setEditing((p) => ({ ...p, [c.key]: e.target.value === '' ? null : Number(e.target.value) }))}
                    />
                  ) : (
                    <input
                      className="adm-input"
                      value={editing[c.key] || ''}
                      onChange={(e) => setEditing((p) => ({ ...p, [c.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="adm-btn adm-btn--primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
