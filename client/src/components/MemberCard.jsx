import React, { useState } from 'react';
import { Building, MapPin, Briefcase, UserPlus, Check, Sparkles } from 'lucide-react';
import { useConnections } from '../context/ConnectionContext';
import { useAuth } from '../context/AuthContext';

const MemberCard = ({ member, onOpenDetails }) => {
  const { user } = useAuth();
  const { connections, pendingSent, sendConnectRequest } = useConnections();
  const [connecting, setConnecting] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const profile = member.profile || {};
  const isConnected = connections.some(c => c.id === member.id);
  const isPending = pendingSent.some(p => p.addressee?.id === member.id);
  const isSelf = user?.id === member.id;

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to connect with members!");
      return;
    }
    setConnecting(true);
    try {
      await sendConnectRequest(member.id);
      setJustSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div 
      onClick={() => onOpenDetails && onOpenDetails(member)}
      className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-700/70 glass-panel-hover cursor-pointer relative flex flex-col justify-between group h-full"
    >
      <div className="space-y-3">
        {/* Header Avatar & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative shrink-0">
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
              alt={profile.full_name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-brand-cyan/40 shadow-card-dark group-hover:ring-brand-cyan transition-all"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-navy-950 rounded-full" title="Active Member" />
          </div>

          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-brand-cyan text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider truncate max-w-[130px]">
            {profile.industry || 'Professional'}
          </span>
        </div>

        {/* Member Info */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-brand-cyan transition-colors truncate">
            {profile.full_name}
          </h3>
          
          <p className="text-xs font-semibold text-slate-300 mt-0.5 flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            <span className="truncate">{profile.title || 'Executive Leader'}</span>
          </p>

          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
            <Building className="w-3.5 h-3.5 text-brand-blue shrink-0" />
            <span className="truncate">{profile.company || 'Enterprise Partner'}</span>
          </p>

          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{profile.location || 'Global'}</span>
          </p>
        </div>

        {/* Short Bio */}
        {profile.bio && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Skills Tags */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-[10px] text-slate-300">
                {skill}
              </span>
            ))}
            {profile.skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400">
                +{profile.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Connection Button */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
          Score <span className="text-brand-cyan font-extrabold">98%</span>
        </span>

        {isSelf ? (
          <span className="text-xs font-bold text-slate-500">Your Profile</span>
        ) : isConnected ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Connected
          </span>
        ) : isPending || justSent ? (
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 text-xs font-bold">
            Pending
          </span>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-3.5 py-1.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold shadow-glow-blue flex items-center gap-1.5 transition-all shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {connecting ? 'Sending...' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MemberCard;
