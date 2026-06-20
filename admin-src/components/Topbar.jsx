const TITLES = {
  stats: 'Statistics',
  users: 'User Management',
  posts: 'Blog Posts',
  portfolio: 'Portfolio CMS',
};

export default function Topbar({ activeTab, user, onChangePassword }) {
  return (
    <div className="admin-topbar">
      <span className="topbar-title">{TITLES[activeTab] || 'Dashboard'}</span>
      <div className="topbar-user">
        <button
          type="button"
          className="btn-sm btn-edit"
          onClick={onChangePassword}
          title="Ganti Password"
          style={{ marginRight: '1rem' }}
        >
          <i className="fas fa-key" />
        </button>
        <div className="avatar">{(user.email || 'A')[0].toUpperCase()}</div>
        <span>{user.email}</span>
      </div>
    </div>
  );
}
