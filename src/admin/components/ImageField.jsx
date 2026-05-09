import { useId, useRef, useState } from 'react';
import { uploads as uploadsApi } from '../api/client';

/**
 * Inline image-binding widget for admin forms.
 * - Shows a preview of the current image (if value is a URL).
 * - Lets the editor either paste a URL OR upload a file from their machine.
 * - On upload, persists via /api/upload and writes the returned URL back via onChange.
 *
 * Props:
 *   - label: string (form label)
 *   - value: string (current image URL)
 *   - onChange(newUrl: string): void
 *   - help?: string (small hint under the field)
 *   - aspect?: string ("16/10", "4/5", "1/1") — only affects the preview box, default 16/10
 */
export default function ImageField({ label, value, onChange, help, aspect = '16/10' }) {
  const id = useId();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const result = await uploadsApi.upload(file);
      // The /upload endpoint returns a relative URL like /uploads/xxx.jpg
      // For the public site we need the full URL via API_BASE — let the consumer decide
      // by storing whatever the API returned. Most managers prepend API_BASE on render.
      onChange(result.url || result.path || '');
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    if (!value) return;
    onChange('');
  };

  return (
    <div className="adm-image-field" style={{ display: 'grid', gap: '0.45rem' }}>
      {label && (
        <label htmlFor={id} style={{
          fontFamily: 'var(--ff-accent, "Cormorant Garamond", serif)',
          fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          fontWeight: 600, color: '#1A2120',
        }}>
          {label}
        </label>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '8rem 1fr', gap: '0.85rem',
        alignItems: 'start',
      }}>
        <div style={{
          aspectRatio: aspect,
          width: '8rem',
          borderRadius: '0.5rem',
          background: '#f3f4f6',
          border: '1px solid rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: '0.7rem',
          textAlign: 'center',
          padding: '0.4rem',
        }}>
          {value ? (
            <img
              src={value}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span>No image</span>
          )}
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <input
            id={id}
            type="text"
            className="adm-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or click Upload to pick a file"
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className="adm-btn adm-btn--sm"
              onClick={handlePick}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : '↑ Upload file'}
            </button>
            {value && (
              <button
                type="button"
                className="adm-btn adm-btn--sm"
                onClick={clear}
                disabled={uploading}
              >
                Clear
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>
          {error && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#dc2626' }}>{error}</p>
          )}
          {help && !error && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280' }}>{help}</p>
          )}
        </div>
      </div>
    </div>
  );
}
