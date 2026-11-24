import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, User, Mail, Lock, AlertCircle, Briefcase } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

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
          <h2>Create Account</h2>
          <p>Sign up to start matching resumes to jobs</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input type="text" className="form-control" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '44px' }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input type="email" className="form-control" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input type="password" className="form-control" placeholder="Min. 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }} required />
            </div>
          </div>

          {/* Role Selector */}
          <div className="form-group">
            <label className="form-label">I am a…</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Candidate tile */}
              <div
                onClick={() => setRole('USER')}
                style={{
                  border: `2px solid ${role === 'USER' ? 'var(--primary)' : 'var(--border-color)'}`,
                  borderRadius: '10px', padding: '14px', cursor: 'pointer',
                  background: role === 'USER' ? 'rgba(99,102,241,0.1)' : 'transparent',
                  textAlign: 'center', transition: 'all 0.2s',
                }}
              >
                <User size={24} style={{ color: role === 'USER' ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '6px' }} />
                <p style={{ fontWeight: '700', fontSize: '14px' }}>Candidate</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Upload & match resumes</p>
              </div>

              {/* Recruiter tile */}
              <div
                onClick={() => setRole('RECRUITER')}
                style={{
                  border: `2px solid ${role === 'RECRUITER' ? '#a855f7' : 'var(--border-color)'}`,
                  borderRadius: '10px', padding: '14px', cursor: 'pointer',
                  background: role === 'RECRUITER' ? 'rgba(168,85,247,0.1)' : 'transparent',
                  textAlign: 'center', transition: 'all 0.2s',
                }}
              >
                <Briefcase size={24} style={{ color: role === 'RECRUITER' ? '#a855f7' : 'var(--text-muted)', marginBottom: '6px' }} />
                <p style={{ fontWeight: '700', fontSize: '14px' }}>Recruiter</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Post jobs & rank candidates</p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Creating Account…' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="gradient-text" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
