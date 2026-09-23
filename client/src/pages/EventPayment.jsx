import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Calendar, MapPin, CheckCircle2, Copy, Check, Download, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const EventPayment = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    member_name: '',
    employee_id: '',
    circle: 'Indore City Circle',
    utr_number: ''
  });

  const [loading, setLoading] = useState(false);
  const [confirmedPass, setConfirmedPass] = useState(null);
  const [eventPaymentsList, setEventPaymentsList] = useState([]);
  const [error, setError] = useState('');

  const circlesList = [
    'Indore City Circle',
    'Indore Corporate HQ',
    'Indore O&M Circle',
    'Ujjain Circle',
    'Dewas Circle',
    'Ratlam Circle',
    'Dhar Circle',
    'Khargone Circle',
    'Khandwa Circle',
    'Mandsaur Circle'
  ];

  useEffect(() => {
    fetchEventsAndPayments();
  }, []);

  const fetchEventsAndPayments = async () => {
    try {
      const [eventsRes, paymentsRes] = await Promise.all([
        api.get('/events'),
        api.get('/payments/event-payment/list')
      ]);

      if (eventsRes.data?.success) {
        setEvents(eventsRes.data.events || []);
        if (eventsRes.data.events?.length > 0) {
          setSelectedEvent(eventsRes.data.events[0]);
        }
      }
      if (paymentsRes.data?.success) {
        setEventPaymentsList(paymentsRes.data.eventPayments || []);
      }
    } catch (err) {
      console.error('Fetch event data error:', err);
    }
  };

  const upiId = settings?.upi_id || 'mpvidyut@sbi';
  const qrCodeUrl = selectedEvent?.payment_qr_url || settings?.default_event_qr_url || '/images/payment-qr.png';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedEvent) {
      setError('Please select an event.');
      return;
    }
    if (!formData.member_name || !formData.employee_id || !formData.utr_number) {
      setError('Please fill in Member Name, Employee ID, and UTR number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        event_id: selectedEvent.id,
        event_title: selectedEvent.title,
        member_name: formData.member_name,
        employee_id: formData.employee_id,
        circle: formData.circle,
        amount: selectedEvent.fee_amount,
        utr_number: formData.utr_number
      };

      const res = await api.post('/payments/event-payment/submit', payload);
      if (res.data?.success) {
        setConfirmedPass(res.data.payment);
        fetchEventsAndPayments();
      } else {
        setError(res.data?.message || 'Payment submission failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider shadow-sm">
            <CreditCard className="w-4 h-4 text-amber-600" /> MPWZ Union Event Registration & Payment
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Union Event Fee Payment & Delegate Pass
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Select an upcoming MPWZ Union conference, workshop, or agitation delegate meet. Pay the registration contribution fee via UPI QR code to receive your entry delegate pass code.
          </p>
        </div>

        {/* Event Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isSelected = selectedEvent?.id === evt.id;
            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`bg-white p-5 rounded-3xl border cursor-pointer transition-all relative flex flex-col justify-between shadow-sm ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {evt.circle || 'All Circles'}
                    </span>
                    <span className="text-base font-black text-amber-700">
                      {evt.fee_amount > 0 ? `₹${evt.fee_amount}` : 'FREE'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{evt.title}</h3>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{evt.event_date} ({evt.event_time})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <button
                  className={`w-full mt-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {isSelected ? <CheckCircle2 className="w-4 h-4" /> : null}
                  {isSelected ? 'Selected Event' : 'Select Event'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Event Payment Section */}
        {selectedEvent && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Dynamic Event QR Code Card */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Dynamic Event UPI QR Code</span>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{selectedEvent.title}</h3>
                <div className="text-xl font-black text-amber-700">Fee: ₹{selectedEvent.fee_amount}</div>
              </div>

              {/* QR Image */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-md relative">
                <img
                  src={qrCodeUrl}
                  alt="MPWZ Event Fee Payment QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto"
                />
              </div>

              {/* UPI ID Copy */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="text-left truncate">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Union Official UPI ID</div>
                  <div className="text-xs font-extrabold text-blue-700 truncate">{upiId}</div>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Event Delegate Payment Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              {confirmedPass ? (
                <div className="space-y-6 printable-area">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-sm">Event Delegate Pass Confirmed!</h4>
                      <p className="text-xs text-emerald-700">Show this digital pass code at the entry gate.</p>
                    </div>
                  </div>

                  {/* Delegate Pass Card */}
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-[10px] text-amber-400 uppercase font-bold">Delegate Pass Code</div>
                        <div className="text-xl font-black text-white tracking-widest">{confirmedPass.pass_code}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {confirmedPass.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="col-span-2">
                        <span className="text-slate-400 block font-semibold">Event Title</span>
                        <span className="text-white font-bold">{confirmedPass.event_title}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Delegate Name</span>
                        <span className="text-white font-bold">{confirmedPass.member_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Employee ID</span>
                        <span className="text-white font-bold">{confirmedPass.employee_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Circle</span>
                        <span className="text-white font-bold">{confirmedPass.circle}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Amount Paid</span>
                        <span className="text-amber-400 font-black text-sm">₹{confirmedPass.amount}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block font-semibold">UPI UTR Ref No.</span>
                        <span className="text-white font-mono bg-slate-950 border border-slate-800 px-2.5 py-1 rounded inline-block font-bold">
                          {confirmedPass.utr_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-600 shadow-md transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download Delegate Pass PDF
                    </button>
                    <button
                      onClick={() => setConfirmedPass(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs hover:bg-slate-200"
                    >
                      New Event Registration
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-amber-600" /> Event Delegate Payment Confirmation
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submit your payment UTR reference to generate your official event entrance pass.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> {error}
                    </div>
                  )}

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Delegate / Member Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Er. Sunita Chouhan"
                        value={formData.member_name}
                        onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Employee ID *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MPWZ-IND-104"
                          value={formData.employee_id}
                          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Circle Office *</label>
                        <select
                          value={formData.circle}
                          onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        >
                          {circlesList.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">12-Digit UPI UTR / Ref No *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. UTR11223344556"
                        value={formData.utr_number}
                        onChange={(e) => setFormData({ ...formData, utr_number: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {loading ? 'Confirming Registration...' : `Confirm Event Payment (₹${selectedEvent.fee_amount})`}
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* Recent Confirmed Event Payments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Confirmed Event Delegate Passes</span>
            <span className="text-xs text-slate-500 font-normal">{eventPaymentsList.length} Registered</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Pass Code</th>
                  <th className="px-4 py-3">Member Name</th>
                  <th className="px-4 py-3">Event Title</th>
                  <th className="px-4 py-3">Circle</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventPaymentsList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-amber-700 font-bold">{item.pass_code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.member_name}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{item.event_title}</td>
                    <td className="px-4 py-3">{item.circle}</td>
                    <td className="px-4 py-3 font-bold text-amber-700">₹{item.amount}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventPayment;
