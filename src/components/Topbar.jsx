import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ mobileNavigationOpen, onMenuClick }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return 'Executive Dashboard';
    if (pathname.startsWith('/workers')) return 'Team Members';
    if (pathname.startsWith('/settings')) return 'Workspace Settings';
    return 'Workspace';
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={mobileNavigationOpen ? 'Close navigation' : 'Open navigation'}
          aria-controls="primary-navigation"
          aria-expanded={mobileNavigationOpen}
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <h1 className="topbar-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="topbar-right">
        {isAdmin ? (
          <span className="badge badge-owner">
            <ShieldCheck size={13} /> Admin
          </span>
        ) : (
          <span className="badge badge-worker">
            <UserCheck size={13} /> Team Member
          </span>
        )}
      </div>
    </header>
  );
};

export default Topbar;
