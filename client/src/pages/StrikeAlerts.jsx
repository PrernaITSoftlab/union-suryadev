import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, PhoneCall, Download, Printer, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const StrikeAlerts = () => {
  const [strikeAlert, setStrikeAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrikeAlert();
  }, []);

  const fetchStrikeAlert = async () => {
    try {
      const res = await api.get('/strike/current');
      if (res.data?.success && res.data.alert) {
        setStrikeAlert(res.data.alert);
      }
    } catch (err) {
      console.error('Fetch strike alert error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Loading strike alert status...
      </div>
    );
  }

  const alert = strikeAlert || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 printable-area">
        
        {/* Main Alert Header Banner */}
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden transition-all ${
          alert.is_active
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-red-500 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                alert.is_active ? 'bg-white text-red-700 animate-pulse shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {alert.is_active ? '⚠️ STRIKE ALERT ACTIVE' : 'NORMAL OPERATIONS'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors shadow-sm ${
                    alert.is_active
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" /> Print Official Notice
                </button>
              </div>
            </div>

            <h1 className={`text-2xl sm:text-4xl font-black leading-tight ${
              alert.is_active ? 'text-white' : 'text-slate-900'
            }`}>
              {alert.title}
            </h1>

            {/* Date, Time, Venue Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className={`rounded-2xl p-3 flex items-center gap-3 border ${
                alert.is_active ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <Clock className={`w-5 h-5 shrink-0 ${alert.is_active ? 'text-amber-300' : 'text-amber-600'}`} />
                <div>
                  <div className={`text-[10px] font-bold uppercase ${alert.is_active ? 'text-red-100' : 'text-slate-500'}`}>Date & Time</div>
                  <div className="text-xs font-black">{alert.strike_date} | {alert.strike_time}</div>
                </div>
              </div>

              <div className={`rounded-2xl p-3 flex items-center gap-3 sm:col-span-2 border ${
                alert.is_active ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <MapPin className={`w-5 h-5 shrink-0 ${alert.is_active ? 'text-amber-300' : 'text-red-600'}`} />
                <div>
                  <div className={`text-[10px] font-bold uppercase ${alert.is_active ? 'text-red-100' : 'text-slate-500'}`}>Protest / Assembly Venue</div>
                  <div className="text-xs font-black truncate">{alert.venue}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Point Charter of Demands */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">म.प्र. पश्चिम क्षेत्र विद्युत कर्मचारी संघ - मुख्य मांगें (Charter of Demands)</h2>
              <p className="text-xs text-slate-500">10-Point resolution submitted to MPWZ Management & Govt of Madhya Pradesh</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {alert.demands?.map((demand, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 hover:border-slate-300 transition-colors">
                <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  {demand}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Field Staff Instructions */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> महत्वपूर्ण निर्देश (Field Staff Directives)
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            {alert.instructions}
          </p>
        </div>

        {/* Emergency Helpline Contacts per Circle */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-amber-600" /> आपातकालीन सर्कल कंट्रोल रूम नंबर (Emergency Helplines)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alert.helpline_contacts?.map((contact, idx) => (
              <div key={idx} className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] text-amber-900/70 font-bold uppercase">{contact.circle}</div>
                <div className="text-sm font-black text-amber-800">{contact.contact}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notice Download Action */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-sm">Download Official MPWZ Union Strike Order</h4>
            <p className="text-xs text-slate-300">PDF document signed by General Secretary Er. Rajesh Sharma</p>
          </div>

          <a
            href={alert.notice_doc_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-md"
          >
            <Download className="w-4 h-4" /> Download Notice PDF (1.8 MB)
          </a>
        </div>

      </div>
    </div>
  );
};

export default StrikeAlerts;
