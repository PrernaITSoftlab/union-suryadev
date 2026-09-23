import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Network, Mail, Lock, User, Sparkles, X, Zap, ShieldCheck } from 'lucide-react';

const AuthModal = ({ initialTab = 'login', onClose }) => {
  const { login, register, switchDemoUser } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regData, setRegData] = useState({
    full_name: '',
    email: '',
    password: '',
    company: '',
    title: '',
    industry: 'Financial Technology',
    location: 'Mumbai, India'
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(regData);
      if (res.success) {
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check form details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type) => {
    setError('');
    setTab('login');
    if (type === 'admin') {
      setLoginEmail('admin@mpwzunion.org');
      setLoginPassword('password123');
    } else {
      setLoginEmail('sunita.chouhan@mpwzunion.org');
      setLoginPassword('password123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white max-w-md w-full rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-2xl relative animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto no-scrollbar text-slate-900">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Logo Header */}
        <div className="text-center mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-2.5 shadow-md">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            MPWZ <span className="text-blue-600">UNION</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {tab === 'login' ? 'Welcome back! Sign in to access member services.' : 'Create your employee profile & join the union.'}
          </p>
        </div>

        {/* Quick Demo Logins Pill */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-600 shrink-0 text-amber-600" /> Fill Portal Credentials
            </span>
            <span className="text-[9px] text-slate-500">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-left shadow-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Member Portal
              </div>
              <div className="text-[10px] text-slate-600 font-mono truncate">
                sunita.chouhan@mpwzunion.org
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Pass: password123
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left shadow-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Admin Portal
              </div>
              <div className="text-[10px] text-amber-900 font-mono truncate">
                admin@mpwzunion.org
              </div>
              <div className="text-[10px] text-amber-800 font-mono">
                Pass: password123
              </div>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4 border border-slate-200">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              tab === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              tab === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Profile
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="rajesh.sharma@mpwz.in"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Union Portal'}
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Er. Rajesh Sharma"
                value={regData.full_name}
                onChange={(e) => setRegData({ ...regData, full_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@mpwz.in"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Circle / Office</label>
                <input
                  type="text"
                  placeholder="Indore City Circle"
                  value={regData.company}
                  onChange={(e) => setRegData({ ...regData, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="Junior Engineer"
                  value={regData.title}
                  onChange={(e) => setRegData({ ...regData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Complete Profile & Join'}
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
