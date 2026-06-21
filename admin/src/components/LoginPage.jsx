import { useState } from 'react';
import { login } from '@assets/api.js';
import { useAuth } from '../context/AuthContext';
import { toast } from '../lib/toast';

export default function LoginPage() {
  const { setUser } = useAuth();
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
      setUser(data.user);
    } catch (err) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login-page admin-premium-bg" style={{ display: 'flex' }}>
      <div className="login-card premium-login-card">
        <div className="login-logo premium-logo">
          <i className="fas fa-shield-alt" />
        </div>
        <h1 className="login-title">Golden Access</h1>
        <p className="login-subtitle">
          Admin Panel — Lutfi Ihsan
          <br />
          <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>Masuk untuk mengelola konten</span>
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <i className="fas fa-envelope input-icon" />
            <input
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <i className="fas fa-lock input-icon" />
            <input
              type={showPass ? 'text' : 'password'}
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

          <button type="submit" className="btn-login premium-btn" disabled={busy}>
            {busy ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>

          {error && (
            <div className="login-error" role="alert" style={{ display: 'block' }}>
              {error}
            </div>
          )}
        </form>

        <a href="index" className="back-to-home">
          <i className="fas fa-arrow-left" /> Kembali ke Portfolio
        </a>
      </div>
    </div>
  );
}
