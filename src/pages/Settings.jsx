import React, { useState } from 'react';
import { User, Save, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfileApi } from '../api/auth';

const Settings = () => {
  const { user, isAdmin, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const updated = await updateProfileApi(profile);
      updateUser(updated);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--slate-900)' }}>
          Profile Settings
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '2px' }}>
          Manage your personal profile details.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--primary-600)' }} />
            <h3 className="card-title">Personal Information</h3>
          </div>
        </div>
        <div className="card-body">
          <div
            style={{
              background: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--primary-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--slate-900)' }}>
                {user?.full_name || user?.email}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '2px' }}>
                {user?.email}
              </div>
              <div style={{ marginTop: '6px' }}>
                <span className={`badge ${isAdmin ? 'badge-owner' : 'badge-worker'}`}>
                  <Shield size={12} /> {isAdmin ? 'Company Owner' : 'Team Member'}
                </span>
              </div>
            </div>
          </div>

          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{success}</div>
            </div>
          )}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid-two">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-first-name">First Name</label>
                <input
                  id="profile-first-name"
                  type="text"
                  required
                  className="form-input"
                  value={profile.first_name}
                  onChange={(event) => setProfile((current) => ({ ...current, first_name: event.target.value }))}
                  placeholder="Jane"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-last-name">Last Name</label>
                <input
                  id="profile-last-name"
                  type="text"
                  required
                  className="form-input"
                  value={profile.last_name}
                  onChange={(event) => setProfile((current) => ({ ...current, last_name: event.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-500)', cursor: 'not-allowed' }}
              />
              <span className="form-help">Email cannot be changed at this time.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 size={16} className="spin-animation" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;