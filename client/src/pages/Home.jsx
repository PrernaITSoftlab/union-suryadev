import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, Calendar, AlertTriangle, FileText, ArrowRight,
  CheckCircle2, Sparkles, Building2, Zap, ShieldAlert, Award, PhoneCall,
  ChevronRight, UserPlus, LogIn, Camera, Clock, MapPin, Eye, RefreshCw,
  AlertCircle, CalendarDays, ExternalLink, X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import HeroSlider from '../components/HeroSlider';
import HomePhotoGallery from '../components/HomePhotoGallery';

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';

const formatProgramDate = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^[0-9]{1,2}\s+[A-Za-z]+/.test(dateVal.trim())) {
    return dateVal;
  }
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch (_) {}
  return String(dateVal);
};

const getProgramDatePill = (dateVal) => {
  if (!dateVal) return { day: '--', month: 'PROG' };
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const day = d.toLocaleDateString('en-IN', { day: '2-digit' });
      const month = d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
      return { day, month };
    }
  } catch (_) {}
  return { day: '01', month: 'PROG' };
};

export default function Home() {
  const { settings } = useAuth();
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [selectedProgramModal, setSelectedProgramModal] = useState(null);

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const res = await api.get('/events/list');
      if (res.data?.success && Array.isArray(res.data.events)) {
        setEvents(res.data.events);
      } else {
        const fallbackRes = await api.get('/events');
        if (fallbackRes.data?.success && Array.isArray(fallbackRes.data.events)) {
          setEvents(fallbackRes.data.events);
        } else {
          setEvents([]);
        }
      }
    } catch (err) {
      console.warn('Error fetching upcoming events:', err);
      try {
        const fallbackRes = await api.get('/events');
        if (fallbackRes.data?.success && Array.isArray(fallbackRes.data.events)) {
          setEvents(fallbackRes.data.events);
          setEventsError(null);
          return;
        }
      } catch (_) {}
      setEventsError(err.response?.data?.message || err.message || 'Unable to fetch upcoming programs from the database.');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const annRes = await api.get('/announcements/list');
        if (annRes.data?.success && Array.isArray(annRes.data.announcements)) {
          setAnnouncements(annRes.data.announcements.slice(0, 3));
        }
      } catch (err) {
        console.warn('Error fetching announcements:', err);
      }
    };

    fetchAnnouncements();
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-3 pb-6 lg:pt-5 lg:pb-8 bg-gradient-to-b from-white via-sky-50/50 to-slate-50 border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.08),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Hero Left Column (Clean Full-Size Photo Slider) */}
            <div className="lg:col-span-6 flex items-start justify-center">
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-sky-100">
                <HeroSlider compact={true} />
              </div>
            </div>

            {/* Hero Right Info */}
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>{t('Madhya Pradesh West Zone Discom Employees Union')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                {t('Uniting Power Engineers & Field Staff for')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600">{t('Safety, Dignity & Rights')}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                {t('Empowering over 5000+ electricity personnel across 53 districts in Madhya Pradesh with legal guidance, wage protection, OPS agitation, and hazard insurance.')}
              </p>

              {/* Key Features Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-0.5 text-[11px] font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t('Legal & OPS Rights')}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t('₹20L Hazard Relief')}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t('Digital Member ID')}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/join"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('JOIN UNION NOW')}</span>
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-sky-600" />
                  <span>{t('MEMBER LOGIN')}</span>
                </Link>
              </div>

              {/* Highlights badge */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200 text-xs">
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900">5000+</div>
                  <div className="text-slate-500 font-semibold text-[11px] mt-0.5">{t('Members')}</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-sky-700">53 Districts</div>
                  <div className="text-slate-500 font-semibold text-[11px] mt-0.5">{t('Madhya Pradesh')}</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-blue-700">100%</div>
                  <div className="text-slate-500 font-semibold text-[11px] mt-0.5">{t('Digital QR Join')}</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Announcements Preview */}
      {announcements.length > 0 && (
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-sky-600" />
                  <span>{t('Important Union Announcements')}</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Latest notifications, gazette orders, and strike bulletins')}</p>
              </div>
              <Link to="/correspondence" className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1">
                <span>{t('View All Correspondence')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map(a => (
                <div
                  key={a.id}
                  className={`p-5 rounded-2xl border transition-all ${a.type === 'STRIKE' || a.priority === 'CRITICAL'
                    ? 'bg-red-50/70 border-red-200 hover:border-red-400'
                    : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                    }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full ${a.type === 'STRIKE' ? 'bg-red-200 text-red-900' : 'bg-sky-100 text-sky-900'
                      }`}>
                      {a.type}
                    </span>
                    <span className="text-slate-500 font-mono">{a.start_date}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug mb-2">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Union Programs & Events Section (Prominent Calendar Display) */}
      <section className="py-14 sm:py-16 bg-gradient-to-b from-white via-sky-50/40 to-white border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-200/80">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>{t('Official Union Calendar')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-3">
                <span>{t('Upcoming Union Programs & Events')}</span>
                {!eventsLoading && !eventsError && events.length > 0 && (
                  <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full bg-sky-600 text-white shadow-sm">
                    {events.length} {events.length === 1 ? 'Program' : 'Programs'}
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
                {t('Conventions, safety workshops, and zonal delegate meetings across Madhya Pradesh Discom circles')}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={fetchEvents}
                title="Refresh Programs from Server"
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${eventsLoading ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{t('Refresh')}</span>
              </button>

              <Link
                to="/events"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5"
              >
                <span>{t('Browse All Programs')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 1. Loading State */}
          {eventsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 sm:h-52 bg-slate-200 w-full relative">
                    <div className="absolute top-3 left-3 w-14 h-14 bg-slate-300 rounded-2xl" />
                    <div className="absolute top-3 right-3 w-20 h-6 bg-slate-300 rounded-full" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                      <div className="h-6 w-24 bg-slate-200 rounded-lg" />
                      <div className="h-6 w-20 bg-slate-200 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 bg-slate-200 rounded-md w-4/5" />
                      <div className="h-5 bg-slate-200 rounded-md w-3/5" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded-md w-full" />
                    <div className="pt-4 border-t border-slate-100 flex gap-2">
                      <div className="h-10 bg-slate-200 rounded-xl flex-1" />
                      <div className="h-10 bg-slate-200 rounded-xl flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Error State */}
          {!eventsLoading && eventsError && (
            <div className="bg-white border-2 border-red-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-md space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {t('Unable to Load Upcoming Programs')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  {eventsError}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={fetchEvents}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('Retry Fetching Programs')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Empty State */}
          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm space-y-5">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shadow-sm">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {t('No Upcoming Programs Scheduled Right Now')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  {t('All upcoming state delegate conventions, technical safety workshops, and regional meetings will be prominently posted here as soon as they are announced by the union executive board.')}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/events"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
                >
                  {t('Browse Past Events & Archives')}
                </Link>
                <button
                  type="button"
                  onClick={fetchEvents}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('Refresh List')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Loaded Programs Grid (All Upcoming Programs) */}
          {!eventsLoading && !eventsError && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {events.map(evt => {
                const datePill = getProgramDatePill(evt.start_date || evt.event_date);
                const displayDate = formatProgramDate(evt.start_date || evt.event_date);
                const displayTime = evt.start_time || evt.event_time || '10:00 AM';
                const isPaid = Boolean(evt.is_paid || Number(evt.event_fee) > 0);

                return (
                  <div
                    key={evt.id}
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-400 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
                  >
                    {/* Card Header Banner with Image & Badges */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                      <img
                        src={evt.banner_url || DEFAULT_EVENT_IMAGE}
                        alt={evt.title}
                        onError={(e) => {
                          if (e.currentTarget.src !== DEFAULT_EVENT_IMAGE) {
                            e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                      {/* Floating Calendar Badge (Top-Left) */}
                      <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md rounded-2xl px-2.5 py-1.5 text-center shadow-lg border border-white/70 min-w-[54px]">
                        <div className="text-[10px] font-black tracking-wider text-sky-700 uppercase leading-none">
                          {datePill.month}
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
                          {datePill.day}
                        </div>
                      </div>

                      {/* Floating Status & Fee Badges (Top-Right) */}
                      <div className="absolute top-3.5 right-3.5 flex flex-col items-end gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-600 text-white shadow-md">
                          {evt.event_type || 'PROGRAM'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                          isPaid ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {isPaid ? `Fee: ₹${evt.event_fee}` : 'Free Entry'}
                        </span>
                      </div>

                      {/* Venue Floating Tag (Bottom) */}
                      {evt.venue && (
                        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 text-white/95 text-xs font-semibold drop-shadow-md">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Date & Time Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-sky-900">
                            <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="font-bold">{displayDate}</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="font-semibold">{displayTime}</span>
                          </div>
                        </div>

                        {/* Program Title */}
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                          {evt.title}
                        </h3>

                        {/* Program Description */}
                        {evt.description && (
                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons Row */}
                      <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedProgramModal(evt)}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:border-sky-400 bg-white hover:bg-sky-50/70 text-slate-800 hover:text-sky-700 text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4 text-sky-600" />
                          <span>{t('View Details')}</span>
                        </button>

                        <Link
                          to={`/events?id=${evt.id}`}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-sky-600/20 flex items-center justify-center gap-1.5"
                        >
                          <span>{isPaid ? `Register (₹${evt.event_fee})` : t('Join Event')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Member Benefits */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">{t('Why Join Us')}</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('Protecting Every Lineman, Engineer & Staff Member')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('MPVMAVAKS Union provides a unified institutional voice to ensure physical safety, wage progression, pension security, and mutual employee relief.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 transition-all space-y-3 shadow-sm group">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('Field Safety Protocols')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('Mandatory Permit-To-Work (PTW) rules, insulated high-voltage gear, and earthing discharge rod standards for 33kV & 11kV lines.')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 transition-all space-y-3 shadow-sm group">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('Wage & Grade Pay')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('Advocating 7th Pay Commission arrears, Dearness Allowance (DA) revisions, and prompt pay anomaly rectification.')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 transition-all space-y-3 shadow-sm group">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('Contract Regularization')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('Strong legal advocate for absorbing outsource & contract linemen into regular discom cadres with pension rights.')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 transition-all space-y-3 shadow-sm group">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('Mutual Benefit Fund')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('Emergency financial relief of up to ₹20 Lakhs for families of linemen injured or deceased during electrical grid duty.')}
            </p>
          </div>
        </div>
      </section>

      {/* Union Activities & Photo Gallery Section */}
      <HomePhotoGallery />



      {/* Call to Action Bar */}
      <section className="py-20 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to Join the Official MPVMAVAKS Union Platform?
          </h2>
          <p className="text-base text-sky-100 max-w-2xl mx-auto font-medium">
            Fill out your official membership application online, complete registration fee payment via UPI QR code, and get instant access to member tools.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/join"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-black bg-white text-slate-900 shadow-2xl hover:bg-slate-100 transition-all"
            >
              COMPLETE MEMBERSHIP APPLICATION
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-sky-800 text-white border-2 border-white/20 hover:bg-sky-900 transition-all"
            >
              Contact Central Office Bhopal
            </Link>
          </div>
        </div>
      </section>

      {/* Program Details Interactive Modal */}
      {selectedProgramModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedProgramModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProgramModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-105"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Banner */}
            <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
              <img
                src={selectedProgramModal.banner_url || DEFAULT_EVENT_IMAGE}
                alt={selectedProgramModal.title}
                onError={(e) => {
                  if (e.currentTarget.src !== DEFAULT_EVENT_IMAGE) {
                    e.currentTarget.src = DEFAULT_EVENT_IMAGE;
                  }
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-600 text-white shadow-md">
                    {selectedProgramModal.event_type || 'PROGRAM'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                    {selectedProgramModal.status || 'REGISTRATION OPEN'}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md ${
                  selectedProgramModal.is_paid || Number(selectedProgramModal.event_fee) > 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {selectedProgramModal.is_paid || Number(selectedProgramModal.event_fee) > 0
                    ? `Fee: ₹${selectedProgramModal.event_fee}`
                    : 'Free Event'}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {selectedProgramModal.title}
                </h2>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-800">{t('Date')}</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {formatProgramDate(selectedProgramModal.start_date || selectedProgramModal.event_date)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-800">{t('Time')}</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {selectedProgramModal.start_time || selectedProgramModal.event_time || '10:00 AM'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('Venue & Location')}</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {selectedProgramModal.venue || 'Union Central Headquarters, Bhopal / Indore'}
                    </div>
                    {selectedProgramModal.address && selectedProgramModal.address !== selectedProgramModal.venue && (
                      <div className="text-xs text-slate-600 mt-0.5">{selectedProgramModal.address}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Program Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('About This Program')}</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {selectedProgramModal.description || t('No additional description provided for this program.')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProgramModal(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-all"
                >
                  {t('Close')}
                </button>

                <Link
                  to={`/events?id=${selectedProgramModal.id}`}
                  onClick={() => setSelectedProgramModal(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm shadow-md shadow-sky-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>{selectedProgramModal.is_paid ? `Register (₹${selectedProgramModal.event_fee})` : t('Join Event Now')}</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
