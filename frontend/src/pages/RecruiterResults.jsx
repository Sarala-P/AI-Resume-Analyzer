import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Trophy, ArrowLeft, User2, FileText, Star, AlertCircle, CheckCircle, Eye, X, RefreshCw } from 'lucide-react';

const RecruiterResults = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState(location.state?.jobTitle || 'Job Position');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRankings();
  }, [jobId]);

  const fetchRankings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/jobs/${jobId}/ranked-resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch rankings');
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 40) return '#fbbf24';
    return 'var(--error)';
  };

  const getBadgeClass = (score) => {
    if (score >= 75) return 'badge-score-high';
    if (score >= 40) return 'badge-score-medium';
    return 'badge-score-low';
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content animate-fade-in">
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/recruiter')} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
            <ArrowLeft size={16} /> Back to Jobs
          </button>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy size={28} style={{ color: '#fbbf24' }} />
              Ranked Candidates
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Ranked for: <strong style={{ color: '#fff' }}>{jobTitle}</strong>
            </p>
          </div>
          <button
            onClick={fetchRankings}
            className="btn btn-secondary"
            style={{ marginLeft: 'auto', padding: '8px 14px' }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Re-evaluate</span>
          </button>
        </header>

        {/* Status */}
        {loading ? (
          <div className="spinner-container" style={{ minHeight: '300px' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
              Parsing and ranking all candidate resumes against job requirements...
            </p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : results.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FileText size={56} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>No Candidate Resumes Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '500px', margin: '8px auto 20px' }}>
              There are currently no candidate resumes uploaded in the system. As soon as candidates sign up and upload their PDF resumes, they will automatically be evaluated here.
            </p>
            <button onClick={() => navigate('/recruiter')} className="btn btn-primary">
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {results.map((r, index) => {
              const isBest = r.isBestMatch && r.score > 0;
              return (
                <div
                  key={r.resumeId}
                  className="glass-card"
                  style={{
                    border: isBest ? '1.5px solid rgba(251, 191, 36, 0.6)' : '1px solid var(--border-color)',
                    background: isBest ? 'rgba(251, 191, 36, 0.04)' : 'var(--bg-card)',
                    boxShadow: isBest ? '0 4px 24px rgba(251, 191, 36, 0.15)' : undefined,
                    padding: '20px 24px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Rank Number Medal */}
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '50%',
                      background: index === 0 && r.score > 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)'
                                : index === 1 && r.score > 0 ? 'linear-gradient(135deg, #9ca3af, #4b5563)'
                                : index === 2 && r.score > 0 ? 'linear-gradient(135deg, #f97316, #c2410c)'
                                : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '16px', flexShrink: 0,
                      color: index < 3 && r.score > 0 ? '#000' : 'var(--text-secondary)',
                      boxShadow: index === 0 && r.score > 0 ? '0 0 12px rgba(251,191,36,0.4)' : 'none'
                    }}>
                      #{index + 1}
                    </div>

                    {/* Candidate Details */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{r.candidateName}</h3>
                        {isBest && (
                          <span style={{
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            color: '#111', fontWeight: '800', fontSize: '11px',
                            padding: '3px 10px', borderRadius: '20px',
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)'
                          }}>
                            <Star size={12} fill="#111" /> BEST MATCH
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User2 size={13} /> {r.candidateEmail}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={13} /> {r.fileName}
                      </p>
                    </div>

                    {/* Score Bar & Percentage */}
                    <div style={{ minWidth: '220px', flex: '0 0 auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Overall Match</span>
                        <span className={`badge ${getBadgeClass(r.score)}`} style={{ fontSize: '13px' }}>
                          {r.score}% Match
                        </span>
                      </div>
                      <div style={{
                        width: '100%', height: '8px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '4px', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${r.score}%`,
                          height: '100%',
                          background: getBarColor(r.score),
                          borderRadius: '4px',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: `0 0 10px ${getBarColor(r.score)}60`,
                        }} />
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div>
                      <button
                        onClick={() => setSelectedCandidate(r)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                      >
                        <Eye size={15} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: View Details */}
        {selectedCandidate && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }} onClick={() => setSelectedCandidate(null)}>
            <div
              className="glass-card animate-scale-in"
              style={{
                maxWidth: '600px', width: '100%',
                background: '#111726', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '16px', padding: '28px', maxHeight: '85vh', overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>{selectedCandidate.candidateName}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{selectedCandidate.candidateEmail} • {selectedCandidate.fileName}</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="btn btn-secondary"
                  style={{ padding: '6px', borderRadius: '50%', minWidth: '32px', height: '32px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: getBarColor(selectedCandidate.score) }}>
                  {selectedCandidate.score}%
                </div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '15px' }}>Job Fit Score</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {selectedCandidate.score >= 75 ? 'Strong candidate profile with high qualification match.' :
                     selectedCandidate.score >= 40 ? 'Moderate match with several transferable skills.' :
                     'Low overlap with technical requirements.'}
                  </p>
                </div>
              </div>

              {/* Matched Skills */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <CheckCircle size={16} /> Matched Skills ({selectedCandidate.matchedSkills?.length || 0})
                </h4>
                {selectedCandidate.matchedSkills && selectedCandidate.matchedSkills.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedCandidate.matchedSkills.map((s) => (
                      <span key={s} className="skill-tag skill-tag-matched">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No exact skills matched.</p>
                )}
              </div>

              {/* Missing Skills */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <AlertCircle size={16} /> Missing Target Skills ({selectedCandidate.missingSkills?.length || 0})
                </h4>
                {selectedCandidate.missingSkills && selectedCandidate.missingSkills.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedCandidate.missingSkills.map((s) => (
                      <span key={s} className="skill-tag skill-tag-missing">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>All required job skills are present!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecruiterResults;
