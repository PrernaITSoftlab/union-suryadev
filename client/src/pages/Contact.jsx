import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { settings } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.post('/contact/submit', formData);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to submit inquiry.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Phone className="w-3.5 h-3.5 text-sky-700" />
            <span>Contact Union HQ</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Get in Touch with Union Representatives
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Have membership questions, legal representation inquiries, or grievance support needs? Write to our central office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">
                Central Office Details
              </h3>

              <div className="space-y-5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Office Address</span>
                    <span className="text-slate-600 leading-relaxed block mt-0.5">
                      {settings?.office_address || '138, Private Bijli Nagar Colony, Govindpura, Bhopal, MP - 462023'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Phone Helpline</span>
                    <span className="text-slate-700 font-mono font-bold block mt-0.5 leading-relaxed">
                      {settings?.contact_phone || '+91 94249 44041 / +91 83198 64691 / +91 94793 65273'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Official Email</span>
                    <span className="text-slate-600 block mt-0.5">
                      {settings?.contact_email || 'mpmavaks@gmail.com'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Office Timings</span>
                    <span className="text-slate-600 block mt-0.5">
                      {settings?.office_hours || 'Monday - Saturday: 10:00 AM - 06:00 PM IST'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder Widget */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-3 shadow-sm">
              <Shield className="w-8 h-8 text-sky-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Central Office Bhopal Map</h4>
              <p className="text-xs text-slate-500 font-medium">138, Private Bijli Nagar Colony, Govindpura, Bhopal</p>
              <div className="h-32 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-xs font-mono text-slate-500">
                [ Interactive Campus Map Placeholder ]
              </div>
            </div>

            {/* Official Social Media Channels */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Official Social Media Channels
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Follow our official handles for live agitation notices, union events, video broadcasts, and news updates.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={settings?.facebook_url || "https://www.facebook.com/share/14tpTFEHUp2/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  title="Connect on Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>
                <a
                  href={settings?.youtube_url || "https://youtube.com/@mpvmavaks?si=a1d8DZGazNo_Jfy-"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  title="Follow on YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YouTube</span>
                </a>
                <a
                  href={settings?.instagram_url || "https://www.instagram.com/mpvmavaks4865?rpxt=MXhpNWs0emRtcmU0bA=="}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  title="Follow on Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-md">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Send an Online Message</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Submissions are stored in Admin Inquiry Center for review.</p>
              </div>

              {feedback?.error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{feedback.error}</span>
                </div>
              )}

              {feedback?.success && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{feedback.success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Er. Ramesh Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="ramesh@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone / Mobile</label>
                    <input
                      type="text"
                      placeholder="+91 98260 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Membership guidance"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Detail *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Write your message or grievance detail here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Message...' : 'Submit Contact Message'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
