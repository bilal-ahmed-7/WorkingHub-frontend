import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowRight, AlertCircle, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { validateInvitationTokenApi, acceptInvitationApi } from '../api/invitations';
import { useAuth } from '../context/AuthContext';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const [validationState, setValidationState] = useState({
    loading: true,
    valid: false,
    email: '',
    companyName: '',
    error: '',
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await validateInvitationTokenApi(token);
        if (res.valid) {
          setValidationState({
            loading: false,
            valid: true,
            email: res.email,
            companyName: res.company_name,
            error: '',
          });
        }
      } catch (err) {
        console.error('Validation error:', err);
        const errMsg =
          err.response?.data?.error ||
          'This invitation token is invalid or has expired.';
        setValidationState({
          loading: false,
          valid: false,
          email: '',
          companyName: '',
          error: errMsg,
        });
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFormErrors({});

    if (formData.new_password !== formData.confirm_new_password) {
      setFormErrors({ confirm_new_password: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await acceptInvitationApi({
        token,
        first_name: formData.first_name,
        last_name: formData.last_name,
        new_password: formData.new_password,
        confirm_new_password: formData.confirm_new_password,
      });

      // Automatically store auth session
      setAuthSession(res.user, res.tokens);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Accept invite error:', err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          setFormErrors(data);
        } else {
          setGeneralError('Failed to complete onboarding. Please check your inputs.');
        }
      } else {
        setGeneralError('Network error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (validationState.loading) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Loader2 size={36} className="spin-animation" style={{ color: 'var(--primary-600)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--slate-800)' }}>
            Verifying Invitation Token...
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '6px' }}>
            Please wait while we verify your invitation.
          </p>
        </div>
      </div>
    );
  }

  if (!validationState.valid) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center', padding: '40px 28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--rose-50)',
              color: 'var(--rose-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '8px' }}>
            Invitation Expired or Invalid
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--slate-600)', marginBottom: '24px' }}>
            {validationState.error}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper" style={{ padding: '40px 20px' }}>
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <Building2 size={26} />
          </div>
          <h2 className="auth-title">Welcome to {validationState.companyName}</h2>
          <p className="auth-subtitle">
            Set up your profile and password to activate your workspace access
          </p>
        </div>

        {/* Invited account info box */}
        <div
          style={{
            background: 'var(--slate-100)',
            borderLeft: '4px solid var(--primary-600)',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Invited Member Email
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)', marginTop: '2px' }}>
            {validationState.email}
          </div>
        </div>

        {generalError && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{generalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First & Last Name */}
          <div className="form-grid-two">
            <div className="form-group">
              <label className="form-label" htmlFor="invite-first-name">First Name</label>
              <input
                id="invite-first-name"
                type="text"
                name="first_name"
                required
                className="form-input"
                placeholder="Bilal"
                value={formData.first_name}
                onChange={handleChange}
                autoFocus
              />
              {formErrors.first_name && (
                <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                  {formErrors.first_name[0]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="invite-last-name">Last Name</label>
              <input
                id="invite-last-name"
                type="text"
                name="last_name"
                required
                className="form-input"
                placeholder="Ahmed"
                value={formData.last_name}
                onChange={handleChange}
              />
              {formErrors.last_name && (
                <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                  {formErrors.last_name[0]}
                </span>
              )}
            </div>
          </div>

          {/* New Password & Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="invite-password">Set Your Secure Password</label>
            <input
              id="invite-password"
              type="password"
              name="new_password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.new_password}
              onChange={handleChange}
            />
            {formErrors.new_password && (
              <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                {Array.isArray(formErrors.new_password) ? formErrors.new_password[0] : formErrors.new_password}
              </span>
            )}
            <span className="form-help">Must be at least 8 characters long</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="invite-confirm-password">Confirm Password</label>
            <input
              id="invite-confirm-password"
              type="password"
              name="confirm_new_password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.confirm_new_password}
              onChange={handleChange}
            />
            {formErrors.confirm_new_password && (
              <span style={{ fontSize: '12px', color: 'var(--rose-600)', marginTop: '4px' }}>
                {formErrors.confirm_new_password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', height: '44px' }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>Activating Account...</span>
              </>
            ) : (
              <>
                <span>Activate Account & Join</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvite;
