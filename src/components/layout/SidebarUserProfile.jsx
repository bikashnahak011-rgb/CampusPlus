export default function SidebarUserProfile({ name, subtitle, avatarUrl, collapsed, fallbackInitial }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || fallbackInitial

  return (
    <div className={`sidebar-user-profile ${collapsed ? 'sidebar-user-profile--collapsed' : ''}`}>
      <div className="sidebar-user-avatar" title={name || 'Signed-in user'}>
        {avatarUrl
          ? <img src={avatarUrl} alt={`${name || 'Signed-in user'} profile`} />
          : <span>{initial}</span>}
      </div>
      {!collapsed && (
        <div className="sidebar-user-copy">
          <p className="sidebar-user-name">{name || 'Signed-in user'}</p>
          <p className="sidebar-user-subtitle">{subtitle}</p>
        </div>
      )}
    </div>
  )
}
