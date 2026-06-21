const TITLES = {
  stats: 'Statistics',
  users: 'User Management',
  posts: 'Blog Posts',
  portfolio: 'Portfolio CMS',
};

export default function Topbar({ activeTab, user, onChangePassword }) {
  return (
    <div className="admin-topbar premium-topbar">
      <span className="topbar-title">{TITLES[activeTab] || 'Dashboard'}</span>
      <div className="topbar-user">
        <span className="role-badge">{user.role}</span>
        <button
          type="button"
          className="btn-sm btn-edit"
          onClick={onChangePassword}
          title="Ganti Password"
        >
          <i className="fas fa-key" /> Password
        </button>
        <div className="avatar">{(user.email || 'A')[0].toUpperCase()}</div>
        <span>{user.email}</span>
      </div>
    </div>
  );
}
