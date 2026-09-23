import React, { useState } from 'react';
import { LogIn, Shield, KeyRound, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage('');

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (role) => {
    setError(null);
    if (role === 'admin') {
      setEmail('admin@mpwzunion.org');
      setPassword('password123');
      setInfoMessage('Admin credentials filled into login form. Click "Sign In to Portal" to log in.');
    } else {
      setEmail('sunita.chouhan@mpwzunion.org');
      setPassword('password123');
      setInfoMessage('Member credentials filled into login form. Click "Sign In to Portal" to log in.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 mx-auto">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Union Portal Login
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to access Member Dashboard or Admin Control Center
          </p>
        </div>

        {/* Quick Test Accounts Credentials */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Portal Login Credentials</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Click card to fill form</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleFillCredentials('admin')}
              className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 hover:border-amber-500 hover:bg-amber-100/70 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-amber-900 text-xs">Admin Portal</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-md group-hover:bg-amber-300 transition-colors">Fill Credentials</span>
              </div>
              <div className="text-[11px] text-slate-700 font-mono space-y-0.5">
                <div><span className="text-slate-500 font-sans font-medium">Email:</span> admin@mpwzunion.org</div>
                <div><span className="text-slate-500 font-sans font-medium">Pass:</span> password123</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleFillCredentials('user')}
              className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-300 hover:border-sky-500 hover:bg-sky-100/70 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-sky-900 text-xs">Member Portal</span>
                <span className="text-[10px] bg-sky-200/80 text-sky-900 font-bold px-2 py-0.5 rounded-md group-hover:bg-sky-300 transition-colors">Fill Credentials</span>
              </div>
              <div className="text-[11px] text-slate-700 font-mono space-y-0.5">
                <div><span className="text-slate-500 font-sans font-medium">Email:</span> sunita.chouhan@mpwzunion.org</div>
                <div><span className="text-slate-500 font-sans font-medium">Pass:</span> password123</div>
              </div>
            </button>
          </div>
        </div>

        {infoMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between font-semibold shadow-sm">
            <span>✨ {infoMessage}</span>
            <button type="button" onClick={() => setInfoMessage('')} className="text-amber-700 hover:text-amber-950 font-bold ml-2">✕</button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="email@mpwzunion.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>

          <div className="pt-2 text-center text-xs text-slate-600 font-medium">
            Don't have a Union Member Account yet?{' '}
            <Link to="/join" className="text-amber-700 font-extrabold hover:underline">
              Apply via Join Now
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
