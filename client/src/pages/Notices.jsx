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
