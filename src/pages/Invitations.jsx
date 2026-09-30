import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MailPlus,
  Clock,
  Trash2,
  Copy,
  Check,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Link2,
} from 'lucide-react';
import { getInvitationsApi, sendInvitationApi, revokeInvitationApi } from '../api/invitations';

const Invitations = () => {
  const [searchParams] = useSearchParams();
  const showDispatch = searchParams.get('action') === 'invite';
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');
  const [dispatchError, setDispatchError] = useState('');

  // Copy state
  const [copiedToken, setCopiedToken] = useState('');
  const pendingInvitations = invitations.filter((invitation) => !invitation.is_accepted && invitation.is_valid);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await getInvitationsApi();
      setInvitations(data);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Unable to load invitations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showDispatch) fetchInvitations();
  }, [showDispatch]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setDispatching(true);
    setDispatchError('');
    setDispatchSuccess('');

    try {
      const res = await sendInvitationApi(inviteEmail);
      setDispatchSuccess(res.message || `Invitation sent successfully to ${inviteEmail}.`);
      setInviteEmail('');
    } catch (err) {
      const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        'Failed to send invitation. Please try again.';
      setDispatchError(msg);
    } finally {
      setDispatching(false);
    }
  };

  const handleRevoke = async (token) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) return;
    try {
      await revokeInvitationApi(token);
      setInvitations((prev) => prev.filter((i) => i.token !== token));
    } catch (err) {
      console.error('Revoke error:', err);
      alert('Could not cancel invitation.');
    }
  };

  const copyInviteLink = (token) => {
    const link = `${window.location.origin}/accept-invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--slate-900)' }}>
          {showDispatch ? 'Send Dispatch' : 'Pending Invitations'}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '2px' }}>
          {showDispatch
            ? 'Send an invitation to add a member to your team.'
            : 'Invitations waiting for a response appear here.'}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {showDispatch && <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MailPlus size={18} style={{ color: 'var(--primary-600)' }} />
            <h3 className="card-title">Send Worker Invitation</h3>
          </div>
        </div>
        <div className="card-body">
          {dispatchSuccess && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{dispatchSuccess}</div>
            </div>
          )}

          {dispatchError && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{dispatchError}</div>
            </div>
          )}

          <form onSubmit={handleSendInvite} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <span className="form-help" style={{ display: 'block', marginTop: '4px' }}>
                Recipient will receive an email with their onboarding link to set their permanent password.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: '42px', minWidth: '160px' }}
              disabled={dispatching}
            >
              {dispatching ? (
                <>
                  <Loader2 size={16} className="spin-animation" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>}

      {!showDispatch && <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pending Invitations</h3>
          <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>
            {pendingInvitations.length} pending
          </span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Loader2 size={32} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto' }} />
            </div>
          ) : pendingInvitations.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker Email</th>
                    <th>Status</th>
                    <th>Dispatched Date</th>
                    <th>Expires At</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvitations.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                        {inv.email}
                      </td>

                      <td>
                        <span className="badge badge-pending">
                          <Clock size={12} /> Pending
                        </span>
                      </td>

                      <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>

                      <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => copyInviteLink(inv.token)}
                            title="Copy direct onboarding link"
                          >
                            {copiedToken === inv.token ? (
                              <>
                                <Check size={14} style={{ color: 'var(--emerald-600)' }} />
                                <span style={{ color: 'var(--emerald-600)' }}>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRevoke(inv.token)}
                            title="Revoke invitation"
                          >
                            <Trash2 size={14} />
                            <span>Revoke</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
              <MailPlus size={40} style={{ margin: '0 auto 12px', color: 'var(--slate-300)' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-700)' }}>
                No pending invitations
              </h4>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>
                Sent invitations will appear here until accepted or expired.
              </p>
            </div>
          )}
        </div>
      </div>}
    </div>
  );
};

export default Invitations;
