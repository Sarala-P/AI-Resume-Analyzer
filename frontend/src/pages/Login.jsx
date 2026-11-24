import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid email or password');

      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', data.role);

      // Route based on role
      navigate(data.role === 'RECRUITER' ? '/recruiter' : '/');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Cpu size={48} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px var(--primary))' }} />
          </div>
          <h2>Welcome Back</h2>
          <p>Login to analyze resumes and match job profiles</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input id="email" type="email" className="form-control"
                placeholder="developer@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input id="password" type="password" className="form-control"
                placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="gradient-text" style={{ fontWeight: 600 }}>Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
