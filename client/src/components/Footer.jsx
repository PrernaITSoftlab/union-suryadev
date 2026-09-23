import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, ExternalLink, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { settings } = useAuth();

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-md shadow-amber-500/20">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                {settings?.union_short_name || 'MPWZ UNION'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {settings?.tagline || 'Madhya Pradesh West Zone Electricity Distribution Company Official Union Platform.'}
            </p>
            <div className="text-xs text-slate-500 font-medium">
              Registration & Safety Officer: General Secretary Office HQ Indore
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/" className="hover:text-amber-600 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-600 transition-colors">About Union & Leadership</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-amber-600 transition-colors">Upcoming Events & Agitations</Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-amber-600 transition-colors">Apply for Membership (Join Now)</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-600 transition-colors">Contact Office</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-600 transition-colors">Member & Admin Portal Login</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Central Office</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">{settings?.office_address || 'Polo Ground HQ Campus, Indore, Madhya Pradesh - 452003'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-mono text-slate-800">{settings?.contact_phone || '+91 98260 11223'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-slate-700">{settings?.contact_email || 'contact@mpwzunion.org'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Union Helpline & QR</h4>
            <p className="text-xs text-slate-600">
              UPI Registration & Event Payments QR active 24/7. Contact WhatsApp support for verification assistance.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 font-mono text-amber-800 font-bold">
              <div>UPI: {settings?.upi_id || 'mpvidyut@sbi'}</div>
              <div>Fee: ₹{settings?.registration_fee || 500} Registration</div>
              <div>WhatsApp: {settings?.payment_whatsapp_number || '+91 98260 11223'}</div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © {new Date().getFullYear()} {settings?.union_name || 'MPWZ Electricity Employees Union'}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-700">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-700">Lineman Safety Manual</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
