import React, { useState } from 'react';
import { Clock, MapPin, Users, ArrowRight, CheckCircle, Video } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event, onOpenDetail }) => {
  const { user } = useAuth();
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRSVP = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to register for events!');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/events/${event.id}/register`);
      if (res.data.success) {
        setRegistered(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      onClick={() => onOpenDetail && onOpenDetail(event)}
      className="glass-card rounded-2xl overflow-hidden border border-slate-700/70 glass-panel-hover cursor-pointer flex flex-col justify-between group h-full"
    >
      <div>
        {/* Event Banner */}
        <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={event.banner_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
          
          {/* Location Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
              event.location_type === 'online' 
                ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan' 
                : 'bg-brand-blue text-white shadow-glow-blue'
            }`}>
              {event.location_type === 'online' ? <Video className="w-3 h-3 shrink-0" /> : <MapPin className="w-3 h-3 shrink-0" />}
              {event.location_type === 'online' ? 'Virtual VIP Lounge' : 'In-Person Summit'}
            </span>
          </div>

          {/* Floating Date Badge */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-navy-950/90 border border-slate-700 text-center">
            <span className="text-[9px] font-bold text-brand-cyan uppercase block">Date</span>
            <span className="text-xs font-extrabold text-white">{formattedDate}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3">
          <h3 className="text-base font-extrabold text-white group-hover:text-brand-cyan transition-colors leading-snug line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-1 text-xs text-slate-300">
            <p className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
              <span>{event.event_time}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-400 truncate">
              <MapPin className="w-3.5 h-3.5 text-brand-blue shrink-0" />
              <span className="truncate">{event.venue}</span>
            </p>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Speaker preview */}
          {event.speaker_name && (
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2.5">
              <img
                src={event.speaker_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={event.speaker_name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-brand-cyan shrink-0"
              />
              <div className="text-xs truncate">
                <span className="text-[10px] text-slate-400 block font-semibold">Keynote Host</span>
                <span className="font-bold text-white truncate block">{event.speaker_name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
          <Users className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
          <strong className="text-white">{event.registered_count || 0}</strong> / {event.capacity}
        </span>

        {registered ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
          </span>
        ) : (
          <button
            onClick={handleRSVP}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-brand-cyan text-navy-950 font-extrabold text-xs shadow-glow-cyan hover:bg-cyan-300 flex items-center gap-1 transition-all shrink-0"
          >
            {loading ? 'Confirming...' : 'Register Free'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
