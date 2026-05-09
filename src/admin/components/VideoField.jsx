import { useId, useRef, useState } from 'react';
import { uploads as uploadsApi } from '../api/client';

/**
 * Inline video-binding widget for admin forms. Mirrors ImageField:
 * accepts either a direct video URL (mp4/webm hosted by us) OR a
 * platform URL (YouTube / Vimeo). Lets the editor upload a file too;
 * the file goes to the same /api/upload bucket as images.
 *
 * Props:
 *   - label: string
 *   - value: string (current URL)
 *   - onChange(newUrl): void
 *   - help?: string
 */
export default function VideoField({ label, value, onChange, help }) {
  const id = useId();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Selected file is not a video.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const result = await uploadsApi.upload(file);
      onChange(result.url || result.path || '');
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const clear = () => value && onChange('');
  const kind = detectKind(value);

  return (
    <div className="adm-video-field" style={{ display: 'grid', gap: '0.45rem' }}>
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
        display: 'grid', gridTemplateColumns: '12rem 1fr', gap: '0.85rem',
        alignItems: 'start',
      }}>
        <div style={{
          aspectRatio: '16/9',
          width: '12rem',
          borderRadius: '0.5rem',
          background: '#0a0a0a',
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
          {kind === 'file' ? (
            <video src={value} muted playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : kind === 'youtube' ? (
            <span style={{ color: '#ef4444', fontWeight: 600 }}>YouTube</span>
          ) : kind === 'vimeo' ? (
            <span style={{ color: '#22d3ee', fontWeight: 600 }}>Vimeo</span>
          ) : (
            <span>No video</span>
          )}
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <input
            id={id}
            type="text"
            className="adm-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… mp4 or YouTube/Vimeo URL"
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className="adm-btn adm-btn--sm"
              onClick={handlePick}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : '↑ Upload video'}
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
              accept="video/*"
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
          {!error && !help && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280' }}>
              MP4/WebM hosted on this site, OR a YouTube / Vimeo URL.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function detectKind(url) {
  if (!url) return null;
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return 'file';
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/vimeo\.com/i.test(url)) return 'vimeo';
  return null;
}
