import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  ClipboardCopy,
  Code2,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  ToggleLeft,
  Trash2,
  X,
} from 'lucide-react';
import Modal from '../components/Modal';
import {
  createIntegrationApi,
  deleteIntegrationApi,
  getIntegrationsApi,
  updateIntegrationApi,
} from '../api/integrations';

const fieldTypes = [
  ['text', 'Short text'],
  ['textarea', 'Long text'],
  ['number', 'Number'],
  ['email', 'Email'],
  ['date', 'Date'],
  ['select', 'Select'],
  ['multi_select', 'Multiple select'],
  ['checkbox', 'Checkbox'],
];

const newField = () => ({
  key: `${Date.now()}-${Math.random()}`,
  name: '',
  field_type: 'text',
  required: false,
  options: '',
});

const blankForm = { name: '', is_active: true, fields: [newField()] };

const toForm = (integration) => ({
  name: integration.name,
  is_active: integration.is_active,
  fields: integration.fields.map((field) => ({
    key: field.id,
    name: field.name,
    field_type: field.field_type,
    required: field.required,
    options: (field.options || []).join(', '),
  })),
});

const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [copiedId, setCopiedId] = useState(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError('');
      setIntegrations(await getIntegrationsApi());
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load integrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const openCreate = () => {
    setEditingIntegration(null);
    setForm({ ...blankForm, fields: [newField()] });
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (integration) => {
    setEditingIntegration(integration);
    setForm(toForm(integration));
    setFieldErrors({});
    setModalOpen(true);
  };

  const updateField = (key, changes) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field) => field.key === key ? { ...field, ...changes } : field),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    const payload = {
      name: form.name.trim(),
      is_active: form.is_active,
      fields: form.fields.map((field, position) => ({
        name: field.name.trim(),
        field_type: field.field_type,
        required: field.required,
        position,
        options: ['select', 'multi_select'].includes(field.field_type)
          ? field.options.split(',').map((option) => option.trim()).filter(Boolean)
          : [],
      })),
    };

    try {
      const saved = editingIntegration
        ? await updateIntegrationApi(editingIntegration.id, payload)
        : await createIntegrationApi(payload);
      setIntegrations((current) => editingIntegration
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...current]);
      setModalOpen(false);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === 'object') setFieldErrors(responseData);
      else setError('Unable to save integration.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (integration) => {
    if (!window.confirm(`Delete ${integration.name}? This cannot be undone.`)) return;
    try {
      await deleteIntegrationApi(integration.id);
      setIntegrations((current) => current.filter((item) => item.id !== integration.id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete integration.');
    }
  };

  const toggleActive = async (integration) => {
    try {
      const saved = await updateIntegrationApi(integration.id, { is_active: !integration.is_active });
      setIntegrations((current) => current.map((item) => item.id === saved.id ? saved : item));
    } catch (err) {
      setError('Unable to update integration status.');
    }
  };

  const copyFormUrl = async (integration) => {
    await navigator.clipboard.writeText(integration.form_url);
    setCopiedId(integration.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const renderError = (field) => {
    const message = fieldErrors[field];
    if (!message) return null;
    return <span className="form-help" style={{ color: 'var(--rose-600)' }}>{Array.isArray(message) ? message[0] : message}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Integrations</h2>
          <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '2px' }}>Create shareable forms for collecting structured information.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={17} /><span>New Integration</span></button>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} /><div>{error}</div></div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your integrations</h3>
          <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>{integrations.length} {integrations.length === 1 ? 'form' : 'forms'}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}><Loader2 size={30} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto' }} /></div>
          ) : integrations.length ? (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Fields</th><th>Status</th><th>Public form</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                <tbody>
                  {integrations.map((integration) => (
                    <tr key={integration.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Code2 size={17} /></div><strong>{integration.name}</strong></div></td>
                      <td style={{ color: 'var(--slate-600)' }}>{integration.fields.length} {integration.fields.length === 1 ? 'field' : 'fields'}</td>
                      <td><span className={`badge ${integration.is_active ? 'badge-active' : 'badge-inactive'}`}>{integration.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => copyFormUrl(integration)} title="Copy public form URL">{copiedId === integration.id ? <Check size={14} /> : <ClipboardCopy size={14} />}<span>{copiedId === integration.id ? 'Copied' : 'Copy link'}</span></button></td>
                      <td style={{ textAlign: 'right' }}><div style={{ display: 'inline-flex', gap: '8px' }}><button className="btn btn-secondary btn-sm" onClick={() => toggleActive(integration)} title="Toggle active status"><ToggleLeft size={14} /><span>{integration.is_active ? 'Disable' : 'Enable'}</span></button><button className="btn btn-secondary btn-sm" onClick={() => openEdit(integration)}><Pencil size={14} /><span>Edit</span></button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(integration)} title="Delete integration"><Trash2 size={14} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--slate-500)' }}><Code2 size={38} style={{ margin: '0 auto 12px', color: 'var(--slate-300)' }} /><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-700)' }}>No integrations yet</h3><p style={{ marginTop: '4px' }}>Create your first public form to start collecting information.</p></div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editingIntegration ? 'Edit Integration' : 'New Integration'} maxWidth="760px">
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label" htmlFor="integration-name">Integration name</label><input id="integration-name" className="form-input" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />{renderError('name')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}><input id="integration-active" type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} /><label htmlFor="integration-active" style={{ fontSize: '13px', color: 'var(--slate-700)' }}>Make this form publicly available</label></div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}><div><h4 style={{ fontSize: '15px' }}>Form fields</h4><p style={{ fontSize: '12px', color: 'var(--slate-500)' }}>Fields are shown in the order listed below.</p></div><button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm((current) => ({ ...current, fields: [...current.fields, newField()] }))}><Plus size={14} />Add field</button></div>
          {fieldErrors.fields && <div className="form-help" style={{ color: 'var(--rose-600)', marginBottom: '8px' }}>{Array.isArray(fieldErrors.fields) ? fieldErrors.fields[0] : fieldErrors.fields}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {form.fields.map((field, index) => (
              <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '20px minmax(150px, 1fr) 150px auto', gap: '8px', alignItems: 'center', padding: '10px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '8px' }}>
                <GripVertical size={16} style={{ color: 'var(--slate-400)' }} />
                <input className="form-input" required placeholder={`Field ${index + 1} name`} value={field.name} onChange={(event) => updateField(field.key, { name: event.target.value })} />
                <select className="form-input" value={field.field_type} onChange={(event) => updateField(field.key, { field_type: event.target.value, options: '' })}>{fieldTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', whiteSpace: 'nowrap' }}><input type="checkbox" checked={field.required} onChange={(event) => updateField(field.key, { required: event.target.checked })} />Required</label><button type="button" onClick={() => setForm((current) => ({ ...current, fields: current.fields.length === 1 ? current.fields : current.fields.filter((item) => item.key !== field.key) }))} style={{ background: 'none', border: 0, color: 'var(--slate-400)', cursor: 'pointer', padding: '4px' }} title="Remove field"><X size={17} /></button></div>
                {['select', 'multi_select'].includes(field.field_type) && <input className="form-input" style={{ gridColumn: '2 / -1' }} required placeholder="Options, separated by commas" value={field.options} onChange={(event) => updateField(field.key, { options: event.target.value })} />}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}><button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><Loader2 size={16} className="spin-animation" />Saving...</> : <><Check size={16} />Save integration</>}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Integrations;