import React, { useState } from 'react';
import { FileText, Search, ExternalLink, Download, X, Filter, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Orders() {
  const { t, isHindi } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pdfModalItem, setPdfModalItem] = useState(null);

  const categories = [
    { id: 'All', labelEn: 'All Orders & Notices', labelHi: 'सभी आदेश एवं सूचनाएं' },
    { id: 'Govt. Circulars', labelEn: 'Govt. Circulars', labelHi: 'शासकीय परिपत्र' },
    { id: 'SC/ST Circulars', labelEn: 'SC/ST Circulars', labelHi: 'अजा/अजजा परिपत्र' },
    { id: 'Normal Circulars', labelEn: 'Normal Circulars', labelHi: 'सामान्य परिपत्र' },
    { id: 'Notices', labelEn: 'Notices & Directives', labelHi: 'सूचनाएं व निर्देश' },
    { id: 'Safety Directives', labelEn: 'Safety & PTW Rules', labelHi: 'सुरक्षा नियमावली' }
  ];

  const circularsList = [
    {
      id: "ORD/MPVMAVAKS/2026/104",
      titleEn: "MP Government Order: 7th Pay Commission DA 4% Revision & Backlog Arrears Payout Release Order",
      titleHi: "म.प्र. शासन आदेश: 7वें वेतन आयोग का 4% महंगाई भत्ता (DA) संशोधन एवं बकाया एरियर भुगतान आदेश।",
      date: "24/09/2026",
      category: "Govt. Circulars",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "ORD/MPVMAVAKS/2026/089",
      titleEn: "SC/ST Reservation Roster, Cadre Promotion Seniority & Backlog Vacancy Filling Directive",
      titleHi: "अनुसूचित जाति / जनजाति पदोन्नति रोस्टर, वरिष्ठता सूची एवं बैकलॉग पद पूर्ति निर्देश।",
      date: "12/09/2026",
      category: "SC/ST Circulars",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "ORD/MPVMAVAKS/2026/072",
      titleEn: "Normal Circular: Employee Annual Increment, CUG Mobile Allowance & Revised Leave Rules 2026",
      titleHi: "सामान्य परिपत्र: कर्मचारी वार्षिक वेतन वृद्धि, सीयूजी मोबाइल भत्ता एवं संशोधित अवकाश नियमावली 2026।",
      date: "28/08/2026",
      category: "Normal Circulars",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "ORD/MPVMAVAKS/2026/058",
      titleEn: "Notice: Annual Zonal Delegate Conference & Union Executive Representation Election Schedule",
      titleHi: "सूचना: वार्षिक ज़ोनल प्रतिनिधि सम्मेलन एवं संघ कार्यकारिणी चुनाव कार्यक्रम।",
      date: "15/08/2026",
      category: "Notices",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "ORD/MPVMAVAKS/2026/044",
      titleEn: "Mandatory 33kV & 11kV Line High-Voltage Field Safety & PTW (Permit-To-Work) Directive",
      titleHi: "33kV एवं 11kV लाइन उच्च-वोल्टेज फ़ील्ड सुरक्षा एवं परमिट-टू-वर्क (PTW) अनिवार्य निर्देश।",
      date: "02/07/2026",
      category: "Safety Directives",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "ORD/MPVMAVAKS/2026/030",
      titleEn: "Govt. Order: Discom Employee Group Cashless Health Insurance & Medical Reimbursement Slabs",
      titleHi: "शासकीय आदेश: डिस्कॉम कर्मचारी कैशलेस स्वास्थ्य बीमा एवं चिकित्सा प्रतिपूर्ति दरें।",
      date: "18/06/2026",
      category: "Govt. Circulars",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "ORD/MPVMAVAKS/2026/015",
      titleEn: "SC/ST Welfare Scheme, Children Higher Education Grant & Housing Assistance Circular",
      titleHi: "अजा/अजजा कल्याण योजना, बच्चों की उच्च शिक्षा अनुदान एवं आवास सहायता परिपत्र।",
      date: "05/05/2026",
      category: "SC/ST Circulars",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "ORD/MPVMAVAKS/2025/112",
      titleEn: "Normal Circular: Substation Operation Shift Roster, OT Allowance & Night Duty Standards",
      titleHi: "सामान्य परिपत्र: सबस्टेशन संचालन पाली रोस्टर, ओवरटाइम भत्ता एवं रात्रिकालीन ड्यूटी नियम।",
      date: "14/12/2025",
      category: "Normal Circulars",
      doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ];

  const filteredCirculars = circularsList.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        item.titleEn.toLowerCase().includes(term) ||
        item.titleHi.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.date.includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Minimal Header */}
        <div className="space-y-2 border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-sky-700" />
            <span>{isHindi ? 'शासकीय आदेश व परिपत्र' : 'Official Orders & Circulars'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHindi ? 'शासकीय आदेश एवं सूचनाएं निर्देशिका' : 'Government Orders & Notices Directory'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {isHindi 
              ? 'आदेश अथवा परिपत्र का पीडीएफ देखने के लिए नीचे दी गई लिंक पर क्लिक करें।' 
              : 'Click on any notice link below to view the official PDF document.'}
          </p>
        </div>

        {/* Sleek Filter & Search Controls (No Horizontal Scrollbar) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Filter Dropdown & Label */}
            <div className="flex items-center gap-2.5 flex-1 max-w-md">
              <Filter className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                {isHindi ? 'श्रेणी (Category):' : 'Category:'}
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {isHindi ? cat.labelHi : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isHindi ? "आदेश विषय / दिनांक खोजें..." : "Search orders or date..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors shadow-sm"
              />
            </div>

          </div>

          {/* Quick Wrapping Category Chips (No overflow-x-auto, clean flex-wrap) */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {isHindi ? cat.labelHi : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Single-Line Notices List with Direct PDF Link */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          {filteredCirculars.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              {isHindi ? 'कोई आदेश नहीं मिला।' : 'No orders matched your search criteria.'}
            </div>
          ) : (
            <ul className="space-y-4 divide-y divide-slate-100">
              {filteredCirculars.map((item, idx) => (
                <li key={item.id} className={idx > 0 ? "pt-4" : ""}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      {/* Direct PDF Link */}
                      <a 
                        href={item.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group text-slate-800 hover:text-sky-700 transition-colors leading-relaxed text-sm sm:text-base font-semibold inline-block"
                      >
                        <span className="underline decoration-slate-400 group-hover:decoration-sky-600 underline-offset-4">
                          {isHindi ? item.titleHi : item.titleEn}
                        </span>
                        <span className="text-slate-600 group-hover:text-sky-700 font-mono text-xs ml-1.5 whitespace-nowrap">
                          ({item.date})
                        </span>
                      </a>

                      {/* Secondary Language Translation Subline */}
                      <div className="text-xs text-slate-500 font-medium italic">
                        {isHindi ? item.titleEn : item.titleHi}
                      </div>
                    </div>

                    {/* Action Button: View / Download PDF */}
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <a
                        href={item.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Open PDF Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isHindi ? 'PDF देखें' : 'View PDF'}</span>
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* PDF LIGHTBOX VIEWER MODAL (If triggered) */}
      {pdfModalItem && (
        <div 
          onClick={() => setPdfModalItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center cursor-pointer animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full h-[88vh] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
              <div className="space-y-0.5 max-w-2xl">
                <span className="text-[10px] font-mono text-sky-300 font-bold uppercase tracking-wider block">
                  {pdfModalItem.id} • {pdfModalItem.category}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {isHindi ? pdfModalItem.titleHi : pdfModalItem.titleEn}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={pdfModalItem.doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'नई विंडो (Open PDF)' : 'Open PDF'}</span>
                </a>
                <button
                  onClick={() => setPdfModalItem(null)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Iframe Viewer */}
            <div className="flex-grow bg-slate-100 p-2 overflow-hidden">
              <iframe
                src={pdfModalItem.doc_url}
                title={pdfModalItem.titleEn}
                className="w-full h-full rounded-xl border border-slate-300 bg-white"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium shrink-0">
              <span>Date: <strong className="font-mono">{pdfModalItem.date}</strong></span>
              <a
                href={pdfModalItem.doc_url}
                download
                className="text-sky-700 font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isHindi ? 'डाउनलोड' : 'Download Document'}</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
