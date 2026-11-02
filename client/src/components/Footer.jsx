import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, ExternalLink, Heart, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { settings } = useAuth();
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info & About MPVMAVAKS Union Team */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={settings?.logo_url || "/images/union-logo.png"} 
                alt="MPVMAVAKS Union Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0" 
              />
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                {settings?.union_short_name || 'MPVMAVAKS UNION'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {settings?.tagline || t('Madhya Pradesh West Zone Electricity Distribution Company Official Union Platform.')}
            </p>
            <div className="text-xs text-slate-500 font-medium">
              Registration & Safety Officer: Central Office Bhopal • Regd. No. 4404
            </div>

            {/* Connect / Follow Us on Facebook & YouTube */}
            <div className="pt-2">
              <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                {t('Connect / Follow Us')}
              </h5>
              <div className="flex items-center gap-2">
                <a
                  href={settings?.facebook_url || "https://facebook.com/mpvmavaksunion"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  title="Connect with us on Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>
                <a
                  href={settings?.youtube_url || "https://youtube.com/@mpvmavaksunion"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  title="Follow our official channel on YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">{t('Quick Navigation')}</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/" className="hover:text-sky-600 transition-colors">{t('Home Page')}</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sky-600 transition-colors">{t('About Union & Leadership')}</Link>
              </li>
              <li>
                <Link to="/board-of-union" className="hover:text-sky-600 transition-colors font-bold text-sky-700">{t('Board of Union (18 Executive Heads)')}</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-sky-600 transition-colors">{t('Upcoming Events & Agitations')}</Link>
              </li>
              <li>
                <Link to="/energy-department" className="hover:text-sky-600 transition-colors font-bold text-slate-700">{t('Energy Department Organizations')}</Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-sky-600 transition-colors">{t('Apply for Membership (Join Now)')}</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sky-600 transition-colors">{t('Contact Office')}</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-600 transition-colors">{t('Member & Admin Portal Login')}</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">{t('Central Office')}</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">{settings?.office_address || '138, Private Bijli Nagar Colony, Govindpura, Bhopal, MP - 462023'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-mono text-slate-800">{settings?.contact_phone || '+91 94249 44041 / +91 83198 64691'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-slate-700">{settings?.contact_email || 'mpmavaks@gmail.com'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">{t('Union Helpline & QR')}</h4>
            <p className="text-xs text-slate-600">
              {t('UPI Registration & Event Payments QR active 24/7. Contact WhatsApp support for verification assistance.')}
            </p>
            <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs space-y-1 font-mono text-sky-900 font-bold">
              <div>UPI: {settings?.upi_id || 'mpvidyut@sbi'}</div>
              <div>Fee: ₹{settings?.registration_fee || 500} Registration (Donation + membership)</div>
              <div>WhatsApp: {settings?.payment_whatsapp_number || '+91 94249 44041'}</div>
            </div>
          </div>

        </div>

        {/* Dedicated About MPVMAVAKS Union Team Section */}
        <div className="mt-10 p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-sky-700" />
                <span>{t('About MPVMAVAKS Union Team')}</span>
              </span>
              <span className="text-xs font-black text-slate-800">
                म.प्र.वि.म. आरक्षित वर्ग अधिकारी एवं कर्मचारी संघ
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {t(
                'MPVMAVAKS Union is the dedicated representative body safeguarding the constitutional rights, technical safety, OPS pension security, and career advancement of over 5000+ electricity engineers, technical officers, and field staff across 53 districts of Madhya Pradesh. Led by Provincial President Er. Suryadev Jaysingh, Senior Vice President Shri V. S. Mehto, and an 18-member Executive Board across West Zone, East Zone, Central Zone, MPPGCL, and MPPTCL.'
              )}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-sky-700 pt-1">
              <Link to="/board-of-union" className="hover:underline flex items-center gap-1">
                <span>{t('View All 18 Executive Officers & Directory')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <span>•</span>
              <Link to="/about" className="hover:underline">
                {t('Union History, Mission & Values')}
              </Link>
            </div>
          </div>

          <div className="shrink-0 space-y-2 w-full md:w-auto">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
              {t('Connect / Follow Us')}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={settings?.facebook_url || "https://facebook.com/mpvmavaksunion"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                title="Follow MPVMAVAKS Union on Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
              <a
                href={settings?.youtube_url || "https://youtube.com/@mpvmavaksunion"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                title="Subscribe to MPVMAVAKS Union on YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © {new Date().getFullYear()} {settings?.union_name || 'MPVMAVAKS Electricity Employees Union'}. {t('All rights reserved.')}
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700">{t('Terms of Service')}</span>
            <span>•</span>
            <span className="hover:text-slate-700">{t('Privacy Policy')}</span>
            <span>•</span>
            <span className="hover:text-slate-700">{t('Lineman Safety Manual')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
