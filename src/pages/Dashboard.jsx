import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MailPlus,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { getDashboardStatsApi } from '../api/companies';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStatsApi();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Unable to load workspace overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="spin-animation" style={{ color: 'var(--primary-600)' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', background: 'rgba(255, 255, 255, 0.15)', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
              {isAdmin ? 'Workspace Administrator' : 'Team Member'}
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.first_name || user?.email}!
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '4px' }}>
            Your team workspace is ready.
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              to="/invitations?action=invite"
              className="btn btn-primary"
              style={{ backgroundColor: '#ffffff', color: 'var(--primary-800)', border: 'none' }}
            >
              <MailPlus size={18} />
              <span>Invite Worker</span>
            </Link>
            <Link
              to="/workers"
              className="btn btn-secondary"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Users size={18} />
              <span>Team Directory</span>
            </Link>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      {isAdmin ? (
        <div className="metrics-grid">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Team Members</span>
              <span className="stat-value">{stats?.metrics?.total_workers || 0}</span>
            </div>
            <div className="stat-icon-wrapper icon-indigo">
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Active Accounts</span>
              <span className="stat-value">{stats?.metrics?.active_users || 0}</span>
            </div>
            <div className="stat-icon-wrapper icon-emerald">
              <UserCheck size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Pending Invitations</span>
              <span className="stat-value">{stats?.metrics?.pending_invites || 0}</span>
            </div>
            <div className="stat-icon-wrapper icon-amber">
              <MailPlus size={24} />
            </div>
          </div>
        </div>
      ) : (
        <div className="metrics-grid">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Colleagues in Workspace</span>
              <span className="stat-value">{stats?.metrics?.colleagues_count || 1}</span>
            </div>
            <div className="stat-icon-wrapper icon-indigo">
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Your Role</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-800)', marginTop: '8px' }}>
                Standard Worker
              </span>
            </div>
            <div className="stat-icon-wrapper icon-emerald">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick View Lists */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          {/* Recent Workers */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Team Members</h3>
              <Link to="/workers" style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View all</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {stats?.recent_workers?.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name / Email</th>
                      <th>Joined Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_workers.map((w) => (
                      <tr key={w.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                            {w.full_name || 'Pending Profile'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{w.email}</div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                          {new Date(w.date_joined).toLocaleDateString()}
                        </td>
                        <td>
                          {w.is_active ? (
                            <span className="badge badge-active">Active</span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--slate-500)', fontSize: '14px' }}>
                  No workers have joined yet. Invite your first colleague!
                </div>
              )}
            </div>
          </div>

          {/* Pending Invitations */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pending Invitations</h3>
              <Link to="/invitations" style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Manage</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {stats?.recent_invitations?.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invited Email</th>
                      <th>Expires At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_invitations.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{inv.email}</td>
                        <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge badge-pending">
                            <Clock size={12} /> Pending
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--slate-500)', fontSize: '14px' }}>
                  No pending invitations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
