import { useState } from 'react';
import { login } from '../../assets/js/api.js';
import { toast } from '../lib/toast';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await login(email.trim(), password);
      toast('Login berhasil!');
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login-page" style={{ display: 'flex' }}>
      <div className="login-card">
        <div className="login-logo">
          <i className="fas fa-key" style={{ color: '#f68c09' }} />
        </div>
        <h1 className="login-title">Golden Access</h1>
        <p className="login-subtitle">
          Management Shell for authorized personnel only.
          <br />
          Please authenticate to access the core systems.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="admin-email">Email</label>
            <i className="fas fa-envelope input-icon" />
            <input
              type="email"
              id="admin-email"
              placeholder="Email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-pass">Password</label>
            <i className="fas fa-lock input-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              id="admin-pass"
              placeholder="Password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              className={`fas ${showPass ? 'fa-eye' : 'fa-eye-slash'} right-icon`}
              onClick={() => setShowPass(!showPass)}
              role="button"
              tabIndex={0}
              aria-label="Toggle password"
            />
          </div>

          <button type="submit" className="btn-login" disabled={busy}>
            {busy ? 'Memproses...' : 'Authorize & Enter'}
          </button>

          {error && (
            <div className="login-error" role="alert" style={{ display: 'block' }}>
              {error}
            </div>
          )}
        </form>

        <a href="index" className="back-to-home">
          <i className="fas fa-arrow-left" /> Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}
