import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/Login';
import Signup from './pages/Signup';

// Candidate pages
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import Result from './pages/Result';

// Recruiter pages
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterResults from './pages/RecruiterResults';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import RecruiterRoute from './components/RecruiterRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Candidate ── */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />

        {/* ── Recruiter ── */}
        <Route path="/recruiter" element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>} />
        <Route path="/recruiter/results/:jobId" element={<RecruiterRoute><RecruiterResults /></RecruiterRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
