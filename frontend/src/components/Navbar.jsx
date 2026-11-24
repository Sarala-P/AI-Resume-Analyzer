import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, LogOut, LayoutDashboard, UploadCloud, Briefcase } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('userName') || 'User';
  const role = localStorage.getItem('userRole') || 'USER';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to={role === 'RECRUITER' ? '/recruiter' : '/'} className="navbar-brand">
          <Cpu size={24} style={{ color: 'var(--primary)' }} />
          <span>AI Resume <span style={{ color: 'var(--primary)' }}>Analyzer</span></span>
        </Link>

        <div className="navbar-links">
          {role === 'RECRUITER' ? (
            /* Recruiter nav links */
            <Link to="/recruiter" className="btn btn-secondary" style={{ padding: '6px 12px', border: 'none' }}>
              <Briefcase size={16} /><span>Recruiter Dashboard</span>
            </Link>
          ) : (
            /* Candidate nav links */
            <>
              <Link to="/" className="btn btn-secondary" style={{ padding: '6px 12px', border: 'none' }}>
                <LayoutDashboard size={16} /><span>Dashboard</span>
              </Link>
              <Link to="/upload" className="btn btn-secondary" style={{ padding: '6px 12px', border: 'none' }}>
                <UploadCloud size={16} /><span>New Analysis</span>
              </Link>
            </>
          )}

          <span className="navbar-user">Hi, {name}</span>

          <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 12px' }}>
            <LogOut size={16} /><span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
