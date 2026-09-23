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
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer flex flex-col justify-between group h-full transition-all"
    >
      <div>
        {/* Event Banner */}
        <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={event.banner_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
          
          {/* Location Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm ${
              event.location_type === 'online' 
                ? 'bg-sky-500 text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              {event.location_type === 'online' ? <Video className="w-3 h-3 shrink-0" /> : <MapPin className="w-3 h-3 shrink-0" />}
              {event.location_type === 'online' ? 'Virtual VIP Lounge' : 'In-Person Summit'}
            </span>
          </div>

          {/* Floating Date Badge */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/95 border border-slate-200 text-center shadow-md">
            <span className="text-[9px] font-bold text-blue-600 uppercase block">Date</span>
            <span className="text-xs font-extrabold text-slate-900">{formattedDate}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-1 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{event.event_time}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-500 truncate">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </p>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Speaker preview */}
          {event.speaker_name && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
              <img
                src={event.speaker_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={event.speaker_name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500 shrink-0"
              />
              <div className="text-xs truncate">
                <span className="text-[10px] text-slate-400 block font-semibold">Keynote Host</span>
                <span className="font-bold text-slate-900 truncate block">{event.speaker_name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
          <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <strong className="text-slate-900">{event.registered_count || 0}</strong> / {event.capacity}
        </span>

        {registered ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
          </span>
        ) : (
          <button
            onClick={handleRSVP}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm hover:bg-blue-700 flex items-center gap-1 transition-all shrink-0"
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
