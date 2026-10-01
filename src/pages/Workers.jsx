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
import Pagination from '../components/Pagination';

const Workers = () => {
  const { isAdmin } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Delete Worker Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchWorkers = async (requestedPage = page, requestedPageSize = pageSize, search = searchQuery) => {
    try {
      setLoading(true);
      const data = await getCompanyWorkersApi({
        page: requestedPage,
        page_size: requestedPageSize,
        search: search.trim(),
      });
      setWorkers(data.results);
      setCount(data.count);
      setError('');
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('Unable to load company team list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadWorkers = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getCompanyWorkersApi({
          page,
          page_size: pageSize,
          search: searchQuery.trim(),
        });
        if (active) {
          setWorkers(data.results);
          setCount(data.count);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.detail || 'Unable to load company team list.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadWorkers();
    return () => { active = false; };
  }, [page, pageSize, searchQuery]);

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
      setCount((current) => Math.max(0, current - 1));
      setDeleteModalOpen(false);
      setSelectedWorker(null);
      if (workers.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchWorkers(page, pageSize);
      }
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
              onChange={(e) => { setPage(1); setSearchQuery(e.target.value); }}
            />
          </div>

          <div style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>
            {count} {count === 1 ? 'member' : 'members'} found
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Loader2 size={32} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto' }} />
            </div>
          ) : workers.length > 0 ? (
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
                  {workers.map((worker) => (
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
          {!loading && (
            <Pagination
              count={count}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPage(1); setPageSize(size); }}
            />
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
