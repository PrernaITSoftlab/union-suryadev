import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MemberCard from '../components/MemberCard';
import { Search, Filter, Users, RefreshCw, X, Building, MapPin, Globe, Linkedin, Briefcase } from 'lucide-react';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [activeModalMember, setActiveModalMember] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/members', {
        params: {
          search,
          industry: selectedIndustry,
          location: selectedLocation
        }
      });
      if (res.data.success) {
        setMembers(res.data.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search, selectedIndustry, selectedLocation]);

  const industries = ['All', 'Financial Technology', 'Management Consulting', 'Cybersecurity', 'Clean Energy', 'Digital Marketing', 'Commercial Real Estate', 'Healthcare'];
  const locations = ['All', 'Bengaluru', 'Mumbai', 'Austin', 'Singapore', 'Sydney', 'Dubai', 'Pune'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold mb-2">
            <Users className="w-4 h-4" /> Professional Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Union <span className="gradient-text-cyan">Member Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified business owners, executives, and innovators ready to collaborate.
          </p>
        </div>

        <button
          onClick={fetchMembers}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Directory
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-700/80 grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, company, title, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        {/* Industry Filter */}
        <div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind === 'All' ? 'All Industries' : ind}</option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Members Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading directory members...</div>
      ) : members.length === 0 ? (
        <div className="py-20 glass-panel rounded-3xl text-center space-y-3 border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No members matched your search</h3>
          <p className="text-xs text-slate-400">Try adjusting your industry or location filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onOpenDetails={(m) => setActiveModalMember(m)}
            />
          ))}
        </div>
      )}

      {/* Full Detail Modal */}
      {activeModalMember && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-card-dark relative animate-in zoom-in-95">
            <button
              onClick={() => setActiveModalMember(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <img
                src={activeModalMember.profile?.avatar_url}
                alt={activeModalMember.profile?.full_name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-cyan shadow-glow-cyan"
              />
              <div>
                <h3 className="text-xl font-extrabold text-white">{activeModalMember.profile?.full_name}</h3>
                <p className="text-xs font-bold text-brand-cyan">{activeModalMember.profile?.title}</p>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-brand-blue" />
                  {activeModalMember.profile?.company}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {activeModalMember.profile?.location}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Executive Bio</span>
                <p className="text-slate-300 leading-relaxed">{activeModalMember.profile?.bio}</p>
              </div>

              {activeModalMember.profile?.skills && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Core Competencies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalMember.profile.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeModalMember.profile?.services && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Services Offered</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalMember.profile.services.map((srv, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Direct Connect Verified</span>
              <button
                onClick={() => setActiveModalMember(null)}
                className="px-5 py-2 rounded-xl bg-brand-cyan text-navy-950 font-extrabold text-xs shadow-glow-cyan"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Members;
