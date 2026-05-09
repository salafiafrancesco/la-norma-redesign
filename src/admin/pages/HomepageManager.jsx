import { useEffect, useState } from 'react';
import {
  content as contentApi,
  homepageContent as hpApi,
} from '../api/client';
import ImageField from '../components/ImageField';

function CollectionTab({ collection, label, columns, emptyRow }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    hpApi.getCollection(collection)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [collection]);

  const handleSave = async () => {
    try {
      if (editing.id) {
        const updated = await hpApi.update(collection, editing.id, editing);
        setItems((p) => p.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await hpApi.create(collection, editing);
        setItems((p) => [...p, created]);
      }
      setEditing(null);
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      await hpApi.delete(collection, id);
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
              <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th>Actions</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={columns.length + 1} className="adm-table__empty">No items yet.</td></tr>}
                {items.map((item) => (
                  <tr key={item.id}>
                    {columns.map((c) => <td key={c.key} style={c.style}>{c.render ? c.render(item[c.key], item) : (item[c.key] || '—')}</td>)}
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
              {columns.filter((c) => c.editable !== false).map((c) => {
                const isImage = c.type === 'image' || /image_url$|^image$|_image_url$/.test(c.key);
                return (
                  <div key={c.key} className="adm-field" style={{ marginBottom: '0.75rem' }}>
                    {isImage ? (
                      <ImageField
                        label={c.label}
                        value={editing[c.key] || ''}
                        onChange={(url) => setEditing((p) => ({ ...p, [c.key]: url }))}
                      />
                    ) : (
                      <>
                        <label className="adm-label">{c.label}</label>
                        {c.type === 'textarea' ? (
                          <textarea className="adm-textarea" value={editing[c.key] || ''} onChange={(e) => setEditing((p) => ({ ...p, [c.key]: e.target.value }))} />
                        ) : c.type === 'number' ? (
                          <input className="adm-input" type="number" value={editing[c.key] ?? ''} onChange={(e) => setEditing((p) => ({ ...p, [c.key]: Number(e.target.value) }))} />
                        ) : (
                          <input className="adm-input" value={editing[c.key] || ''} onChange={(e) => setEditing((p) => ({ ...p, [c.key]: e.target.value }))} />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
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

function PageContentTab() {
  const SECTIONS = ['hero', 'story', 'reservation_banner', 'order_online'];
  const [active, setActive] = useState('hero');
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    contentApi.getSection(active)
      .then((d) => setJson(JSON.stringify(d, null, 2)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [active]);

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('');
    try {
      await contentApi.updateSection(active, JSON.parse(json));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="adm-flex adm-gap-2" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
        {SECTIONS.map((s) => (
          <button key={s} className={`adm-btn adm-btn--sm ${active === s ? 'adm-btn--primary' : 'adm-btn--secondary'}`} onClick={() => setActive(s)}>{s.replace('_', ' ')}</button>
        ))}
      </div>
      {error && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {saved && <div className="adm-alert adm-alert--success" style={{ marginBottom: '1rem' }}>Saved.</div>}
      {loading ? <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div> : (
        <>
          <textarea className="adm-textarea" style={{ fontFamily: 'monospace', fontSize: '0.82rem', minHeight: '20rem' }} value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
          <div style={{ marginTop: '1rem' }}>
            <button className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </>
      )}
    </div>
  );
}

function NewsletterTab() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hpApi.listSubscribers()
      .then(setSubs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-card">
      {loading ? (
        <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Email</th><th>Source</th><th>Subscribed</th></tr></thead>
            <tbody>
              {subs.length === 0 && <tr><td colSpan="3" className="adm-table__empty">No subscribers yet.</td></tr>}
              {subs.map((s) => (
                <tr key={s.id}>
                  <td>{s.email}</td>
                  <td>{s.source}</td>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(s.subscribed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const STATS_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'value', label: 'Value' },
  { key: 'label', label: 'Label' },
];

const BEYOND_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'title', label: 'Title' },
  { key: 'body', label: 'Body', type: 'textarea' },
  { key: 'link', label: 'Link' },
  { key: 'image_url', label: 'Image URL' },
  { key: 'cta_label', label: 'CTA label' },
];

const AGG_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'source', label: 'Source' },
  { key: 'rating', label: 'Rating', type: 'number' },
  { key: 'review_count', label: 'Reviews', type: 'number' },
  { key: 'link', label: 'Link' },
];

const QUOTE_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'text', label: 'Quote', type: 'textarea' },
  { key: 'author_name', label: 'Author' },
  { key: 'author_role', label: 'Role / Location' },
];

const VISIT_COLS = [
  { key: 'sort_order', label: 'Order', type: 'number', style: { width: 50 } },
  { key: 'day_label', label: 'Day' },
  { key: 'note', label: 'Note' },
];

export default function HomepageManager() {
  const [tab, setTab] = useState('content');

  const TABS = [
    { key: 'content', label: 'Page Content' },
    { key: 'stats', label: 'Signature Stats' },
    { key: 'beyond', label: 'Beyond Dinner' },
    { key: 'aggregators', label: 'Ratings' },
    { key: 'quotes', label: 'Quotes' },
    { key: 'visitNotes', label: 'Visit Notes' },
    { key: 'newsletter', label: 'Newsletter' },
  ];

  return (
    <>
      <div className="adm-toolbar">
        <h2 className="adm-section-title">Homepage</h2>
        <div className="adm-toolbar__spacer" />
      </div>
      <div className="adm-tabs" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`adm-tab${tab === t.key ? ' is-active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'content' && <PageContentTab />}
      {tab === 'stats' && <CollectionTab collection="stats" label="Stat" columns={STATS_COLS} emptyRow={{ sort_order: 0, value: '', label: '' }} />}
      {tab === 'beyond' && <CollectionTab collection="beyond" label="Beyond Card" columns={BEYOND_COLS} emptyRow={{ sort_order: 0, title: '', body: '', link: '', image_url: '', cta_label: 'Discover' }} />}
      {tab === 'aggregators' && <CollectionTab collection="aggregators" label="Rating Source" columns={AGG_COLS} emptyRow={{ sort_order: 0, source: '', rating: 0, review_count: 0, link: '' }} />}
      {tab === 'quotes' && <CollectionTab collection="quotes" label="Quote" columns={QUOTE_COLS} emptyRow={{ sort_order: 0, text: '', author_name: '', author_role: '' }} />}
      {tab === 'visitNotes' && <CollectionTab collection="visitNotes" label="Visit Note" columns={VISIT_COLS} emptyRow={{ sort_order: 0, day_label: '', note: '' }} />}
      {tab === 'newsletter' && <NewsletterTab />}
    </>
  );
}
