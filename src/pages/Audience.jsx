import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react';
import Modal from '../components/Modal';
import {
  createAudienceApi,
  deleteAudienceApi,
  getAudienceApi,
  updateAudienceApi,
} from '../api/audience';

const emptyForm = {
  email: '',
  mobile: '',
  zipcode: '',
  city: '',
  street: '',
  state: '',
};

const Audience = () => {
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAudience, setEditingAudience] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchAudiences = async () => {
    try {
      setLoading(true);
      setError('');
      setAudiences(await getAudienceApi());
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load audience.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiences();
  }, []);

  const openCreate = () => {
    setEditingAudience(null);
    setForm(emptyForm);
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (audience) => {
    setEditingAudience(audience);
    setForm({
      email: audience.email,
      mobile: audience.mobile,
      zipcode: audience.zipcode,
      city: audience.city,
      street: audience.street,
      state: audience.state,
    });
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setError('');

    try {
      const saved = editingAudience
        ? await updateAudienceApi(editingAudience.id, form)
        : await createAudienceApi(form);
      setAudiences((current) => editingAudience
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved].sort((a, b) => a.city.localeCompare(b.city) || a.email.localeCompare(b.email)));
      setModalOpen(false);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === 'object') {
        setFieldErrors(responseData);
      } else {
        setError('Unable to save audience record.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (audience) => {
    if (!window.confirm(`Remove ${audience.email} from your audience?`)) return;
    setError('');
    try {
      await deleteAudienceApi(audience.id);
      setAudiences((current) => current.filter((item) => item.id !== audience.id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete audience record.');
    }
  };

  const filteredAudiences = audiences.filter((item) => {
    const query = search.trim().toLowerCase();
    return [item.email, item.mobile, item.zipcode, item.city, item.street, item.state]
      .some((value) => value.toLowerCase().includes(query));
  });

  const renderFieldError = (field) => {
    const message = fieldErrors[field];
    if (!message) return null;
    return <span className="form-help" style={{ color: 'var(--rose-600)' }}>{Array.isArray(message) ? message[0] : message}</span>;
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--slate-900)' }}>Audience</h2>
          <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '2px' }}>
            Manage your company’s customer records.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={17} />
          <span>Add Audience</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ padding: '16px 24px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}
            />
            <input
              type="search"
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
              placeholder="Search audience..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>
            {filteredAudiences.length} {filteredAudiences.length === 1 ? 'record' : 'records'}
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Loader2 size={30} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto' }} />
            </div>
          ) : filteredAudiences.length ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Address</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudiences.map((item) => (
                    <tr key={item.id}>
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
                            }}
                          >
                            <UserRound size={17} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{item.email}</div>
                            <div style={{ fontSize: '13px', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                              <Mail size={13} /> {item.mobile}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={14} /> {item.street}, {item.city}, {item.state} {item.zipcode}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)} title="Edit audience record">
                            <Pencil size={14} />
                            <span>Edit</span>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)} title="Delete audience record">
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
              <UserRound size={38} style={{ margin: '0 auto 12px', color: 'var(--slate-300)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-700)' }}>
                {search ? 'No matching audience records' : 'No audience records yet'}
              </h3>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editingAudience ? 'Edit Audience' : 'Add Audience'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {[
              ['email', 'Email', 'email'],
              ['mobile', 'Mobile', 'tel'],
              ['street', 'Street', 'text'],
              ['city', 'City', 'text'],
              ['state', 'State', 'text'],
              ['zipcode', 'Zipcode', 'text'],
            ].map(([field, label, type]) => (
              <div className="form-group" key={field}>
                <label className="form-label" htmlFor={`audience-${field}`}>{label}</label>
                <input
                  id={`audience-${field}`}
                  type={type}
                  required
                  className="form-input"
                  value={form[field]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                />
                {renderFieldError(field)}
              </div>
            ))}
          </div>
          {fieldErrors.non_field_errors && (
            <div className="alert alert-error">{fieldErrors.non_field_errors.join(' ')}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="spin-animation" /> : null}
              <span>{editingAudience ? 'Save Changes' : 'Add Audience'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Audience;
