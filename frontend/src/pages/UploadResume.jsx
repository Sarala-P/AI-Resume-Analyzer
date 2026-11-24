import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { UploadCloud, FileText, FileCode, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file format. Only PDF resumes are accepted.');
      setFile(null);
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please upload a resume (PDF)');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please paste the job description');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Step 1: Upload Resume File
      setLoadingStep('Uploading and parsing PDF with Apache Tika...');
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Failed to upload and parse resume file');
      }

      const resumeId = uploadData.id;

      // Step 2: Trigger Keyword Analysis Engine
      setLoadingStep('Extracting key credentials & comparing profiles...');
      const analysisResponse = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId,
          jobDescription,
        }),
      });

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(analysisData.message || 'Failed to execute resume analysis');
      }

      // Step 3: Navigate to Result
      navigate('/result', { state: { analysisData } });

    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content animate-fade-in">
        <header style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>AI Resume Matcher</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Upload your CV and paste the target job description to run matches</p>
        </header>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="glass-card spinner-container" style={{ minHeight: '350px' }}>
            <Loader2 className="spinner" size={48} style={{ color: 'var(--primary)', animation: 'rotate 1s linear infinite' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Analyzing Match</h3>
            <p style={{ color: 'var(--text-secondary)', animation: 'pulse 1.5s infinite' }}>{loadingStep}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="upload-grid">
            {/* Left Column: File Upload */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>1. Upload Resume</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Upload your current resume in PDF format. We will parse it and index your skills.</p>
              
              <div 
                className={`dropzone ${dragActive ? 'active' : ''} ${file ? 'file-selected' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control"
                  style={{ display: 'none' }}
                  onChange={handleChange}
                  accept=".pdf"
                />
                
                {file ? (
                  <>
                    <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '15px', color: 'white' }}>{file.name}</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                      Change File
                    </button>
                  </>
                ) : (
                  <>
                    <UploadCloud size={48} className="dropzone-icon" />
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '15px' }}>Drag & drop your PDF resume here</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>or click to browse from explorer</p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '4px' }}>
                      Only PDF format up to 5MB supported
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Job Description */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>2. Job Description</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Paste the full text of the job description you are targeting.</p>
              
              <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0 }}>
                <textarea
                  className="form-control"
                  placeholder="Paste job description requirements here (e.g. We are looking for a Spring Boot Developer with experience in React, MySQL, and JWT authentication...)"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{ flex: 1, minHeight: '220px', resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', width: '100%', marginTop: 'auto' }}>
                <span>Start Match Analysis</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default UploadResume;
