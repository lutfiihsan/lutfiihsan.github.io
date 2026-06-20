import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PostsTab from './PostsTab';
import StatsTab from './StatsTab';
import UsersTab from './UsersTab';
import PortfolioTab from './PortfolioTab';
import PasswordPanel from './PasswordPanel';

export default function Dashboard({ user, onLogout }) {
  const { refreshSession } = useAuth();
  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'stats' : 'posts');
  const [passwordOpen, setPasswordOpen] = useState(false);

  // Re-validate session saat pindah tab admin
  useEffect(() => {
    if (['stats', 'users', 'portfolio'].includes(activeTab)) {
      refreshSession();
    }
  }, [activeTab, refreshSession]);

  async function handleLogout() {
    const result = await Swal.fire({
      title: 'Keluar dari Admin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      background: '#13132a',
      color: '#f0f0ff',
    });
    if (result.isConfirmed) onLogout();
  }

  async function handleTabChange(tab) {
    setActiveTab(tab);
  }

  return (
    <div className="admin-layout premium-layout" style={{ display: 'flex' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      <div className="admin-main premium-main">
        <Topbar
          activeTab={activeTab}
          user={user}
          onChangePassword={() => setPasswordOpen(true)}
        />
        <div className="premium-content-wrap">
          {activeTab === 'stats' && isAdmin && <StatsTab onAuthFail={onLogout} />}
          {activeTab === 'users' && isAdmin && <UsersTab currentUserId={user.id} onAuthFail={onLogout} />}
          {activeTab === 'posts' && <PostsTab isAdmin={isAdmin} onAuthFail={onLogout} />}
          {activeTab === 'portfolio' && isAdmin && <PortfolioTab onAuthFail={onLogout} />}
        </div>
      </div>
      <PasswordPanel open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}
