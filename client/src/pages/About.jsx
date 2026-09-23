import React from 'react';
import { Shield, Target, Eye, Award, Users, CheckCircle, ChevronRight, Building, Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function About() {
  const { settings } = useAuth();

  const leadership = [
    {
      name: "Er. Rajesh Sharma",
      title: "General Secretary & Executive Director",
      circle: "Indore HQ Circle",
      bio: "22+ years of service in MP West Zone Discom. Leading wage agreements, safety standards, and OPS advocacy.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Er. Sunita Chouhan",
      title: "Vice President (Women Wing)",
      circle: "Indore Corporate Circle",
      bio: "Superintending Engineer focused on workplace dignity, substation automation, and technical safety.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Shri Vikramaditya Patel",
      title: "Zonal Secretary (Ujjain Zone)",
      circle: "Ujjain Circle",
      bio: "Line Superintendent Grade-I with 18 years field experience managing 33kV line safety & hazard allowance.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span>About MPWZ Union</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Standing Together for Safety, Pay Security & Professional Honor
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {settings?.about_summary || 'Formed to uphold worker safety, fair pay scales, pension security, and technical excellence across 9 circles of Madhya Pradesh West Zone Electricity Distribution Discom.'}
          </p>
        </div>

        {/* History, Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our History</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Established as the representative union for engineers, linemen, and office staff of MP West Zone Electricity Distribution Co. Ltd. Over three decades of history advocating for power workers.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ensure 100% zero-accident field safety protocols, timely pay commission relief, Old Pension Scheme (OPS) reinstatement, and regularizing contract staff into permanent discom roles.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To build a modern, digitally connected discom union platform where every member receives instant assistance, legal counsel, transparent document access, and mutual relief support.
            </p>
          </div>
        </div>

        {/* Core Objectives */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-8 shadow-sm">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Union Core Objectives</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Guiding principles ratified by the State Union Executive Body</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Enforce strict high-voltage safety earthing & PTW protocols.",
              "Reinstatement of Old Pension Scheme (OPS) across Discom.",
              "Regularization of outsource & contract linemen into regular posts.",
              "Immediate ₹20 Lakh accident relief for grid operational casualties.",
              "Digital sharing of gazette orders, pay circulars & safety manuals.",
              "Democratized access to Union Executive body & Grievance assistance."
            ].map((obj, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-800 font-medium leading-relaxed">{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Union Executive Leadership</h2>
            <p className="text-xs text-slate-500 font-medium">Elected office bearers leading the West Zone Discom body</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((l, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-center shadow-sm hover:border-amber-300 transition-colors">
                <img 
                  src={l.image} 
                  alt={l.name} 
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-500 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{l.name}</h3>
                  <p className="text-xs text-amber-700 font-extrabold mt-0.5">{l.title}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{l.circle}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {l.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-900">Have questions or grievance issues?</h3>
            <p className="text-xs text-slate-600 font-medium">Contact Union Central Office or submit an online membership request.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/join" className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm">
              Apply to Join
            </Link>
            <Link to="/contact" className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs border border-slate-300 hover:bg-slate-50 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
