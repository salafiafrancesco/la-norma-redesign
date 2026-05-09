import { useEffect, useState } from 'react';
import { content as contentApi } from '../api/client';

/**
 * Friendly editor for the homepage "menu highlights" data
 * (label / headline / note / categories[name][items[name, desc, price]]).
 *
 * Persists to /api/content/menu — same endpoint the public site reads from.
 * Replaces the raw JSON editor for this section in ContentEditor.
 */
export default function MenuManager() {
  const [data, setData] = useState({ label: '', headline: '', note: '', categories: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [activeCat, setActiveCat] = useState(0);

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const fetched = await contentApi.getSection('menu');
      setData({
        label: fetched.label || '',
        headline: fetched.headline || '',
        note: fetched.note || '',
        categories: Array.isArray(fetched.categories) ? fetched.categories : [],
      });
    } catch (e) {
      setError(e.message || 'Unable to load menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      // Strip empty categories/items before saving
      const clean = {
        ...data,
        categories: data.categories
          .filter((c) => (c.name || '').trim().length > 0)
          .map((c) => ({
            name: c.name.trim(),
            items: (c.items || [])
              .filter((it) => (it.name || '').trim().length > 0)
              .map((it) => ({
                name: it.name.trim(),
                desc: (it.desc || '').trim(),
                price: (it.price || '').trim(),
              })),
          })),
      };
      await contentApi.updateSection('menu', clean);
      setData(clean);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (e) {
      setError(e.message || 'Unable to save.');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    setData((d) => ({
      ...d,
      categories: [...d.categories, { name: 'New category', items: [] }],
    }));
    setActiveCat(data.categories.length);
  };

  const removeCategory = (index) => {
    if (!window.confirm(`Remove category "${data.categories[index]?.name || ''}" and all its items?`)) return;
    setData((d) => {
      const next = d.categories.filter((_, i) => i !== index);
      return { ...d, categories: next };
    });
    setActiveCat((c) => Math.max(0, Math.min(c, data.categories.length - 2)));
  };

  const moveCategory = (index, dir) => {
    setData((d) => {
      const next = [...d.categories];
      const target = index + dir;
      if (target < 0 || target >= next.length) return d;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...d, categories: next };
    });
    setActiveCat((c) => (c === index ? index + dir : c));
  };

  const updateCategory = (index, patch) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  };

  const addItem = (catIndex) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c, i) =>
        i === catIndex ? { ...c, items: [...(c.items || []), { name: '', desc: '', price: '' }] } : c,
      ),
    }));
  };

  const removeItem = (catIndex, itemIndex) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c, i) =>
        i === catIndex ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) } : c,
      ),
    }));
  };

  const moveItem = (catIndex, itemIndex, dir) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c, i) => {
        if (i !== catIndex) return c;
        const next = [...c.items];
        const target = itemIndex + dir;
        if (target < 0 || target >= next.length) return c;
        [next[itemIndex], next[target]] = [next[target], next[itemIndex]];
        return { ...c, items: next };
      }),
    }));
  };

  const updateItem = (catIndex, itemIndex, patch) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c, i) => {
        if (i !== catIndex) return c;
        return {
          ...c,
          items: c.items.map((it, j) => (j === itemIndex ? { ...it, ...patch } : it)),
        };
      }),
    }));
  };

  if (loading) {
    return (
      <div className="adm-flex adm-flex--center" style={{ padding: '3rem 0', color: '#6B7280' }}>
        <div className="adm-spinner" style={{ marginRight: '0.75rem' }} /> Loading menu…
      </div>
    );
  }

  const cat = data.categories[activeCat];

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">Menu</h2>
        <div className="adm-toolbar__spacer" />
        {savedFlash && (
          <span style={{ color: '#16a34a', fontSize: '0.85rem', marginRight: '0.75rem' }}>Saved ✓</span>
        )}
        <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
        <h3 className="adm-card__title">Section header</h3>
        <p className="adm-card__lead">These appear above the menu preview on the homepage.</p>
        <div className="adm-form-grid">
          <label className="adm-field">
            <span>Eyebrow label</span>
            <input
              className="adm-input"
              value={data.label}
              onChange={(e) => setData((d) => ({ ...d, label: e.target.value }))}
              placeholder="A Taste of the Menu"
            />
          </label>
          <label className="adm-field" style={{ gridColumn: '1 / -1' }}>
            <span>Headline (use \n for line break)</span>
            <textarea
              className="adm-input"
              rows={2}
              value={data.headline}
              onChange={(e) => setData((d) => ({ ...d, headline: e.target.value }))}
              placeholder="Seasonal ingredients.\nA distinctly Sicilian point of view."
            />
          </label>
          <label className="adm-field" style={{ gridColumn: '1 / -1' }}>
            <span>Footer note</span>
            <textarea
              className="adm-input"
              rows={2}
              value={data.note}
              onChange={(e) => setData((d) => ({ ...d, note: e.target.value }))}
              placeholder="Menus evolve with the season..."
            />
          </label>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar" style={{ marginBottom: '1rem' }}>
          <h3 className="adm-card__title" style={{ margin: 0 }}>Categories &amp; dishes</h3>
          <div className="adm-toolbar__spacer" />
          <button className="adm-btn" onClick={addCategory}>+ Add category</button>
        </div>

        {data.categories.length === 0 ? (
          <p style={{ color: '#6B7280', padding: '1rem 0' }}>
            No categories yet. Add one to start building the menu.
          </p>
        ) : (
          <>
            {/* Tabs */}
            <div role="tablist" style={{
              display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
              borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '1rem', paddingBottom: '0.5rem',
            }}>
              {data.categories.map((c, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === activeCat}
                  className={`adm-btn ${i === activeCat ? 'adm-btn--primary' : ''}`}
                  onClick={() => setActiveCat(i)}
                  style={{ fontSize: '0.85rem' }}
                >
                  {c.name || `Untitled ${i + 1}`}
                  <span style={{ marginLeft: '0.4rem', opacity: 0.55 }}>({(c.items || []).length})</span>
                </button>
              ))}
            </div>

            {/* Active category editor */}
            {cat && (
              <div>
                <div className="adm-form-grid" style={{ marginBottom: '0.85rem' }}>
                  <label className="adm-field" style={{ gridColumn: '1 / -1' }}>
                    <span>Category name</span>
                    <input
                      className="adm-input"
                      value={cat.name || ''}
                      onChange={(e) => updateCategory(activeCat, { name: e.target.value })}
                    />
                  </label>
                </div>

                <div className="adm-flex adm-gap-2" style={{ marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                  <button className="adm-btn" onClick={() => moveCategory(activeCat, -1)} disabled={activeCat === 0}>← Move category left</button>
                  <button className="adm-btn" onClick={() => moveCategory(activeCat, 1)} disabled={activeCat === data.categories.length - 1}>Move category right →</button>
                  <button className="adm-btn adm-btn--danger" onClick={() => removeCategory(activeCat)}>Delete category</button>
                </div>

                <table className="adm-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '24%' }}>Name</th>
                      <th>Description</th>
                      <th style={{ width: '12%' }}>Price</th>
                      <th style={{ width: '10rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cat.items || []).map((item, j) => (
                      <tr key={j}>
                        <td>
                          <input
                            className="adm-input"
                            value={item.name || ''}
                            onChange={(e) => updateItem(activeCat, j, { name: e.target.value })}
                            placeholder="Pasta alla Norma"
                          />
                        </td>
                        <td>
                          <input
                            className="adm-input"
                            value={item.desc || ''}
                            onChange={(e) => updateItem(activeCat, j, { desc: e.target.value })}
                            placeholder="Rigatoni, eggplant, San Marzano…"
                          />
                        </td>
                        <td>
                          <input
                            className="adm-input"
                            value={item.price || ''}
                            onChange={(e) => updateItem(activeCat, j, { price: e.target.value })}
                            placeholder="$26"
                          />
                        </td>
                        <td>
                          <div className="adm-flex adm-gap-1" style={{ flexWrap: 'wrap' }}>
                            <button className="adm-btn adm-btn--sm" onClick={() => moveItem(activeCat, j, -1)} disabled={j === 0} aria-label="Move up">↑</button>
                            <button className="adm-btn adm-btn--sm" onClick={() => moveItem(activeCat, j, 1)} disabled={j === cat.items.length - 1} aria-label="Move down">↓</button>
                            <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => removeItem(activeCat, j)} aria-label="Delete dish">×</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button className="adm-btn" onClick={() => addItem(activeCat)} style={{ marginTop: '0.85rem' }}>
                  + Add dish to {cat.name || 'this category'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
