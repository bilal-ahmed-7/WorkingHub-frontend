import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return 'Executive Dashboard';
    if (pathname.startsWith('/workers')) return 'Team & Workers';
    if (pathname.startsWith('/invitations')) return 'Invitation Center';
    if (pathname.startsWith('/settings')) return 'Workspace Settings';
    return 'Workspace';
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="topbar-right">
        {isAdmin ? (
          <span className="badge badge-owner">
            <ShieldCheck size={13} /> Admin
          </span>
        ) : (
          <span className="badge badge-worker">
            <UserCheck size={13} /> Worker
          </span>
        )}
      </div>
    </header>
  );
};

export default Topbar;
