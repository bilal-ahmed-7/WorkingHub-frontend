import React, { useEffect, useState } from 'react';
import { AlertCircle, ClipboardList, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { createAudienceRecordApi, deleteAudienceRecordApi, getAudienceApi, updateAudienceRecordApi } from '../api/audience';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const emptyRecord = { integration_id: '', name: '', mobile: '', email: '', zipcode: '', city: '', street: '', state: '' };
const columns = [['name', 'Name'], ['mobile', 'Mobile'], ['email', 'Email'], ['zipcode', 'ZIP Code'], ['city', 'City'], ['street', 'Street'], ['state', 'State']];
const usPhoneFormatHint = 'Use (XXX) XXX-XXXX, XXX-XXX-XXXX, or +1XXXXXXXXXX.';
const formatUsPhone = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits.length === 10
    ? `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    : value;
};
const sortOptions = [
  ['-updated_at', 'Newest first'],
  ['updated_at', 'Oldest first'],
  ['name', 'Name A-Z'],
  ['-name', 'Name Z-A'],
];

const Audience = () => {
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-updated_at');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState(emptyRecord);
  const [modalError, setModalError] = useState('');

  const load = async (requestedPage = page) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAudienceApi({
        page: requestedPage,
        page_size: pageSize,
        search: search.trim(),
        ordering,
      });
      setRecords(data.results);
      setCount(data.count);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load audience records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, pageSize, search, ordering]);

  const openModal = (record = null) => {
    setSelectedRecord(record);
    setForm(record
      ? { ...emptyRecord, ...record, mobile: formatUsPhone(record.mobile), integration_id: record.integration_id || '' }
      : emptyRecord);
    setModalError('');
    setModalOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const payload = { ...form, integration_id: selectedRecord ? form.integration_id || null : null };
      if (selectedRecord) {
        await updateAudienceRecordApi(selectedRecord.id, payload);
      } else {
        await createAudienceRecordApi(payload);
      }
      setNotice('Audience record saved.');
      setModalOpen(false);
      if (selectedRecord) {
        await load(page);
      } else {
        setPage(1);
        await load(1);
      }
    } catch (err) {
      const data = err.response?.data;
      setModalError(data && typeof data === 'object'
        ? Object.values(data).map((value) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')
        : 'Unable to save audience record.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record) => {
    setDeleting(true);
    try {
      await deleteAudienceRecordApi(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      setCount((current) => current - 1);
      setNotice('Audience record deleted.');
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete audience record.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Audience</h2>
        <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '2px' }}>Your standardised audience records.</p>
      </div>
      {error && <div className="alert alert-error"><AlertCircle size={18} />{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}
      <div className="card">
        <div className="card-header">
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="search"
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
              placeholder="Search audience..."
              value={search}
              onChange={(event) => { setPage(1); setSearch(event.target.value); }}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--slate-600)' }}>
            Sort by
            <select
              className="form-input"
              style={{ height: '40px', width: 'auto' }}
              value={ordering}
              onChange={(event) => { setPage(1); setOrdering(event.target.value); }}
            >
              {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>{count} Audience</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal()}><Plus size={16} /> Add audience</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}><Loader2 size={30} className="spin-animation" /></div>
          ) : records.length ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Submitted</th>{columns.map(([, label]) => <th key={label}>{label}</th>)}<th>Actions</th></tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(record.submitted_at).toLocaleString()}</td>
                      {columns.map(([key]) => <td key={key}>{(key === 'mobile' ? formatUsPhone(record[key]) : record[key]) || '—'}</td>)}
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal(record)}><Pencil size={14} /> Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(record)}><Trash2 size={14} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
              <ClipboardList size={38} style={{ margin: '0 auto 12px' }} />
              <h3>{search ? 'No matching audience records' : 'No audience records yet'}</h3>
            </div>
          )}
          {!loading && <Pagination count={count} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPage(1); setPageSize(size); }} />}
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title={selectedRecord ? 'Edit audience record' : 'Add audience record'}>
        <form onSubmit={save}>
          {modalError && <div className="alert alert-error"><AlertCircle size={18} />{modalError}</div>}
          {columns.map(([key, label]) => (
            <div className="form-group" key={key}>
              <label className="form-label" htmlFor={`audience-${key}`}>
                {label}
                {(key === 'mobile' || key === 'email') && <span aria-hidden="true" style={{ color: 'var(--rose-600)', marginLeft: '3px' }}>*</span>}
              </label>
              <input
                id={`audience-${key}`}
                className="form-input"
                type={key === 'mobile' ? 'tel' : key === 'email' ? 'email' : 'text'}
                required={key === 'mobile' || key === 'email'}
                autoComplete={key === 'mobile' ? 'tel' : undefined}
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
              {key === 'mobile' && <span className="form-help">{usPhoneFormatHint}</span>}
            </div>
          ))}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save record'}</button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete audience"
      >
        <p style={{ color: 'var(--slate-600)' }}>
          Are you sure you want to delete{' '}
          <strong>{deleteTarget?.name || deleteTarget?.email || 'this audience'}</strong>?
          {' '}This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => deleteTarget && remove(deleteTarget)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete audience'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Audience;
