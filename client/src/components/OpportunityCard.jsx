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
      className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-700/70 glass-panel-hover cursor-pointer relative flex flex-col justify-between h-full"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[11px] font-extrabold truncate max-w-[180px]">
            {opportunity.category}
          </span>
          {opportunity.is_featured && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 shrink-0" /> Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-extrabold text-white hover:text-brand-cyan transition-colors leading-snug line-clamp-2">
          {opportunity.title}
        </h3>

        {/* Author info */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800">
          <img
            src={opportunity.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
            alt={opportunity.author_name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-brand-cyan/50 shrink-0"
          />
          <div className="text-xs truncate">
            <p className="font-bold text-slate-200 truncate">{opportunity.author_name}</p>
            <p className="text-slate-400 truncate">{opportunity.author_company || 'Union Member'}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Budget & Location */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Value / Retainer</span>
            <span className="font-extrabold text-emerald-400 flex items-center gap-1 mt-0.5 truncate">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{opportunity.budget_range || 'Direct Discussion'}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Location Scope</span>
            <span className="font-semibold text-slate-300 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
              <span className="truncate">{opportunity.location || 'Global'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-500 font-mono shrink-0">
          {new Date(opportunity.created_at || Date.now()).toLocaleDateString()}
        </span>

        {expressed ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Expressed
          </span>
        ) : (
          <button
            onClick={handleInterest}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold text-xs shadow-glow-cyan hover:opacity-90 flex items-center gap-1 transition-all shrink-0"
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
