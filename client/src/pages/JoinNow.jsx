import React, { useState } from 'react';
import { UserPlus, QrCode, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, FileText, Phone, MessageSquare, ExternalLink, Building2, MapPin, User, Calendar, Award, Receipt, Heart, CreditCard } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const COMPANIES = [
  "MP West Zone Electricity Discom (म.प्र. पश्चिम क्षेत्र विद्युत वितरण कं. लि.)",
  "MP East Zone Electricity Discom (म.प्र. पूर्व क्षेत्र विद्युत वितरण कं. लि.)",
  "MP Central Zone Electricity Discom (म.प्र. मध्य क्षेत्र विद्युत वितरण कं. लि.)",
  "MP Power Generating Co. Ltd. (MPPGCL)",
  "MP Power Transmission Co. Ltd. (MPPTCL)",
  "MPSEB (म.प्र. राज्य विद्युत मंडल)",
  "Other Discom / Company"
];

const DISTRICTS = [
  "Indore (इन्दौर)",
  "Ujjain (उज्जैन)",
  "Dewas (देवास)",
  "Dhar (धार)",
  "Khargone / West Nimar (खरगौन)",
  "Khandwa / East Nimar (खंडवा)",
  "Burhanpur (बुरहानपुर)",
  "Barwani (बड़वानी)",
  "Ratlam (रतलाम)",
  "Mandsaur (मंदसौर)",
  "Neemuch (नीमच)",
  "Jhabua (झाबुआ)",
  "Alirajpur (अलीराजपुर)",
  "Bhopal (भोपाल)",
  "Gwalior (ग्वालियर)",
  "Jabalpur (जबलपुर)",
  "Sagar (सागर)",
  "Rewa (रीवा)",
  "Satna (सतना)",
  "Other District"
];

const POSTS = [
  "Junior Engineer (JE) / कनिष्ठ अभियंता",
  "Assistant Engineer (AE) / सहायक अभियंता",
  "Executive Engineer (EE) / कार्यपालन अभियंता",
  "Sub-Engineer / उप-अभियंता",
  "Line Staff / Lineman / लाइनमैन",
  "Testing Assistant / Engineer / परीक्षण सहायक",
  "Office Assistant / Clerk / कार्यालय सहायक",
  "Computer Operator / कंप्यूटर ऑपरेटर",
  "Accountant / लेखापाल",
  "Class 4 Staff / चतुर्थ श्रेणी कर्मचारी",
  "Other Post"
];

const JOINING_YEARS = Array.from({ length: 47 }, (_, i) => String(2026 - i));
const MEMBERSHIP_YEARS = ["2026-2027", "2025-2026", "2024-2025", "2023-2024"];

export default function JoinNow() {
  const { settings } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // 1. Name of Company * — dropdown
    company_name: COMPANIES[0],
    // 2. Name of District * — dropdown
    district_name: DISTRICTS[0],
    // 3. Circle Name — text input
    circle_name: '',
    // 4. Division Name — text input
    division_name: '',
    // 5. Office Name (DC/Zone/etc.) * — text input
    office_name: '',
    // 6. Joining Year (किस वर्ष में नौकरी ज्वाइन की) — dropdown
    joining_year: '',
    // 7. Your Name * — text input
    full_name: '',
    // 8. Father’s Name * — text input
    father_name: '',
    // 9. Name of Post * — dropdown
    post_name: POSTS[0],
    // 10. Post in Department (विभाग में पद) — text input
    dept_post: '',
    // 11. Post in Union (Member, etc.) (संगठन में पद) — text input
    union_post: 'Member',
    // 12. Mobile Number (CUG) (Official) — phone input
    cug_mobile: '',
    // 13. Mobile Number (WhatsApp) (Personal) * — phone input
    whatsapp_mobile: '',
    // 14. Year of Membership * — radio/select
    membership_year: '2026-2027',
    // 15. Membership Rs-60/- * — radio option
    membership_fee_status: 'Paid (₹60 जमा है)',
    // 16. Date of Membership Receipt (Rs-60) (सदस्यता राशि दिनांक) * — date picker
    membership_receipt_date: new Date().toISOString().split('T')[0],
    // 17. Membership Receipt Number (Rs-60) (सदस्यता रसीद नंबर) * — text input
    membership_receipt_no: '',
    // 18. Donation Amount — number input
    donation_amount: '',
    // 19. Date of Donation Receipt Number (सहयोग राशि रसीद की दिनांक) — date picker
    donation_receipt_date: '',
    // 20. Donation Receipt Number (सहयोग राशि रसीद नंबर) * — text input
    donation_receipt_no: '',
    // 21. Name (By reference) (रेफरेंस कराने वाले पदाधिकारी/सदस्य का नाम) * — text input
    reference_name: '',

    // Terms & Payment details
    terms_accepted: false,
    transaction_id: '',
    payment_proof_url: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_note: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  const regFee = settings?.registration_fee || 60;
  const qrUrl = settings?.registration_qr_url || '/images/payment-qr.png';
  const whatsappNo = settings?.payment_whatsapp_number || '+91 98260 11223';

  // Field change handler
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Step 1 Validation & Proceed
  const handleStep1Submit = (e) => {
    e.preventDefault();
    const errors = {};

    // 1. Company Name *
    if (!formData.company_name) errors.company_name = 'Name of Company is required.';
    // 2. District Name *
    if (!formData.district_name) errors.district_name = 'Name of District is required.';
    // 5. Office Name *
    if (!formData.office_name || !formData.office_name.trim()) errors.office_name = 'Office Name (DC/Zone/etc.) is required.';
    // 7. Your Name *
    if (!formData.full_name || formData.full_name.trim().length < 2) errors.full_name = 'Your Name is required (at least 2 characters).';
    // 8. Father's Name *
    if (!formData.father_name || formData.father_name.trim().length < 2) errors.father_name = "Father's Name is required.";
    // 9. Name of Post *
    if (!formData.post_name) errors.post_name = 'Name of Post is required.';
    
    // 12. CUG Mobile (Optional format check)
    const cleanCug = formData.cug_mobile.replace(/\D/g, '');
    if (formData.cug_mobile && cleanCug.length !== 10) {
      errors.cug_mobile = 'CUG Mobile Number must be 10 digits.';
    }

    // 13. Mobile Number (WhatsApp) * (Required 10 digits)
    const cleanWa = formData.whatsapp_mobile.replace(/\D/g, '');
    if (!formData.whatsapp_mobile || cleanWa.length !== 10) {
      errors.whatsapp_mobile = 'Valid 10-digit WhatsApp Mobile Number is required.';
    }

    // 14. Year of Membership *
    if (!formData.membership_year) errors.membership_year = 'Year of Membership is required.';
    // 15. Membership Rs-60/- *
    if (!formData.membership_fee_status) errors.membership_fee_status = 'Membership Fee Rs-60 status is required.';
    // 16. Date of Membership Receipt (Rs-60) *
    if (!formData.membership_receipt_date) errors.membership_receipt_date = 'Date of Membership Receipt is required.';
    // 17. Membership Receipt Number (Rs-60) *
    if (!formData.membership_receipt_no || !formData.membership_receipt_no.trim()) errors.membership_receipt_no = 'Membership Receipt Number (Rs-60) is required.';

    // 18. Donation Amount (Optional validation)
    if (formData.donation_amount && Number(formData.donation_amount) < 0) {
      errors.donation_amount = 'Donation amount cannot be negative.';
    }

    // 20. Donation Receipt Number *
    if (!formData.donation_receipt_no || !formData.donation_receipt_no.trim()) {
      errors.donation_receipt_no = 'Donation Receipt Number is required.';
    }

    // 21. Name (By reference) *
    if (!formData.reference_name || !formData.reference_name.trim()) {
      errors.reference_name = 'Name (By reference) of official/member is required.';
    }

    // Terms check
    if (!formData.terms_accepted) {
      errors.terms_accepted = 'You must accept the Union Declaration to proceed.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFeedback({ error: 'Please correct the highlighted errors in the form before proceeding.' });
      window.scrollTo({ top: 250, behavior: 'smooth' });
      return;
    }

    setFieldErrors({});
    setFeedback(null);
    setStep(2);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Step 2 Final Submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.transaction_id || !formData.transaction_id.trim()) {
      setFeedback({ error: 'Transaction ID / UTR Number is required for verification.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        ...formData,
        full_name: formData.full_name.trim(),
        father_name: formData.father_name.trim(),
        whatsapp_mobile: formData.whatsapp_mobile.trim(),
        mobile: formData.whatsapp_mobile.trim()
      };

      const res = await api.post('/membership-applications/submit', payload);
      if (res.data.success) {
        setSubmittedApplication(res.data.application);
        setStep(3);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const cleanPhone = whatsappNo.replace(/[^0-9]/g, '');
  const waMsg = encodeURIComponent(`*MPWZ UNION MEMBERSHIP REGISTRATION*\nName: ${formData.full_name}\nDistrict: ${formData.district_name}\nReceipt No: ${formData.membership_receipt_no}\nUTR: ${formData.transaction_id || 'N/A'}\nPlease verify my membership application. Thank you!`);
  const waLink = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${waMsg}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <UserPlus className="w-3.5 h-3.5 text-amber-700" />
            <span>Union Membership Form • सदस्यता फॉर्म</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Apply to Join MP West Zone Electricity Union
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Please fill out all required fields marked with <span className="text-red-500 font-bold">*</span> accurately. Applications are verified by Union Admin.
          </p>
        </div>

        {/* Progress Tracker Bar */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs font-bold border-b border-slate-200 pb-5">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-500'}`}>1</span>
            <span>Member Details</span>
          </div>
          <span className="text-slate-300">• • •</span>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span>Payment & UTR</span>
          </div>
          <span className="text-slate-300">• • •</span>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-500 text-white font-extrabold' : 'bg-slate-200 text-slate-500'}`}>3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback?.error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-semibold animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{feedback.error}</span>
          </div>
        )}

        {/* STEP 1: Application Form (Fields 1 to 21 in Exact Order) */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-sm">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>Membership Form Fields (1 to 21)</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">* Required Fields</span>
            </div>

            {/* Grid for 21 Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 1. Name of Company * — dropdown */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Name of Company <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.company_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                >
                  {COMPANIES.map((comp, idx) => (
                    <option key={idx} value={comp}>{comp}</option>
                  ))}
                </select>
                {fieldErrors.company_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.company_name}</p>}
              </div>

              {/* 2. Name of District * — dropdown */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Name of District <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district_name}
                  onChange={(e) => handleChange('district_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.district_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                >
                  {DISTRICTS.map((dist, idx) => (
                    <option key={idx} value={dist}>{dist}</option>
                  ))}
                </select>
                {fieldErrors.district_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.district_name}</p>}
              </div>

              {/* 3. Circle Name — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Circle Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indore Circle / Ujjain Circle"
                  value={formData.circle_name}
                  onChange={(e) => handleChange('circle_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* 4. Division Name — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. Division Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. West Division / North Division"
                  value={formData.division_name}
                  onChange={(e) => handleChange('division_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* 5. Office Name (DC/Zone/etc.) * — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  5. Office Name (DC/Zone/etc.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DC Annapurna / Zone 1 Office"
                  value={formData.office_name}
                  onChange={(e) => handleChange('office_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.office_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                />
                {fieldErrors.office_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.office_name}</p>}
              </div>

              {/* 6. Joining Year (किस वर्ष में नौकरी ज्वाइन की) — dropdown */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6. Joining Year (किस वर्ष में नौकरी ज्वाइन की)
                </label>
                <select
                  value={formData.joining_year}
                  onChange={(e) => handleChange('joining_year', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Select Joining Year --</option>
                  {JOINING_YEARS.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              {/* 7. Your Name * — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  7. Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar Sharma"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.full_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                />
                {fieldErrors.full_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.full_name}</p>}
              </div>

              {/* 8. Father’s Name * — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  8. Father’s Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shri O. P. Sharma"
                  value={formData.father_name}
                  onChange={(e) => handleChange('father_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.father_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                />
                {fieldErrors.father_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.father_name}</p>}
              </div>

              {/* 9. Name of Post * — dropdown */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  9. Name of Post <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.post_name}
                  onChange={(e) => handleChange('post_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.post_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                >
                  {POSTS.map((pst, idx) => (
                    <option key={idx} value={pst}>{pst}</option>
                  ))}
                </select>
                {fieldErrors.post_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.post_name}</p>}
              </div>

              {/* 10. Post in Department (विभाग में पद) — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  10. Post in Department (विभाग में पद)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Lineman / Shift In-Charge"
                  value={formData.dept_post}
                  onChange={(e) => handleChange('dept_post', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* 11. Post in Union (Member, etc.) (संगठन में पद) — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  11. Post in Union (Member, etc.) (संगठन में पद)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Member / District Vice President"
                  value={formData.union_post}
                  onChange={(e) => handleChange('union_post', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* 12. Mobile Number (CUG) (Official) — phone input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  12. Mobile Number (CUG) (Official)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9425000000"
                  value={formData.cug_mobile}
                  onChange={(e) => handleChange('cug_mobile', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.cug_mobile ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono`}
                />
                {fieldErrors.cug_mobile && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.cug_mobile}</p>}
              </div>

              {/* 13. Mobile Number (WhatsApp) (Personal) * — phone input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  13. Mobile Number (WhatsApp) (Personal) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9826011223"
                  value={formData.whatsapp_mobile}
                  onChange={(e) => handleChange('whatsapp_mobile', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.whatsapp_mobile ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono`}
                />
                {fieldErrors.whatsapp_mobile && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.whatsapp_mobile}</p>}
              </div>

              {/* 14. Year of Membership * — radio/select */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  14. Year of Membership <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {MEMBERSHIP_YEARS.map((yr) => (
                    <label key={yr} className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer font-medium bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-amber-400">
                      <input
                        type="radio"
                        name="membership_year"
                        value={yr}
                        checked={formData.membership_year === yr}
                        onChange={(e) => handleChange('membership_year', e.target.value)}
                        className="accent-amber-600 w-3.5 h-3.5"
                      />
                      <span>{yr}</span>
                    </label>
                  ))}
                </div>
                {fieldErrors.membership_year && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.membership_year}</p>}
              </div>

              {/* 15. Membership Rs-60/- * — radio option */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  15. Membership Rs-60/- <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-800 cursor-pointer font-medium bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg text-amber-900">
                    <input
                      type="radio"
                      name="membership_fee_status"
                      value="Paid (₹60 जमा है)"
                      checked={formData.membership_fee_status === 'Paid (₹60 जमा है)'}
                      onChange={(e) => handleChange('membership_fee_status', e.target.value)}
                      className="accent-amber-600 w-3.5 h-3.5"
                    />
                    <span>Paid (₹60 जमा है)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-800 cursor-pointer font-medium bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <input
                      type="radio"
                      name="membership_fee_status"
                      value="Pending (जमा करना शेष है)"
                      checked={formData.membership_fee_status === 'Pending (जमा करना शेष है)'}
                      onChange={(e) => handleChange('membership_fee_status', e.target.value)}
                      className="accent-amber-600 w-3.5 h-3.5"
                    />
                    <span>Pending</span>
                  </label>
                </div>
                {fieldErrors.membership_fee_status && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.membership_fee_status}</p>}
              </div>

              {/* 16. Date of Membership Receipt (Rs-60) (सदस्यता राशि दिनांक) * — date picker */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  16. Date of Membership Receipt (Rs-60) (सदस्यता राशि दिनांक) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.membership_receipt_date}
                  onChange={(e) => handleChange('membership_receipt_date', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.membership_receipt_date ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                />
                {fieldErrors.membership_receipt_date && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.membership_receipt_date}</p>}
              </div>

              {/* 17. Membership Receipt Number (Rs-60) (सदस्यता रसीद नंबर) * — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  17. Membership Receipt Number (Rs-60) (सदस्यता रसीद नंबर) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. RCP-60-2026-0012"
                  value={formData.membership_receipt_no}
                  onChange={(e) => handleChange('membership_receipt_no', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.membership_receipt_no ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                />
                {fieldErrors.membership_receipt_no && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.membership_receipt_no}</p>}
              </div>

              {/* 18. Donation Amount — number input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  18. Donation Amount (सहयोग राशि रुपये)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={formData.donation_amount}
                  onChange={(e) => handleChange('donation_amount', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.donation_amount ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                />
                {fieldErrors.donation_amount && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.donation_amount}</p>}
              </div>

              {/* 19. Date of Donation Receipt Number (सहयोग राशि रसीद की दिनांक) — date picker */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  19. Date of Donation Receipt Number (सहयोग राशि रसीद की दिनांक)
                </label>
                <input
                  type="date"
                  value={formData.donation_receipt_date}
                  onChange={(e) => handleChange('donation_receipt_date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* 20. Donation Receipt Number (सहयोग राशि रसीद नंबर) * — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  20. Donation Receipt Number (सहयोग राशि रसीद नंबर) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DON-2026-0045"
                  value={formData.donation_receipt_no}
                  onChange={(e) => handleChange('donation_receipt_no', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.donation_receipt_no ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                />
                {fieldErrors.donation_receipt_no && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.donation_receipt_no}</p>}
              </div>

              {/* 21. Name (By reference) (रेफरेंस कराने वाले पदाधिकारी/सदस्य का नाम) * — text input */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  21. Name (By reference) (रेफरेंस कराने वाले पदाधिकारी/सदस्य का नाम) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Er. Suresh Sharma (District President / Delegate)"
                  value={formData.reference_name}
                  onChange={(e) => handleChange('reference_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.reference_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium`}
                />
                {fieldErrors.reference_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.reference_name}</p>}
              </div>

            </div>

            {/* Terms Declaration */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms_accepted}
                onChange={(e) => handleChange('terms_accepted', e.target.checked)}
                className="mt-1 accent-amber-600 w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-amber-950 leading-relaxed cursor-pointer font-medium">
                I hereby declare that all provided details (Fields 1-21) are correct and genuine. I agree to abide by the Constitution, Rules, and Agitation Guidelines of the MP West Zone Electricity Discom Employees Union.
              </label>
            </div>
            {fieldErrors.terms_accepted && (
              <p className="text-xs text-red-600 font-semibold">{fieldErrors.terms_accepted}</p>
            )}

            {/* Submit Step 1 Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Proceed to Registration QR Payment & UTR Entry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: QR Payment & UTR Submission */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Step 2: Registration Verification</span>
              <h2 className="text-2xl font-bold text-slate-900">Scan Union QR Code & Enter UTR Reference</h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto font-medium">
                Pay the annual union registration fee of <span className="text-slate-900 font-extrabold">₹{regFee}</span> via UPI (GPay, PhonePe, Paytm, BHIM) and enter your transaction UTR number.
              </p>
            </div>

            {/* Form Fields Summary Pill */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-medium">
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                <div><span className="text-slate-500">Applicant:</span> <strong className="text-slate-900">{formData.full_name}</strong></div>
                <div><span className="text-slate-500">Father:</span> <strong className="text-slate-900">{formData.father_name}</strong></div>
                <div><span className="text-slate-500">District:</span> <strong className="text-amber-800">{formData.district_name}</strong></div>
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-600">
                <div><span>Receipt No:</span> <strong>{formData.membership_receipt_no}</strong></div>
                <div><span>Receipt Date:</span> <strong>{formData.membership_receipt_date}</strong></div>
                <div><span>Referred By:</span> <strong>{formData.reference_name}</strong></div>
              </div>
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
                </div>

                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Details via WhatsApp ({whatsappNo})</span>
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
                  onChange={(e) => handleChange('transaction_id', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => handleChange('payment_date', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Screenshot URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.payment_proof_url}
                    onChange={(e) => handleChange('payment_proof_url', e.target.value)}
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
                Back to Edit Fields
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
                Your application <span className="font-mono text-amber-700 font-bold">{submittedApplication.application_no}</span> has been received by the MPWZ Union Admin.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-left space-y-2 font-mono shadow-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="text-slate-900 font-bold">{submittedApplication.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Company / District:</span>
                <span className="text-slate-800">{submittedApplication.district_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="text-slate-900 font-bold">{submittedApplication.membership_receipt_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Referred By:</span>
                <span className="text-slate-900 font-bold">{submittedApplication.reference_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application No:</span>
                <span className="text-amber-700 font-bold">{submittedApplication.application_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction UTR:</span>
                <span className="text-sky-700 font-bold">{submittedApplication.transaction_id || 'N/A'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
              Once Admin verifies your application details and receipt payment, your union membership profile will be activated.
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
