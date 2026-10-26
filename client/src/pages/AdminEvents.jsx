import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Plus, Trash2, Users, Download, ArrowLeft, X, CheckCircle2, RefreshCw, Eye, ExternalLink, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [viewReceiptUrl, setViewReceiptUrl] = useState(null);
  const [rejectAttendeeModal, setRejectAttendeeModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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
    speaker_title: 'Community Founder',
    event_fee: '',
    is_paid: false,
    requires_approval: true
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
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        ...newEvent,
        start_date: newEvent.event_date,
        start_time: newEvent.event_time,
        event_fee: Number(newEvent.event_fee) || 0,
        is_paid: Number(newEvent.event_fee) > 0
      };
      const res = await api.post('/admin/events', payload);
      if (res.data.success) {
        setCreateModal(false);
        setNewEvent(prev => ({ ...prev, title: '', description: '', event_fee: '', is_paid: false }));
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

  const handleApproveAttendee = async (regId) => {
    try {
      const res = await api.put(`/admin/events/registrations/${regId}/approve`);
      if (res.data.success) {
        setAttendeesList(prev => prev.map(a => (a.id === regId || a.registration_id === regId) ? { ...a, registration_status: 'CONFIRMED' } : a));
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve attendee');
    }
  };

  const handleConfirmRejectAttendee = async (e) => {
    e?.preventDefault();
    if (!rejectAttendeeModal) return;
    const regId = rejectAttendeeModal.id || rejectAttendeeModal.registration_id;
    try {
      const res = await api.put(`/admin/events/registrations/${regId}/reject`, {
        rejection_reason: rejectReason || 'Join request rejected by admin.'
      });
      if (res.data.success) {
        setAttendeesList(prev => prev.map(a => (a.id === regId || a.registration_id === regId) ? { ...a, registration_status: 'REJECTED', rejection_reason: rejectReason } : a));
        setRejectAttendeeModal(null);
        setRejectReason('');
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject attendee');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link to="/admin" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 border border-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <button
          onClick={() => setCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" /> Platform Events & Summits ({events.length})
        </h3>

        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center font-medium">Loading events roster...</p>
          ) : events.map((evt) => (
            <div key={evt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3">
                <img
                  src={evt.banner_url}
                  alt={evt.title}
                  className="w-16 h-12 rounded-xl object-cover ring-1 ring-blue-100 shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{evt.event_date} • {evt.event_time} ({evt.location_type})</p>
                  <p className="text-[11px] text-blue-700 font-bold mt-0.5">{evt.registered_count || 0} Registered Attendees</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleViewAttendees(evt)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-blue-700 border border-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" /> View Attendees
                </button>
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Create Networking Event</h3>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="MPVMAVAKS Union Executive Convention"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 04:00 PM IST"
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location Type</label>
                  <select
                    value={newEvent.location_type}
                    onChange={(e) => setNewEvent({ ...newEvent, location_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  >
                    <option value="online">Virtual / Online</option>
                    <option value="in_person">In-Person Summit</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capacity Limit</label>
                  <input
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Joining Charges / Fee (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 for Free"
                      value={newEvent.event_fee ?? ''}
                      onFocus={(e) => {
                        if (e.target.value === '0') e.target.select();
                      }}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.length > 1 && /^0\d+/.test(val)) {
                          val = val.replace(/^0+/, '') || '0';
                          e.target.value = val;
                        }
                        const fee = val === '' ? '' : Math.max(0, Number(val));
                        setNewEvent({
                          ...newEvent,
                          event_fee: val === '' ? '' : (isNaN(fee) ? 0 : fee),
                          is_paid: Number(fee) > 0
                        });
                      }}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {Number(newEvent.event_fee) > 0 ? `Paid Event (₹${newEvent.event_fee} per attendee)` : 'Free entry for all members'}
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="font-bold text-slate-700 block mb-1">Approval Workflow</label>
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={newEvent.requires_approval}
                      onChange={(e) => setNewEvent({ ...newEvent, requires_approval: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Require Admin Approval</span>
                      <span className="text-[10px] text-slate-500 block">Admin must approve each request to issue pass</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Outline the keynote agenda..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-extrabold shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                  <span>{submitting ? 'Publishing Event...' : 'Publish Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attendees & Join Requests Modal */}
      {attendeesModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setAttendeesModalEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900">Member Join Requests & Attendees</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                Number(attendeesModalEvent.event_fee) > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {Number(attendeesModalEvent.event_fee) > 0 ? `Fee: ₹${attendeesModalEvent.event_fee}` : 'Free Entry'}
              </span>
            </div>
            <p className="text-xs text-blue-700 font-bold mb-4">{attendeesModalEvent.title}</p>

            <div className="max-h-96 overflow-y-auto space-y-2.5 mb-5 pr-1">
              {attendeesList.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  No member join requests recorded for this event yet.
                </p>
              ) : attendeesList.map((a) => {
                const regId = a.id || a.registration_id;
                const status = (a.registration_status || 'PENDING').toUpperCase();
                return (
                  <div key={regId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{a.member_name || a.user?.profile?.full_name || a.full_name || 'Member'}</span>
                        {a.employee_id && (
                          <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                            ID: {a.employee_id}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {status === 'CONFIRMED' ? 'Approved / Confirmed' : status === 'REJECTED' ? 'Rejected' : 'Pending Approval'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>{a.member_email || a.user?.email || 'No email'}</span>
                        {a.member_phone && <span>Phone: {a.member_phone}</span>}
                        {a.member_circle && <span>Circle: {a.member_circle}</span>}
                        {a.pass_code && <span className="font-mono text-emerald-700 font-semibold">Pass: {a.pass_code}</span>}
                        {a.transaction_id && <span className="font-mono text-blue-700">UTR: {a.transaction_id}</span>}
                      </div>

                      {a.payment_proof_url && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setViewReceiptUrl(a.payment_proof_url)}
                            className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3 text-sky-600" />
                            <span>View Payment Receipt</span>
                          </button>
                        </div>
                      )}

                      {status === 'REJECTED' && a.rejection_reason && (
                        <p className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mt-1">
                          Reason: {a.rejection_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleApproveAttendee(regId)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {status !== 'REJECTED' && (
                        <button
                          onClick={() => {
                            setRejectAttendeeModal(a);
                            setRejectReason('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-right pt-3 border-t border-slate-100">
              <button
                onClick={() => setAttendeesModalEvent(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT ATTENDEE MODAL */}
      {rejectAttendeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Reject Attendee Join Request</span>
              </h3>
              <button onClick={() => setRejectAttendeeModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Reject join request for <strong>{rejectAttendeeModal.member_name || rejectAttendeeModal.user?.profile?.full_name || 'Member'}</strong>?
            </p>

            <form onSubmit={handleConfirmRejectAttendee} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rejection Reason / Remarks</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Unverified payment receipt or delegate quota full."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectAttendeeModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Payment Receipt Preview</h3>
              <button onClick={() => setViewReceiptUrl(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[220px]">
              {viewReceiptUrl.startsWith('data:application/pdf') || viewReceiptUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewReceiptUrl}
                  title="Receipt Document"
                  className="w-full h-80 rounded-xl"
                />
              ) : (
                <img
                  src={viewReceiptUrl}
                  alt="Receipt Preview"
                  className="w-full h-full max-h-[55vh] object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={viewReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Tab</span>
              </a>

              <button
                type="button"
                onClick={() => setViewReceiptUrl(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminEvents;
