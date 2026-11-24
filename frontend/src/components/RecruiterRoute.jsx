import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * RecruiterRoute — only lets RECRUITER users through.
 * If not logged in → redirect to /login
 * If logged in but not RECRUITER → redirect to candidate dashboard /
 */
const RecruiterRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'RECRUITER') return <Navigate to="/" replace />;

  return children;
};

export default RecruiterRoute;
