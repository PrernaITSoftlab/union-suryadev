import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../context/ConnectionContext';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DocumentHub from '../components/DocumentHub';
import MemberCard from '../components/MemberCard';
import { 
  User, 
  Network, 
  Briefcase, 
  Calendar, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Edit3, 
  ArrowRight, 
  Sparkles,
  Zap,
  Building,
  FileText,
  Users,
  Search,
  Mail,
  Phone,
  Linkedin,
  Globe,
  MapPin,
  X,
  Copy,
  ShieldCheck,
  Check
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { connections, pendingIncoming, suggested, respondConnectRequest, sendConnectRequest } = useConnections();
  const { notifications } = useNotifications();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'documents', 'directory'
  const [processingId, setProcessingId] = useState(null);

  // Directory & Contact search states
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [activeModalMember, setActiveModalMember] = useState(null);
  const [copiedContact, setCopiedContact] = useState('');

  // Fetch Directory Members
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await api.get('/members', {
        params: {
          search: memberSearch,
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
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchMembers();
    }
  }, [activeTab, memberSearch, selectedIndustry, selectedLocation]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center space-y-4 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">User Portal Access Required</h2>
        <p className="text-xs text-slate-600">Please sign in to access your personal networking dashboard.</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all">
          Go to Home & Sign In
        </Link>
      </div>
    );
  }

  const profile = user.profile || {};
  const completionScore = profile.profile_completion || 85;

  const handleRespond = async (connId, action) => {
    setProcessingId(connId);
    try {
      await respondConnectRequest(connId, action);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCopyText = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedContact(type);
    setTimeout(() => setCopiedContact(''), 2000);
  };

  const industries = ['All', 'Financial Technology', 'Management Consulting', 'Cybersecurity', 'Clean Energy', 'Digital Marketing', 'Commercial Real Estate', 'Healthcare'];
  const locations = ['All', 'Bengaluru', 'Mumbai', 'Austin', 'Singapore', 'Sydney', 'Dubai', 'Pune'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
            alt={profile.full_name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {profile.full_name}!</h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {isAdmin ? 'Admin' : 'User'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{profile.title || 'Discom Employee'} — {profile.company || 'MPWZ'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 border border-amber-200 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Admin Panel
            </Link>
          )}
          <Link
            to="/profile/edit"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit Profile
          </Link>
          <Link
            to="/connections"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Network className="w-3.5 h-3.5" /> Connections ({connections.length})
          </Link>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" /> Overview & Network
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" /> Upload & Share Documents
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'directory'
              ? 'bg-blue-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" /> Directory & Contacts
        </button>
      </div>

      {/* TAB 1: OVERVIEW & NETWORK */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Profile Completion Meter */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Profile Completeness</span>
                <span className="text-xs font-extrabold text-blue-700">{completionScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${completionScore}%` }} />
              </div>
              <p className="text-[10px] text-slate-500">Add phone & employee ID to hit 100%</p>
            </div>

            {/* Total Connections */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>My Network</span>
                <Network className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{connections.length}</div>
              <p className="text-[10px] text-slate-500">Connected Decision Makers</p>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Pending Requests</span>
                <UserPlus className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-amber-800">{pendingIncoming.length}</div>
              <p className="text-[10px] text-slate-500">Awaiting your approval</p>
            </div>

            {/* Document Vault Quick Jump */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>Shared Documents</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">Document Vault</div>
              <button 
                onClick={() => setActiveTab('documents')} 
                className="text-[10px] text-blue-700 font-bold hover:underline"
              >
                Upload / Browse Shared Files &rarr;
              </button>
            </div>

          </div>

          {/* Main Grid: Pending Requests & Recommended Matches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (2 cols): Pending Requests & Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Incoming Connection Requests Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-600" /> Incoming Connection Invitations ({pendingIncoming.length})
                </h3>

                {pendingIncoming.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No pending invitations. Explore the member directory to connect!</p>
                ) : (
                  <div className="space-y-3">
                    {pendingIncoming.map((req) => (
                      <div key={req.connection_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.requester?.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                            alt={req.requester?.profile?.full_name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-100"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{req.requester?.profile?.full_name}</h4>
                            <p className="text-[11px] text-slate-500">{req.requester?.profile?.title} — {req.requester?.profile?.company}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespond(req.connection_id, 'accept')}
                            disabled={processingId === req.connection_id}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => handleRespond(req.connection_id, 'decline')}
                            disabled={processingId === req.connection_id}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Platform Announcements */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" /> MPWZ Union Announcements
                </h3>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  🎉 <strong>Annual Delegate Convention 2026 Registration Open!</strong> Reserve your delegate pass now for the upcoming convention in Indore.
                </div>
              </div>

            </div>

            {/* Right Column (1 col): Suggested Professionals */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Suggested Connections
              </h3>

              <div className="space-y-3">
                {suggested.map((sug) => (
                  <div key={sug.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={sug.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                        alt={sug.profile?.full_name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-blue-100 shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{sug.profile?.full_name}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{sug.profile?.company}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => sendConnectRequest(sug.id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD & SHARE DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="animate-in fade-in">
          <DocumentHub />
        </div>
      )}

      {/* TAB 3: DIRECTORY & CONTACTS */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2 shadow-sm">
                <Users className="w-4 h-4 text-blue-600" /> Community Directory & Contact Roster
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Network <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Member Contacts & Profiles</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Access direct emails, phone numbers, and professional info of verified network members.
              </p>
            </div>
          </div>

          {/* Search & Filtering Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by name, company, title, or skills..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            <div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind === 'All' ? 'All Industries' : ind}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Member Roster Grid */}
          {loadingMembers ? (
            <div className="py-16 text-center text-slate-500 text-xs font-medium">Loading member contacts...</div>
          ) : members.length === 0 ? (
            <div className="py-16 bg-white rounded-3xl text-center space-y-3 border border-slate-200 shadow-sm">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No members matched your search</h3>
              <p className="text-xs text-slate-500">Try adjusting your industry or location filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onOpenDetails={(mem) => setActiveModalMember(mem)}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* Member Details & Contact Modal */}
      {activeModalMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setActiveModalMember(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Avatar Header */}
            <div className="flex items-start gap-4 mb-6">
              <img
                src={activeModalMember.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                alt={activeModalMember.profile?.full_name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-100 shrink-0"
              />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{activeModalMember.profile?.full_name}</h3>
                <p className="text-xs font-bold text-blue-700">{activeModalMember.profile?.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  {activeModalMember.profile?.company}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {activeModalMember.profile?.location}
                </p>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 mb-5 text-xs">
              <span className="text-[10px] font-extrabold uppercase text-blue-700 block mb-1">
                Direct Contact Information
              </span>

              {/* Email */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-800 truncate">{activeModalMember.email}</span>
                </div>
                <button
                  onClick={() => handleCopyText(activeModalMember.email, 'email')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedContact === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedContact === 'email' ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Phone */}
              {activeModalMember.profile?.phone && (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-slate-800 truncate">{activeModalMember.profile.phone}</span>
                  </div>
                  <a
                    href={`tel:${activeModalMember.profile.phone}`}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0 border border-emerald-200 transition-colors"
                  >
                    Call
                  </a>
                </div>
              )}

              {/* LinkedIn */}
              {activeModalMember.profile?.linkedin && (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center gap-2 truncate">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-slate-800 truncate">{activeModalMember.profile.linkedin}</span>
                  </div>
                  <a
                    href={activeModalMember.profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold shrink-0 border border-blue-200 transition-colors"
                  >
                    Open
                  </a>
                </div>
              )}
            </div>

            {/* Bio & Skills */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Executive Bio</span>
                <p className="text-slate-700 leading-relaxed">{activeModalMember.profile?.bio}</p>
              </div>

              {activeModalMember.profile?.skills && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">Core Competencies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalMember.profile.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Union Verified Contact</span>
              <button
                onClick={() => setActiveModalMember(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
