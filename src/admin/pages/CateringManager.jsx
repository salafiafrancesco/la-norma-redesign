import { useEffect, useState } from 'react';
import {
  content as contentApi,
  cateringContent as ccApi,
  cateringRequests as requestsApi,
  uploads as uploadsApi,
} from '../api/client';

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];
const STATUS_COLORS = { new: '#dc2626', contacted: '#d97706', closed: '#16a34a' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function exportToCsv(items) {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Event Date', 'Event Type', 'Location', 'Budget', 'Guests', 'Message', 'Status', 'Created'];
  const rows = items.map((r) => [
    r.id, `"${(r.name || '').replace(/"/g, '""')}"`, r.email, r.phone || '', r.event_date || '',
    r.event_type || '', r.location_type || '', r.budget_range || '', r.guests ?? '',
    `"${(r.message || '').replace(/"/g, '""')}"`, r.status, r.created_at,
  ]);
  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `catering-requests-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ================================================================
// Generic Collection CRUD Tab
// ================================================================
function CollectionTab({ collection, label, columns, emptyRow }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    ccApi.getCollection(collection)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [collection]);

  const handleSave = async () => {
    try {
      if (editing.id) {
        const updated = await ccApi.update(collection, editing.id, editing);
        setItems((p) => p.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await ccApi.create(collection, editing);
        setItems((p) => [...p, created]);
      }
      setEditing(null);
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      await ccApi.delete(collection, id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}
      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1rem' }}>
        <div style={{ flex: 1 }} />
        <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => setEditing({ ...emptyRow })}>+ New {label}</button>
      </div>
      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}<th>Actions</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={columns.length + 1} className="adm-table__empty">No items yet.</td></tr>}
                {items.map((item) => (
                  <tr key={item.id}>
                    {columns.map((col) => (
                      <td key={col.key} style={col.style}>
                        {col.render ? col.render(item[col.key], item) : (item[col.key] || '—')}
                      </td>
                    ))}
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
              <h3 className="adm-modal__title">{editing.id ? `Edit ${label}` : `New ${label}`}</h3>
              <button className="adm-modal__close" onClick={() => setEditing(null)}>&times;</button>
            </div>
            <div className="adm-modal__body">
              {columns.filter((col) => col.editable !== false).map((col) => (
                <div key={col.key} className="adm-field" style={{ marginBottom: '0.75rem' }}>
                  <label className="adm-label">{col.label}</label>
                  {col.type === 'textarea' ? (
                    <textarea className="adm-textarea" value={editing[col.key] || ''} onChange={(e) => setEditing((p) => ({ ...p, [col.key]: e.target.value }))} />
                  ) : col.type === 'checkbox' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={Boolean(editing[col.key])} onChange={(e) => setEditing((p) => ({ ...p, [col.key]: e.target.checked }))} />
                      {col.label}
                    </label>
                  ) : col.type === 'number' ? (
                    <input className="adm-input" type="number" value={editing[col.key] ?? ''} onChange={(e) => setEditing((p) => ({ ...p, [col.key]: Number(e.target.value) }))} />
                  ) : (
                    <input className="adm-input" value={editing[col.key] || ''} onChange={(e) => setEditing((p) => ({ ...p, [col.key]: e.target.value }))} />
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
    </>
  );
}

// ================================================================
// Page Content Editor (JSON)
// ================================================================
function PageContentTab() {
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    contentApi.getSection('catering')
      .then((data) => setJson(JSON.stringify(data, null, 2)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('');
    try {
      await contentApi.updateSection('catering', JSON.parse(json));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>;

  return (
    <div>
      {error && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {saved && <div className="adm-alert adm-alert--success" style={{ marginBottom: '1rem' }}>Saved.</div>}
      <p className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.75rem' }}>
        Edit hero, statement, yacht section, CTA, contact, and SEO fields. Collections (tiers, offerings, gallery, etc.) are managed in their own tabs.
      </p>
      <textarea className="adm-textarea" style={{ fontFamily: 'monospace', fontSize: '0.82rem', minHeight: '24rem' }} value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
      <div style={{ marginTop: '1rem' }}>
        <button className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Content'}</button>
      </div>
    </div>
  );
}

// ================================================================
// Requests Tab
// ================================================================
function RequestsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let c = false;
    const params = {};
    if (statusFilter) params.status = statusFilter;
    requestsApi.list(params)
      .then((d) => { if (!c) setItems(d); })
      .catch((e) => { if (!c) setError(e.message); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, [statusFilter]);

  const handleStatus = async (id, status) => {
    try {
      const updated = await requestsApi.update(id, { status });
      setItems((p) => p.map((i) => (i.id === id ? updated : i)));
      if (detail?.id === id) setDetail(updated);
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await requestsApi.delete(id);
      setItems((p) => p.filter((i) => i.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch (e) { setError(e.message); }
  };

  const newCount = items.filter((i) => i.status === 'new').length;

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}
      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select className="adm-select" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={(e) => { setLoading(true); setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {newCount > 0 && <span style={{ fontSize: '0.85rem', color: '#dc2626', alignSelf: 'center' }}>{newCount} new</span>}
        <div style={{ flex: 1 }} />
        <button className="adm-btn adm-btn--secondary adm-btn--sm" onClick={() => exportToCsv(items)} disabled={items.length === 0}>Export CSV</button>
      </div>
      <div className="adm-card">
        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Date</th><th>Name</th><th>Type</th><th>Location</th><th>Guests</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan="7" className="adm-table__empty">No requests.</td></tr>}
                {items.map((r) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(r)}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{formatDate(r.created_at)}</td>
                    <td><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</div><div className="adm-text-muted adm-text-sm">{r.email}</div></td>
                    <td style={{ fontSize: '0.85rem' }}>{r.event_type || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{r.location_type || '—'}</td>
                    <td>{r.guests ?? '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select className="adm-select" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8125rem', color: STATUS_COLORS[r.status] }} value={r.status} onChange={(e) => handleStatus(r.id, e.target.value)}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="adm-flex adm-gap-1">
                        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setDetail(r)}>View</button>
                        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDelete(r.id)}>Delete</button>
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
              <h3 className="adm-modal__title">Request #{detail.id}</h3>
              <button className="adm-modal__close" onClick={() => setDetail(null)}>&times;</button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-grid-2" style={{ marginBottom: '1.25rem' }}>
                {[['Name', detail.name], ['Email', detail.email], ['Phone', detail.phone || '—'], ['Event Date', detail.event_date || '—'],
                  ['Event Type', detail.event_type || '—'], ['Guests', detail.guests ?? '—'], ['Location', detail.location_type || '—'], ['Budget', detail.budget_range || '—'],
                ].map(([l, v]) => <div key={l}><div className="adm-text-muted adm-text-sm">{l}</div><div style={{ fontWeight: 500 }}>{v}</div></div>)}
              </div>
              {detail.message && <div style={{ marginBottom: '1rem' }}><div className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.3rem' }}>Message</div><div style={{ background: 'var(--adm-bg)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{detail.message}</div></div>}
              <div className="adm-field"><label className="adm-label">Status</label><select className="adm-select" style={{ width: 'auto', minWidth: 160 }} value={detail.status} onChange={(e) => handleStatus(detail.id, e.target.value)}>{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn adm-btn--danger" onClick={() => { handleDelete(detail.id); setDetail(null); }}>Delete</button>
              <div style={{ flex: 1 }} />
              <a className="adm-btn adm-btn--secondary" href={`mailto:${detail.email}?subject=Re: Your catering inquiry at La Norma`}>Reply</a>
              <button className="adm-btn adm-btn--primary" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ================================================================
// Collection tab configs
// ================================================================
const TIER_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'title', label: 'Title' },
  { key: 'range_label', label: 'Range' },
  { key: 'badge_label', label: 'Badge' },
  { key: 'body', label: 'Body', type: 'textarea' },
  { key: 'ideal_for', label: 'Ideal for', type: 'textarea' },
  { key: 'image_url', label: 'Image URL' },
  { key: 'cta_label', label: 'CTA label' },
];

const SIG_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'image_url', label: 'Image URL' },
];

const GALLERY_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'image_url', label: 'Image URL' },
  { key: 'dish_name', label: 'Dish name' },
  { key: 'category', label: 'Category' },
  { key: 'alt_text', label: 'Alt text' },
];

const PROCESS_COLS = [
  { key: 'step_number', label: 'Step #', type: 'number', style: { width: 50 } },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const PORTFOLIO_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'title', label: 'Title' },
  { key: 'tag', label: 'Tag' },
  { key: 'headcount', label: 'Headcount' },
  { key: 'image_url', label: 'Image URL' },
  { key: 'is_placeholder', label: 'Placeholder?', type: 'checkbox', render: (v) => v ? '⚠️ Yes' : 'No' },
];

const TESTIMONIAL_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'quote', label: 'Quote', type: 'textarea' },
  { key: 'author_name', label: 'Author' },
  { key: 'author_role', label: 'Role' },
  { key: 'is_placeholder', label: 'Placeholder?', type: 'checkbox', render: (v) => v ? '⚠️ Yes' : 'No' },
];

const FAQ_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'question', label: 'Question' },
  { key: 'answer', label: 'Answer', type: 'textarea' },
];

// ================================================================
// Main component with tabs
// ================================================================
export default function CateringManager() {
  const [tab, setTab] = useState('requests');

  const TABS = [
    { key: 'requests', label: 'Requests' },
    { key: 'tiers', label: 'Service Tiers' },
    { key: 'signatures', label: 'Offerings' },
    { key: 'gallery', label: 'Menu Gallery' },
    { key: 'process', label: 'Process' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'faqs', label: 'FAQ' },
    { key: 'content', label: 'Page Content' },
  ];

  return (
    <>
      <div className="adm-toolbar">
        <h2 className="adm-section-title">Catering</h2>
        <div className="adm-toolbar__spacer" />
      </div>

      <div className="adm-tabs" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`adm-tab${tab === t.key ? ' is-active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'requests' && <RequestsTab />}
      {tab === 'tiers' && <CollectionTab collection="tiers" label="Service Tier" columns={TIER_COLS} emptyRow={{ sort_order: 0, title: '', range_label: '', ideal_for: '', body: '', image_url: '', badge_label: '', cta_label: 'Inquire about this format' }} />}
      {tab === 'signatures' && <CollectionTab collection="signatures" label="Offering" columns={SIG_COLS} emptyRow={{ sort_order: 0, title: '', description: '', image_url: '' }} />}
      {tab === 'gallery' && <CollectionTab collection="gallery" label="Gallery Image" columns={GALLERY_COLS} emptyRow={{ sort_order: 0, image_url: '', dish_name: '', category: '', alt_text: '' }} />}
      {tab === 'process' && <CollectionTab collection="process" label="Process Step" columns={PROCESS_COLS} emptyRow={{ step_number: 1, title: '', description: '' }} />}
      {tab === 'portfolio' && <CollectionTab collection="portfolio" label="Portfolio Event" columns={PORTFOLIO_COLS} emptyRow={{ sort_order: 0, title: '', tag: '', headcount: '', image_url: '', is_placeholder: true }} />}
      {tab === 'testimonials' && <CollectionTab collection="testimonials" label="Testimonial" columns={TESTIMONIAL_COLS} emptyRow={{ sort_order: 0, quote: '', author_name: '', author_role: '', is_placeholder: true }} />}
      {tab === 'faqs' && <CollectionTab collection="faqs" label="FAQ" columns={FAQ_COLS} emptyRow={{ sort_order: 0, question: '', answer: '' }} />}
      {tab === 'content' && <PageContentTab />}
    </>
  );
}
