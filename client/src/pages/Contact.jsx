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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Phone className="w-3.5 h-3.5 text-amber-700" />
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
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Office Address</span>
                    <span className="text-slate-600 leading-relaxed block mt-0.5">
                      {settings?.office_address || 'MPWZ Union HQ, Discom HQ Campus, Polo Ground, Indore, MP - 452003'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Phone Helpline</span>
                    <span className="text-slate-700 font-mono font-bold block mt-0.5">
                      {settings?.contact_phone || '+91 98260 11223'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Official Email</span>
                    <span className="text-slate-600 block mt-0.5">
                      {settings?.contact_email || 'contact@mpwzunion.org'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
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
              <Shield className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Indore HQ Campus Map</h4>
              <p className="text-xs text-slate-500 font-medium">Polo Ground MP West Zone Discom Executive HQ</p>
              <div className="h-32 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-xs font-mono text-slate-500">
                [ Interactive Campus Map Placeholder ]
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Membership guidance"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-2 shadow-sm"
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
