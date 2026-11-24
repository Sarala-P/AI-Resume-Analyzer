import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CircularProgress from '../components/CircularProgress';
import { Check, AlertCircle, ArrowLeft, Calendar, FileText, CheckCircle, HelpCircle } from 'lucide-react';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysisData = location.state?.analysisData;

  if (!analysisData) {
    // Redirect to home if accessed directly without state
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  const {
    fileName,
    analysisDate,
    score,
    matchedSkills,
    missingSkills,
    jobDescription
  } = analysisData;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getScoreVerdict = (val) => {
    if (val >= 85) return { text: 'Excellent Match!', desc: 'Your profile is highly aligned with this job. Go ahead and apply!', color: 'var(--success)' };
    if (val >= 60) return { text: 'Good Fit', desc: 'You have a solid base of skills. Consider adding missing keywords if you have them.', color: '#fbbf24' };
    if (val >= 35) return { text: 'Moderate Match', desc: 'There are several key missing skills. You might want to update your resume.', color: '#f59e0b' };
    return { text: 'Low Match', desc: 'This position requires multiple skills not currently listed on your resume.', color: 'var(--error)' };
  };

  const verdict = getScoreVerdict(score);

  // Safe keyword highlighter that returns React nodes
  const renderHighlightedText = (text, matched, missing) => {
    if (!text) return '';
    
    const allSkills = [...matched, ...missing];
    if (allSkills.length === 0) return text;
    
    // Sort skills by length descending to match longer terms first (e.g. "spring boot" before "spring")
    const sortedSkills = [...allSkills].sort((a, b) => b.length - a.length);
    
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    
    const patternString = sortedSkills.map(skill => {
      const escaped = escapeRegExp(skill);
      // Boundary conditions for C++, C#, .NET
      const prefix = /^[a-zA-Z0-9]/.test(skill) ? '\\b' : '';
      const suffix = /[a-zA-Z0-9]$/.test(skill) ? '\\b' : '';
      return `${prefix}${escaped}${suffix}`;
    }).join('|');
    
    const regex = new RegExp(`(${patternString})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      const lowerPart = part.toLowerCase();
      const isMatched = matched.some(s => s.toLowerCase() === lowerPart);
      const isMissing = missing.some(s => s.toLowerCase() === lowerPart);
      
      if (isMatched) {
        return <span key={index} className="highlight-match">{part}</span>;
      } else if (isMissing) {
        return <span key={index} className="highlight-missing">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content animate-fade-in">
        <header style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Analysis Report</h1>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={14} /> {fileName}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {formatDate(analysisDate)}
              </span>
            </div>
          </div>
        </header>

        <div className="results-grid">
          {/* Left Panel: Score and summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card score-panel">
              <CircularProgress score={score} />
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '20px', color: verdict.color }}>
                {verdict.text}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                {verdict.desc}
              </p>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Resume Match Legend</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="highlight-match" style={{ fontSize: '11px', padding: '2px 6px' }}>Java</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Matched skill present in CV</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="highlight-missing" style={{ fontSize: '11px', padding: '2px 6px' }}>Docker</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Missing skill target in job description</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Detailed matching list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Skills lists */}
            <div className="glass-card">
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Skills Breakdown</h2>

              {/* Matched Skills */}
              <div className="skills-container" style={{ marginTop: 0 }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} />
                  Matched Skills ({matchedSkills.length})
                </h3>
                {matchedSkills.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>No matching skills identified.</p>
                ) : (
                  <div className="skills-grid">
                    {matchedSkills.map((skill) => (
                      <span key={skill} className="skill-tag skill-tag-matched">
                        <Check size={12} />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills */}
              <div className="skills-container" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} />
                  Missing Target Skills ({missingSkills.length})
                </h3>
                {missingSkills.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>No missing skills! Excellent matching profile.</p>
                ) : (
                  <div className="skills-grid">
                    {missingSkills.map((skill) => (
                      <span key={skill} className="skill-tag skill-tag-missing">
                        <AlertCircle size={12} />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Document Viewer with Highlights */}
            <div className="glass-card">
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Job Description Analysis</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Below are the matching and missing target keywords highlighted directly within the provided text:
              </p>
              <div className="highlighted-jd-box">
                {renderHighlightedText(jobDescription, matchedSkills, missingSkills)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Result;
