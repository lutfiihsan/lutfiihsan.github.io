const NAV = [
  { id: 'stats', icon: 'fa-chart-line', label: 'Statistics', adminOnly: true },
  { id: 'users', icon: 'fa-users-cog', label: 'Users', adminOnly: true },
  { id: 'posts', icon: 'fa-newspaper', label: 'Posts', adminOnly: false },
  { id: 'portfolio', icon: 'fa-briefcase', label: 'Portfolio', adminOnly: true },
];

export default function Sidebar({ activeTab, onTabChange, isAdmin, onLogout }) {
  return (
    <aside className="admin-sidebar premium-sidebar">
      <div className="sidebar-logo">
        <i className="fas fa-crown" />
        <span>Golden Admin</span>
      </div>
      <nav className="sidebar-nav">
        {NAV.filter((n) => !n.adminOnly || isAdmin).map((item) => (
          <a
            key={item.id}
            href="#"
            className={activeTab === item.id ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onTabChange(item.id);
            }}
          >
            <i className={`fas ${item.icon}`} /> {item.label}
          </a>
        ))}
        <a href="blog" target="_blank" rel="noreferrer">
          <i className="fas fa-globe" /> View Blog
        </a>
        <a href="index">
          <i className="fas fa-home" /> Portfolio
        </a>
      </nav>
      <div className="sidebar-logout">
        <button type="button" className="btn-logout" onClick={onLogout}>
          <i className="fas fa-sign-out-alt" /> Logout
        </button>
      </div>
    </aside>
  );
}
