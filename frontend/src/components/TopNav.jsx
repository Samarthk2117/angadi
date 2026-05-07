import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, BookOpen, FileWarning, Lightbulb, Gamepad2, LogIn, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-8 lg:px-12">
      <nav className="mx-auto flex w-full max-w-[1650px] items-center justify-between rounded-2xl border border-white/15 bg-[#070b14]/75 px-4 py-3 backdrop-blur-xl sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-white">
          <Shield size={20} className="text-cyan-300" />
          <span className="text-sm font-extrabold tracking-wide sm:text-base">Sentinel</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/dashboard"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              isActive('/dashboard') ? 'bg-cyan-400/20 text-cyan-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link
            to="/community"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              isActive('/community') ? 'bg-cyan-400/20 text-cyan-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users size={16} /> Community
          </Link>
          <Link
            to="/learn"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              isActive('/learn') ? 'bg-cyan-400/20 text-cyan-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen size={16} /> Learn
          </Link>
          <Link
            to="/spot-the-scam"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              isActive('/spot-the-scam') ? 'bg-cyan-400/20 text-cyan-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Gamepad2 size={16} /> Spot Scam
          </Link>
          <Link
            to="/reporting"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              isActive('/reporting') ? 'bg-cyan-400/20 text-cyan-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileWarning size={16} /> Reporting
          </Link>
          <Link
            to="/safety-tips"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              isActive('/safety-tips') ? 'bg-cyan-400/20 text-cyan-200' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Lightbulb size={16} /> Tips
          </Link>

          {user ? (
            <button onClick={handleLogout} className="btn-secondary px-3 py-2 text-xs sm:text-sm">
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary px-3 py-2 text-xs sm:text-sm">
              <LogIn size={16} /> Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default TopNav;
