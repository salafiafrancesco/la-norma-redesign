import { useEffect, useState } from 'react';
import { content as contentApi, uploads as uploadsApi } from '../api/client';

const SECTIONS = [
  { key: 'restaurant', label: 'Restaurant Info',      icon: '🍽' },
  { key: 'links',      label: 'External Links',        icon: '🔗' },
  { key: 'hero',       label: 'Hero Section',          icon: '🖼' },
  { key: 'story',      label: 'Our Story',             icon: '📖' },
  { key: 'specialties',label: 'Specialties',           icon: '⭐', isJson: true },
  { key: 'experiences',label: 'Experiences',           icon: '🥂', isJson: true },
  { key: 'menu',       label: 'Menu Highlights',       icon: '📋', isJson: true },
  { key: 'testimonials',label: 'Testimonials',         icon: '💬', isJson: true },
  { key: 'reservation_banner', label: 'Reservation Banner', icon: '🗓' },
  { key: 'order_online',label: 'Order Online',         icon: '📦' },
  { key: 'footer',     label: 'Footer',                icon: '⬇', isJson: true },
];

const IMAGE_KEYS = ['image_url', 'imageUrl'];

export default function ContentEditor() {
  const [activeSection, setActiveSection] = useState('restaurant');
  const [sectionData, setSectionData]     = useState({});
  const [editData, setEditData]           = useState({});
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [error, setError]                 = useState('');

  const section = SECTIONS.find(s => s.key === activeSection);

  useEffect(() => {
    setLoading(true);
    setError('');
    setSaved(false);
    contentApi.getSection(activeSection)
      .then((data) => {
        setSectionData(data);
        if (section?.isJson) {
          setEditData({ _json: JSON.stringify(data, null, 2) });
        } else {
          setEditData(Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v ?? '')])
          ));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeSection]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      let payload;
      if (section?.isJson) {
        try { payload = JSON.parse(editData._json); }
        catch { throw new Error('Invalid JSON — please check the syntax'); }
      } else {
        payload = editData;
      }
      await contentApi.updateSection(activeSection, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key, file) => {
    try {
      const { url } = await uploadsApi.upload(file);
      setEditData(d => ({ ...d, [key]: url }));
    } catch (e) {
      setError('Image upload failed: ' + e.message);
    }
  };

  return (
    <>
      {/* Section tabs */}
      <div className="adm-tabs">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            className={`adm-tab${activeSection === s.key ? ' is-active' : ''}`}
            onClick={() => setActiveSection(s.key)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {error && <div className="adm-alert adm-alert--error">{error}</div>}
      {saved && <div className="adm-alert adm-alert--success">✓ Changes saved successfully</div>}

      <div className="adm-card">
        <div className="adm-section-header">
          <h2 className="adm-card__title" style={{ marginBottom: 0 }}>
            {section?.icon} {section?.label}
          </h2>
          <button
            className="adm-btn adm-btn--primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        <div className="adm-divider" />

        {loading ? (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        ) : section?.isJson ? (
          <JsonEditor
            value={editData._json || ''}
            onChange={(v) => setEditData({ _json: v })}
            section={activeSection}
          />
        ) : (
          <FieldsEditor
            data={editData}
            onChange={(k, v) => setEditData(d => ({ ...d, [k]: v }))}
            onImageUpload={handleImageUpload}
          />
        )}
      </div>
    </>
  );
}

// ── Flat key-value fields editor ──────────────────────────────
function FieldsEditor({ data, onChange, onImageUpload }) {
  return (
    <div className="adm-form">
      {Object.entries(data).map(([key, value]) => {
        const isImageKey = IMAGE_KEYS.includes(key) || key.endsWith('_url');
        const isLong = key.includes('body') || key.includes('sub') ||
                       key.includes('description') || key.includes('note') ||
                       key.includes('quote') || key.includes('tagline');

        return (
          <div key={key} className="adm-field">
            <label className="adm-label">
              {formatLabel(key)}
              <span className="adm-label-hint">{key}</span>
            </label>

            {isImageKey ? (
              <div className="adm-img-upload">
                {value && <img src={value} className="adm-img-preview" alt="" />}
                <div>
                  <input
                    className="adm-input"
                    type="url"
                    value={value}
                    onChange={(e) => onChange(key, e.target.value)}
                    placeholder="https://... or upload below"
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <label className="adm-btn adm-btn--secondary adm-btn--sm" style={{ cursor: 'pointer' }}>
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files[0] && onImageUpload(key, e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            ) : isLong ? (
              <textarea
                className="adm-textarea"
                rows={4}
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
              />
            ) : (
              <input
                className="adm-input"
                type="text"
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── JSON array editor ─────────────────────────────────────────
function JsonEditor({ value, onChange, section }) {
  const hints = {
    specialties:  'Array of objects: id, tag, name, description, price, imageUrl, imageAlt, badge (optional)',
    experiences:  'Array of objects: id, icon, label, title, description, cta, ctaHref',
    menu:         'Object with: label, headline1, headline2, note, categories (array of {id, title, items[]})',
    testimonials: 'Object with: label, headline, items (array of {id, quote, author, location, rating})',
    footer:       'Object with: tagline, nav_items (array of {label, href})',
  };

  return (
    <div>
      {hints[section] && (
        <div className="adm-alert adm-alert--info" style={{ marginBottom: '1rem' }}>
          <strong>Structure:</strong> {hints[section]}
        </div>
      )}
      <div className="adm-field">
        <label className="adm-label">
          JSON Content
          <span className="adm-label-hint">Edit carefully — must be valid JSON</span>
        </label>
        <textarea
          className="adm-textarea adm-textarea--code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={20}
        />
      </div>
    </div>
  );
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}
