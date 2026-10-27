import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Clock, Users, Shield, QrCode, Search, CheckCircle, AlertCircle, ArrowRight, X, History, FileText, CheckCircle2, Award, ExternalLink, Heart, MessageCircle, Share2, Sparkles, Upload, Printer, Ticket, FileCheck, Eye } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import EventCommentsModal from '../components/EventCommentsModal';
import EventShareModal from '../components/EventShareModal';

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const receiptFileInputRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptFileSize, setReceiptFileSize] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [attendeePassModalEvent, setAttendeePassModalEvent] = useState(null);
  const [viewReceiptModal, setViewReceiptModal] = useState(null);

  // Social interactions state
  const [commentingEvent, setCommentingEvent] = useState(null);
  const [sharingEvent, setSharingEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchEvents = async () => {
    try {
      const sep = search ? '&' : '?';
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/events/list${searchParam}${sep}_t=${Date.now()}`);
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, user?.id]);

  // Deep linking scroll to event if ?id=xx is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventId = params.get('id');
    if (eventId && events.length > 0) {
      const el = document.getElementById(`event-card-${eventId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-sky-400', 'ring-offset-4');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-sky-400', 'ring-offset-4');
        }, 3500);
      }
    }
  }, [events, location.search]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Like / Unlike Handler
  const handleToggleLike = async (evt) => {
    if (!user) {
      setToast({
        type: 'info',
        message: 'Please sign in to like this union event.',
        actionText: 'Sign In',
        actionLink: '/login'
      });
      return;
    }

    const prevEvents = [...events];
    const prevLiked = Boolean(evt.is_liked);
    const prevCount = Number(evt.likes_count || 0);
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    // Optimistic UI update
    setEvents(prev => prev.map(e => e.id === evt.id ? { ...e, is_liked: nextLiked, likes_count: nextCount } : e));

    try {
      const res = await api.post(`/events/${evt.id}/like`);
      if (res.data.success) {
        setEvents(prev => prev.map(e => e.id === evt.id ? { ...e, is_liked: res.data.liked, likes_count: res.data.likes_count } : e));
      }
    } catch (err) {
      setEvents(prevEvents);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update like status.'
      });
    }
  };

  const handleCommentCountUpdate = (newCount, targetEventId) => {
    const idToUpdate = targetEventId || commentingEvent?.id;
    if (!idToUpdate) return;
    setEvents(prev => prev.map(e => e.id === idToUpdate ? { ...e, comments_count: newCount } : e));
    setCommentingEvent(prev => (prev && prev.id === idToUpdate) ? { ...prev, comments_count: newCount } : prev);
  };

  // Default Past Programs Data for fallback presentation
  const pastPrograms = [
    {
      id: 10,
      title: "31st Annual MPVMAVAKS Union Zonal Delegates Convention 2025",
      start_date: "14 November 2025",
      start_time: "10:00 AM",
      venue: "Abhay Prashal Auditorium, Race Course Road, Indore",
      event_type: "ANNUAL CONVENTION",
      banner_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
      attendance: "1,450 Delegates",
      outcome_badge: "CONCLUDED",
      resolution: "Unanimous resolution passed for ₹20L accident relief fund and 7th Pay DA arrears release."
    },
    {
      id: 11,
      title: "Statewide OPS Advocacy & Lineman Safety Rally 2025",
      start_date: "22 August 2025",
      start_time: "11:30 AM",
      venue: "Polo Ground Discom HQ, Indore to Divisional Commissioner Office",
      event_type: "AGITATION RALLY",
      banner_url: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80",
      attendance: "3,200 Field Staff",
      outcome_badge: "SUCCESSFUL",
      resolution: "10-point charter submitted to MD MPVMAVAKS; high-voltage PTW safety guidelines officially issued."
    },
    {
      id: 12,
      title: "High-Voltage 33kV Line Earthing & PTW Practical Safety Workshop",
      start_date: "05 May 2025",
      start_time: "09:30 AM",
      venue: "Ujjain Zonal Substation Technical Training Centre",
      event_type: "SAFETY WORKSHOP",
      banner_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      attendance: "620 Sub-Engineers & Linemen",
      outcome_badge: "COMPLETED",
      resolution: "Hands-on certification completed for Class-4 insulated rubber gloves & discharge rod placement."
    }
  ];

  // Separate fetched events into upcoming and past
  const isPastEvent = (e) => Boolean(e.is_past || e.status === 'COMPLETED');
  const upcomingEvents = events.filter(e => !isPastEvent(e));
  const apiPastEvents = events.filter(e => isPastEvent(e));
  const combinedPastPrograms = apiPastEvents.length > 0 ? apiPastEvents : pastPrograms;

  const handleJoinClick = (evt) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedEvent(evt);
    setTransactionId('');
    setPaymentProofUrl('');
    setReceiptFileName('');
    setReceiptFileSize('');
    setFeedback(null);
  };

  const handleReceiptFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ error: 'Receipt file size must be less than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofUrl(reader.result);
      setReceiptFileName(file.name);
      setReceiptFileSize((file.size / 1024).toFixed(1) + ' KB');
      setFeedback(null);
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setPaymentProofUrl('');
    setReceiptFileName('');
    setReceiptFileSize('');
    if (receiptFileInputRef.current) {
      receiptFileInputRef.current.value = '';
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (selectedEvent.is_paid) {
      if (!transactionId.trim()) {
        setFeedback({ error: 'Please enter the Payment Transaction ID / UTR number for paid registration.' });
        return;
      }
      if (!paymentProofUrl) {
        setFeedback({ error: 'Please upload your payment receipt screenshot or PDF. Paid events require receipt proof for admin verification.' });
        return;
      }
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.post(`/events/${selectedEvent.id}/register`, {
        transaction_id: transactionId.trim(),
        payment_proof_url: paymentProofUrl
      });

      if (res.data.success) {
        setFeedback({ success: res.data.message });
        fetchEvents();
        setTimeout(() => {
          setSelectedEvent(null);
        }, 2500);
      }
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to submit event registration.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-sky-700" />
              <span>Union Events & Assemblies • कार्यक्रम</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Union Conventions, Agitations & Safety Workshops
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Browse upcoming union programs or review past delegates conventions and safety rallies.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search programs by title, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* SECTION 1: UPCOMING PROGRAMS */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 font-bold shrink-0 shadow-sm">
                <Calendar className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Upcoming Programs</h2>
                <p className="text-xs text-slate-500 font-medium">Active conventions, delegate assemblies, and agitation rallies open for registration</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-extrabold">
              {upcomingEvents.length} Active
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 font-medium">Loading Upcoming Programs...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No upcoming programs found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(evt => {
                const isRegistered = Boolean(evt.user_registration);
                const regStatus = evt.user_registration?.registration_status;

                return (
                  <div 
                    key={evt.id} 
                    id={`event-card-${evt.id}`}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col hover:border-sky-300 transition-all shadow-md group"
                  >

                    {/* Banner */}
                    <div className="relative h-48 overflow-hidden">
                      <img src={evt.banner_url} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-sky-800 border border-sky-300 shadow-sm">
                        {evt.event_type}
                      </div>
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">
                        {evt.is_paid ? `₹${evt.event_fee}` : 'FREE'}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-sky-800 transition-colors">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {evt.description}
                        </p>

                        <div className="space-y-2 pt-2 text-xs text-slate-500 border-t border-slate-100 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>{evt.start_date} ({evt.start_time})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                            <span className="truncate">{evt.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>Capacity: {evt.registered_count} / {evt.capacity} Delegates</span>
                          </div>
                        </div>
                      </div>

                      {/* Social Interaction Toolbar (Like, Comment, Share) */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleLike(evt)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-95 group/like ${
                            evt.is_liked
                              ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200 shadow-sm'
                              : 'hover:bg-slate-100 text-slate-600 hover:text-rose-600'
                          }`}
                          title={evt.is_liked ? "Unlike Event" : "Like Event"}
                        >
                          <Heart className={`w-4 h-4 transition-all duration-300 group-hover/like:scale-125 ${
                            evt.is_liked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                          }`} />
                          <span>{evt.likes_count || 0}</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          type="button"
                          onClick={() => setCommentingEvent(evt)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-sky-700 transition-all text-slate-600 active:scale-95 group/comment"
                          title="View & Add Comments"
                        >
                          <MessageCircle className="w-4 h-4 transition-transform group-hover/comment:scale-110 text-slate-500 group-hover/comment:text-sky-600" />
                          <span>{evt.comments_count || 0}</span>
                          <span className="hidden sm:inline text-[11px] font-normal text-slate-400">Comments</span>
                        </button>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={() => setSharingEvent(evt)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-all text-slate-600 active:scale-95 group/share"
                          title="Share Event Link & Socials"
                        >
                          <Share2 className="w-4 h-4 transition-transform group-hover/share:scale-110 text-slate-500 group-hover/share:text-emerald-600" />
                          <span className="text-[11px]">Share</span>
                        </button>
                      </div>

                      {/* Join / Status Action */}
                      <div className="pt-2">
                        {isRegistered ? (
                          regStatus === 'CONFIRMED' ? (
                            <div className="space-y-2">
                              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <div>
                                    <span className="block leading-tight text-emerald-900">Approved Attendee • Pass Issued</span>
                                    <span className="text-[10px] text-emerald-700 font-medium">Verified to attend at the venue</span>
                                  </div>
                                </span>
                                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                                  {evt.user_registration.pass_code}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setAttendeePassModalEvent(evt)}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-colors"
                              >
                                <Ticket className="w-4 h-4" />
                                <span>View Official Attendee Pass</span>
                              </button>
                            </div>
                          ) : regStatus === 'REJECTED' ? (
                            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-bold space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="flex items-center gap-1.5">
                                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="block leading-tight text-rose-900">Request Rejected • Cannot Attend</span>
                                    <span className="text-[10px] text-rose-600 font-medium block">
                                      {evt.user_registration?.rejection_reason
                                        ? `Reason: ${evt.user_registration.rejection_reason}`
                                        : 'Admin reviewed and declined this request.'}
                                    </span>
                                  </div>
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-rose-200">
                                <span className="text-[10px] text-rose-700 font-medium">Only approved members can attend</span>
                                <button
                                  type="button"
                                  onClick={() => handleJoinClick(evt)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shrink-0 transition-colors shadow-sm"
                                >
                                  Re-Apply with New Receipt
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                  <div>
                                    <span className="block leading-tight text-amber-900">Join Request Pending Approval</span>
                                    <span className="text-[10px] text-amber-700 font-medium">
                                      {evt.is_paid ? 'Admin is reviewing your UTR & receipt' : 'Admin is reviewing your join request'}
                                    </span>
                                  </div>
                                </span>
                                {evt.user_registration.pass_code && (
                                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                                    Ref: {evt.user_registration.pass_code}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-medium text-amber-800 bg-amber-100/60 p-1.5 rounded-lg border border-amber-200 flex items-center justify-between">
                                <span>⚠️ Only approved members can attend this event.</span>
                                {evt.user_registration.transaction_id && (
                                  <span className="font-mono font-bold text-slate-700">UTR: {evt.user_registration.transaction_id}</span>
                                )}
                              </div>
                            </div>
                          )
                        ) : (
                          <button
                            onClick={() => handleJoinClick(evt)}
                            className="w-full py-3 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center justify-center gap-2 shadow-md"
                          >
                            <span>{evt.is_paid ? `Request to Join (₹${evt.event_fee})` : 'Request to Join (Free Entry)'}</span>
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

        {/* SECTION 2: PAST PROGRAMS */}
        <div className="space-y-8 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0 shadow-sm">
                <History className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Past Programs & Concluded Assemblies</h2>
                <p className="text-xs text-slate-500 font-medium">Archived union conventions, safety rallies, and delegation outcomes</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold">
              {combinedPastPrograms.length} Concluded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {combinedPastPrograms.map(item => (
              <div 
                key={item.id} 
                id={`event-card-${item.id}`}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
              >

                <div>
                  {/* Banner with Outcome Badge */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={item.banner_url} alt={item.title} className="w-full h-full object-cover filter grayscale-[20%] group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      {item.event_type}
                    </div>
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold">
                      ✓ {item.outcome_badge || 'CONCLUDED'}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-sky-800 transition-colors">{item.title}</h3>

                    <div className="space-y-1.5 text-xs text-slate-500 font-medium pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Held on {item.start_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{item.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sky-800 font-semibold">
                        <Users className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>Outcome Attendance: {item.attendance || `${item.registered_count || 450} Delegates`}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 leading-relaxed font-medium mt-2">
                      <strong>Resolution:</strong> {item.resolution || item.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-3">
                  {/* Social Interaction Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-95 group/like ${
                        item.is_liked
                          ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200 shadow-sm'
                          : 'hover:bg-slate-100 text-slate-600 hover:text-rose-600'
                      }`}
                      title={item.is_liked ? "Unlike" : "Like"}
                    >
                      <Heart className={`w-4 h-4 transition-all duration-300 group-hover/like:scale-125 ${
                        item.is_liked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                      }`} />
                      <span>{item.likes_count || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCommentingEvent(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-sky-700 transition-all text-slate-600 active:scale-95 group/comment"
                      title="Comments & Resolutions"
                    >
                      <MessageCircle className="w-4 h-4 transition-transform group-hover/comment:scale-110 text-slate-500 group-hover/comment:text-sky-600" />
                      <span>{item.comments_count || 0}</span>
                      <span className="hidden sm:inline text-[11px] font-normal text-slate-400">Comments</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSharingEvent(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:text-emerald-700 transition-all text-slate-600 active:scale-95 group/share"
                      title="Share Archived Report"
                    >
                      <Share2 className="w-4 h-4 transition-transform group-hover/share:scale-110 text-slate-500 group-hover/share:text-emerald-600" />
                      <span className="text-[11px]">Share</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold text-center flex items-center justify-center gap-1">
                    <Award className="w-3.5 h-3.5 text-sky-600" />
                    <span>Official Archived Program Report</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Registration Modal for Upcoming Events */}
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
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Event Participation</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Request to Join: {selectedEvent.title}</h3>
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
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{feedback.success}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {selectedEvent.is_paid ? (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Event Joining Charges:</span>
                      <span className="text-lg font-extrabold text-sky-700">₹{selectedEvent.event_fee}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <img src={selectedEvent.payment_qr_url || '/images/payment-qr.png'} alt="QR Code" className="w-40 h-40 object-contain" />
                      <span className="text-[10px] text-slate-800 font-mono font-bold mt-1">Scan to Pay via UPI</span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed text-center font-medium">
                      {selectedEvent.payment_instructions || 'Please complete the payment and enter the UTR/Transaction ID below for admin verification.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Transaction ID / UTR Number <span className="text-sky-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UTR11223344556"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Upload Payment Receipt / Screenshot <span className="text-red-500">*</span>
                    </label>

                    {!paymentProofUrl ? (
                      <div
                        onClick={() => receiptFileInputRef.current?.click()}
                        className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl p-4 bg-sky-50/50 hover:bg-sky-50 text-center cursor-pointer transition-colors space-y-2"
                      >
                        <div className="w-10 h-10 mx-auto rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to upload payment receipt
                          </p>
                          <p className="text-[11px] text-slate-500">
                            PNG, JPG, WEBP, or PDF (Max 5MB)
                          </p>
                        </div>
                        <input
                          ref={receiptFileInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleReceiptFileChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {paymentProofUrl.startsWith('data:image') || paymentProofUrl.startsWith('http') ? (
                            <img
                              src={paymentProofUrl}
                              alt="Receipt Thumbnail"
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
                              onClick={() => setViewReceiptModal(paymentProofUrl)}
                            />
                          ) : (
                            <div
                              onClick={() => setViewReceiptModal(paymentProofUrl)}
                              className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs shrink-0 cursor-pointer"
                            >
                              PDF
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {receiptFileName || 'Payment Receipt Uploaded'}
                            </p>
                            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{receiptFileSize || 'Ready for review'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewReceiptModal(paymentProofUrl)}
                            className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-slate-200 rounded-lg text-xs"
                            title="Preview Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={removeReceipt}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs"
                            title="Remove Receipt"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Official receipt required for admin approval.</span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Enter receipt image direct URL (optional):', paymentProofUrl.startsWith('http') ? paymentProofUrl : '');
                          if (url !== null && url.trim()) {
                            setPaymentProofUrl(url.trim());
                            setReceiptFileName('Online Receipt Image');
                          }
                        }}
                        className="text-sky-700 hover:text-sky-800 font-bold underline"
                      >
                        Paste URL
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-semibold leading-relaxed">
                  This event is free for union members. Once you submit your join request, the admin team will review and approve your attendance.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting Join Request...' : (selectedEvent.is_paid ? 'Submit Join Request (With Receipt)' : 'Submit Join Request')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Official Union Attendee Pass Modal */}
      {attendeePassModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setAttendeePassModalEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pass Header */}
            <div className="text-center border-b border-slate-100 pb-4 space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-300">
                Official Delegate Entry Pass
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">MPVMAVAKS Union Assembly</h3>
              <p className="text-xs text-slate-500">M.P. Electricity Board Commissioned Employees Union</p>
            </div>

            {/* Pass Ticket Body */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white space-y-4 shadow-xl border border-sky-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-sky-300 font-bold uppercase tracking-wider block">Program / Event</span>
                  <h4 className="text-base font-extrabold text-white leading-snug mt-0.5">{attendeePassModalEvent.title}</h4>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold shrink-0">
                  APPROVED ATTENDEE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Delegate Member</span>
                  <span className="font-bold text-white block truncate">{user?.profile?.full_name || user?.email}</span>
                  <span className="text-[10px] font-mono text-amber-400">{user?.member_id || `ID: ${user?.id}`}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Discom Circle</span>
                  <span className="font-bold text-white block truncate">{user?.profile?.circle || 'Indore Region'}</span>
                  <span className="text-[10px] text-slate-300 truncate block">{user?.profile?.designation || 'Member'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Date & Time</span>
                  <span className="font-bold text-white block">{attendeePassModalEvent.start_date}</span>
                  <span className="text-[10px] text-slate-300 block">{attendeePassModalEvent.start_time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Assembly Venue</span>
                  <span className="font-bold text-white block truncate">{attendeePassModalEvent.venue}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold block">Entry: Gate Verified</span>
                </div>
              </div>

              {/* Pass Code Barcode simulation */}
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold block">Verification Pass Code</span>
                  <span className="font-mono text-sm sm:text-base font-black tracking-widest text-amber-300 block">
                    {attendeePassModalEvent.user_registration?.pass_code || 'PASS-CONFIRMED'}
                  </span>
                </div>
                <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-1">
                Notice: Non-transferable digital pass. Only approved members with valid identity card can attend.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print / Save Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setAttendeePassModalEvent(null)}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Payment Receipt Preview</h3>
              <button onClick={() => setViewReceiptModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[220px]">
              {viewReceiptModal.startsWith('data:application/pdf') ? (
                <iframe
                  src={viewReceiptModal}
                  title="Receipt Document"
                  className="w-full h-80 rounded-xl"
                />
              ) : (
                <img
                  src={viewReceiptModal}
                  alt="Receipt Preview"
                  className="w-full h-full max-h-[55vh] object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={viewReceiptModal}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Tab</span>
              </a>

              <button
                type="button"
                onClick={() => setViewReceiptModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Drawer / Modal */}
      <EventCommentsModal
        isOpen={Boolean(commentingEvent)}
        onClose={() => setCommentingEvent(null)}
        event={commentingEvent}
        currentUser={user}
        onCommentCountUpdate={handleCommentCountUpdate}
      />

      {/* Social Share Modal */}
      <EventShareModal
        isOpen={Boolean(sharingEvent)}
        onClose={() => setSharingEvent(null)}
        event={sharingEvent}
      />

      {/* Floating Action Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <p className="text-xs font-medium text-slate-200">{toast.message}</p>
          {toast.actionLink && (
            <Link
              to={toast.actionLink}
              className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shrink-0 transition-colors shadow-sm"
            >
              {toast.actionText}
            </Link>
          )}
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white text-xs p-1">✕</button>
        </div>
      )}

    </div>
  );
}
