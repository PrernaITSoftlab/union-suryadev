import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { Calendar, Search, Filter, Video, MapPin, Users } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events', {
        params: { type: selectedType, search }
      });
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedType, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold mb-2">
            <Calendar className="w-4 h-4" /> VIP Events & Summits
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Upcoming <span className="gradient-text-cyan">Networking Meetings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reserve your seat for monthly virtual pitch circles, mastermind keynotes, and annual leader summits.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by summit title, speaker, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          {['All', 'online', 'in_person'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                selectedType === t ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'in_person' ? 'In-Person' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading upcoming networking events...</div>
      ) : events.length === 0 ? (
        <div className="py-20 glass-panel rounded-3xl text-center space-y-3 border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No events match your criteria</h3>
          <p className="text-xs text-slate-400">Check back soon for newly scheduled summits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(evt => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Events;
