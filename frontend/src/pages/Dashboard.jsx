import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { UploadCloud, FileText, BarChart3, Award, FileSearch, Trash2, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analysis/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch dashboard statistics');
      }

      const summary = await response.json();
      setData(summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteAnalysis = async (id, e) => {
    e.stopPropagation(); // Stop navigation trigger
    if (!window.confirm('Are you sure you want to delete this analysis record?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analysis/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete analysis');
      }

      // Refresh dashboard
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 75) return 'badge-score-high';
    if (score >= 40) return 'badge-score-medium';
    return 'badge-score-low';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '36px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Workspace Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your resumes and match them against job postings</p>
          </div>
          <button onClick={() => navigate('/upload')} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
            <UploadCloud size={18} />
            <span>Analyze Resume</span>
          </button>
        </header>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading your workspace...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="metrics-grid">
              <div className="glass-card metric-card">
                <div className="metric-icon">
                  <FileText size={24} />
                </div>
                <div className="metric-info">
                  <h3>Total Resumes</h3>
                  <p>{data?.totalResumes}</p>
                </div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-icon success">
                  <BarChart3 size={24} />
                </div>
                <div className="metric-info">
                  <h3>Average Match</h3>
                  <p>{data?.averageScore}%</p>
                </div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-icon accent">
                  <Award size={24} />
                </div>
                <div className="metric-info">
                  <h3>Best Match</h3>
                  <p>{data?.bestMatchScore}%</p>
                </div>
              </div>
            </div>

            {/* Analysis History */}
            <div className="glass-card">
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Analysis History</h2>
              {data?.recentAnalyses?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  <FileSearch size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <p style={{ fontSize: '16px', fontWeight: 600 }}>No analysis history yet</p>
                  <p style={{ fontSize: '14px', marginBottom: '20px' }}>Upload a resume and enter a job description to get started</p>
                  <button onClick={() => navigate('/upload')} className="btn btn-primary">
                    Upload & Match Now
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Resume Name</th>
                        <th>Job Description Snippet</th>
                        <th>Analyzed Date</th>
                        <th>Match Score</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.recentAnalyses?.map((item) => (
                        <tr 
                          key={item.id} 
                          onClick={() => navigate('/result', { state: { analysisData: item } })}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ fontWeight: '600' }}>{item.fileName}</td>
                          <td style={{ color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.jobDescription}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{formatDate(item.analysisDate)}</td>
                          <td>
                            <span className={`badge ${getScoreBadgeClass(item.score)}`}>
                              {item.score}% Match
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '10px' }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/result', { state: { analysisData: item } });
                                }}
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                View Result
                                <ArrowRight size={14} />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteAnalysis(item.id, e)}
                                className="btn btn-danger" 
                                style={{ padding: '6px', minWidth: '32px' }}
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
