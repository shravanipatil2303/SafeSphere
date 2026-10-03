import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, User, FileText, AlertTriangle, Database } from 'lucide-react';

export const Navbar = () => {
  const { user, role, isLoggedIn, logout, isDemoMode, modeLabel } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    await logout();
    if (isAdminRoute) {
      navigate('/admin/login');
    } else {
      navigate('/citizen/login');
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Mode Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">SafeSphere</span>
              <span className="text-xs text-blue-400 block -mt-1 font-medium">Disaster Intelligence Platform</span>
            </div>
          </div>

          {/* Explicit DEMO vs REAL Mode Banner */}
          <div
            className={`hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
            title={modeLabel}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'DEMO MODE (Local AI)' : 'REAL MODE (Supabase DB)'}</span>
          </div>
        </div>

        {/* Portal-Specific Navigation */}
        <nav className="flex items-center space-x-4 text-sm font-medium">
          {isAdminRoute ? (
            /* ADMIN PORTAL NAV */
            <>
              {isLoggedIn && role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-md transition ${
                      location.pathname === '/admin/dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Command Dashboard
                  </Link>

                  <div className="flex items-center space-x-2 pl-4 border-l border-slate-700">
                    <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs border border-red-500/30 font-semibold">
                      AUTHORITY ADMIN
                    </span>
                    <span className="text-slate-300 hidden sm:inline">{user?.name || user?.email}</span>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-md transition"
                      title="Logout Admin"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            /* CITIZEN PORTAL NAV (STRICTLY NO ADMIN LINKS HERE) */
            <>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/citizen/dashboard"
                    className={`px-3 py-2 rounded-md transition ${
                      location.pathname === '/citizen/dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/citizen/report"
                    className={`px-3 py-2 rounded-md transition flex items-center space-x-1 ${
                      location.pathname === '/citizen/report'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600/90 text-white hover:bg-blue-500'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Report Incident</span>
                  </Link>

                  <Link
                    to="/citizen/reports"
                    className={`px-3 py-2 rounded-md transition flex items-center space-x-1 ${
                      location.pathname === '/citizen/reports'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>My Reports</span>
                  </Link>

                  <div className="flex items-center space-x-2 pl-4 border-l border-slate-700">
                    <span className="text-slate-300 hidden sm:inline">{user?.name || user?.email}</span>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-md transition"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/citizen/login"
                    className="text-slate-300 hover:text-white px-3 py-2 rounded-md transition"
                  >
                    Citizen Login
                  </Link>
                  <Link
                    to="/citizen/signup"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-semibold transition"
                  >
                    Citizen Signup
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
