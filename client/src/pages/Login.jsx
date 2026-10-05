import React, { useState } from 'react';
import { LogIn, Shield, KeyRound, Mail, AlertCircle, ArrowRight, UserCheck, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Login({ defaultAdmin = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isInitiallyAdmin = defaultAdmin || location.pathname.includes('/admin');
  const [isAdminMode, setIsAdminMode] = useState(isInitiallyAdmin);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials. Please check your Admin ID/Email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 rounded-2xl p-0.5 shadow-md mx-auto transition-all ${isAdminMode ? 'bg-gradient-to-tr from-sky-600 to-indigo-700 shadow-sky-600/30' : 'bg-gradient-to-tr from-sky-500 to-blue-600 shadow-sky-500/20'
            }`}>
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              {isAdminMode ? (
                <ShieldCheck className="w-8 h-8 text-sky-700" />
              ) : (
                <Shield className="w-8 h-8 text-sky-600" />
              )}
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAdminMode ? 'Union Admin Portal Login' : 'Union Member Portal Login'}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {isAdminMode
              ? 'Authenticate with secure Admin ID / Email to manage Notices, Photos & System'
              : 'Sign in with your Member ID or registered email to access Member Portal'}
          </p>
        </div>

        {/* Tab Switcher: Member Login vs Admin Login */}
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${!isAdminMode
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Member Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsAdminMode(true); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${isAdminMode
                ? 'bg-sky-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Login</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-semibold animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}


        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-md">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {isAdminMode ? 'Admin ID or Email Address' : 'Member ID or Email Address'}
            </label>
            <div className="relative">
              {isAdminMode ? (
                <ShieldCheck className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
              ) : (
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              )}
              <input
                type="text"
                required
                placeholder={isAdminMode ? "UNION-ADMIN-001 or admin@mpvmavaksunion.org" : "UNION-IND-104 or member@mpvmavaksunion.org"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {isAdminMode ? 'Admin Password' : 'Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 shadow-md ${isAdminMode
                ? 'bg-sky-700 hover:bg-sky-600 shadow-sky-700/20'
                : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20'
              }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating Credentials...' : (isAdminMode ? 'Sign In to Admin Dashboard' : 'Sign In to Portal')}</span>
          </button>

          <div className="pt-2 text-center text-xs text-slate-600 font-medium border-t border-slate-100">
            {isAdminMode ? (
              <span className="text-slate-500">
                Authorized Union Administrators only. Encrypted session security active.
              </span>
            ) : (
              <span>
                Don't have a Union Member Account yet?{' '}
                <Link to="/join" className="text-sky-700 font-extrabold hover:underline">
                  Apply via Join Now
                </Link>
              </span>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}

