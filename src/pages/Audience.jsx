import React, { useEffect, useState } from 'react';
import { AlertCircle, ClipboardList, Loader2, Search } from 'lucide-react';
import { getAudienceApi } from '../api/audience';

const Audience = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAudienceApi()
      .then(setSubmissions)
      .catch((err) => setError(err.response?.data?.detail || 'Unable to load submissions.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter((submission) => (
    `${submission.integration_name} ${JSON.stringify(submission.data)}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  ));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Audience</h2>
        <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '2px' }}>
          Responses submitted through your integration forms.
        </p>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} />{error}</div>}

      <div className="card">
        <div className="card-header">
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input type="search" className="form-input" style={{ paddingLeft: '38px', height: '40px' }} placeholder="Search responses..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>{filtered.length} responses</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}><Loader2 size={30} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto' }} /></div>
          ) : filtered.length ? (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Form</th><th>Submitted</th><th>Details</th></tr></thead>
                <tbody>
                  {filtered.map((submission) => (
                    <tr key={submission.id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{submission.integration_name}</td>
                      <td style={{ color: 'var(--slate-600)', whiteSpace: 'nowrap' }}>{new Date(submission.submitted_at).toLocaleString()}</td>
                      <td><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{Object.entries(submission.data).map(([key, value]) => <span key={key} style={{ padding: '5px 8px', background: 'var(--slate-100)', borderRadius: '5px', fontSize: '12px', color: 'var(--slate-700)' }}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value || 'No')}</span>)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--slate-500)' }}><ClipboardList size={38} style={{ margin: '0 auto 12px', color: 'var(--slate-300)' }} /><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-700)' }}>{search ? 'No matching responses' : 'No form responses yet'}</h3></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Audience;
