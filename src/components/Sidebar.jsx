import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MailPlus,
  Building2,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserRound,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for collapsible sub-menus
  const [openSubMenus, setOpenSubMenus] = useState({
    team: true,
    invitations: true,
  });

  const toggleSubMenu = (key) => {
    setOpenSubMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    <aside className="sidebar">
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
      <nav className="sidebar-nav">
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

        {/* Workers / Team Management */}
        <div>
          <div
            className={`nav-item ${location.pathname.startsWith('/workers') ? 'active' : ''}`}
            onClick={() => toggleSubMenu('team')}
          >
            <div className="nav-item-content">
              <Users size={18} />
              <span>Workers & Team</span>
            </div>
            {openSubMenus.team ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {openSubMenus.team && (
            <div className="nav-sub-list">
              <NavLink
                to="/workers"
                end
                className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`}
              >
                <span>&bull; All Members</span>
              </NavLink>
            </div>
          )}
        </div>

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

        {/* Invitations (Company Owner feature) */}
        {isAdmin && (
          <div>
            <div
              className={`nav-item ${location.pathname.startsWith('/invitations') ? 'active' : ''}`}
              onClick={() => toggleSubMenu('invitations')}
            >
              <div className="nav-item-content">
                <MailPlus size={18} />
                <span>Invitations</span>
              </div>
              {openSubMenus.invitations ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>

            {openSubMenus.invitations && (
              <div className="nav-sub-list">
                <NavLink
                  to="/invitations"
                  className={() => `nav-sub-item ${location.search !== '?action=invite' ? 'active' : ''}`}
                >
                  <span>&bull; Pending Invites</span>
                </NavLink>
                <NavLink
                  to="/invitations?action=invite"
                  className={() => `nav-sub-item ${location.search === '?action=invite' ? 'active' : ''}`}
                >
                  <span>&bull; Send Dispatch</span>
                </NavLink>
              </div>
            )}
          </div>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-item-content">
            <UserRound size={18} />
            <span>Profile</span>
          </div>
        </NavLink>
      </nav>

      {/* Bottom of Sidebar: Profile Info & Direct Logout Button */}
      <div className="sidebar-footer">
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

        <button className="btn-logout" onClick={handleLogout} title="Log out of your session">
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
