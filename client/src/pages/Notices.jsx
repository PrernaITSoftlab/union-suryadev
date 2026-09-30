import React from 'react';
import { AlertTriangle, Bell, Clock, MapPin, PhoneCall, ShieldAlert, Download, Printer, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Notices() {
  const { settings } = useAuth();

  const noticesList = [
    {
      id: "NTC-STRIKE-01",
      badge: "STRIKE NOTICE",
      title: "अनिश्चितकालीन कामबंद आंदोलन एवं धरना प्रदर्शन (Indefinite Strike & Protest Notice)",
      date: "Active Now",
      venue: "Polo Ground Discom Executive HQ Campus, Indore",
      circle_coverage: "Indore, Ujjain, Dewas, Ratlam, Dhar, Khargone, Khandwa, Mandsaur, Neemuch",
      type: "URGENT",
      demands: [
        "Reinstatement of Old Pension Scheme (OPS) for all power engineers & employees.",
        "Regularization and cadre absorption of outsource and contract linemen.",
        "Instant ₹20 Lakh hazard relief compensation for electrical accident fatalities on duty.",
        "Revocation of arbitrary pay recovery orders and DA arrears release.",
        "Mandatory 100% supply of Class 4 insulated rubber gloves & earthing rods."
      ]
    },
    {
      id: "NTC-GEN-04",
      badge: "GENERAL NOTICE",
      title: "Zone Level Lineman Safety Workshop & High-Voltage Work Permit Protocol",
      date: "05 October 2026",
      venue: "Ujjain Discom Zonal Training Hall",
      circle_coverage: "Ujjain & Dewas Discom Circles",
      type: "GENERAL",
      demands: [
        "Mandatory attendance for all Substation In-Charges and Shift Sub-Engineers.",
        "Hands-on demonstration of earthing discharge rod placement on 33kV feeders."
      ]
    },
    {
      id: "NTC-PRESS-09",
      badge: "PRESS RELEASE",
      title: "Union Delegation Submits 10-Point Charter to Honorable Energy Minister",
      date: "18 September 2026",
      venue: "Mantralaya Vallabh Bhawan, Bhopal",
      circle_coverage: "All MP Discom Zones",
      type: "PRESS",
      demands: [
        "Formal representation regarding pay anomaly rectification and hazard allowance."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
              <Bell className="w-3.5 h-3.5 text-sky-700" />
              <span>Notices & Strike Bulletins • सूचनाएं</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Union Notices, Agitation Bulletins & Press Releases
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Official press notes, emergency strike alerts, charter of demands, and zonal notifications.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm shrink-0"
          >
            <Printer className="w-4 h-4 text-sky-600" /> Print Notices Page
          </button>
        </div>

        {/* Featured News Clipping & Historic Agreement Section */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-sky-800 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* News Image Preview */}
            <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border-2 border-sky-500/50 shadow-2xl bg-black">
              <img 
                src="/images/gallery/discom-talks-news-clipping.png" 
                alt="Singaji Samachar - Discom & Union Historic Agreement News Clipping" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="p-3 bg-slate-900 text-slate-300 text-xs text-center font-mono font-bold border-t border-slate-800">
                Singaji Samachar Press Release • 28 September 2026
              </div>
            </div>

            {/* Content Details */}
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Historic Agreement Reached • ऐतिहासिक वार्ता सफल</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                म.प्र. पश्चिम क्षेत्र विद्युत वितरण कंपनी और आरक्षित वर्ग संगठन के बीच ऐतिहासिक वार्ता सफल, मांगों पर बनी सहमति
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                इंदौर डिस्कॉम प्रबंध निदेशक कार्यालय में प्रांतीय अध्यक्ष <strong>इंजी सूर्यदेव जयसिंह</strong>, प्रांतीय महासचिव <strong>डी.डी. रामटेके</strong>, प्रांतीय वरिष्ठ उपाध्यक्ष <strong>वी.एस. महतो</strong> एवं संस्थापक <strong>एम.एल. शाक्य</strong> के नेतृत्व में 49 सूत्रीय मांग पत्र पर सकारात्मक सहमति बनी।
              </p>

              {/* Photo Strip */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl overflow-hidden border border-white/20 h-28 sm:h-32">
                  <img src="/images/gallery/discom-management-meeting.jpg" alt="Discom Meeting" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden border border-white/20 h-28 sm:h-32">
                  <img src="/images/gallery/union-discom-felicitation.png" alt="Felicitation" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="pt-2 text-xs font-mono text-sky-300 font-bold">
                ✓ 28 सितंबर 2026 से प्रस्तावित अनिश्चितकालीन हड़ताल स्थगित
              </div>
            </div>
          </div>
        </div>

        {/* Notices Cards Grid */}
        <div className="space-y-6">
          {noticesList.map(ntc => (
            <div key={ntc.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-600 text-white shadow-sm uppercase tracking-wider">
                    {ntc.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{ntc.id}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-600" /> {ntc.date}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">{ntc.title}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium pt-1">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                  <span><strong>Assembly Venue:</strong> {ntc.venue}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 space-y-2">
                <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">Key Resolutions / Points:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {ntc.demands.map((d, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                      <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div><span>Circles Covered:</span> <strong className="text-slate-800">{ntc.circle_coverage}</strong></div>
                <Link to="/contact" className="text-sky-700 font-extrabold hover:underline">
                  Contact Control Room →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
