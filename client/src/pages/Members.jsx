import React, { useState, useEffect } from 'react';
import { Users, Search, MapPin, Building2, Phone, Mail, ShieldCheck, Lock, Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('All');
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [revealedContacts, setRevealedContacts] = useState({});
  const [loading, setLoading] = useState(true);

  const circles = [
    'All',
    'Indore City Circle',
    'Indore Corporate Circle',
    'Ujjain Circle',
    'Dewas Division',
    'Ratlam Circle',
    'Dhar Circle',
    'Khargone Circle',
    'Khandwa Circle'
  ];

  const designations = [
    'All',
    'Superintending Engineer (SE)',
    'Assistant Engineer (AE)',
    'Junior Engineer (JE)',
    'Line Superintendent Grade-I',
    'Senior Lineman',
    'Line Attendant Grade-II',
    'Senior Accountant'
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      if (res.data?.success) {
        setMembers(res.data.members || []);
      }
    } catch (err) {
      console.error('Fetch members error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRevealContact = (memberId) => {
    setRevealedContacts(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const filteredMembers = members.filter(m => {
    const profile = m.profile || {};
    const matchesCircle = selectedCircle === 'All' || profile.circle === selectedCircle;
    const matchesDesignation = selectedDesignation === 'All' || profile.title === selectedDesignation;
    const matchesSearch = (profile.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (profile.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCircle && matchesDesignation && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Users className="w-4 h-4 text-blue-600" /> MPWZ Union Verified Employee Directory
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Member & Employee Directory
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Search electricity distribution engineers, line superintendents, linemen, accountants and zonal representatives across MP West Zone Discom circles.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search name, Employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            {/* Circle Dropdown */}
            <div>
              <select
                value={selectedCircle}
                onChange={(e) => setSelectedCircle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                <option value="All">All West Zone Circles</option>
                {circles.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Designation Dropdown */}
            <div>
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                <option value="All">All Designations</option>
                {designations.filter(d => d !== 'All').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Members Cards Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading member directory...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-2">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Members Found</h3>
            <p className="text-xs text-slate-500">Try clearing or changing your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const p = member.profile || {};
              const isRevealed = Boolean(revealedContacts[member.id]);

              return (
                <div
                  key={member.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    
                    {/* Header Info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={p.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                        alt={p.full_name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{p.full_name}</h3>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                            {member.employee_id || `MPWZ-${member.id}`}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-blue-700 leading-snug">{p.title || 'Discom Employee'}</p>
                        <p className="text-[11px] text-slate-500">{p.department || 'Operations'}</p>
                      </div>
                    </div>

                    {/* Union Role & Circle Badges */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold truncate">{p.circle || p.location || 'Indore Circle'}</span>
                      </div>
                      {p.union_designation && (
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Union Role: {p.union_designation}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {p.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {p.bio}
                      </p>
                    )}

                  </div>

                  {/* Sensitive Contact Protection Section */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {isRevealed ? (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-800">
                          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {p.phone || '+91 98260 00000'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-800 truncate">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-600" /> {member.email}</span>
                        </div>
                        <button
                          onClick={() => toggleRevealContact(member.id)}
                          className="w-full text-center text-[10px] text-slate-500 hover:text-slate-700 mt-1 font-medium"
                        >
                          Hide Details
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleRevealContact(member.id)}
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-600" /> Click to View Contact Details
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Members;
