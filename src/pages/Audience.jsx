import React, { useEffect, useState } from 'react';
import { AlertCircle, ClipboardList, Loader2, Search } from 'lucide-react';
import { getAudienceApi } from '../api/audience';
import Pagination from '../components/Pagination';

const displayLabel = (label) => label
  .replace(/^(enter|select|choose|input)\s+(your\s+)?/i, '')
  .trim();

const Audience = () => {
  const [submissions, setSubmissions] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getAudienceApi({ page, page_size: pageSize, search: search.trim() })
      .then((data) => {
        if (active) {
          setSubmissions(data.results);
          setCount(data.count);
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.detail || 'Unable to load submissions.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, pageSize, search]);

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
            <input type="search" className="form-input" style={{ paddingLeft: '38px', height: '40px' }} placeholder="Search responses..." value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 600 }}>{count} responses</span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}><Loader2 size={30} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto' }} /></div>
          ) : submissions.length ? (
            <div className="table-container">
              <table className="data-table audience-table">
                <thead><tr><th>Form</th><th>Submitted</th><th>Details</th></tr></thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{submission.integration_name}</td>
                      <td style={{ color: 'var(--slate-600)', whiteSpace: 'nowrap' }}>{new Date(submission.submitted_at).toLocaleString()}</td>
                      <td>
                        <div className="audience-details-grid">
                          {Object.entries(submission.data).map(([key, value]) => (
                            <div className="audience-detail-item" key={key}>
                              <span className="audience-detail-label">{displayLabel(key)}</span>
                              <span className="audience-detail-value">
                                {Array.isArray(value) ? value.join(', ') : String(value ?? 'No value')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--slate-500)' }}><ClipboardList size={38} style={{ margin: '0 auto 12px', color: 'var(--slate-300)' }} /><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-700)' }}>{search ? 'No matching responses' : 'No form responses yet'}</h3></div>
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
    </div>
  );
};

export default Audience;
