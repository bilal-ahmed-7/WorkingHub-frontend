import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AcceptInvite from './pages/AcceptInvite';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Invitations from './pages/Invitations';
import Settings from './pages/Settings';
import Audience from './pages/Audience';
import Integrations from './pages/Integrations';
import PublicIntegrationForm from './pages/PublicIntegrationForm';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public Routes ─────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />
          <Route path="/integrations/public/:publicId" element={<PublicIntegrationForm />} />

          {/* ── Root redirect ─────────────────────────── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ── Protected Routes (inside sidebar layout) ─ */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workers" element={<Workers />} />
            <Route
              path="/audience"
              element={
                <ProtectedRoute requireAdmin>
                  <Audience />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invitations"
              element={
                <ProtectedRoute requireAdmin>
                  <Invitations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/integrations"
              element={
                <ProtectedRoute requireAdmin>
                  <Integrations />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* ── 404 fallback ─────────────────────────── */}
          <Route
            path="*"
            element={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100vh',
                  gap: '16px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <div
                  style={{
                    fontSize: '72px',
                    fontWeight: 800,
                    color: 'var(--slate-200)',
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                  }}
                >
                  404
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--slate-700)' }}>
                  Page not found
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--slate-500)' }}>
                  The page you're looking for doesn't exist.
                </p>
                <a
                  href="/dashboard"
                  style={{
                    marginTop: '8px',
                    padding: '10px 20px',
                    background: 'var(--primary-600)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Back to Dashboard
                </a>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
