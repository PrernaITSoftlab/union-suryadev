import React, { useState, useEffect } from 'react';
import { QrCode, Copy, CheckCircle2, ShieldCheck, CreditCard, Download, ArrowRight, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const JoiningFee = () => {
  const [copied, setCopied] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [formData, setFormData] = useState({
    member_name: '',
    employee_id: '',
    circle: 'Indore City Circle',
    designation: 'Junior Engineer',
    fee_type: 'Annual Membership (₹500)',
    amount: 500,
    utr_number: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);
  const [joiningFeesList, setJoiningFeesList] = useState([]);
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
    'Mandsaur Circle',
    'Neemuch Circle',
    'Jhabua Circle',
    'Barwani Circle',
    'Burhanpur Circle',
    'Shajapur Circle'
  ];

  const designationsList = [
    'Superintending Engineer (SE)',
    'Executive Engineer (EE)',
    'Assistant Engineer (AE)',
    'Junior Engineer (JE)',
    'Line Superintendent (Grade I/II)',
    'Senior Lineman',
    'Lineman (Grade I/II)',
    'Line Attendant (Outsource/Contract)',
    'Senior Accountant',
    'Office Assistant / AG-III',
    'Substation Operator'
  ];

  const plans = [
    {
      id: 'annual',
      name: 'Annual Membership Fee',
      amount: 500,
      description: 'Standard 1-year MPWZ Union active membership & legal support.',
      badge: 'POPULAR'
    },
    {
      id: 'lifetime',
      name: 'Lifetime Membership Fee',
      amount: 2500,
      description: 'Permanent lifetime union membership & Mutual Benefit Fund eligibility.',
      badge: 'BEST VALUE'
    },
    {
      id: 'monthly',
      name: 'Monthly Union Dues',
      amount: 50,
      description: 'Regular monthly subscription contribution for active members.',
      badge: 'SUBSCRIPTION'
    }
  ];

  useEffect(() => {
    fetchFeesList();
  }, []);

  const fetchFeesList = async () => {
    try {
      const res = await api.get('/payments/joining-fee/list');
      if (res.data?.success) {
        setJoiningFeesList(res.data.joiningFees || []);
      }
    } catch (err) {
      console.error('Fetch fees list failed:', err);
    }
  };

  const upiId = settings?.upi_id || 'mpvidyut@sbi';
  const qrCodeUrl = settings?.registration_qr_url || '/images/payment-qr.png';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);
    setFormData(prev => ({
      ...prev,
      fee_type: `${plan.name} (₹${plan.amount})`,
      amount: plan.amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.member_name || !formData.employee_id || !formData.utr_number) {
      setError('Please fill in Member Name, Employee ID, and UTR number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/joining-fee/submit', formData);
      if (res.data?.success) {
        setSubmittedReceipt(res.data.payment);
        fetchFeesList();
      } else {
        setError(res.data?.message || 'Submission failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <QrCode className="w-4 h-4 text-blue-600" /> MPWZ Union Official Payment Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            MPWZ Union Membership Joining Fee
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Pay your MPWZ Union annual or lifetime joining fee via UPI QR code. Submit your transaction UTR reference number to receive your digital receipt immediately.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className={`bg-white p-6 rounded-3xl border cursor-pointer transition-all relative shadow-sm ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-md">
                    {plan.badge}
                  </span>
                )}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">₹{plan.amount}</span>
                    <span className="text-xs text-slate-500 font-semibold">/ INR</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {plan.description}
                  </p>
                  <button
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-4 h-4" /> : null}
                    {isSelected ? 'Selected Plan' : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* QR Code & Payment Instructions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* QR Code Box */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Scan to Pay via Any UPI App</span>
              <h3 className="text-lg font-bold text-slate-900">₹{formData.amount} - {formData.fee_type.split('(')[0]}</h3>
            </div>

            {/* QR Frame */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-md relative group">
              <img
                src={qrCodeUrl}
                alt="MPWZ Union Payment UPI QR Code"
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-lg shadow-lg">GPay / PhonePe / Paytm</span>
              </div>
            </div>

            {/* Copy UPI ID */}
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

            {/* Accepted UPI Apps logos list */}
            <div className="pt-1 text-xs text-slate-500">
              Accepted: <span className="text-slate-800 font-bold">Google Pay, PhonePe, Paytm, BHIM UPI, Amazon Pay</span>
            </div>
          </div>

          {/* Payment Confirmation Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            {submittedReceipt ? (
              <div className="space-y-6 printable-area">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-sm">Payment Confirmation Submitted Successfully!</h4>
                    <p className="text-xs text-emerald-700">Your UTR has been logged for verification by the Union Treasurer.</p>
                  </div>
                </div>

                {/* Digital Receipt Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <div className="text-xs text-slate-500">Official Receipt No.</div>
                      <div className="text-base font-black text-blue-700">{submittedReceipt.receipt_no}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      {submittedReceipt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block font-semibold">Member Name</span>
                      <span className="text-slate-900 font-bold">{submittedReceipt.member_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Employee ID</span>
                      <span className="text-slate-900 font-bold">{submittedReceipt.employee_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Circle Office</span>
                      <span className="text-slate-900 font-bold">{submittedReceipt.circle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Designation</span>
                      <span className="text-slate-900 font-bold">{submittedReceipt.designation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Fee Type</span>
                      <span className="text-blue-700 font-bold">{submittedReceipt.fee_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Amount Paid</span>
                      <span className="text-emerald-700 font-black text-sm">₹{submittedReceipt.amount}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block font-semibold">UPI UTR / Ref No.</span>
                      <span className="text-slate-900 font-mono font-bold bg-white border border-slate-200 px-2.5 py-1 rounded inline-block shadow-sm">
                        {submittedReceipt.utr_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4" /> Print / Save Receipt PDF
                  </button>
                  <button
                    onClick={() => setSubmittedReceipt(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs hover:bg-slate-200"
                  >
                    Submit Another Payment
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> Payment Confirmation Form
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    After scanning QR and completing payment on your UPI app, fill in your transaction details below.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Employee / Member Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Er. Rajesh Sharma"
                      value={formData.member_name}
                      onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Employee ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MPWZ-IND-104"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Circle Office *</label>
                    <select
                      value={formData.circle}
                      onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {circlesList.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Designation *</label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {designationsList.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">UPI UTR / 12-Digit Reference Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 426819203847 or UTR98765432101"
                      value={formData.utr_number}
                      onChange={(e) => setFormData({ ...formData, utr_number: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Find the 12-digit UTR/Ref number in your GPay / PhonePe / Paytm payment receipt details.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {loading ? 'Submitting Payment...' : `Submit Payment Confirmation (₹${formData.amount})`}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Verified Members Joining Fee History */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Recent Member Joining Fee Submissions</span>
            <span className="text-xs text-slate-500 font-normal">{joiningFeesList.length} Records</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Receipt No</th>
                  <th className="px-4 py-3">Member Name</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Circle</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {joiningFeesList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-blue-700 font-bold">{item.receipt_no}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.member_name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{item.employee_id}</td>
                    <td className="px-4 py-3">{item.circle}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">₹{item.amount}</td>
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

export default JoiningFee;
