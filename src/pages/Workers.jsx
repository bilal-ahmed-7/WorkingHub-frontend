import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  getCompanyWorkersApi,
  deleteCompanyWorkerApi,
  setCompanyWorkerActiveApi,
} from '../api/companies';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const Workers = () => {
  const { isAdmin } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Delete Worker Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const data = await getCompanyWorkersApi();
      setWorkers(data);
      setError('');
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('Unable to load company team list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const confirmDeleteWorker = (worker) => {
    setSelectedWorker(worker);
    setDeleteModalOpen(true);
  };

  const handleDeleteWorker = async () => {
    if (!selectedWorker) return;
    setDeleting(true);
    try {
      await deleteCompanyWorkerApi(selectedWorker.id);
      setWorkers((prev) => prev.filter((w) => w.id !== selectedWorker.id));
      setDeleteModalOpen(false);
      setSelectedWorker(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Could not remove worker. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (worker) => {
    setStatusUpdatingId(worker.id);
    setError('');
    try {
      const updated = await setCompanyWorkerActiveApi(worker.id, !worker.is_active);
      setWorkers((prev) => prev.map((member) => (
        member.id === worker.id ? { ...member, is_active: updated.is_active } : member
      )));
      setError('');
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Your session is no longer valid. Please sign in again.'
          : err.response?.data?.detail || 'Unable to update member status.'
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filteredWorkers = workers.filter((w) => {
    const query = searchQuery.toLowerCase();
    return (
      w.email.toLowerCase().includes(query) ||
      (w.full_name && w.full_name.toLowerCase().includes(query)) ||
      (w.first_name && w.first_name.toLowerCase().includes(query)) ||
      (w.last_name && w.last_name.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      {/* Header with Search & Invite Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--slate-900)' }}>
            Team & Workers Directory
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '2px' }}>
            Manage your team members and their access.
          </p>
        </div>

      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header" style={{ padding: '16px 24px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-400)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>
            {filteredWorkers.length} {filteredWorkers.length === 1 ? 'member' : 'members'} found
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Loader2 size={32} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto' }} />
            </div>
          ) : filteredWorkers.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker Profile</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Enrolled Date</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-100)',
                              color: 'var(--primary-700)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            {worker.full_name
                              ? worker.full_name.slice(0, 2).toUpperCase()
                              : worker.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                              {worker.full_name || 'Pending Onboarding'}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
                              {worker.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-worker">
                          <UserCheck size={12} /> Worker
                        </span>
                      </td>

                      <td>
                        {worker.is_active ? (
                          <span className="badge badge-active">Active</span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                            Inactive
                          </span>
                        )}
                      </td>

                      <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                        {new Date(worker.date_joined).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleStatusToggle(worker)}
                              disabled={statusUpdatingId === worker.id}
                              title={worker.is_active ? 'Deactivate member' : 'Reactivate member'}
                            >
                              {worker.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                              <span>{worker.is_active ? 'Deactivate' : 'Reactivate'}</span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => confirmDeleteWorker(worker)}
                              title="Remove worker from the team"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
              <Users size={40} style={{ margin: '0 auto 12px', color: 'var(--slate-300)' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-700)' }}>
                No workers found
              </h4>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>
                {searchQuery
                  ? 'No members match your search criteria.'
                  : 'Accepted invitations will appear here as team members.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Member Removal"
      >
        <p style={{ fontSize: '14px', color: 'var(--slate-600)', marginBottom: '20px' }}>
          Are you sure you want to remove <strong>{selectedWorker?.full_name || selectedWorker?.email}</strong> from the team? This action will immediately revoke their workspace access.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ backgroundColor: 'var(--rose-600)', color: '#ffffff' }}
            onClick={handleDeleteWorker}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                <span>Removing...</span>
              </>
            ) : (
              <span>Confirm Removal</span>
            )}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Workers;
