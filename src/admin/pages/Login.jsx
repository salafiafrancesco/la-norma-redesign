import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export default function Login() {
  const { login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Login failed');
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

          <button
            type="submit"
            className="adm-btn adm-btn--primary adm-btn--full"
            style={{ marginTop: '0.35rem', padding: '0.6rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in\u2026' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
