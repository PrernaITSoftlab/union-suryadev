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
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer relative flex flex-col justify-between group h-full transition-all"
    >
      <div className="space-y-3">
        {/* Header Avatar & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative shrink-0">
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
              alt={profile.full_name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-sm group-hover:ring-blue-600 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Active Member" />
          </div>

          <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-blue-700 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider truncate max-w-[130px]">
            {profile.industry || 'Professional'}
          </span>
        </div>

        {/* Member Info */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {profile.full_name}
          </h3>
          
          <p className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{profile.title || 'Executive Leader'}</span>
          </p>

          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 truncate">
            <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">{profile.company || 'Enterprise Partner'}</span>
          </p>

          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{profile.location || 'Global'}</span>
          </p>
        </div>

        {/* Short Bio */}
        {profile.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Skills Tags */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                {skill}
              </span>
            ))}
            {profile.skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500">
                +{profile.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Connection Button */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">
          Score <span className="text-blue-700 font-extrabold">98%</span>
        </span>

        {isSelf ? (
          <span className="text-xs font-bold text-slate-400">Your Profile</span>
        ) : isConnected ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Connected
          </span>
        ) : isPending || justSent ? (
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            Pending
          </span>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all shrink-0"
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
