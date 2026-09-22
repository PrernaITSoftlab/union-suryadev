import React, { useState } from 'react';
import { useConnections } from '../context/ConnectionContext';
import { Network, Search, UserPlus, CheckCircle2, MessageSquare, Mail, Building, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Connections = () => {
  const { connections, pendingIncoming, pendingSent, respondConnectRequest } = useConnections();
  const [activeTab, setActiveTab] = useState('accepted'); // 'accepted' | 'incoming' | 'sent'
  const [search, setSearch] = useState('');

  const filteredConnections = connections.filter(c => {
    const term = search.toLowerCase();
    const prof = c.profile || {};
    return prof.full_name?.toLowerCase().includes(term) ||
           prof.company?.toLowerCase().includes(term) ||
           prof.title?.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold mb-2">
            <Network className="w-4 h-4" /> Connections Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            My Professional <span className="gradient-text-cyan">Network</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your connected decision makers, pending invitations, and referral communications.
          </p>
        </div>

        <Link
          to="/members"
          className="px-4 py-2.5 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" /> Discover New Members
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('accepted')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'accepted' ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan' : 'text-slate-400 hover:text-white'
          }`}
        >
          Connections ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'incoming' ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan' : 'text-slate-400 hover:text-white'
          }`}
        >
          Incoming ({pendingIncoming.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'sent' ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sent ({pendingSent.length})
        </button>
      </div>

      {/* Search Input for Accepted Connections */}
      {activeTab === 'accepted' && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>
      )}

      {/* Main Content View */}
      {activeTab === 'accepted' && (
        filteredConnections.length === 0 ? (
          <div className="py-16 glass-panel rounded-3xl text-center space-y-3 border border-slate-800">
            <Network className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No active connections found</h3>
            <p className="text-xs text-slate-400">Search the member directory and send your first connection invitation!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((conn) => (
              <div key={conn.id} className="glass-card rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={conn.profile?.avatar_url}
                      alt={conn.profile?.full_name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-cyan shadow-glow-cyan"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-white">{conn.profile?.full_name}</h3>
                      <p className="text-xs text-brand-cyan font-bold">{conn.profile?.title}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-brand-blue" /> {conn.profile?.company}
                      </p>
                    </div>
                  </div>

                  {conn.profile?.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {conn.profile.bio}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Connection
                  </span>
                  <a
                    href={`mailto:${conn.email}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-brand-cyan flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Direct
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Incoming Requests Tab */}
      {activeTab === 'incoming' && (
        pendingIncoming.length === 0 ? (
          <div className="py-16 glass-panel rounded-3xl text-center text-slate-400 border border-slate-800">
            No incoming connection requests at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingIncoming.map((req) => (
              <div key={req.connection_id} className="glass-card rounded-2xl p-5 border border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={req.requester?.profile?.avatar_url}
                    alt={req.requester?.profile?.full_name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-brand-cyan"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{req.requester?.profile?.full_name}</h4>
                    <p className="text-xs text-slate-400">{req.requester?.profile?.title} — {req.requester?.profile?.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => respondConnectRequest(req.connection_id, 'accept')}
                    className="px-3 py-1.5 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs shadow-glow-cyan"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondConnectRequest(req.connection_id, 'decline')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        pendingSent.length === 0 ? (
          <div className="py-16 glass-panel rounded-3xl text-center text-slate-400 border border-slate-800">
            No pending sent connection requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSent.map((s) => (
              <div key={s.connection_id} className="glass-card rounded-2xl p-5 border border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={s.addressee?.profile?.avatar_url}
                    alt={s.addressee?.profile?.full_name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-brand-cyan"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{s.addressee?.profile?.full_name}</h4>
                    <p className="text-xs text-slate-400">{s.addressee?.profile?.title} — {s.addressee?.profile?.company}</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold">
                  Pending Review
                </span>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
};

export default Connections;
