import { useEffect, useState } from 'react';
import { siteNavigation } from '../api/client';

const PAGE_KEY_OPTIONS = [
  '', 'home', 'menu', 'about', 'contact', 'faq', 'blog', 'catering',
  'cooking-classes', 'wine-tastings', 'live-music', 'private-events', 'privacy-policy',
];

export default function FooterManager() {
  const [columns, setColumns] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCol, setEditingCol] = useState(null);
  const [editingLink, setEditingLink] = useState(null);

  const load = () => {
    setLoading(true);
    siteNavigation.getAll()
      .then((data) => {
        setColumns(data.footerColumns || []);
        setLinks(data.footerColumnLinks || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaveCol = async () => {
    try {
      if (editingCol.id) {
        const updated = await siteNavigation.updateFooterColumn(editingCol.id, editingCol);
        setColumns((p) => p.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await siteNavigation.createFooterColumn(editingCol);
        setColumns((p) => [...p, created]);
      }
      setEditingCol(null);
    } catch (e) { setError(e.message); }
  };

  const handleDeleteCol = async (id) => {
    if (!window.confirm('Delete this column? All its links will be removed too.')) return;
    try {
      await siteNavigation.deleteFooterColumn(id);
      load();
    } catch (e) { setError(e.message); }
  };

  const handleSaveLink = async () => {
    try {
      const payload = { ...editingLink, column_id: Number(editingLink.column_id) };
      if (editingLink.id) {
        const updated = await siteNavigation.updateFooterLink(editingLink.id, payload);
        setLinks((p) => p.map((l) => (l.id === updated.id ? updated : l)));
      } else {
        const created = await siteNavigation.createFooterLink(payload);
        setLinks((p) => [...p, created]);
      }
      setEditingLink(null);
    } catch (e) { setError(e.message); }
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      await siteNavigation.deleteFooterLink(id);
      setLinks((p) => p.filter((l) => l.id !== id));
    } catch (e) { setError(e.message); }
  };

  if (loading) return <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>;

  return (
    <div>
      <div className="adm-section-title" style={{ marginBottom: '1rem' }}>
        Footer columns &amp; links
        <p className="adm-text-muted" style={{ fontWeight: 400, fontSize: '0.85rem', marginTop: '0.4rem' }}>
          Manage the link columns shown in the site footer. Each column groups related links (About, Experiences, etc).
          Use <code>page_key</code> for internal pages or <code>href</code> for external URLs.
        </p>
      </div>

      {error && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1rem' }}>
        <div style={{ flex: 1 }} />
        <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => setEditingCol({ sort_order: 0, label: '' })}>+ New column</button>
      </div>

      {columns.length === 0 && (
        <div className="adm-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light, #888)' }}>
          No footer columns yet. Click "+ New column" to start.
        </div>
      )}

      {columns.map((col) => {
        const colLinks = links.filter((l) => l.column_id === col.id).sort((a, b) => a.sort_order - b.sort_order);
        return (
          <div key={col.id} className="adm-card" style={{ marginBottom: '1.25rem' }}>
            <div className="adm-flex adm-gap-2" style={{ alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <strong>{col.label}</strong>
              <span className="adm-text-muted" style={{ fontSize: '0.78rem' }}>order: {col.sort_order} · id: {col.id}</span>
              <div style={{ flex: 1 }} />
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setEditingCol({ ...col })}>Edit column</button>
              <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDeleteCol(col.id)}>Delete</button>
              <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => setEditingLink({ column_id: col.id, sort_order: 0, label: '', page_key: '', href: '', target: '' })}>+ Link</button>
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Label</th>
                    <th>Page</th>
                    <th>External URL</th>
                    <th>Target</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colLinks.length === 0 && <tr><td colSpan={6} className="adm-table__empty">No links yet in this column.</td></tr>}
                  {colLinks.map((l) => (
                    <tr key={l.id}>
                      <td>{l.sort_order}</td>
                      <td>{l.label}</td>
                      <td>{l.page_key || '—'}</td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.href || '—'}</td>
                      <td>{l.target || '—'}</td>
                      <td>
                        <div className="adm-flex adm-gap-1">
                          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setEditingLink({ ...l })}>Edit</button>
                          <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDeleteLink(l.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {editingCol && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setEditingCol(null)}>
          <div className="adm-modal">
            <div className="adm-modal__header">
              <h3 className="adm-modal__title">{editingCol.id ? 'Edit column' : 'New column'}</h3>
              <button className="adm-modal__close" onClick={() => setEditingCol(null)}>&times;</button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-field" style={{ marginBottom: '0.75rem' }}>
                <label className="adm-label">Sort order</label>
                <input className="adm-input" type="number" value={editingCol.sort_order ?? 0} onChange={(e) => setEditingCol((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="adm-field" style={{ marginBottom: '0.75rem' }}>
                <label className="adm-label">Label</label>
                <input className="adm-input" value={editingCol.label || ''} onChange={(e) => setEditingCol((p) => ({ ...p, label: e.target.value }))} />
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setEditingCol(null)}>Cancel</button>
              <button className="adm-btn adm-btn--primary" onClick={handleSaveCol}>Save</button>
            </div>
          </div>
        </div>
      )}

      {editingLink && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setEditingLink(null)}>
          <div className="adm-modal">
            <div className="adm-modal__header">
              <h3 className="adm-modal__title">{editingLink.id ? 'Edit link' : 'New link'}</h3>
              <button className="adm-modal__close" onClick={() => setEditingLink(null)}>&times;</button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-field" style={{ marginBottom: '0.75rem' }}>
                <label className="adm-label">Column</label>
                <select className="adm-select" value={editingLink.column_id || ''} onChange={(e) => setEditingLink((p) => ({ ...p, column_id: Number(e.target.value) }))}>
                  {columns.map((c) => <option key={c.id} value={c.id}>{c.label} (id: {c.id})</option>)}
                </select>
              </div>
              <div className="adm-field" style={{ marginBottom: '0.75rem' }}>
                <label className="adm-label">Sort order</label>
                <input className="adm-input" type="number" value={editingLink.sort_order ?? 0} onChange={(e) => setEditingLink((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="adm-field" style={{ marginBottom: '0.75rem' }}>
                <label className="adm-label">Label</label>
                <input className="adm-input" value={editingLink.label || ''} onChange={(e) => setEditingLink((p) => ({ ...p, label: e.target.value }))} />
              </div>
              <div className="adm-field" style={{ marginBottom: '0.75rem' }}>
                <label className="adm-label">Internal page</label>
                <select className="adm-select" value={editingLink.page_key || ''} onChange={(e) => setEditingLink((p) => ({ ...p, page_key: e.target.value }))}>
                  {PAGE_KEY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt || '— none (use external URL) —'}</option>)}
                </select>
              </div>
              <div className="adm-field" style={{ marginBottom: '0.75rem' }}>
                <label className="adm-label">External URL (used if no page selected)</label>
                <input className="adm-input" value={editingLink.href || ''} onChange={(e) => setEditingLink((p) => ({ ...p, href: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="adm-field" style={{ marginBottom: '0.75rem' }}>
                <label className="adm-label">Target (use _blank for new tab)</label>
                <input className="adm-input" value={editingLink.target || ''} onChange={(e) => setEditingLink((p) => ({ ...p, target: e.target.value }))} placeholder="_blank" />
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn adm-btn--secondary" onClick={() => setEditingLink(null)}>Cancel</button>
              <button className="adm-btn adm-btn--primary" onClick={handleSaveLink}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
