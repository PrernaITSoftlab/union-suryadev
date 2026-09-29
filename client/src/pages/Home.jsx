import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, Calendar, AlertTriangle, FileText, ArrowRight,
  CheckCircle2, Sparkles, Building2, Zap, ShieldAlert, Award, PhoneCall, ChevronRight, UserPlus, LogIn, Camera
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import HeroSlider from '../components/HeroSlider';
import HomePhotoGallery from '../components/HomePhotoGallery';

export default function Home() {
  const { settings } = useAuth();
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, evtRes] = await Promise.all([
          api.get('/announcements/list'),
          api.get('/events/list')
        ]);
        if (annRes.data.success) setAnnouncements(annRes.data.announcements.slice(0, 3));
        if (evtRes.data.success) setEvents(evtRes.data.events.slice(0, 3));
      } catch (err) {
        console.warn('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
                {t('Empowering over 15,000+ electricity personnel across Indore, Ujjain, Dewas, Ratlam, Dhar, Khargone, Khandwa, Mandsaur, and Neemch discom circles with legal guidance, wage protection, OPS agitation, and hazard insurance.')}
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
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900">15,000+</div>
                  <div className="text-slate-500 font-semibold text-[11px] mt-0.5">{t('Union Member')}</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-sky-700">9 Circles</div>
                  <div className="text-slate-500 font-semibold text-[11px] mt-0.5">{t('MP West Zone')}</div>
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
              <Link to="/events" className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1">
                <span>{t('View All Notices')}</span>
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

      {/* Member Benefits */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">{t('Why Join Us')}</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('Protecting Every Lineman, Engineer & Staff Member')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('MPWZ Union provides a unified institutional voice to ensure physical safety, wage progression, pension security, and mutual employee relief.')}
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

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('Upcoming Union Events & Conventions')}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">{t('Conventions, safety workshops, and zonal delegate meetings')}</p>
              </div>
              <Link to="/events" className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1">
                <span>{t('Browse All Events')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map(evt => (
                <div key={evt.id} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden hover:border-sky-300 transition-all flex flex-col shadow-sm">
                  <img src={evt.banner_url} alt={evt.title} className="w-full h-44 object-cover" />
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-sky-700 font-extrabold mb-2">
                        <span>{evt.event_type}</span>
                        <span className="text-slate-500 font-mono">{evt.start_date}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{evt.venue}</span>
                      <Link
                        to="/events"
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-sm"
                      >
                        {evt.is_paid ? `Register (₹${evt.event_fee})` : 'Join Free'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Bar */}
      <section className="py-20 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to Join the Official MPWZ Union Platform?
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
              Contact Union HQ Indore
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
