import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  ClipboardCopy,
  Code2,
  Eye,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  ToggleLeft,
  Trash2,
  X,
} from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  createIntegrationApi,
  deleteIntegrationApi,
  getIntegrationsApi,
  updateIntegrationApi,
  getIntegrationLogsApi,
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

const displayLabel = (label) => label
  .replace(/^(enter|select|choose|input)\s+(your\s+)?/i, '')
  .trim();

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
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [copiedId, setCopiedId] = useState(null);
  const [notice, setNotice] = useState('');
  const [logs, setLogs] = useState(null);
  const [logsIntegration, setLogsIntegration] = useState(null);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(10);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchIntegrations = async (
    requestedPage = page,
    requestedPageSize = pageSize,
    isActive = () => true,
  ) => {
    try {
      setLoading(true);
      setError('');
      const data = await getIntegrationsApi({ page: requestedPage, page_size: requestedPageSize });
      if (isActive()) {
        setIntegrations(data.results);
        setCount(data.count);
      }
    } catch (err) {
      if (isActive()) setError(err.response?.data?.detail || 'Unable to load integrations.');
    } finally {
      if (isActive()) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchIntegrations(page, pageSize, () => active);
    return () => { active = false; };
  }, [page, pageSize]);

  const openCreate = () => {
    setEditingIntegration(null);
    setForm({ ...blankForm, fields: [newField()] });
    setFieldErrors({});
    setNotice('');
    setModalOpen(true);
  };

  const openEdit = (integration) => {
    setEditingIntegration(integration);
    setForm(toForm(integration));
    setFieldErrors({});
    setNotice('');
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
      if (!editingIntegration) {
        if (page !== 1) setPage(1);
        else await fetchIntegrations(1, pageSize);
      }
      setModalOpen(false);
      setNotice(`${saved.name} ${editingIntegration ? 'updated' : 'created'} successfully.`);
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
      setCount((current) => Math.max(0, current - 1));
      if (integrations.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchIntegrations(page, pageSize);
      }
      setNotice(`${integration.name} was deleted successfully.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete integration.');
    }
  };

  const toggleActive = async (integration) => {
    try {
      const saved = await updateIntegrationApi(integration.id, { is_active: !integration.is_active });
      setIntegrations((current) => current.map((item) => item.id === saved.id ? saved : item));
      setNotice(`${saved.name} is now ${saved.is_active ? 'active' : 'inactive'}.`);
    } catch (err) {
      setError('Unable to update integration status.');
    }
  };

  const openLogs = async (integration) => {
    setLogsIntegration(integration);
    setLogsPage(1);
    setLogsError('');
    setSelectedLog(null);
    setLogsLoading(true);
    setLogs(null);
  };

  useEffect(() => {
    if (!logsIntegration) return undefined;
    let active = true;
    setLogsLoading(true);
    getIntegrationLogsApi(logsIntegration.id, { page: logsPage, page_size: logsPageSize })
      .then((data) => { if (active) setLogs(data); })
      .catch((err) => {
        if (active) {
          setLogsError(err.response?.data?.detail || 'Unable to load form logs.');
          setLogs(null);
        }
      })
      .finally(() => { if (active) setLogsLoading(false); });
    return () => { active = false; };
  }, [logsIntegration, logsPage, logsPageSize]);

  const getLogIdentity = (log) => Object.entries(log.data || {}).find(([key]) => {
    const normalized = key.toLowerCase();
    return normalized.includes('email') || normalized.includes('phone') || normalized.includes('mobile') || normalized.endsWith(' id');
  })?.[1] || 'Not provided';

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
      {notice && <div className="alert alert-success"><Check size={18} /><div>{notice}</div></div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your integrations</h3>
          <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>{count} {count === 1 ? 'form' : 'forms'}</span>
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
                      <td style={{ textAlign: 'right' }}><div style={{ display: 'inline-flex', gap: '8px' }}><button className="btn btn-secondary btn-sm" onClick={() => openLogs(integration)} title="View form logs"><Eye size={14} /><span>Logs</span></button><button className="btn btn-secondary btn-sm" onClick={() => toggleActive(integration)} title="Toggle active status"><ToggleLeft size={14} /><span>{integration.is_active ? 'Disable' : 'Enable'}</span></button><button className="btn btn-secondary btn-sm" onClick={() => openEdit(integration)}><Pencil size={14} /><span>Edit</span></button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(integration)} title="Delete integration"><Trash2 size={14} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--slate-500)' }}><Code2 size={38} style={{ margin: '0 auto 12px', color: 'var(--slate-300)' }} /><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-700)' }}>No integrations yet</h3><p style={{ marginTop: '4px' }}>Create your first public form to start collecting information.</p></div>
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

      <Modal isOpen={Boolean(logsIntegration)} onClose={() => { setLogsIntegration(null); setLogs(null); }} title={`${logsIntegration?.name || 'Form'} logs`} maxWidth="900px">
        {logsLoading ? <div style={{ padding: '32px', textAlign: 'center' }}><Loader2 size={28} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto' }} /></div> : logsError ? <div className="alert alert-error"><AlertCircle size={18} /><div>{logsError}</div></div> : logs && <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}><div style={{ padding: '16px', background: 'var(--emerald-50)', borderRadius: '8px' }}><div style={{ fontSize: '12px', color: 'var(--emerald-700)', fontWeight: 700 }}>SUCCESSFUL SUBMISSIONS</div><strong style={{ display: 'block', fontSize: '28px', color: 'var(--emerald-700)' }}>{logs?.total_success}</strong></div><div style={{ padding: '16px', background: 'var(--rose-50)', borderRadius: '8px' }}><div style={{ fontSize: '12px', color: 'var(--rose-600)', fontWeight: 700 }}>ERRORS</div><strong style={{ display: 'block', fontSize: '28px', color: 'var(--rose-600)' }}>{logs?.total_errors}</strong></div></div>
          {logs?.results.length ? <div className="table-container"><table className="data-table"><thead><tr><th>Status</th><th>Email / identity</th><th>Response</th><th>Submitted</th><th style={{ textAlign: 'right' }}>View</th></tr></thead><tbody>{logs.results.map((log) => <tr key={log.id}><td><span className={`badge ${log.status === 'success' ? 'badge-active' : 'badge-inactive'}`}>{log.status === 'success' ? 'Success' : 'Error'}</span></td><td style={{ fontWeight: 600 }}>{getLogIdentity(log)}</td><td style={{ color: log.status === 'error' ? 'var(--rose-600)' : 'var(--slate-600)', maxWidth: '280px' }}>{log.error_message || 'Response saved successfully.'}</td><td style={{ whiteSpace: 'nowrap', color: 'var(--slate-500)' }}>{new Date(log.submitted_at).toLocaleString()}</td><td style={{ textAlign: 'right' }}><button className="btn btn-secondary btn-sm btn-icon" onClick={() => setSelectedLog(log)} title="View complete log"><Eye size={15} /><span>Details</span></button></td></tr>)}</tbody></table></div> : <div style={{ padding: '32px', textAlign: 'center', color: 'var(--slate-500)' }}>No attempts have been recorded for this form.</div>}
          <Pagination
            count={logs?.count || 0}
            page={logsPage}
            pageSize={logsPageSize}
            onPageChange={setLogsPage}
            onPageSizeChange={(size) => { setLogsPage(1); setLogsPageSize(size); }}
          />
        </>}
      </Modal>

      <Modal isOpen={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} title={`Submission log #${selectedLog?.id || ''}`} maxWidth="820px">
        {selectedLog && <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--slate-200)' }}>
            <div><div style={{ fontSize: '12px', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Submission result</div><div style={{ marginTop: '5px', fontWeight: 800, color: selectedLog.status === 'success' ? 'var(--emerald-700)' : 'var(--rose-600)' }}>{selectedLog.status === 'success' ? 'Successful response' : 'Rejected response'}</div></div>
            <span className={`badge ${selectedLog.status === 'success' ? 'badge-active' : 'badge-inactive'}`}>HTTP {selectedLog.response_status}</span>
          </div>
          {selectedLog.error_message && <div className="alert alert-error"><AlertCircle size={18} /><div>{selectedLog.error_message}</div></div>}
          <div className="log-detail-grid">
            <div><span className="log-detail-label">Submitted</span><strong>{new Date(selectedLog.submitted_at).toLocaleString()}</strong></div>
            <div><span className="log-detail-label">Identity</span><strong>{getLogIdentity(selectedLog)}</strong></div>
            <div><span className="log-detail-label">Method</span><strong>{selectedLog.request_meta?.method || 'POST'}</strong></div>
            <div><span className="log-detail-label">Content type</span><strong>{selectedLog.request_meta?.content_type || 'application/json'}</strong></div>
            <div><span className="log-detail-label">IP address</span><strong>{selectedLog.request_meta?.ip_address || 'Unavailable'}</strong></div>
            <div><span className="log-detail-label">Origin</span><strong>{selectedLog.request_meta?.origin || 'Unavailable'}</strong></div>
          </div>
          <div style={{ marginTop: '20px' }}><div className="log-detail-label">Form ID / token</div><code className="log-code-line">{selectedLog.form_token || logs?.form_token || selectedLog.form_id || logs?.form_id || 'Unavailable'}</code></div>
          <div style={{ marginTop: '20px' }}><div className="log-detail-label">Payload</div><table className="record-details-table"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>{Object.entries(selectedLog.data || {}).map(([key, value]) => <tr key={key}><td>{displayLabel(key)}</td><td>{Array.isArray(value) ? value.join(', ') : String(value ?? 'No value')}</td></tr>)}</tbody></table></div>
        </div>}
      </Modal>
    </div>
  );
};

export default Integrations;