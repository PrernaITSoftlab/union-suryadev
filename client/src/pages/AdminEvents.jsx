import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Plus, Trash2, Users, Download, ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);

  // Create form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    banner_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    event_date: '2026-11-10',
    event_time: '10:00 AM - 01:00 PM IST',
    location_type: 'online',
    venue: 'Union VIP Virtual Lounge',
    description: '',
    capacity: 100,
    speaker_name: 'Aarav Suyradev & Executive Panel',
    speaker_title: 'Community Founder'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
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
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/events', newEvent);
      if (res.data.success) {
        setCreateModal(false);
        await fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await api.delete(`/admin/events/${id}`);
      if (res.data.success) {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleViewAttendees = async (evt) => {
    setAttendeesModalEvent(evt);
    try {
      const res = await api.get(`/admin/events/${evt.id}/attendees`);
      if (res.data.success) {
        setAttendeesList(res.data.attendees || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link to="/admin" className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <button
          onClick={() => setCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-card-dark space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" /> Platform Events & Summits ({events.length})
        </h3>

        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center">Loading events roster...</p>
          ) : events.map((evt) => (
            <div key={evt.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={evt.banner_url}
                  alt={evt.title}
                  className="w-16 h-12 rounded-xl object-cover ring-1 ring-brand-cyan"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{evt.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{evt.event_date} • {evt.event_time} ({evt.location_type})</p>
                  <p className="text-[11px] text-brand-cyan mt-0.5">{evt.registered_count || 0} Registered Attendees</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleViewAttendees(evt)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5 text-brand-cyan" /> View Attendees
                </button>
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-card-dark relative">
            <button
              onClick={() => setCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-4">Create Networking Event</h3>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="Union Suyradev Executive Breakfast Pitch"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="06:00 PM - 07:30 PM IST"
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Location Type</label>
                  <select
                    value={newEvent.location_type}
                    onChange={(e) => setNewEvent({ ...newEvent, location_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="online">Virtual / Online</option>
                    <option value="in_person">In-Person Summit</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Capacity Limit</label>
                  <input
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Outline the keynote agenda and speed-networking structure..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-brand-cyan text-navy-950 font-extrabold shadow-glow-cyan"
                >
                  {submitting ? 'Creating...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attendees Modal */}
      {attendeesModalEvent && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-card-dark relative">
            <button
              onClick={() => setAttendeesModalEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Registered Attendees</h3>
            <p className="text-xs text-brand-cyan mb-4">{attendeesModalEvent.title}</p>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {attendeesList.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No member registrations recorded yet.</p>
              ) : attendeesList.map((a) => (
                <div key={a.registration_id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{a.user?.profile?.full_name || 'Member'}</div>
                    <div className="text-[10px] text-slate-400">{a.user?.email}</div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Confirmed</span>
                </div>
              ))}
            </div>

            <div className="text-right">
              <button
                onClick={() => setAttendeesModalEvent(null)}
                className="px-4 py-2 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminEvents;
