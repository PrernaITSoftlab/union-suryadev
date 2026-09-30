import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, QrCode, CheckCircle, AlertCircle, ArrowRight, FileText, MessageSquare, ExternalLink, ShieldCheck, ChevronDown, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const COMPANIES = [
  "MP West Zone Electricity Discom (म.प्र. पश्चिम क्षेत्र विद्युत वितरण कं. लि.)",
  "MP East Zone Electricity Discom (म.प्र. पूर्व क्षेत्र विद्युत वितरण कं. लि.)",
  "MP Central Zone Electricity Discom (म.प्र. मध्य क्षेत्र विद्युत वितरण कं. लि.)",
  "MP Power Generating Co. Ltd. (MPPGCL)",
  "MP Power Transmission Co. Ltd. (MPPTCL)",
  "MP Power Management (म.प्र. पावर मैनेजमेंट कंपनी लि.)",
  "Other Department"
];

// All 55 Districts of Madhya Pradesh
const DISTRICTS = [
  "Agar Malwa (आगर मालवा)",
  "Alirajpur (अलीराजपुर)",
  "Anuppur (अनूपपुर)",
  "Ashoknagar (अशोकनगर)",
  "Balaghat (बालाघाट)",
  "Barwani (बड़वानी)",
  "Betul (बैतूल)",
  "Bhind (भिंड)",
  "Bhopal (भोपाल)",
  "Burhanpur (बुरहानपुर)",
  "Chhatarpur (छतरपुर)",
  "Chhindwara (छिंदवाड़ा)",
  "Damoh (दमोह)",
  "Datia (दतिया)",
  "Dewas (देवास)",
  "Dhar (धार)",
  "Dindori (डिंडोरी)",
  "Guna (गुणा)",
  "Gwalior (ग्वालियर)",
  "Harda (हरदा)",
  "Hoshangabad / Narmadapuram (नर्मदापुरम)",
  "Indore (इन्दौर)",
  "Jabalpur (जबलपुर)",
  "Jhabua (झाबुआ)",
  "Katni (कटनी)",
  "Khandwa / East Nimar (खंडवा)",
  "Khargone / West Nimar (खरगौन)",
  "Maihar (मैहर)",
  "Mandla (मंडला)",
  "Mandsaur (मंदसौर)",
  "Mauganj (मऊगंज)",
  "Morena (मुरैना)",
  "Narsinghpur (नरसिंहपुर)",
  "Neemuch (नीमच)",
  "Niwari (निवाड़ी)",
  "Pandhurna (पांढुर्णा)",
  "Panna (पन्ना)",
  "Raisen (रायसेन)",
  "Rajgarh (राजगढ़)",
  "Ratlam (रतलाम)",
  "Rewa (रीवा)",
  "Sagar (सागर)",
  "Satna (सतना)",
  "Sehore (सीहोर)",
  "Seoni (सिवनी)",
  "Shahdol (शहडोल)",
  "Shajapur (शाजापुर)",
  "Sheopur (श्योपुर)",
  "Shivpuri (शिवपुरी)",
  "Sidhi (सीधी)",
  "Singrauli (सिंगरौली)",
  "Tikamgarh (टीकमगढ़)",
  "Ujjain (उज्जैन)",
  "Umaria (उमरिया)",
  "Vidisha (विदिशा)",
  "Other District"
];

const EMPLOYEE_TYPES = [
  "Regular",
  "Contract Based",
  "OutSource",
  "Other"
];

const CATEGORIES = [
  "ST",
  "SC",
  "OBC",
  "Other"
];

const EMPLOYEE_CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3 (J.E.)",
  "Class 4"
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
const MEMBERSHIP_YEARS = ["2026", "2027"];

export default function JoinNow() {
  const { settings } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: COMPANIES[0],
    district_name: DISTRICTS[21], // Default Indore
    circle_name: '',
    division_name: '',
    office_name: '',
    joining_year: '',
    full_name: '',
    father_name: '',
    post_name: POSTS[0],
    dept_post: '',
    union_post: 'Member',

    // New requested fields
    employee_type: EMPLOYEE_TYPES[0], // Regular
    category: CATEGORIES[2], // OBC
    employee_class: EMPLOYEE_CLASSES[2], // Class 3

    cug_mobile: '',
    whatsapp_mobile: '',
    membership_year: '2026',
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

  // Custom Dropdowns state
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const districtDropdownRef = useRef(null);

  const [companyOpen, setCompanyOpen] = useState(false);
  const companyDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target)) {
        setDistrictOpen(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setCompanyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fee calculation: Class 1 -> ₹2000; Class 2 -> ₹1500; Class 3 (J.E.) -> ₹1000; Class 4 -> ₹500
  const getFeeForClass = (cls) => {
    if (cls === 'Class 1') return 2000;
    if (cls === 'Class 2') return 1500;
    if (cls === 'Class 3 (J.E.)' || cls === 'Class 3') return 1000;
    return 500;
  };
  const regFee = getFeeForClass(formData.employee_class);

  const qrUrl = settings?.registration_qr_url || '/images/payment-qr.png';
  const whatsappNo = settings?.payment_whatsapp_number || '+91 94249 44041';

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.company_name) errors.company_name = 'Name of Company is required.';
    if (!formData.district_name) errors.district_name = 'Name of District is required.';
    if (!formData.office_name || !formData.office_name.trim()) errors.office_name = 'Office Name (DC/Zone/etc.) is required.';
    if (!formData.full_name || formData.full_name.trim().length < 2) errors.full_name = 'Your Name is required (at least 2 characters).';
    if (!formData.father_name || formData.father_name.trim().length < 2) errors.father_name = "Father's Name is required.";
    if (!formData.post_name) errors.post_name = 'Name of Post is required.';
    if (!formData.employee_type) errors.employee_type = 'Employee Type is required.';
    if (!formData.category) errors.category = 'Category is required.';
    if (!formData.employee_class) errors.employee_class = 'Employee Class is required.';

    const cleanCug = formData.cug_mobile.replace(/\D/g, '');
    if (formData.cug_mobile && cleanCug.length !== 10) {
      errors.cug_mobile = 'CUG Mobile Number must be 10 digits.';
    }

    const cleanWa = formData.whatsapp_mobile.replace(/\D/g, '');
    if (!formData.whatsapp_mobile || cleanWa.length !== 10) {
      errors.whatsapp_mobile = 'Valid 10-digit WhatsApp Mobile Number is required.';
    }

    if (!formData.membership_year) errors.membership_year = 'Year of Membership is required.';
    if (!formData.reference_name || !formData.reference_name.trim()) {
      errors.reference_name = 'Name (By reference) of official/member is required.';
    }

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

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        ...formData,
        registration_fee: regFee,
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
  const waMsg = encodeURIComponent(`*MPVMAVAKS UNION MEMBERSHIP REGISTRATION*\nName: ${formData.full_name}\nDistrict: ${formData.district_name}\nClass: ${formData.employee_class} (Fee: ₹${regFee})\nUTR: ${formData.transaction_id || 'N/A'}\nPlease verify my membership application. Thank you!`);
  const waLink = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${waMsg}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <UserPlus className="w-3.5 h-3.5 text-sky-700" />
            <span>Union Membership Form • सदस्यता फॉर्म</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Apply to Join MP West Zone Electricity Union
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Please fill out all required fields marked with <span className="text-red-500 font-bold">*</span> accurately. Select your Employee Class to determine your registration fee (Class 1: ₹2000 | Class 2: ₹1500 | Class 3 (J.E.): ₹1000 | Class 4: ₹500).
          </p>
        </div>

        {/* Progress Tracker Bar */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs font-bold border-b border-slate-200 pb-5">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-sky-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-sky-600 text-white font-extrabold' : 'bg-slate-200 text-slate-500'}`}>1</span>
            <span>Member Details</span>
          </div>
          <span className="text-slate-300">• • •</span>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-sky-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-sky-600 text-white font-extrabold' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span>Payment (₹{regFee}) & UTR</span>
          </div>
          <span className="text-slate-300">• • •</span>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-sky-700' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-sky-600 text-white font-extrabold' : 'bg-slate-200 text-slate-500'}`}>3</span>
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

        {/* STEP 1: Application Form */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>Membership Form</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">* Required Fields</span>
            </div>

            {/* Grid for Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* 1. Name of Company * — dropdown displaying downwards */}
              <div className="md:col-span-1 relative" ref={companyDropdownRef}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Name of Company <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCompanyOpen(!companyOpen)}
                  className={`w-full bg-slate-50 border ${fieldErrors.company_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium flex items-center justify-between text-left shadow-sm`}
                >
                  <span className="truncate">{formData.company_name || '-- Select Company --'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
                </button>

                {companyOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-60 overflow-y-auto space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {COMPANIES.map((comp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleChange('company_name', comp);
                          setCompanyOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${formData.company_name === comp
                            ? 'bg-sky-600 text-white font-bold'
                            : 'text-slate-800 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                )}
                {fieldErrors.company_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.company_name}</p>}
              </div>

              {/* 2. Name of District * — dropdown opening downside with all 55 MP districts */}
              <div className="md:col-span-1 relative" ref={districtDropdownRef}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Name of District <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDistrictOpen(!districtOpen)}
                  className={`w-full bg-slate-50 border ${fieldErrors.district_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium flex items-center justify-between text-left shadow-sm`}
                >
                  <span className="truncate">{formData.district_name || '-- Select District --'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${districtOpen ? 'rotate-180' : ''}`} />
                </button>

                {districtOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search district..."
                        value={districtSearch}
                        onChange={(e) => setDistrictSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                      {DISTRICTS.filter(dist => dist.toLowerCase().includes(districtSearch.toLowerCase())).map((dist, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            handleChange('district_name', dist);
                            setDistrictOpen(false);
                            setDistrictSearch('');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${formData.district_name === dist
                              ? 'bg-sky-600 text-white font-bold'
                              : 'text-slate-800 hover:bg-sky-50 hover:text-sky-700'
                            }`}
                        >
                          {dist}
                        </button>
                      ))}
                      {DISTRICTS.filter(dist => dist.toLowerCase().includes(districtSearch.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-xs text-slate-400 text-center font-medium">No matching district found</div>
                      )}
                    </div>
                  </div>
                )}
                {fieldErrors.district_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.district_name}</p>}
              </div>

              {/* NEW FIELD 1: Employee Type * */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Employee Type (कर्मचारी का प्रकार) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employee_type}
                  onChange={(e) => handleChange('employee_type', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.employee_type ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium`}
                >
                  {EMPLOYEE_TYPES.map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </select>
                {fieldErrors.employee_type && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.employee_type}</p>}
              </div>

              {/* NEW FIELD 2: Category * */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. Category (वर्ग / श्रेणी) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.category ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium`}
                >
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                {fieldErrors.category && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.category}</p>}
              </div>

              {/* NEW FIELD 3: Employee Class * (Dynamic Fee Rule: Class 1 = 2000rs | Class 2 = 1500rs | Class 3 (J.E.) = 1000rs | Class 4 = 500rs) */}
              <div className="md:col-span-2 p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-900">
                    5. Employee Class (कर्मचारी श्रेणी) <span className="text-red-500">*</span>
                  </label>
                  <span className="px-2.5 py-1 rounded-full bg-sky-600 text-white font-extrabold text-[11px] shadow-sm">
                    Applicable Registration Fee: ₹{regFee}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {EMPLOYEE_CLASSES.map((cls) => {
                    const isSelected = formData.employee_class === cls;
                    const feeForCls = getFeeForClass(cls);
                    return (
                      <label
                        key={cls}
                        className={`p-3 rounded-xl border cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1 ${isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-md font-bold'
                            : 'bg-white border-slate-300 hover:border-sky-400 text-slate-800'
                          }`}
                      >
                        <input
                          type="radio"
                          name="employee_class"
                          value={cls}
                          checked={isSelected}
                          onChange={(e) => handleChange('employee_class', e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-xs font-extrabold">{cls}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-sky-100 font-bold' : 'text-sky-700 font-semibold'}`}>
                          Fee: ₹{feeForCls}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {fieldErrors.employee_class && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.employee_class}</p>}
              </div>

              {/* 6. Circle Name — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6. Circle Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indore Circle / Ujjain Circle"
                  value={formData.circle_name}
                  onChange={(e) => handleChange('circle_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              {/* 7. Division Name — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  7. Division Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. West Division / North Division"
                  value={formData.division_name}
                  onChange={(e) => handleChange('division_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              {/* 8. Office Name (DC/Zone/etc.) * — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  8. Office Name (DC/Zone/etc.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DC Annapurna / Zone 1 Office"
                  value={formData.office_name}
                  onChange={(e) => handleChange('office_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.office_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium`}
                />
                {fieldErrors.office_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.office_name}</p>}
              </div>

              {/* 9. Joining Year (किस वर्ष में नौकरी ज्वाइन की) — dropdown */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  9. Joining Year (किस वर्ष में नौकरी ज्वाइन की)
                </label>
                <select
                  value={formData.joining_year}
                  onChange={(e) => handleChange('joining_year', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                >
                  <option value="">-- Select Joining Year --</option>
                  {JOINING_YEARS.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              {/* 10. Your Name * — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  10. Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar Sharma"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.full_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium`}
                />
                {fieldErrors.full_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.full_name}</p>}
              </div>

              {/* 11. Father’s Name * — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  11. Father’s Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shri O. P. Sharma"
                  value={formData.father_name}
                  onChange={(e) => handleChange('father_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.father_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium`}
                />
                {fieldErrors.father_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.father_name}</p>}
              </div>

              {/* 12. Name of Post * — dropdown */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  12. Name of Post <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.post_name}
                  onChange={(e) => handleChange('post_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.post_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium`}
                >
                  {POSTS.map((pst, idx) => (
                    <option key={idx} value={pst}>{pst}</option>
                  ))}
                </select>
                {fieldErrors.post_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.post_name}</p>}
              </div>

              {/* 13. Post in Department (विभाग में पद) — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  13. Post in Department (विभाग में पद)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Lineman / Shift In-Charge"
                  value={formData.dept_post}
                  onChange={(e) => handleChange('dept_post', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              {/* 14. Post in Union (Member, etc.) (संगठन में पद) — text input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  14. Post in Union (Member, etc.) (संगठन में पद)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Member / District Vice President"
                  value={formData.union_post}
                  onChange={(e) => handleChange('union_post', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              {/* 15. Mobile Number (CUG) (Official) — phone input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  15. Mobile Number (CUG) (Official)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9425000000"
                  value={formData.cug_mobile}
                  onChange={(e) => handleChange('cug_mobile', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.cug_mobile ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono`}
                />
                {fieldErrors.cug_mobile && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.cug_mobile}</p>}
              </div>

              {/* 16. Mobile Number (WhatsApp) (Personal) * — phone input */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  16. Mobile Number (WhatsApp) (Personal) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9826011223"
                  value={formData.whatsapp_mobile}
                  onChange={(e) => handleChange('whatsapp_mobile', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.whatsapp_mobile ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono`}
                />
                {fieldErrors.whatsapp_mobile && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.whatsapp_mobile}</p>}
              </div>

              {/* 17. Year of Membership * — radio/select */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  17. Year of Membership <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {MEMBERSHIP_YEARS.map((yr) => (
                    <label key={yr} className="inline-flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer font-medium bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-sky-400">
                      <input
                        type="radio"
                        name="membership_year"
                        value={yr}
                        checked={formData.membership_year === yr}
                        onChange={(e) => handleChange('membership_year', e.target.value)}
                        className="accent-sky-600 w-3.5 h-3.5"
                      />
                      <span>{yr}</span>
                    </label>
                  ))}
                </div>
                {fieldErrors.membership_year && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.membership_year}</p>}
              </div>

              {/* 18. Name (By reference) (रेफरेंस कराने वाले पदाधिकारी/सदस्य का नाम) * — text input */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  18. Name (By reference) (रेफरेंस कराने वाले पदाधिकारी/सदस्य का नाम) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Er. Suryadev Jaysingh (District President / Delegate)"
                  value={formData.reference_name}
                  onChange={(e) => handleChange('reference_name', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.reference_name ? 'border-red-500 bg-red-50/50' : 'border-slate-300'} rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium`}
                />
                {fieldErrors.reference_name && <p className="text-[11px] text-red-600 mt-1 font-semibold">{fieldErrors.reference_name}</p>}
              </div>

            </div>

            {/* Terms Declaration */}
            <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.terms_accepted}
                onChange={(e) => handleChange('terms_accepted', e.target.checked)}
                className="mt-1 accent-sky-600 w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-sky-950 leading-relaxed cursor-pointer font-medium">
                I hereby declare that all provided details are correct and genuine. I agree to abide by the Constitution, Rules, and Agitation Guidelines of the MP West Zone Electricity Discom Employees Union.
              </label>
            </div>
            {fieldErrors.terms_accepted && (
              <p className="text-xs text-red-600 font-semibold">{fieldErrors.terms_accepted}</p>
            )}

            {/* Submit Step 1 Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-xs sm:text-sm bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>Proceed to Registration QR Payment (₹{regFee}) & UTR Entry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: QR Payment & UTR Submission */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">

            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">Step 2: Registration Verification</span>
              <h2 className="text-2xl font-bold text-slate-900">Scan Union QR Code & Enter UTR Reference</h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto font-medium">
                Pay the annual union registration fee of <span className="text-sky-700 font-extrabold text-sm">₹{regFee}</span> ({formData.employee_class}) via UPI (GPay, PhonePe, Paytm, BHIM) and enter your transaction UTR number.
              </p>
            </div>

            {/* Form Fields Summary Pill */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-medium">
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                <div><span className="text-slate-500">Applicant:</span> <strong className="text-slate-900">{formData.full_name}</strong></div>
                <div><span className="text-slate-500">Father:</span> <strong className="text-slate-900">{formData.father_name}</strong></div>
                <div><span className="text-slate-500">District:</span> <strong className="text-sky-800">{formData.district_name}</strong></div>
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-600">
                <div><span>Employee Type:</span> <strong className="text-slate-900">{formData.employee_type}</strong></div>
                <div><span>Category:</span> <strong className="text-slate-900">{formData.category}</strong></div>
                <div><span>Class & Fee:</span> <strong className="text-sky-700">{formData.employee_class} (₹{regFee})</strong></div>
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
                    <span>Selected Cadre Class:</span>
                    <span className="text-slate-900 font-bold">{formData.employee_class}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Required Fee:</span>
                    <span className="text-sky-700 font-extrabold text-base">₹{regFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>UPI ID:</span>
                    <span className="text-sky-700 font-bold">{settings?.upi_id || 'mpvidyut@sbi'}</span>
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
                  Transaction ID / UTR Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR98765432101 (Optional)"
                  value={formData.transaction_id}
                  onChange={(e) => handleChange('transaction_id', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => handleChange('payment_date', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Screenshot URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.payment_proof_url}
                    onChange={(e) => handleChange('payment_proof_url', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
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
                className="w-2/3 py-3.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center justify-center gap-2 shadow-md"
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
                Your application <span className="font-mono text-sky-700 font-bold">{submittedApplication.application_no}</span> has been received by the MPVMAVAKS Union Admin.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-left space-y-2 font-mono shadow-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="text-slate-900 font-bold">{submittedApplication.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">District:</span>
                <span className="text-slate-800">{submittedApplication.district_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cadre Class & Fee:</span>
                <span className="text-sky-700 font-bold">{formData.employee_class} (₹{regFee})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee Type / Cat:</span>
                <span className="text-slate-800">{formData.employee_type} | {formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application No:</span>
                <span className="text-sky-700 font-bold">{submittedApplication.application_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction UTR:</span>
                <span className="text-sky-700 font-bold">{submittedApplication.transaction_id || 'N/A'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 max-w-lg mx-auto text-xs text-sky-950 font-medium space-y-1.5 leading-relaxed text-left">
              <div className="font-extrabold text-sky-900 flex items-center gap-1.5 text-xs">
                <span>🔐 Payment & Onboarding Access Policy</span>
              </div>
              <p>
                Your registration is currently stored as <strong className="text-sky-900">PENDING</strong>. Once Union Admin verifies your payment UTR (<span className="font-mono font-bold text-sky-900">{submittedApplication.transaction_id || 'N/A'}</span>), your unique <strong>Union Member Login ID</strong> and <strong>Temporary Password</strong> will be automatically generated and dispatched to <strong className="text-slate-900">{submittedApplication.email || 'your registered contact'}</strong>.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Back to Home Page
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-md"
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
