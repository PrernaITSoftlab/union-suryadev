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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link to="/admin" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 border border-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900">Business Opportunities Moderation</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-amber-600" /> Active Platform Opportunities ({opportunities.length})
        </h3>

        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center font-medium">Loading opportunity listings...</p>
          ) : opportunities.map((opp) => (
            <div key={opp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 uppercase border border-blue-200">
                    {opp.category}
                  </span>
                  {opp.is_featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{opp.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">By {opp.author_name} ({opp.author_company}) • Value: {opp.budget_range}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleFeatured(opp.id, opp.is_featured)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                    opp.is_featured ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opp.is_featured ? 'Unfeature' : 'Feature on Home'}
                </button>
                <button
                  onClick={() => handleDeleteOpp(opp.id)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
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
