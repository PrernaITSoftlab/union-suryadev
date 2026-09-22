import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Network, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  PlusCircle, 
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading admin control panel...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-card-dark flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Platform Administration Mode
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Union Suyradev <span className="gradient-text-cyan">Admin Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, user access controls, opportunity approvals, and summit event management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/members"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-brand-cyan" /> Members Manager
          </Link>
          <Link
            to="/admin/events"
            className="px-4 py-2.5 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" /> Manage Events
          </Link>
        </div>
      </div>

      {/* KPI Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Registered Members', val: stats?.totalMembers || 0, icon: Users, color: 'text-brand-cyan', note: `${stats?.activeMembers || 0} active accounts` },
          { title: 'Active Connections', val: stats?.totalConnections || 0, icon: Network, color: 'text-brand-blue', note: 'Global graph density' },
          { title: 'Published Opportunities', val: stats?.totalOpportunities || 0, icon: Briefcase, color: 'text-amber-400', note: 'B2B referral listings' },
          { title: 'Summit Registrations', val: stats?.totalRegistrations || 0, icon: Calendar, color: 'text-emerald-400', note: 'Across 3 active events' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel rounded-2xl p-6 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>{card.title}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-3xl font-extrabold text-white">{card.val}</div>
              <p className="text-[11px] text-slate-400">{card.note}</p>
            </div>
          );
        })}
      </div>

      {/* Sector Distribution Visual Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Industry Breakdown (Left 2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-6">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-cyan" /> Industry Sector Distribution
          </h3>

          <div className="space-y-4">
            {Object.entries(stats?.industryBreakdown || {}).map(([ind, count], idx) => {
              const pct = Math.round((count / (stats?.totalMembers || 1)) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>{ind}</span>
                    <span className="text-brand-cyan">{count} members ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-brand-blue to-brand-cyan h-full" style={{ width: `${Math.max(pct, 12)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Admin Actions (Right 1 col) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/80 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" /> Executive Shortcuts
          </h3>

          <div className="space-y-3 text-xs">
            <Link
              to="/admin/members"
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-brand-cyan text-slate-200 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-brand-cyan" />
                <span>Review Member Roster</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/opportunities"
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-brand-cyan text-slate-200 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Approve / Feature Leads</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/events"
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-brand-cyan text-slate-200 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Create & Export Events</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
