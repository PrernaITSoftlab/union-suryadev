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

  const handleDemoFill = async (type) => {
    setLoading(true);
    try {
      await switchDemoUser(type);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-panel max-w-md w-full rounded-3xl p-5 sm:p-8 border border-slate-700 shadow-card-dark relative animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Logo Header */}
        <div className="text-center mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center mx-auto mb-2.5 shadow-glow-cyan">
            <Network className="w-5 h-5 sm:w-6 sm:h-6 text-navy-950 font-bold" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            UNION <span className="gradient-text-cyan">SUYRADEV</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {tab === 'login' ? 'Welcome back! Sign in to access your network.' : 'Create your executive profile & join the network.'}
          </p>
        </div>

        {/* Quick Demo Logins Pill */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4">
          <span className="text-[10px] font-extrabold uppercase text-amber-400 flex items-center gap-1 mb-2">
            <Zap className="w-3 h-3 fill-amber-400 shrink-0" /> Instant One-Click Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('member')}
              className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1"
            >
              <User className="w-3 h-3 text-brand-cyan shrink-0" /> Member Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" /> Admin Demo
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 mb-4 border border-slate-800">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              tab === 'login' ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              tab === 'register' ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Profile
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="priya.sharma@nexusfintech.io"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold text-xs shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Network'}
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Rajesh Kumar"
                value={regData.full_name}
                onChange={(e) => setRegData({ ...regData, full_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@company.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Company</label>
                <input
                  type="text"
                  placeholder="Apex Ventures"
                  value={regData.company}
                  onChange={(e) => setRegData({ ...regData, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Founder / VP"
                  value={regData.title}
                  onChange={(e) => setRegData({ ...regData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold text-xs shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2"
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
