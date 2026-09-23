import React, { useState } from 'react';
import { UserPlus, QrCode, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, FileText, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function JoinNow() {
  const { settings } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    father_husband_name: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    whatsapp: '',
    email: '',
    address: '',
    city: 'Indore',
    district: 'Indore',
    state: 'Madhya Pradesh',
    pin_code: '452001',
    occupation: 'Discom Service',
    company: 'MP West Zone Electricity Discom',
    designation: 'Line Staff / Engineer',
    union_info: '',
    profile_photo_url: '',
    identity_doc_url: '',
    additional_doc_url: '',
    emergency_contact: '',
    terms_accepted: false,
    transaction_id: '',
    payment_proof_url: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_note: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  const regFee = settings?.registration_fee || 500;
  const qrUrl = settings?.registration_qr_url || '/images/payment-qr.png';
  const whatsappNo = settings?.payment_whatsapp_number || '+91 98260 11223';

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!formData.terms_accepted) {
      setFeedback({ error: 'Please accept the Union Membership Terms and Declaration to proceed.' });
      return;
    }
    setFeedback(null);
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.transaction_id) {
      setFeedback({ error: 'Transaction ID / UTR Number is required for verification.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.post('/membership-applications/submit', formData);
      if (res.data.success) {
        setSubmittedApplication(res.data.application);
        setStep(3);
      }
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to submit application.' });
    } finally {
      setSubmitting(false);
    }
  };

  const cleanPhone = whatsappNo.replace(/[^0-9]/g, '');
  const waMsg = encodeURIComponent(`*MPWZ UNION MEMBERSHIP PAYMENT PROOF*\nName: ${formData.full_name}\nMobile: ${formData.mobile}\nUTR: ${formData.transaction_id || 'N/A'}\nAmount: ₹${regFee}\nPlease verify my membership application. Thank you!`);
  const waLink = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${waMsg}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <UserPlus className="w-3.5 h-3.5 text-amber-700" />
            <span>Union Membership Application</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Apply to Join MP West Zone Electricity Union
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Fill in your personal, employment, and payment details below. Applications are reviewed by Admin for verification and user account generation.
          </p>
        </div>

        {/* Progress Tracker Bar */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold border-b border-slate-200 pb-6">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-500'}`}>1</span>
            <span>Personal & Work Details</span>
          </div>
          <span className="text-slate-300">• • •</span>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span>QR Payment & UTR</span>
          </div>
          <span className="text-slate-300">• • •</span>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-500 text-white font-extrabold' : 'bg-slate-200 text-slate-500'}`}>3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {feedback?.error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{feedback.error}</span>
          </div>
        )}

        {/* STEP 1: Application Form */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-amber-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                1. Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (पूरा नाम) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Er. Rajesh Sharma"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Father / Husband Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Shri O. P. Sharma"
                    value={formData.father_husband_name}
                    onChange={(e) => setFormData({ ...formData, father_husband_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98260 00000"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Address */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-extrabold text-amber-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                2. Contact & Address Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98260 11223"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="+91 98260 11223"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Street, Colony, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Circle</label>
                  <input
                    type="text"
                    placeholder="Indore / Ujjain"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="452001"
                    value={formData.pin_code}
                    onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Employment & Union Information */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-extrabold text-amber-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                3. Employment & Discom Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Discom</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    placeholder="Junior Engineer / Lineman"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.profile_photo_url}
                    onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Union Notes / Discom Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Any prior union contribution, circle details, or grievance notes..."
                  value={formData.union_info}
                  onChange={(e) => setFormData({ ...formData, union_info: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Terms Declaration */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                required
                checked={formData.terms_accepted}
                onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                className="mt-1 accent-amber-600 w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-700 leading-relaxed cursor-pointer font-medium">
                I hereby declare that the information provided above is accurate. I agree to abide by the Constitution, Safety By-laws, and Agitation Guidelines of the MP West Zone Electricity Discom Employees Union.
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Proceed to Registration QR Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: QR Payment & UTR Submission */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Step 2: Registration Payment</span>
              <h2 className="text-2xl font-bold text-slate-900">Scan QR Code & Submit UTR Reference</h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto font-medium">
                Pay the annual union registration fee of <span className="text-slate-900 font-extrabold">₹{regFee}</span> using any UPI app (GPay, PhonePe, Paytm, BHIM).
              </p>
            </div>

            {/* QR Card */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <img src={qrUrl} alt="Union Registration Payment QR" className="w-56 h-56 object-contain" />
                <span className="text-xs text-slate-900 font-extrabold font-mono mt-2">UPI ID: {settings?.upi_id || 'mpvidyut@sbi'}</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 font-mono shadow-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Applicant Name:</span>
                    <span className="text-slate-900 font-bold">{formData.full_name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Registration Fee:</span>
                    <span className="text-amber-700 font-bold text-sm">₹{regFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>UPI ID:</span>
                    <span className="text-sky-700 font-bold">{settings?.upi_id || 'mpvidyut@sbi'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Account Name:</span>
                    <span className="text-slate-800 font-bold">{settings?.account_name || 'MP VIDYUT MANDAL ARAKSHIT VAR'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Bank:</span>
                    <span className="text-slate-800">{settings?.bank_name || 'State Bank of India'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block">Payment Instructions:</span>
                  <ol className="list-decimal list-inside text-slate-600 space-y-1 text-[11px] leading-relaxed font-medium">
                    <li>Scan the QR code above or send ₹{regFee} to <code className="text-amber-800 font-bold">{settings?.upi_id || 'mpvidyut@sbi'}</code>.</li>
                    <li>Copy the 12-digit UTR / Transaction Ref Number from your UPI receipt.</li>
                    <li>Paste the UTR number below and submit.</li>
                  </ol>
                </div>

                {/* WhatsApp Action Button */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Proof via WhatsApp ({whatsappNo})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* UTR Input Form */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction ID / UTR Number <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR98765432101"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Proof Screenshot URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.payment_proof_url}
                    onChange={(e) => setFormData({ ...formData, payment_proof_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Back to Details
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-3.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{submitting ? 'Submitting Application...' : 'Submit Final Membership Application'}</span>
              </button>
            </div>

          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && submittedApplication && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Membership Application Submitted!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
                Your application <span className="font-mono text-amber-700 font-bold">{submittedApplication.application_no}</span> has been received by the Union Admin Office.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-left space-y-2 font-mono shadow-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="text-slate-900 font-bold">{submittedApplication.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application No:</span>
                <span className="text-amber-700 font-bold">{submittedApplication.application_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction UTR:</span>
                <span className="text-sky-700 font-bold">{submittedApplication.transaction_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="text-amber-700 uppercase font-bold">{submittedApplication.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application Status:</span>
                <span className="text-amber-700 uppercase font-bold">{submittedApplication.application_status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
              Once Admin verifies your payment UTR, they will activate your account. You will be able to log in with your credentials.
            </p>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Back to Home Page
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              >
                Go to Member Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
