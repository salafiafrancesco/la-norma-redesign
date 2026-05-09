import { useEffect, useState } from 'react';
import { content as contentApi } from '../api/client';
import { THEME_DEFAULTS } from '../../../shared/contentSchema.js';

const FIELDS = [
  { key: 'cream', label: 'Cream', desc: 'Page background, subtle tints' },
  { key: 'charcoal', label: 'Charcoal', desc: 'Primary text & dark surfaces' },
  { key: 'olive', label: 'Olive', desc: 'Secondary accent (links, hover)' },
  { key: 'olive_dark', label: 'Olive dark', desc: 'Darker olive variant' },
  { key: 'olive_light', label: 'Olive light', desc: 'Lighter olive variant' },
  { key: 'terracotta', label: 'Terracotta', desc: 'Primary CTA, eyebrows' },
  { key: 'terracotta_dk', label: 'Terracotta dark', desc: 'Hover state' },
  { key: 'gold', label: 'Gold', desc: 'Brand highlight' },
  { key: 'gold_light', label: 'Gold light', desc: 'Soft highlight' },
  { key: 'gold_pale', label: 'Gold pale', desc: 'Tint backgrounds' },
];

const HEX_RX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export default function ThemeManager() {
  const [colors, setColors] = useState(THEME_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setLoading(true);
    contentApi.getSection('theme')
      .then((data) => {
        const merged = { ...THEME_DEFAULTS };
        for (const k of Object.keys(THEME_DEFAULTS)) {
          if (data && typeof data[k] === 'string' && data[k].trim()) merged[k] = data[k].trim();
        }
        setColors(merged);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key, value) => {
    setColors((c) => ({ ...c, [key]: value }));
  };

  const reset = () => {
    if (!window.confirm('Reset all colors to the original brand defaults?')) return;
    setColors({ ...THEME_DEFAULTS });
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      // Validate hex
      const invalid = Object.entries(colors).find(([, v]) => !HEX_RX.test(v));
      if (invalid) throw new Error(`"${invalid[0]}" must be a hex color like #C4973A`);

      await contentApi.updateSection('theme', colors);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);

      // Apply immediately to current admin window for instant preview confidence
      applyThemeToRoot(colors);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-flex adm-flex--center" style={{ padding: '3rem 0', color: '#6B7280' }}>
        <div className="adm-spinner" style={{ marginRight: '0.75rem' }} /> Loading theme…
      </div>
    );
  }

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">Theme &amp; Colors</h2>
        <div className="adm-toolbar__spacer" />
        {savedFlash && <span style={{ color: '#16a34a', fontSize: '0.85rem', marginRight: '0.75rem' }}>Saved ✓</span>}
        <button className="adm-btn" onClick={reset}>Reset to defaults</button>
        <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving} style={{ marginLeft: '0.5rem' }}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
        <h3 className="adm-card__title">Brand palette</h3>
        <p className="adm-card__lead">
          These are CSS custom properties injected on <code>:root</code> at runtime. Changes apply on the next page load
          for visitors. Use proper hex codes (<code>#C4973A</code> or <code>#fff</code>).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem 1rem' }}>
          {FIELDS.map((f) => {
            const value = colors[f.key] || '#000000';
            const isValid = HEX_RX.test(value);
            return (
              <div key={f.key} className="adm-field" style={{
                display: 'grid', gridTemplateColumns: '3.25rem 1fr', gap: '0.75rem',
                alignItems: 'start', padding: '0.85rem', borderRadius: '0.6rem',
                border: '1px solid rgba(0,0,0,0.08)', background: '#fff',
              }}>
                <input
                  type="color"
                  value={isValid ? expandHex(value) : '#000000'}
                  onChange={(e) => setField(f.key, e.target.value.toUpperCase())}
                  aria-label={`${f.label} color picker`}
                  style={{
                    width: '3.25rem', height: '3.25rem', padding: 0, border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: '0.5rem', background: 'none', cursor: 'pointer',
                  }}
                />
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', color: '#1A2120', marginBottom: '0.15rem' }}>
                    {f.label}
                  </label>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: '0.45rem' }}>{f.desc}</div>
                  <input
                    type="text"
                    className="adm-input"
                    value={value}
                    onChange={(e) => setField(f.key, e.target.value)}
                    spellCheck={false}
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      fontSize: '0.85rem',
                      borderColor: isValid ? undefined : '#dc2626',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title">Live preview</h3>
        <p className="adm-card__lead">
          Approximate of how the palette renders together. The public site applies these on next reload after saving.
        </p>
        <ThemePreview colors={colors} />
      </div>
    </>
  );
}

function ThemePreview({ colors }) {
  const c = (k) => colors[k] || THEME_DEFAULTS[k];
  return (
    <div style={{
      display: 'grid', gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    }}>
      <div style={{ background: c('cream'), padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: c('terracotta'), marginBottom: '0.5rem' }}>
          Eyebrow on cream
        </div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: c('charcoal'), lineHeight: 1.1, marginBottom: '0.75rem' }}>
          Sicilian hospitality, served wherever you gather.
        </div>
        <button style={{
          padding: '0.6rem 1.25rem', border: 'none', borderRadius: '999px',
          background: c('terracotta'), color: '#fff', fontWeight: 600, cursor: 'pointer',
        }}>
          Reserve a table
        </button>
      </div>
      <div style={{ background: c('charcoal'), padding: '1.25rem', borderRadius: '0.75rem', color: c('cream') }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: c('gold_light'), marginBottom: '0.5rem' }}>
          Eyebrow on dark
        </div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', lineHeight: 1.1, marginBottom: '0.75rem' }}>
          Catering · Private Events &amp; Yacht Parties
        </div>
        <span style={{ display: 'inline-block', height: '2px', width: '2.5rem', background: c('gold'), borderRadius: '999px' }} />
      </div>
    </div>
  );
}

// shared with ThemeProvider — exported only as a side helper here for save preview
function applyThemeToRoot(colors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(colors)) {
    if (typeof v === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
      root.style.setProperty(`--${k.replace(/_/g, '-')}`, v);
    }
  }
}

function expandHex(hex) {
  // The native color picker only accepts 6-char hex
  if (!hex) return '#000000';
  const m = /^#([0-9a-fA-F]{3})$/.exec(hex);
  if (!m) return hex;
  const [r, g, b] = m[1].split('');
  return `#${r}${r}${g}${g}${b}${b}`;
}
