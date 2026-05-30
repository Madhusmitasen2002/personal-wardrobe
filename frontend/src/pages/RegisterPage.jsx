import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './LoginPage.css'; /* Shares auth styles */

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Password strength
  const strength = useMemo(() => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { level: 20, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { level: 40, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: 60, label: 'Good', color: '#eab308' };
    if (score <= 4) return { level: 80, label: 'Strong', color: '#22c55e' };
    return { level: 100, label: 'Excellent', color: '#10b981' };
  }, [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.displayName || !form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    if (form.displayName.length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.displayName, form.email, form.password);
      navigate('/wardrobe');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__blob auth-page__blob--1" />
      <div className="auth-page__blob auth-page__blob--2" />

      <div className="auth-card animate-slide-up">
        <div className="auth-card__header">
          <div className="auth-card__icon">✨</div>
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__subtitle">Start organizing your wardrobe today</p>
        </div>

        {error && (
          <div className="auth-card__error animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-card__form">
          {/* Display Name */}
          <div className="form-field">
            <label htmlFor="register-name" className="form-field__label">Display Name</label>
            <div className="form-field__input-wrapper">
              <svg className="form-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="register-name"
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                className="form-field__input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-field">
            <label htmlFor="register-email" className="form-field__label">Email</label>
            <div className="form-field__input-wrapper">
              <svg className="form-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="register-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="form-field__input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-field">
            <label htmlFor="register-password" className="form-field__label">Password</label>
            <div className="form-field__input-wrapper">
              <svg className="form-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="form-field__input"
              />
              <button
                type="button"
                className="form-field__toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {/* Strength bar */}
            {form.password && (
              <div className="password-strength animate-fade-in">
                <div className="password-strength__bar">
                  <div
                    className="password-strength__fill"
                    style={{ width: `${strength.level}%`, background: strength.color }}
                  />
                </div>
                <div className="password-strength__label" style={{ color: strength.color }}>
                  {strength.label}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="auth-card__submit" disabled={loading}>
            {loading ? <LoadingSpinner size={20} /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
