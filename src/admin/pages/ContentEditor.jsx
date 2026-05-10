import { useEffect, useMemo, useState } from 'react';
import {
  CONTENT_SECTIONS,
  CONTENT_SECTION_MAP,
} from '../../../shared/contentSchema.js';
import { content as contentApi, uploads as uploadsApi } from '../api/client';
import VideoField from '../components/VideoField';

const IMAGE_KEYS = ['image_url', 'imageUrl'];

// Sections grouped into three logical categories so the picker stays
// readable when there are 20+ sections. Any section key not listed here
// (e.g. a future addition) is appended to the "Other" group at the end.
const SECTION_GROUPS = [
  {
    label: 'Site & brand',
    keys: ['restaurant', 'links', 'general', 'footer', 'theme'],
  },
  {
    label: 'Homepage',
    keys: ['hero', 'story', 'specialties', 'experiences', 'menu', 'testimonials', 'reservation_banner', 'order_online'],
  },
  {
    label: 'Pages',
    keys: ['catering', 'menuPage', 'aboutPage', 'contactPage', 'faqPage', 'cookingClassesPage', 'wineTastingsPage', 'liveMusicPage', 'privateEventsPage'],
  },
];

function buildGroupedSections() {
  const placed = new Set();
  const groups = SECTION_GROUPS.map((group) => ({
    label: group.label,
    items: group.keys
      .map((key) => CONTENT_SECTION_MAP[key])
      .filter(Boolean)
      .map((section) => {
        placed.add(section.key);
        return section;
      }),
  }));

  const orphans = CONTENT_SECTIONS.filter((section) => !placed.has(section.key));
  if (orphans.length > 0) {
    groups.push({ label: 'Other', items: orphans });
  }

  return groups.filter((group) => group.items.length > 0);
}

function buildEditState(sectionConfig, data = {}) {
  if (!sectionConfig) return {};

  if (sectionConfig.editor === 'json') {
    return { _json: JSON.stringify(data, null, 2) };
  }

  return Object.fromEntries(
    sectionConfig.fields.map((field) => [field.key, String(data[field.key] ?? '')]),
  );
}

export default function ContentEditor() {
  const [activeSection, setActiveSection] = useState(CONTENT_SECTIONS[0].key);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const sectionConfig = useMemo(
    () => CONTENT_SECTION_MAP[activeSection],
    [activeSection],
  );

  const groupedSections = useMemo(() => buildGroupedSections(), []);

  useEffect(() => {
    let cancelled = false;
    setError('');
    setSaved(false);

    contentApi.getSection(activeSection)
      .then((data) => {
        if (!cancelled) {
          setEditData(buildEditState(sectionConfig, data));
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeSection, sectionConfig]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const payload = sectionConfig.editor === 'json'
        ? JSON.parse(editData._json || '{}')
        : editData;

      await contentApi.updateSection(activeSection, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      setError(saveError.message || 'Unable to save this section.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key, file) => {
    try {
      const { url } = await uploadsApi.upload(file);
      setEditData((current) => ({ ...current, [key]: url }));
    } catch (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
    }
  };

  return (
    <>
      <div className="adm-section-picker">
        {groupedSections.map((group) => (
          <div className="adm-section-picker__group" key={group.label}>
            <p className="adm-section-picker__label">{group.label}</p>
            <div className="adm-section-picker__pills">
              {group.items.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  className={`adm-section-pill${activeSection === section.key ? ' is-active' : ''}`}
                  onClick={() => {
                    setLoading(true);
                    setActiveSection(section.key);
                  }}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="adm-alert adm-alert--error">{error}</div>}
      {saved && <div className="adm-alert adm-alert--success">Changes saved successfully.</div>}

      <div className="adm-card">
        <div className="adm-section-header">
          <div>
            <h2 className="adm-card__title" style={{ marginBottom: '0.4rem' }}>
              {sectionConfig.label}
            </h2>
            <p className="adm-text-muted adm-text-sm">{sectionConfig.description}</p>
          </div>
          <button className="adm-btn adm-btn--primary" type="button" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {sectionConfig.hint && (
          <div className="adm-alert adm-alert--info">
            <strong>Structure:</strong> {sectionConfig.hint}
          </div>
        )}

        {loading ? (
          <div className="adm-page-loader">
            <div className="adm-spinner" />
            Loading section...
          </div>
        ) : sectionConfig.editor === 'json' ? (
          <JsonEditor value={editData._json || ''} onChange={(value) => setEditData({ _json: value })} />
        ) : (
          <FieldsEditor
            sectionConfig={sectionConfig}
            data={editData}
            onChange={(key, value) => setEditData((current) => ({ ...current, [key]: value }))}
            onImageUpload={handleImageUpload}
          />
        )}
      </div>
    </>
  );
}

function FieldsEditor({ data, onChange, onImageUpload, sectionConfig }) {
  return (
    <div className="adm-form">
      {sectionConfig.fields.map((field) => {
        const value = data[field.key] ?? '';
        const isVideoField = field.kind === 'video';
        const isImageField = !isVideoField && (IMAGE_KEYS.includes(field.key) || field.key.endsWith('_url'));

        if (isVideoField) {
          return (
            <div key={field.key} className="adm-field">
              <VideoField
                label={field.label}
                value={value}
                onChange={(v) => onChange(field.key, v)}
                help={field.help}
              />
            </div>
          );
        }

        return (
          <div key={field.key} className="adm-field">
            <label className="adm-label">
              {field.label}
              <span className="adm-label-hint">{field.key}</span>
            </label>

            {isImageField ? (
              <div className="adm-img-upload">
                {value && <img src={value} className="adm-img-preview" alt="" />}
                <div>
                  <input
                    className="adm-input"
                    type="url"
                    value={value}
                    onChange={(event) => onChange(field.key, event.target.value)}
                    placeholder="https://... or upload below"
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <label className="adm-btn adm-btn--secondary adm-btn--sm" style={{ cursor: 'pointer' }}>
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(event) => event.target.files?.[0] && onImageUpload(field.key, event.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            ) : field.multiline ? (
              <textarea
                className="adm-textarea"
                rows={4}
                value={value}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            ) : (
              <input
                className="adm-input"
                type="text"
                value={value}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function JsonEditor({ value, onChange }) {
  return (
    <div className="adm-field">
      <label className="adm-label">
        JSON content
        <span className="adm-label-hint">Edit carefully. This must remain valid JSON.</span>
      </label>
      <textarea
        className="adm-textarea adm-textarea--code"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        rows={20}
      />
    </div>
  );
}
