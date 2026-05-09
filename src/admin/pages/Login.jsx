import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export default function Login() {
  const { login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needs2fa, setNeeds2fa] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, needs2fa ? totpCode : undefined);
    } catch (err) {
      // The backend signals "needs 2FA" by returning 401 with requires_2fa: true.
      if (err?.data?.requires_2fa) {
        setNeeds2fa(true);
        setError(needs2fa ? 'Invalid code. Try again.' : '');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-page">
      <div className="adm-login-box">
        <div className="adm-login-logo">
          <div className="adm-login-logo__name">La Norma</div>
          <div className="adm-login-logo__tag">Ristorante & Pizzeria</div>
        </div>

        <div className="adm-login-title">Sign in to continue</div>

        {error && <div className="adm-alert adm-alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="adm-form">
          <div className="adm-field">
            <label className="adm-label" htmlFor="adm-username">Username</label>
            <input
              id="adm-username"
              className="adm-input"
              type="text"
              autoComplete="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="adm-field">
            <label className="adm-label" htmlFor="adm-password">Password</label>
            <input
              id="adm-password"
              className="adm-input"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {needs2fa && (
            <div className="adm-field">
              <label className="adm-label" htmlFor="adm-totp">Two-factor code</label>
              <input
                id="adm-totp"
                className="adm-input"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
              <p className="adm-text-muted adm-text-sm" style={{ marginTop: '0.35rem' }}>
                Open your authenticator app (Google Authenticator, 1Password, Authy) and enter the current 6-digit code.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="adm-btn adm-btn--primary adm-btn--full"
            style={{ marginTop: '0.35rem', padding: '0.6rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in\u2026' : needs2fa ? 'Verify & sign in' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
