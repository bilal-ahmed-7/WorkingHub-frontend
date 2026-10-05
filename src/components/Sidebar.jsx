import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  UserRound,
  Code2,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileNavigationOpen }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : 'WH';
  };

  return (
    <aside className={`sidebar${mobileNavigationOpen ? ' sidebar-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <Building2 size={20} />
        </div>
        <div>
          <div className="sidebar-brand-title">WorkHub</div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav
        className="sidebar-nav"
        id="primary-navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-section-title">Navigation</div>

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-item-content">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>
        </NavLink>

        <NavLink
          to="/workers"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-item-content">
            <Users size={18} />
            <span>Team Members</span>
          </div>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/audience"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-content">
              <UserRound size={18} />
              <span>Audience</span>
            </div>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/integrations"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-content">
              <Code2 size={18} />
              <span>Integrations</span>
            </div>
          </NavLink>
        )}

      </nav>

      {/* Bottom of Sidebar: Profile Info & Direct Logout Button */}
      <div className="sidebar-footer">
        <div className="sidebar-profile-row">
          <div className="user-profile-widget">
            <div className="user-avatar">
              {getInitials(user?.full_name || user?.first_name, user?.email)}
            </div>
            <div className="user-meta">
              <div className="user-display-name">
                {user?.full_name || user?.first_name || 'User'}
              </div>
              <div className="user-email-text" title={user?.email}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-settings-button"
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={17} />
          </button>
        </div>

        <button className="btn-logout" onClick={handleLogout} title="Log out of your session">
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
