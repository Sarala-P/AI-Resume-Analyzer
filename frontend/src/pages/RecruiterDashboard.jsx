import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Briefcase, PlusCircle, List, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

const RecruiterDashboard = () => {
  const [title, setTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // Fetch existing jobs on load
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setFetchingJobs(true);
    try {
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchingJobs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !jobDescription.trim()) {
      setError('Please fill in both the job title and description.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create job');

      setSuccess(`Job "${data.title}" created! Now rank candidates.`);
      setTitle('');
      setJobDescription('');
      fetchJobs(); // refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content animate-fade-in">
        {/* Header */}
        <header style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Briefcase size={32} style={{ color: 'var(--primary)' }} />
            Recruiter Mode
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Post a job description and automatically rank every uploaded candidate resume.
          </p>
        </header>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* ── Post New Job ── */}
          <div className="glass-card">
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={20} style={{ color: 'var(--primary)' }} /> Post New Job
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Senior Java Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  className="form-control"
                  placeholder="Paste the full job requirements here — skills, experience, tech stack..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{ minHeight: '220px', resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save & Rank Candidates'}
              </button>
            </form>
          </div>

          {/* ── Previous Job Postings ── */}
          <div className="glass-card">
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <List size={20} style={{ color: 'var(--primary)' }} /> Your Job Postings
            </h2>

            {fetchingJobs ? (
              <div className="spinner-container" style={{ minHeight: '150px' }}>
                <div className="spinner" />
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Briefcase size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <p>No job postings yet. Create your first one →</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{job.title}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Clock size={12} /> {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                      onClick={() => navigate(`/recruiter/results/${job.id}`, { state: { jobTitle: job.title } })}
                    >
                      Rank Candidates <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
