import React, { useState } from 'react';
import { FileText, Download, Search, Filter, ShieldCheck, Eye, Calendar, Building2, CheckCircle2, X, FileCheck, Info, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { settings } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCircular, setSelectedCircular] = useState(null);

  const categories = [
    { id: 'All', label: 'All Circulars & Orders', count: 8 },
    { id: 'Govt. Circulars', label: 'Govt. Circulars (शासकीय परिपत्र)', count: 2 },
    { id: 'SC/ST Circulars', label: 'SC/ST Circulars (अजा/अजजा परिपत्र)', count: 2 },
    { id: 'Normal Circulars', label: 'Normal Circulars (सामान्य परिपत्र)', count: 2 },
    { id: 'Notices', label: 'Notices & Notifications (सूचनाएं)', count: 2 },
    { id: 'Safety Directives', label: 'Safety & PTW Directives (सुरक्षा निर्देश)', count: 1 }
  ];

  const circularsList = [
    {
      id: "ORD/MPWZ/2026/104",
      title: "MP Government Order: 7th Pay Commission DA 4% Revision & Backlog Arrears Release",
      title_hi: "म.प्र. शासन आदेश: 7वें वेतन आयोग का 4% महंगाई भत्ता (DA) संशोधन एवं बकाया एरियर भुगतान आदेश",
      date: "24 Sept 2026",
      issuing_authority: "Energy Department, Govt. of Madhya Pradesh (ऊर्जा विभाग, म.प्र. शासन)",
      category: "Govt. Circulars",
      file_size: "2.4 MB",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      applicability: "All Regular Engineers, Line Staff & Office Personnel across 9 MPWZ Circles",
      rule_ref: "MP Govt Finance Directive No. F-11/4/2026/Rules/IV",
      details: "Official sanction order issued by the Govt of MP Energy Secretariat for granting 4% enhanced Dearness Allowance (DA) to all active Discom power employees and pensioners, along with installment payout schedules for retroactive arrears from January 2026."
    },
    {
      id: "ORD/MPWZ/2026/089",
      title: "SC/ST Reservation Roster, Cadre Promotion Seniority & Backlog Vacancy Filling Directive",
      title_hi: "अनुसूचित जाति / जनजाति पदोन्नति रोस्टर, वरिष्ठता सूची एवं बैकलोग पद पूर्ति निर्देश",
      date: "12 Sept 2026",
      issuing_authority: "MP Discom SC/ST Welfare Cell & HR Secretariat (अजा/अजजा कल्याण प्रकोष्ठ, इंदौर)",
      category: "SC/ST Circulars",
      file_size: "3.1 MB",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      applicability: "SC/ST Power Engineers, Sub-Engineers, Linemen & Administrative Cadres",
      rule_ref: "MP Gazette (Extraordinary) Regulation Sec 16(A)/2026",
      details: "Comprehensive guidelines issued for strict compliance of 100-point reservation rosters in promotions across Junior Engineer (JE), Assistant Engineer (AE), and Line Superintendent cadres, with time-bound resolution of SC/ST backlog posts."
    },
    {
      id: "ORD/MPWZ/2026/072",
      title: "Normal Circular: Discom Employee Annual Increment, CUG Mobile Allowance & Leave Rules",
      title_hi: "सामान्य परिपत्र: वार्षिक वेतन वृद्धि, सीयूजी मोबाइल भत्ता एवं अवकाश नियमावली 2026",
      date: "28 Aug 2026",
      issuing_authority: "Chief General Manager (HR & Admin), MPWZ HQ Indore",
      category: "Normal Circulars",
      file_size: "1.5 MB",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      applicability: "All Permanent & Probationary Employees of MP West Zone Discom",
      rule_ref: "MPWZ Discom Service Rules Clause 44-B",
      details: "Revised operational guidelines detailing the annual July increment sanction procedures, updated official CUG mobile monthly reimbursement slabs per designation, and revised earned leave encashment limits."
    },
    {
      id: "ORD/MPWZ/2026/058",
      title: "Notice: Annual Zonal Delegate Conference & Union Executive Representation Election Schedule",
      title_hi: "सूचना: वार्षिक ज़ोनल प्रतिनिधि सम्मेलन एवं संघ कार्यकारिणी चुनाव कार्यक्रम",
      date: "15 Aug 2026",
      issuing_authority: "Union Election Returning Officer & Central Secretariat",
      category: "Notices",
      file_size: "1.2 MB",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      applicability: "All Registered Union Members across Indore, Ujjain, Dewas, Ratlam, Dhar, Khargone",
      rule_ref: "Union Constitution Article 12 (Elections)",
      details: "Official notification declaring the election schedule for circle delegates, zonal secretaries, and central executive committee members for the term 2026-2028 along with nomination filing procedures."
    },
    {
      id: "ORD/MPWZ/2026/044",
      title: "Mandatory 33kV & 11kV Line High-Voltage Field Safety & PTW (Permit-To-Work) Directive",
      title_hi: "33kV एवं 11kV लाइन उच्च-वोल्टेज फ़ील्ड सुरक्षा एवं परमिट-टू-वर्क (PTW) अनिवार्य निर्देश",
      date: "02 July 2026",
      issuing_authority: "Chief Safety Officer & Union Executive Body, MPWZ HQ",
      category: "Safety Directives",
      file_size: "2.8 MB",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      applicability: "All Shift Engineers, Substation In-Charges & Field Lineman Crews",
      rule_ref: "Central Electricity Authority (CEA) Safety Standard 2023",
      details: "Strict safety mandate making Class-4 tested 30kV insulated rubber gloves, double earthing discharge rods, and written digital PTW clearance mandatory prior to any maintenance shutdown on 33kV/11kV lines."
    },
    {
      id: "ORD/MPWZ/2026/030",
      title: "Govt. Order: Discom Employee Group Cashless Health Insurance & Medical Reimbursement Slabs",
      title_hi: "शासकीय आदेश: डिस्कॉम कर्मचारी कैशलेस स्वास्थ्य बीमा एवं चिकित्सा प्रतिपूर्ति दरें",
      date: "18 June 2026",
      issuing_authority: "Department of Energy & MP State Discom Holding Co. Bhopal",
      category: "Govt. Circulars",
      file_size: "3.5 MB",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      applicability: "Serving Employees, Outsource Line Staff & Retired Discom Pensioners",
      rule_ref: "MP Swasthya Suraksha Yojna Gazette 2026",
      details: "Official government gazette order launching cashless hospitalization cover up to ₹5 Lakhs per family per annum at all empanelled super-specialty hospitals in MP for electricity grid personnel."
    },
    {
      id: "ORD/MPWZ/2026/015",
      title: "SC/ST Welfare Scheme, Children Higher Education Grant & Housing Assistance Circular",
      title_hi: "अजा/अजजा कल्याण योजना, बच्चों की उच्च शिक्षा अनुदान एवं आवास सहायता परिपत्र",
      date: "05 May 2026",
      issuing_authority: "SC/ST Discom Employees Welfare Association & MPWZ Discom",
      category: "SC/ST Circulars",
      file_size: "1.9 MB",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      applicability: "SC/ST Union Members & Dependents",
      rule_ref: "MP Welfare Trust Directive 2025/Sec-B",
      details: "Notification announcing special educational grants for meritorious children of SC/ST discom staff pursuing engineering and medical degrees, plus interest-subsidized home loan schemes."
    },
    {
      id: "ORD/MPWZ/2025/112",
      title: "Normal Circular: Substation Operation Shift Roster, OT Allowance & Night Duty Standards",
      title_hi: "सामान्य परिपत्र: सबस्टेशन संचालन पाली रोस्टर, ओवरटाइम भत्ता एवं रात्रिकालीन ड्यूटी नियम",
      date: "14 Dec 2025",
      issuing_authority: "Chief Engineer (O&M Zone), MPWZ Discom Indore",
      category: "Normal Circulars",
      file_size: "1.6 MB",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      applicability: "Testing Assistants, Substation Operators & Shift Engineers",
      rule_ref: "MPWZ O&M Regulations Clause 18",
      details: "Circular establishing 8-hour shift rotations for 33/11kV substation operators, revised night-duty allowance rates, and mandatory break-shift rest hours after emergency outage restorations."
    }
  ];

  const filteredCirculars = circularsList.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        item.title_hi.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.issuing_authority.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
              <FileText className="w-3.5 h-3.5 text-sky-700" />
              <span>Official Orders Portal • शासकीय परिपत्र हब</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Official Circulars, Government Orders & Notices
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Search, view details, and download authenticated PDF circulars published by Govt of MP, Discom Management, SC/ST Cell, and Union Body.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by order no., subject, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Category Tabs Bar (Govt. Circulars, Notices, SC/ST Circulars, Normal Circulars, etc.) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  active
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {cat.id === 'All' ? circularsList.length : circularsList.filter(c => c.category === cat.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Circulars Table & Cards Layout */}
        <div className="space-y-4">
          {filteredCirculars.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No circulars found matching your search filter</h3>
              <p className="text-xs text-slate-500">Try selecting "All Circulars & Orders" or changing search keywords.</p>
            </div>
          ) : (
            filteredCirculars.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-sky-300 transition-all space-y-4"
              >
                {/* Header row with Circular Number & Category Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-[11px] font-mono font-extrabold border border-sky-200">
                      {item.id}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      item.category === 'Govt. Circulars' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      item.category === 'SC/ST Circulars' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      item.category === 'Notices' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      item.category === 'Safety Directives' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.category}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" /> Published: {item.date}
                  </span>
                </div>

                {/* Main Subject & English / Hindi Titles */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-snug">
                    {item.title_hi}
                  </p>
                </div>

                {/* Issuing Authority & Summary Preview */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500 font-semibold">
                    Issuing Authority: <strong className="text-slate-800 font-bold">{item.issuing_authority}</strong>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {item.details.length > 140 ? `${item.details.slice(0, 140)}...` : item.details}
                  </p>
                </div>

                {/* Action Buttons: Details & View/Download PDF */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedCircular(item)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>View Circular Details (विवरण देखें)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-sky-600" />
                      <span>View PDF</span>
                    </a>

                    <a
                      href={item.doc_url}
                      target="_blank"
                      download
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF ({item.file_size})</span>
                    </a>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* CIRCULAR DETAILS MODAL (Standard Government Website Style) */}
      {selectedCircular && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedCircular(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-mono font-extrabold border border-sky-200">
                  {selectedCircular.id}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                  {selectedCircular.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedCircular.title}</h3>
              <p className="text-xs font-semibold text-slate-600 leading-snug">{selectedCircular.title_hi}</p>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium">
                <div>
                  <span className="text-slate-500 block">Issuing Authority:</span>
                  <strong className="text-slate-900 font-bold">{selectedCircular.issuing_authority}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Publication Date:</span>
                  <strong className="text-sky-700 font-bold">{selectedCircular.date}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Rule / Act Reference:</span>
                  <strong className="text-slate-900 font-bold">{selectedCircular.rule_ref}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Document Format & Size:</span>
                  <strong className="text-slate-900 font-bold">PDF ({selectedCircular.file_size})</strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wider">Target Applicability (प्रयोज्यता):</h4>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-950 font-semibold">
                  {selectedCircular.applicability}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wider">Detailed Subject Summary (विस्तृत सारांश):</h4>
                <p className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedCircular.details}
                </p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedCircular(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Close Window
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={selectedCircular.doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span>Open PDF in Browser</span>
                </a>

                <a
                  href={selectedCircular.doc_url}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
