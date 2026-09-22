import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, Star, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/opportunities');
      if (res.data.success) {
        setOpportunities(res.data.opportunities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const res = await api.put(`/admin/opportunities/${id}`, { is_featured: !currentFeatured });
      if (res.data.success) {
        setOpportunities(prev => prev.map(o => o.id === id ? { ...o, is_featured: !currentFeatured } : o));
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDeleteOpp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business opportunity?')) return;
    try {
      const res = await api.delete(`/admin/opportunities/${id}`);
      if (res.data.success) {
        setOpportunities(prev => prev.filter(o => o.id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link to="/admin" className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-white">Business Opportunities Moderation</h1>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-card-dark space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-amber-400" /> Active Platform Opportunities ({opportunities.length})
        </h3>

        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center">Loading opportunity listings...</p>
          ) : opportunities.map((opp) => (
            <div key={opp.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-brand-cyan/20 text-brand-cyan uppercase">
                    {opp.category}
                  </span>
                  {opp.is_featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> Featured
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">{opp.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">By {opp.author_name} ({opp.author_company}) • Value: {opp.budget_range}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleFeatured(opp.id, opp.is_featured)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    opp.is_featured ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {opp.is_featured ? 'Unfeature' : 'Feature on Home'}
                </button>
                <button
                  onClick={() => handleDeleteOpp(opp.id)}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminOpportunities;
