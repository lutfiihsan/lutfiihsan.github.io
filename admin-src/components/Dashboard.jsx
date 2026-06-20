import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PostsTab from './PostsTab';
import StatsTab from './StatsTab';
import UsersTab from './UsersTab';
import PortfolioTab from './PortfolioTab';
import PasswordModal from './PasswordModal';

export default function Dashboard({ user, onLogout }) {
  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'stats' : 'posts');
  const [passwordOpen, setPasswordOpen] = useState(false);

  async function handleLogout() {
    const result = await Swal.fire({
      title: 'Yakin ingin keluar?',
      text: 'Anda akan keluar dari sesi administrator.',
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

  return (
    <div className="admin-layout" style={{ display: 'flex' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      <div className="admin-main">
        <Topbar
          activeTab={activeTab}
          user={user}
          onChangePassword={() => setPasswordOpen(true)}
        />
        {activeTab === 'stats' && isAdmin && <StatsTab />}
        {activeTab === 'users' && isAdmin && <UsersTab currentUserId={user.id} />}
        {activeTab === 'posts' && <PostsTab isAdmin={isAdmin} />}
        {activeTab === 'portfolio' && isAdmin && <PortfolioTab />}
      </div>
      <PasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}
