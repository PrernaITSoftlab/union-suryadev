import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Shield, QrCode, Search, CheckCircle, AlertCircle, ArrowRight, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await api.get(`/events/list${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search]);

  const handleJoinClick = (evt) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedEvent(evt);
    setTransactionId('');
    setPaymentProofUrl('');
    setFeedback(null);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (selectedEvent.is_paid && !transactionId) {
      setFeedback({ error: 'Please enter the Transaction ID / UTR for paid registration.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.post(`/events/${selectedEvent.id}/register`, {
        transaction_id: transactionId,
        payment_proof_url: paymentProofUrl
      });

      if (res.data.success) {
        setFeedback({ success: res.data.message });
        fetchEvents();
        setTimeout(() => {
          setSelectedEvent(null);
        }, 2000);
      }
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to submit event registration.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>Union Events & Conventions</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Upcoming Agitations, Workshops & Delegates Assembly
            </h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-medium">Loading Union Events...</div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No events found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(evt => {
              const isRegistered = Boolean(evt.user_registration);
              const regStatus = evt.user_registration?.registration_status;

              return (
                <div key={evt.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col hover:border-amber-300 transition-all shadow-md">
                  
                  {/* Banner */}
                  <div className="relative h-48 overflow-hidden">
                    <img src={evt.banner_url} alt={evt.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-amber-800 border border-amber-300 shadow-sm">
                      {evt.event_type}
                    </div>
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">
                      {evt.is_paid ? `₹${evt.event_fee}` : 'FREE'}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg text-slate-900 leading-snug">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {evt.description}
                      </p>

                      <div className="space-y-2 pt-2 text-xs text-slate-500 border-t border-slate-100 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{evt.start_date} ({evt.start_time})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Capacity: {evt.registered_count} / {evt.capacity} Delegates</span>
                        </div>
                      </div>
                    </div>

                    {/* Join / Status Action */}
                    <div className="pt-4 border-t border-slate-100">
                      {isRegistered ? (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Registered ({regStatus})</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700">{evt.user_registration.pass_code}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoinClick(evt)}
                          className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <span>{evt.is_paid ? `Register for Event (₹${evt.event_fee})` : 'Join Event (Free)'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Registration Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 space-y-6 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Event Registration</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-500">{selectedEvent.venue} • {selectedEvent.start_date}</p>
            </div>

            {feedback?.error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{feedback.error}</span>
              </div>
            )}

            {feedback?.success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{feedback.success}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {selectedEvent.is_paid ? (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Registration Fee Amount:</span>
                      <span className="text-lg font-extrabold text-amber-700">₹{selectedEvent.event_fee}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <img src={selectedEvent.payment_qr_url || '/images/payment-qr.png'} alt="QR Code" className="w-40 h-40 object-contain" />
                      <span className="text-[10px] text-slate-800 font-mono font-bold mt-1">Scan to Pay via UPI</span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed text-center font-medium">
                      {selectedEvent.payment_instructions}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Transaction ID / UTR Number <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UTR11223344556"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Screenshot URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={paymentProofUrl}
                      onChange={(e) => setPaymentProofUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
                  This event is free for all registered Union members. Click confirm below to claim your delegate pass.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
              >
                {submitting ? 'Submitting Registration...' : 'Confirm Event Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
