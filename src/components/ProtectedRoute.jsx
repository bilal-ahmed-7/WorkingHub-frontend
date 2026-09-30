import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps any route element with authentication (and optionally admin) protection.
 *
 * Usage:
 *   <ProtectedRoute>          — requires authentication only
 *   <ProtectedRoute requireAdmin>  — also requires ADMIN role
 *
 * When wrapping <Layout /> (which renders <Outlet />), pass children directly.
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '12px',
          backgroundColor: 'var(--slate-50)',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--slate-600)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary-600)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="spin-animation"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
