import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../context/ConnectionContext';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { 
  User, 
  Network, 
  Briefcase, 
  Calendar, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Edit3, 
  ArrowRight, 
  Sparkles,
  Zap,
  TrendingUp,
  Building
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { connections, pendingIncoming, suggested, respondConnectRequest, sendConnectRequest } = useConnections();
  const { notifications } = useNotifications();

  const [processingId, setProcessingId] = useState(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Member Portal Access Required</h2>
        <p className="text-xs text-slate-400">Please sign in to access your personal networking dashboard.</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs">
          Go to Home & Sign In
        </Link>
      </div>
    );
  }

  const profile = user.profile || {};
  const completionScore = profile.profile_completion || 85;

  const handleRespond = async (connId, action) => {
    setProcessingId(connId);
    try {
      await respondConnectRequest(connId, action);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-card-dark flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
            alt={profile.full_name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-cyan shadow-glow-cyan"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Welcome back, {profile.full_name}!</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-cyan/20 text-brand-cyan">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{profile.title} — {profile.company}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile/edit"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-brand-cyan" /> Edit Profile
          </Link>
          <Link
            to="/connections"
            className="px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-glow-blue flex items-center gap-1.5"
          >
            <Network className="w-3.5 h-3.5" /> Connections ({connections.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Profile Completion Meter */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Profile Completeness</span>
            <span className="text-xs font-extrabold text-brand-cyan">{completionScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-brand-blue to-brand-cyan h-full transition-all duration-500" style={{ width: `${completionScore}%` }} />
          </div>
          <p className="text-[10px] text-slate-500">Add services & LinkedIn link to hit 100%</p>
        </div>

        {/* Total Connections */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>My Network</span>
            <Network className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-2xl font-extrabold text-white">{connections.length}</div>
          <p className="text-[10px] text-slate-400">Connected Decision Makers</p>
        </div>

        {/* Pending Requests */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Pending Requests</span>
            <UserPlus className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{pendingIncoming.length}</div>
          <p className="text-[10px] text-slate-400">Awaiting your approval</p>
        </div>

        {/* Notifications */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Unread Alerts</span>
            <Bell className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-extrabold text-white">{notifications.filter(n => !n.is_read).length}</div>
          <p className="text-[10px] text-slate-400">Opportunity & event updates</p>
        </div>

      </div>

      {/* Main Grid: Pending Requests & Recommended Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 cols): Pending Requests & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Incoming Connection Requests Card */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-700/80 space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" /> Incoming Connection Invitations ({pendingIncoming.length})
            </h3>

            {pendingIncoming.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pending invitations. Explore the member directory to connect!</p>
            ) : (
              <div className="space-y-3">
                {pendingIncoming.map((req) => (
                  <div key={req.connection_id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.requester?.profile?.avatar_url}
                        alt={req.requester?.profile?.full_name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-brand-cyan"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{req.requester?.profile?.full_name}</h4>
                        <p className="text-[11px] text-slate-400">{req.requester?.profile?.title} — {req.requester?.profile?.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(req.connection_id, 'accept')}
                        disabled={processingId === req.connection_id}
                        className="px-3 py-1.5 rounded-xl bg-brand-cyan text-navy-950 text-xs font-bold shadow-glow-cyan flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleRespond(req.connection_id, 'decline')}
                        disabled={processingId === req.connection_id}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Platform Announcements */}
          <div className="glass-card rounded-3xl p-6 border border-slate-700/80 space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-cyan" /> Union Suyradev Announcements
            </h3>
            <div className="p-4 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 text-xs text-slate-200 leading-relaxed">
              🎉 <strong>Annual Business Summit 2026 Registration Open!</strong> Reserve your VIP pass now to meet over 300 verified decision makers in Mumbai.
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Suggested Professionals */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/80 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan" /> Suggested Connections
          </h3>

          <div className="space-y-3">
            {suggested.map((sug) => (
              <div key={sug.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={sug.profile?.avatar_url}
                    alt={sug.profile?.full_name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-cyan shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{sug.profile?.full_name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{sug.profile?.company}</p>
                  </div>
                </div>

                <button
                  onClick={() => sendConnectRequest(sug.id)}
                  className="px-2.5 py-1 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-[11px] font-bold shrink-0"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
