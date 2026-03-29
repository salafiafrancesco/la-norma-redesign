import { useEffect, useState } from 'react';
import { uploads as uploadsApi } from '../api/client';

export default function ImagesPage() {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState('');

  const load = () => {
    setLoading(true);
    uploadsApi.list()
      .then(setFiles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (e) => {
    const fileList = Array.from(e.target.files);
    if (!fileList.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of fileList) {
        await uploadsApi.upload(file);
      }
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await uploadsApi.delete(filename);
      setFiles(prev => prev.filter(f => f.filename !== filename));
    } catch (e) {
      setError(e.message);
    }
  };

  const copyUrl = (url) => {
    const base = import.meta.env.VITE_API_URL || window.location.origin;
    navigator.clipboard.writeText(base + url);
    setCopied(url);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <>
      {error && <div className="adm-alert adm-alert--error">{error}</div>}

      <div className="adm-toolbar">
        <h2 className="adm-section-title">Image Library</h2>
        <div className="adm-toolbar__spacer" />
        <label className="adm-btn adm-btn--primary" style={{ cursor: 'pointer' }}>
          {uploading ? 'Uploading…' : '+ Upload Images'}
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="adm-alert adm-alert--info">
        Upload images here, then copy the URL to use it in any content section. Max 8 MB per file.
      </div>

      {loading ? (
        <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
      ) : files.length === 0 ? (
        <div className="adm-card">
          <p className="adm-text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
            No images uploaded yet. Upload your first image above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {files.map(f => (
            <div key={f.filename} className="adm-card" style={{ padding: '0.75rem' }}>
              <img
                src={(import.meta.env.VITE_API_URL ?? '') + f.url}
                alt={f.filename}
                style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, display: 'block', marginBottom: '0.75rem' }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--adm-muted)', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                {f.filename}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--adm-muted)', marginBottom: '0.75rem' }}>
                {(f.size / 1024).toFixed(0)} KB
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="adm-btn adm-btn--secondary adm-btn--sm"
                  style={{ flex: 1 }}
                  onClick={() => copyUrl(f.url)}
                >
                  {copied === f.url ? '✓ Copied' : 'Copy URL'}
                </button>
                <button
                  className="adm-btn adm-btn--danger adm-btn--sm"
                  onClick={() => handleDelete(f.filename)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
