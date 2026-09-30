import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { getPublicIntegrationApi, submitIntegrationApi } from '../api/integrations';

const inputType = { text: 'text', number: 'number', email: 'email', date: 'date' };

const initialValue = (field) => field.field_type === 'multi_select' ? [] : field.field_type === 'checkbox' ? false : '';

const PublicIntegrationForm = () => {
  const publicId = window.location.pathname.split('/').filter(Boolean).pop();
  const [integration, setIntegration] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadForm = async () => {
      try {
        const data = await getPublicIntegrationApi(publicId);
        setIntegration(data);
        setValues(Object.fromEntries(data.fields.map((field) => [field.name, initialValue(field)])));
      } catch (err) {
        setError(err.response?.data?.detail || 'This form is unavailable.');
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [publicId]);

  const resetValues = () => setValues(Object.fromEntries(integration.fields.map((field) => [field.name, initialValue(field)])));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      const response = await submitIntegrationApi(publicId, values);
      setSuccess(response.message || 'Thanks, your response has been submitted.');
      resetValues();
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData && typeof responseData === 'object') setFieldErrors(responseData);
      else setError('Unable to submit this form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const renderField = (field) => {
    const common = { id: `public-${field.id}`, name: field.name, required: field.required, className: 'form-input', value: values[field.name] ?? '', onChange: (event) => updateValue(field.name, event.target.value) };
    if (field.field_type === 'textarea') return <textarea {...common} rows="4" />;
    if (field.field_type === 'select') return <select {...common}><option value="">Select an option</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
    if (field.field_type === 'multi_select') return <select multiple {...common} value={values[field.name] || []} onChange={(event) => updateValue(field.name, Array.from(event.target.selectedOptions, (option) => option.value))}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
    if (field.field_type === 'checkbox') return <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-700)' }}><input type="checkbox" checked={Boolean(values[field.name])} required={field.required} onChange={(event) => updateValue(field.name, event.target.checked)} />Yes</label>;
    return <input {...common} type={inputType[field.field_type] || 'text'} />;
  };

  if (loading) return <div className="public-form-shell"><Loader2 size={30} className="spin-animation" style={{ color: 'var(--primary-600)' }} /></div>;
  if (error && !integration) return <div className="public-form-shell"><div className="public-form-card"><div className="alert alert-error"><AlertCircle size={18} />{error}</div></div></div>;

  return <div className="public-form-shell"><div className="public-form-card">
    <div style={{ marginBottom: '26px' }}><div style={{ color: 'var(--primary-600)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>WorkHub form</div><h1 style={{ fontSize: '28px', lineHeight: 1.2 }}>{integration.name}</h1><p style={{ color: 'var(--slate-500)', marginTop: '8px' }}>Please complete the form below.</p></div>
    {success && <div className="alert alert-success"><CheckCircle2 size={18} />{success}</div>}
    {error && <div className="alert alert-error"><AlertCircle size={18} />{error}</div>}
    <form onSubmit={handleSubmit}>{integration.fields.map((field) => <div className="form-group" key={field.id}><label className="form-label" htmlFor={`public-${field.id}`}>{field.name}{field.required ? ' *' : ''}</label>{renderField(field)}{fieldErrors[field.name] && <span className="form-help" style={{ color: 'var(--rose-600)' }}>{fieldErrors[field.name]}</span>}</div>)}<button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>{submitting ? <><Loader2 size={16} className="spin-animation" />Submitting...</> : <><Send size={16} />Submit response</>}</button></form>
  </div></div>;
};

export default PublicIntegrationForm;