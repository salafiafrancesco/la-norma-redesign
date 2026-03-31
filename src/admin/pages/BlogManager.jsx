import { useEffect, useMemo, useState } from 'react';
import { blog as blogApi, uploads as uploadsApi } from '../api/client';

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: 'Dining Guide',
  tags: 'Longboat Key dining, Italian restaurant',
  author_name: 'La Norma Editorial Team',
  cover_image: '',
  cover_image_alt: '',
  excerpt: '',
  body: '',
  seo_title: '',
  seo_description: '',
  featured: false,
  status: 'draft',
  published_at: '',
};

function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (entry) => String(entry).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(value) {
  if (!value) return 'Draft';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState('');
  const [source, setSource] = useState('admin');
  const [deleting, setDeleting] = useState(null);
  const readOnly = source !== 'admin';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    blogApi.listWithMeta(statusFilter ? { status: statusFilter } : {})
      .then(({ items: nextItems, source: nextSource }) => {
        if (!cancelled) {
          setItems(nextItems);
          setSource(nextSource);
        }
      })
      .catch((entryError) => {
        if (!cancelled) {
          setError(entryError.message);
          setSource('admin');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const filteredItems = useMemo(() => {
    const search = searchValue.trim().toLowerCase();
    if (!search) return items;

    return items.filter((item) =>
      [
        item.title,
        item.slug,
        item.category,
        ...(item.tags || []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [items, searchValue]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(id);

    try {
      await blogApi.delete(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (entryError) {
      setError(entryError.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleQuickStatusChange = async (item, status) => {
    try {
      const updated = await blogApi.update(item.id, {
        status,
        published_at: status === 'published' ? item.published_at || new Date().toISOString() : item.published_at,
      });
      setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
    } catch (entryError) {
      setError(entryError.message);
    }
  };

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}
      {readOnly && (
        <div className="adm-alert adm-alert--info">
          Journal editing is temporarily unavailable on the connected backend. Published posts are still visible here in read-only mode.
        </div>
      )}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">Journal</h2>
        <div className="adm-toolbar__spacer" />
        {!readOnly && (
          <button className="adm-btn adm-btn--primary" onClick={() => setModal(EMPTY_FORM)}>
            + New Post
          </button>
        )}
      </div>

      <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
        <div className="adm-card__title">
          Editorial flow
          <span className="adm-card__title-meta">draft, publish, update</span>
        </div>
        <div className="adm-flex adm-gap-2" style={{ flexWrap: 'wrap' }}>
          <select
            className="adm-select"
            style={{ width: 'auto', minWidth: 180 }}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          <input
            className="adm-input"
            style={{ minWidth: 260, maxWidth: 360 }}
            type="search"
            placeholder="Search title, slug, category, or tag"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>
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
                  <th>Published</th>
                  <th>Post</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="7" className="adm-table__empty">No posts found yet.</td>
                  </tr>
                )}

                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.published_at)}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                      <div className="adm-text-muted adm-text-sm">{item.slug}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      {readOnly ? (
                        <span className={`adm-badge adm-badge--${item.status || 'inactive'}`}>{item.status || 'published'}</span>
                      ) : (
                        <select
                          className="adm-select"
                          style={{ width: 'auto', minWidth: 140 }}
                          value={item.status}
                          onChange={(event) => handleQuickStatusChange(item, event.target.value)}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      )}
                    </td>
                    <td>{item.featured ? 'Yes' : 'No'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.updated_at)}</td>
                    <td>
                      {readOnly ? (
                        <span className="adm-text-muted adm-text-sm">Read only</span>
                      ) : (
                        <div className="adm-flex adm-gap-1">
                          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setModal({ ...item })}>
                            Edit
                          </button>
                          <button
                            className="adm-btn adm-btn--danger adm-btn--sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                          >
                            {deleting === item.id ? '...' : 'Delete'}
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

      {modal && (
        <BlogPostModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            setItems((current) => {
              const exists = current.find((item) => item.id === saved.id);
              return exists
                ? current.map((item) => (item.id === saved.id ? saved : item))
                : [saved, ...current];
            });
            setModal(null);
          }}
        />
      )}
    </>
  );
}

function BlogPostModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({
    ...initial,
    tags: Array.isArray(initial?.tags) ? initial.tags.join(', ') : (initial?.tags || ''),
    published_at: toDateTimeLocal(initial?.published_at),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleImageUpload = async (file) => {
    try {
      const { url } = await uploadsApi.upload(file);
      setField('cover_image', url);
    } catch (entryError) {
      setError(`Upload failed: ${entryError.message}`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title || !form.body) {
      setError('Title and body are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        tags: form.tags,
        featured: Boolean(form.featured),
        published_at: form.published_at ? new Date(form.published_at).toISOString() : '',
      };

      const saved = isEdit
        ? await blogApi.update(form.id, payload)
        : await blogApi.create(payload);

      onSaved(saved);
    } catch (entryError) {
      setError(entryError.message);
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="adm-modal" style={{ maxWidth: 920 }}>
        <div className="adm-modal__header">
          <h3 className="adm-modal__title">{isEdit ? 'Edit Post' : 'New Journal Post'}</h3>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close">x</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="adm-modal__body">
            {error && <div className="adm-alert adm-alert--error">{error}</div>}

            <div className="adm-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="adm-field">
                <label className="adm-label">Title *</label>
                <input className="adm-input" type="text" value={form.title} onChange={(event) => setField('title', event.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Slug</label>
                <input className="adm-input" type="text" value={form.slug || ''} onChange={(event) => setField('slug', event.target.value)} placeholder="auto-generated-if-empty" />
              </div>
            </div>

            <div className="adm-grid-3" style={{ marginBottom: '1rem' }}>
              <div className="adm-field">
                <label className="adm-label">Category</label>
                <input className="adm-input" type="text" value={form.category || ''} onChange={(event) => setField('category', event.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Author</label>
                <input className="adm-input" type="text" value={form.author_name || ''} onChange={(event) => setField('author_name', event.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Tags</label>
                <input className="adm-input" type="text" value={form.tags || ''} onChange={(event) => setField('tags', event.target.value)} placeholder="tag 1, tag 2, tag 3" />
              </div>
            </div>

            <div className="adm-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="adm-field">
                <label className="adm-label">Status</label>
                <select className="adm-select" value={form.status} onChange={(event) => setField('status', event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="adm-field">
                <label className="adm-label">Publish date</label>
                <input className="adm-input" type="datetime-local" value={form.published_at || ''} onChange={(event) => setField('published_at', event.target.value)} />
              </div>
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Cover image</label>
              <div className="adm-img-upload">
                {form.cover_image && <img src={form.cover_image} className="adm-img-preview" alt="" />}
                <div>
                  <input className="adm-input" type="url" value={form.cover_image || ''} onChange={(event) => setField('cover_image', event.target.value)} placeholder="https://..." style={{ marginBottom: '0.5rem' }} />
                  <label className="adm-btn adm-btn--secondary adm-btn--sm" style={{ cursor: 'pointer' }}>
                    Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => event.target.files?.[0] && handleImageUpload(event.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Cover image alt text</label>
              <input className="adm-input" type="text" value={form.cover_image_alt || ''} onChange={(event) => setField('cover_image_alt', event.target.value)} />
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Excerpt</label>
              <textarea className="adm-textarea" rows={3} value={form.excerpt || ''} onChange={(event) => setField('excerpt', event.target.value)} placeholder="Short summary shown on cards and previews" />
            </div>

            <div className="adm-field" style={{ marginBottom: '1rem' }}>
              <label className="adm-label">Body *</label>
              <textarea className="adm-textarea" rows={14} value={form.body || ''} onChange={(event) => setField('body', event.target.value)} placeholder="Use plain paragraphs. Add sections with ## headings and lists with - bullets." />
              <div className="adm-field__hint">Supports plain text, `##` section headings, `###` subheadings, and `-` bullet lists.</div>
            </div>

            <div className="adm-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="adm-field">
                <label className="adm-label">SEO title</label>
                <input className="adm-input" type="text" value={form.seo_title || ''} onChange={(event) => setField('seo_title', event.target.value)} />
              </div>
              <div className="adm-field">
                <label className="adm-label">SEO description</label>
                <textarea className="adm-textarea" rows={3} value={form.seo_description || ''} onChange={(event) => setField('seo_description', event.target.value)} />
              </div>
            </div>

            <div className="adm-field adm-field--row">
              <label className="adm-toggle">
                <input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setField('featured', event.target.checked)} />
                <span className="adm-toggle__slider" />
              </label>
              <span className="adm-label">Feature this post in the journal</span>
            </div>
          </div>

          <div className="adm-modal__footer">
            <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
