import React, { useState } from 'react';
import { Briefcase, DollarSign, MapPin, CheckCircle2, ArrowRight, Star } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const OpportunityCard = ({ opportunity, onOpenDetail }) => {
  const { user } = useAuth();
  const [expressed, setExpressed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInterest = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to express interest in business opportunities!');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/opportunities/${opportunity.id}/interest`);
      if (res.data.success) {
        setExpressed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={() => onOpenDetail && onOpenDetail(opportunity)}
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer relative flex flex-col justify-between h-full transition-all"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-extrabold truncate max-w-[180px]">
            {opportunity.category}
          </span>
          {opportunity.is_featured && (
            <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-500 shrink-0" /> Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-blue-600 transition-colors leading-snug line-clamp-2">
          {opportunity.title}
        </h3>

        {/* Author info */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
          <img
            src={opportunity.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
            alt={opportunity.author_name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500 shrink-0"
          />
          <div className="text-xs truncate">
            <p className="font-bold text-slate-900 truncate">{opportunity.author_name}</p>
            <p className="text-slate-500 truncate">{opportunity.author_company || 'Union Member'}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Budget & Location */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Value / Retainer</span>
            <span className="font-extrabold text-emerald-700 flex items-center gap-1 mt-0.5 truncate">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{opportunity.budget_range || 'Direct Discussion'}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Location Scope</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{opportunity.location || 'Global'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 font-mono shrink-0">
          {new Date(opportunity.created_at || Date.now()).toLocaleDateString()}
        </span>

        {expressed ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Expressed
          </span>
        ) : (
          <button
            onClick={handleInterest}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm hover:bg-blue-700 flex items-center gap-1 transition-all shrink-0"
          >
            {loading ? 'Processing...' : 'Express Interest'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
