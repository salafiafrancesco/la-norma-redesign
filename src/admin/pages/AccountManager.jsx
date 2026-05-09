import { useEffect, useState } from 'react';
import { auth as authApi } from '../api/client';

export default function AccountManager() {
  const [enabled, setEnabled] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Setup flow state (when user clicks "Enable 2FA")
  const [setupQr, setSetupQr] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');

  // Disable flow state
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authApi.twoFactor.status()
      .then((r) => { if (!cancelled) setEnabled(!!r?.enabled); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  const startSetup = async () => {
    setError('');
    setBusy(true);
    try {
      const r = await authApi.twoFactor.setup();
      setSetupQr(r.qr);
      setSetupSecret(r.secret);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await authApi.twoFactor.enable(setupCode);
      setEnabled(true);
      setSetupQr('');
      setSetupSecret('');
      setSetupCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancelSetup = () => {
    setSetupQr('');
    setSetupSecret('');
    setSetupCode('');
    setError('');
  };

  const submitDisable = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await authApi.twoFactor.disable(disablePassword);
      setEnabled(false);
      setDisablePassword('');
      setShowDisable(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="adm-section-title" style={{ marginBottom: '1.5rem' }}>Account & security</h1>

      {error && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
        <div className="adm-card__title">Two-factor authentication (TOTP)</div>

        {enabled === null && (
          <div className="adm-page-loader"><div className="adm-spinner" /> Loading…</div>
        )}

        {/* Disabled — not in setup flow */}
        {enabled === false && !setupQr && (
          <>
            <p style={{ marginBottom: '0.85rem', color: 'var(--adm-text-mid, #555)' }}>
              2FA is currently <strong>disabled</strong>. Enable it to require a 6-digit code from an authenticator app every time you sign in.
            </p>
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={startSetup}
              disabled={busy}
            >
              Enable 2FA
            </button>
          </>
        )}

        {/* Setup flow */}
        {setupQr && (
          <div>
            <p style={{ marginBottom: '0.85rem' }}>
              Scan the QR code below with your authenticator app
              (<strong>Google Authenticator, 1Password, Authy, Microsoft Authenticator</strong>),
              then enter the 6-digit code it shows to confirm.
            </p>
            <div style={{
              display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start',
              padding: '1rem 0',
            }}>
              <img
                src={setupQr}
                alt="2FA QR code"
                style={{ width: 220, height: 220, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: '#fff' }}
              />
              <div style={{ flex: 1, minWidth: 240 }}>
                <p className="adm-text-muted adm-text-sm" style={{ marginBottom: '0.4rem' }}>
                  Can&rsquo;t scan? Enter this secret manually:
                </p>
                <code style={{
                  display: 'block', padding: '0.6rem 0.85rem',
                  background: 'var(--adm-bg, #f7f6f0)', borderRadius: 6,
                  fontSize: '0.85rem', wordBreak: 'break-all', marginBottom: '1rem',
                }}>{setupSecret}</code>

                <form onSubmit={confirmEnable}>
                  <div className="adm-field">
                    <label className="adm-label" htmlFor="setup-code">6-digit code</label>
                    <input
                      id="setup-code"
                      className="adm-input"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      placeholder="123456"
                      value={setupCode}
                      onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="adm-flex adm-gap-2" style={{ marginTop: '0.65rem' }}>
                    <button type="submit" className="adm-btn adm-btn--primary" disabled={busy || setupCode.length !== 6}>
                      {busy ? 'Verifying…' : 'Verify & enable'}
                    </button>
                    <button type="button" className="adm-btn adm-btn--ghost" onClick={cancelSetup} disabled={busy}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Enabled — offer disable */}
        {enabled === true && !showDisable && (
          <>
            <p style={{ marginBottom: '0.85rem', color: 'var(--adm-text-mid, #555)' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>● 2FA is active.</span>
              {' '}You will be asked for a 6-digit code on every sign-in.
            </p>
            <button
              type="button"
              className="adm-btn adm-btn--danger"
              onClick={() => setShowDisable(true)}
            >
              Disable 2FA
            </button>
          </>
        )}

        {/* Disable confirm */}
        {enabled === true && showDisable && (
          <form onSubmit={submitDisable}>
            <p style={{ marginBottom: '0.85rem' }}>
              Confirm your password to turn off 2FA. You can re-enable it any time.
            </p>
            <div className="adm-field" style={{ maxWidth: 320 }}>
              <label className="adm-label" htmlFor="disable-pw">Password</label>
              <input
                id="disable-pw"
                className="adm-input"
                type="password"
                autoComplete="current-password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="adm-flex adm-gap-2" style={{ marginTop: '0.65rem' }}>
              <button type="submit" className="adm-btn adm-btn--danger" disabled={busy}>
                {busy ? 'Disabling…' : 'Confirm disable'}
              </button>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => { setShowDisable(false); setDisablePassword(''); }} disabled={busy}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
