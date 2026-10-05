import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Send } from 'lucide-react';
import { getPublicIntegrationApi, submitIntegrationApi } from '../api/integrations';

const inputType = { text: 'text', number: 'number', email: 'email', date: 'date' };
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
const dataKey = (field) => field.system_key === 'custom' ? field.name : field.system_key;
const initialValue = (field) => (field.field_type === 'multi_select' ? [] : field.field_type === 'checkbox' ? false : '');

const mapFeature = (feature) => {
  const properties = feature.properties || {}; const context = properties.context || feature.context || {}; const address = context.address || {};
  const name = (key) => typeof context[key] === 'string' ? context[key] : context[key]?.name || context[key]?.text || '';
  return { address_main: properties.full_address || feature.place_name || properties.name || '', address_street: [address.address_number || properties.address_number, address.street_name || context.street?.name || properties.street].filter(Boolean).join(' '), address_city: name('place') || name('locality') || properties.place || '', address_zipcode: name('postcode') || properties.postcode || '' };
};

const AddressField = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState([]); const [searching, setSearching] = useState(false); const [lookupError, setLookupError] = useState(''); const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  const search = (query) => {
    onChange({ address_main: query }); setSuggestions([]); setLookupError(''); request.current?.abort();
    if (query.trim().length < 3) return;
    if (!mapboxToken) { setLookupError('Address lookup is not configured. Add VITE_MAPBOX_TOKEN to the frontend environment.'); return; }
    const controller = new AbortController(); request.current = controller; setSearching(true);
    const params = new URLSearchParams({ q: query.trim(), access_token: mapboxToken, autocomplete: 'true', types: 'address', limit: '5' });
    fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to search addresses.')))
      .then((result) => setSuggestions(result.features || []))
      .catch((error) => { if (error.name !== 'AbortError') setLookupError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setSearching(false); });
  };
  return <div style={{ position: 'relative' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={17} color="var(--slate-500)" /><input className="form-input" type="search" autoComplete="street-address" required value={value} placeholder="Start typing your street address" onChange={(event) => search(event.target.value)} />{searching && <Loader2 size={17} className="spin-animation" />}</div>{suggestions.length > 0 && <ul style={{ position: 'absolute', zIndex: 10, top: 'calc(100% + 4px)', right: 0, left: 0, listStyle: 'none', overflow: 'hidden', background: '#fff', border: '1px solid var(--slate-200)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>{suggestions.map((feature) => { const label = feature.properties?.full_address || feature.place_name || feature.properties?.name; return <li key={feature.properties?.mapbox_id || label}><button type="button" style={{ width: '100%', padding: '11px 14px', textAlign: 'left', background: '#fff', border: 0, cursor: 'pointer' }} onClick={() => { onChange(mapFeature(feature)); setSuggestions([]); }}>{label}</button></li>; })}</ul>}{lookupError && <span className="form-help">{lookupError}</span>}</div>;
};

const PublicIntegrationForm = () => {
  const publicId = window.location.pathname.split('/').filter(Boolean).pop();
  const [integration, setIntegration] = useState(null); const [values, setValues] = useState({}); const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(''); const [fieldErrors, setFieldErrors] = useState({}); const [success, setSuccess] = useState('');
  useEffect(() => { getPublicIntegrationApi(publicId).then((data) => { setIntegration(data); setValues(Object.fromEntries(data.fields.map((field) => [dataKey(field), initialValue(field)]))); }).catch((err) => setError(err.response?.data?.detail || 'This form is unavailable.')).finally(() => setLoading(false)); }, [publicId]);
  const updateValues = (changes) => setValues((current) => ({ ...current, ...changes }));
  const submit = async (event) => { event.preventDefault(); setSubmitting(true); setError(''); setFieldErrors({}); try { const response = await submitIntegrationApi(publicId, values); setSuccess(response.message || 'Thanks, your response has been submitted.'); setValues(Object.fromEntries(integration.fields.map((field) => [dataKey(field), initialValue(field)]))); } catch (err) { const data = err.response?.data; if (data && typeof data === 'object') setFieldErrors(data); else setError('Unable to submit this form. Please try again.'); } finally { setSubmitting(false); } };
  const render = (field) => { const key = dataKey(field); const value = values[key] ?? initialValue(field); if (field.field_type === 'address_autocomplete') return <AddressField value={value} onChange={updateValues} />; const common = { id: `public-${field.id}`, name: key, required: field.required, className: 'form-input', value, readOnly: Boolean(field.config?.is_read_only), onChange: (event) => updateValues({ [key]: event.target.value }) }; if (field.field_type === 'textarea') return <textarea {...common} rows="4" />; if (field.field_type === 'select') return <select {...common}><option value="">Select an option</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>; if (field.field_type === 'multi_select') return <select {...common} multiple value={value || []} onChange={(event) => updateValues({ [key]: Array.from(event.target.selectedOptions, (option) => option.value) })}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>; if (field.field_type === 'checkbox') return <label style={{ display: 'flex', gap: '8px' }}><input type="checkbox" checked={Boolean(value)} onChange={(event) => updateValues({ [key]: event.target.checked })} />Yes</label>; return <input {...common} type={inputType[field.field_type] || 'text'} />; };
  if (loading) return <div className="public-form-shell"><Loader2 size={30} className="spin-animation" /></div>;
  if (error && !integration) return <div className="public-form-shell"><div className="public-form-card"><div className="alert alert-error"><AlertCircle size={18} />{error}</div></div></div>;
  return <div className="public-form-shell"><div className="public-form-card"><div style={{ marginBottom: '26px' }}><div style={{ color: 'var(--primary-600)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>WorkHub form</div><h1 style={{ fontSize: '28px' }}>{integration.name}</h1><p style={{ color: 'var(--slate-500)', marginTop: '8px' }}>Please complete the form below.</p></div>{success && <div className="alert alert-success"><CheckCircle2 size={18} />{success}</div>}{error && <div className="alert alert-error"><AlertCircle size={18} />{error}</div>}<form onSubmit={submit}>{integration.fields.map((field) => { const key = dataKey(field); return <div className="form-group" key={field.id}><label className="form-label" htmlFor={`public-${field.id}`}>{field.name}{field.required ? ' *' : ''}</label>{render(field)}{field.config?.is_read_only && <span className="form-help">Filled automatically from the selected address.</span>}{fieldErrors[key] && <span className="form-help" style={{ color: 'var(--rose-600)' }}>{Array.isArray(fieldErrors[key]) ? fieldErrors[key][0] : fieldErrors[key]}</span>}</div>; })}<button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>{submitting ? <><Loader2 size={16} className="spin-animation" />Submitting...</> : <><Send size={16} />Submit response</>}</button></form></div></div>;
};

export default PublicIntegrationForm;
