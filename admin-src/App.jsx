import { useEffect, useState } from 'react';
import { getSession, logout } from '../assets/js/api.js';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then((s) => setUser(s?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
  }

  if (loading) {
    return (
      <div className="admin-login-page" style={{ display: 'flex' }}>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin" /> Memuat...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
