import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Membership Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold">
          <Mail className="w-4 h-4" /> Direct Communication Channel
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Get in Touch with <span className="gradient-text-cyan">Union Suyradev</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Have questions about membership tiers, executive match-making, or corporate sponsorship?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          {[
            { icon: Mail, title: 'Email Support', detail: 'contact@unionsuyradev.com', sub: '24-hour response SLA' },
            { icon: Phone, title: 'Executive Line', detail: '+91 98200 11223', sub: 'Mon - Fri, 9:00 AM - 7:00 PM IST' },
            { icon: MapPin, title: 'Headquarters', detail: 'Union Suyradev Tower, BKC, Mumbai', sub: 'Regional hubs in SG & Austin' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel rounded-2xl p-6 border border-slate-700/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs font-extrabold text-brand-cyan mt-0.5">{item.detail}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-slate-700/80 shadow-card-dark">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Message Received!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Thank you for contacting Union Suyradev. A community relationship manager will reach out within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-xs text-brand-cyan font-bold"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@vancestrategies.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Membership Inquiry">Executive Membership Inquiry</option>
                  <option value="Corporate Sponsorship">Corporate Event Sponsorship</option>
                  <option value="Technical Support">Platform Technical Support</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Message Detail</label>
                <textarea
                  rows="4"
                  required
                  placeholder="How can Union Suyradev assist your organization?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold text-xs shadow-glow-cyan hover:opacity-95 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" /> Send Inquiry
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};

export default Contact;
