import React from 'react';
import { Shield, Users, Award, MapPin, Mail, Phone, CheckCircle, ChevronRight, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function BoardOfUnion() {
  const { settings } = useAuth();

  const boardMembers = [
    {
      name: "Er. Rajesh Sharma",
      title: "General Secretary & Executive Director",
      circle: "Indore HQ Circle",
      phone: "+91 98260 11223",
      email: "rajesh.sharma@mpwzunion.org",
      role: "Central Executive Secretariat",
      bio: "22+ years of service in MP West Zone Discom. Leading wage agreements, safety standards, and OPS advocacy across 9 discom circles.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Er. Sunita Chouhan",
      title: "Vice President (Women Wing)",
      circle: "Indore Corporate Circle",
      phone: "+91 98260 22334",
      email: "sunita.chouhan@mpwzunion.org",
      role: "Technical & Women Cadre Safety",
      bio: "Superintending Engineer focused on workplace dignity, substation automation, and technical safety protocols for female engineers & office staff.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Shri Vikramaditya Patel",
      title: "Zonal Secretary (Ujjain Zone)",
      circle: "Ujjain Circle",
      phone: "+91 98260 33445",
      email: "vikram.patel@mpwzunion.org",
      role: "Field Safety & Line Staff Protection",
      bio: "Line Superintendent Grade-I with 18 years field experience managing 33kV line safety, hazard allowance, and PTW compliance.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Er. Alok Nath Verma",
      title: "Treasurer & Financial Audit Controller",
      circle: "Dewas Circle",
      phone: "+91 98260 44556",
      email: "alok.verma@mpwzunion.org",
      role: "Union Fund & Mutual Relief Fund",
      bio: "Executive Engineer managing the MPWZ Union Mutual Relief Fund and 20L hazard accident relief disbursements.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Shri Mahendra Singh Rathore",
      title: "Joint Secretary (Ratlam & Mandsaur Zone)",
      circle: "Ratlam Circle",
      phone: "+91 98260 55667",
      email: "mahendra.rathore@mpwzunion.org",
      role: "Agitation & OPS Campaign Director",
      bio: "Active organizer of the Old Pension Scheme (OPS) restoration agitation and contract staff regularization rallies.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Er. Meenakshi Sundaram",
      title: "Legal Advisor & Grievance Cell In-Charge",
      circle: "Khargone Circle",
      phone: "+91 98260 66778",
      email: "meenakshi.s@mpwzunion.org",
      role: "Legal Cell & Industrial Dispute Representation",
      bio: "Specialist in Electricity Act 2003 legal defense, 7th Pay Commission arrears disputes, and service tribunal litigation.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const circleDelegates = [
    { circle: "Indore City Circle", delegate: "Er. Manoj Joshi", contact: "+91 98260 11001" },
    { circle: "Indore O&M Circle", delegate: "Shri Deepak Solanki", contact: "+91 98260 11002" },
    { circle: "Ujjain Discom Circle", delegate: "Shri Kailash Bairagi", contact: "+91 98260 11003" },
    { circle: "Dewas Discom Circle", delegate: "Er. Sanjay Kulkarni", contact: "+91 98260 11004" },
    { circle: "Dhar Discom Circle", delegate: "Shri Rakesh Verma", contact: "+91 98260 11005" },
    { circle: "Khargone Circle", delegate: "Shri Mohanlal Yadav", contact: "+91 98260 11006" },
    { circle: "Khandwa Circle", delegate: "Er. Anita Upadhyay", contact: "+91 98260 11007" },
    { circle: "Mandsaur Circle", delegate: "Shri Surendra Chouhan", contact: "+91 98260 11008" },
    { circle: "Neemuch Circle", delegate: "Shri Bhagwan Das", contact: "+91 98260 11009" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Users className="w-3.5 h-3.5 text-sky-700" />
            <span>Board of Union • संघ मंडल directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Board of Union & Executive Council
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Meet the elected executive board members, zonal secretaries, and circle delegates representing 15,000+ power engineers and linemen across MP West Zone.
          </p>
        </div>

        {/* Executive Board Cards */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-600" />
            <span>Central Executive Office Bearers</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-sm shrink-0" 
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">{member.name}</h3>
                      <p className="text-xs font-extrabold text-sky-700">{member.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{member.circle}</p>
                    </div>
                  </div>

                  <span className="inline-block px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-900 text-[10px] font-bold">
                    Role: {member.role}
                  </span>

                  <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-100 pt-2">
                    "{member.bio}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs font-mono space-y-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zonal Circle Delegates Directory */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Circle Delegates & Representatives Directory</h2>
            <p className="text-xs text-slate-500">Contact regional circle delegates for immediate local grievance and PTW safety assistance.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {circleDelegates.map((d, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{d.circle}</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{d.delegate}</div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                  {d.contact}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
