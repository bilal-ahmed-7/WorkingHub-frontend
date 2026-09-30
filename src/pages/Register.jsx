import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    if (formData.password !== formData.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          setErrors(data);
        } else {
          setGeneralError('Registration failed. Please review your information.');
        }
      } else {
        setGeneralError('Could not reach the server. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '40px 20px' }}>
      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <Building2 size={26} />
          </div>
          <h2 className="auth-title">Create Company Workspace</h2>
          <p className="auth-subtitle">Create your company account</p>
        </div>

        {generalError && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{generalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Organization Name */}
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              name="company_name"
              required
              className="form-input"
              placeholder="Acme Innovations Inc."
              value={formData.company_name}
              onChange={handleChange}
              autoFocus
            />
            {errors.company_name && (
              <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                {Array.isArray(errors.company_name) ? errors.company_name[0] : errors.company_name}
              </span>
            )}
          </div>

          {/* Owner Full Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                required
                className="form-input"
                placeholder="Jane"
                value={formData.first_name}
                onChange={handleChange}
              />
              {errors.first_name && (
                <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                  {errors.first_name[0]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                required
                className="form-input"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
              />
              {errors.last_name && (
                <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                  {errors.last_name[0]}
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Work Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="form-input"
              placeholder="jane@acme.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                {Array.isArray(errors.email) ? errors.email[0] : errors.email}
              </span>
            )}
          </div>

          {/* Password & Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                  {errors.password[0]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={handleChange}
              />
              {errors.confirm_password && (
                <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                  {errors.confirm_password}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', height: '44px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>Creating Workspace...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--slate-500)',
            borderTop: '1px solid var(--slate-200)',
            paddingTop: '20px',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
