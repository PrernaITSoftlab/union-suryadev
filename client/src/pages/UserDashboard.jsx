import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { 
  User, Users, Calendar, AlertTriangle, FileText, Send, Bell, CreditCard, 
  CheckCircle, Clock, Search, Upload, Download, Eye, Plus, ShieldCheck, Lock, Edit3, X, Share2
} from 'lucide-react';

export default function UserDashboard() {
  const { user, updateProfile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [directory, setDirectory] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stories, setStories] = useState([]);
  const [inboxDocs, setInboxDocs] = useState([]);
  const [sentDocs, setSentDocs] = useState([]);
  const [payments, setPayments] = useState([]);

  // Modals & Form States
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.profile?.full_name || '',
    phone: user?.profile?.phone || '',
    whatsapp: user?.profile?.whatsapp || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    bio: user?.profile?.bio || '',
    avatar_url: user?.profile?.avatar_url || '',
    emergency_contact: user?.profile?.emergency_contact || ''
  });

  const [newStoryModal, setNewStoryModal] = useState(false);
  const [storyForm, setStoryForm] = useState({ title: '', description: '', category: 'General Circular', attachment_url: '', attachment_type: 'PDF' });

  const [shareDocModal, setShareDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ recipient_id: '', title: '', message: '', file_url: '', file_name: '', file_type: 'PDF', file_size: '1.2 MB' });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      if (activeTab === 'overview' || activeTab === 'directory') {
        const dirRes = await api.get('/members/directory');
        if (dirRes.data.success) setDirectory(dirRes.data.members);
      }
      if (activeTab === 'overview' || activeTab === 'events') {
        const evtRes = await api.get('/events/list');
        if (evtRes.data.success) setEvents(evtRes.data.events);
      }
      if (activeTab === 'overview' || activeTab === 'announcements') {
        const annRes = await api.get('/announcements/list');
        if (annRes.data.success) setAnnouncements(annRes.data.announcements);
      }
      if (activeTab === 'overview' || activeTab === 'stories') {
        const stRes = await api.get('/stories/feed');
        if (stRes.data.success) setStories(stRes.data.stories);
      }
      if (activeTab === 'overview' || activeTab === 'documents') {
        const [inRes, sentRes] = await Promise.all([
          api.get('/documents/inbox'),
          api.get('/documents/sent')
        ]);
        if (inRes.data.success) setInboxDocs(inRes.data.documents);
        if (sentRes.data.success) setSentDocs(sentRes.data.documents);
      }
      if (activeTab === 'overview' || activeTab === 'payments') {
        const payRes = await api.get('/payments/my-history');
        if (payRes.data.success) setPayments(payRes.data.payments);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(profileForm);
      if (res.success) {
        setEditingProfile(false);
        setFeedback({ success: 'Profile updated successfully!' });
      }
    } catch (err) {
      setFeedback({ error: 'Failed to update profile.' });
    }
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/stories/create', storyForm);
      if (res.data.success) {
        setNewStoryModal(false);
        setStoryForm({ title: '', description: '', category: 'General Circular', attachment_url: '', attachment_type: 'PDF' });
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to publish story.');
    }
  };

  const handleShareDocSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/documents/share', docForm);
      if (res.data.success) {
        setShareDocModal(false);
        setDocForm({ recipient_id: '', title: '', message: '', file_url: '', file_name: '', file_type: 'PDF', file_size: '1.2 MB' });
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to share document.');
    }
  };

  const openShareDocForMember = (member) => {
    setDocForm(prev => ({ ...prev, recipient_id: String(member.id) }));
    setShareDocModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Banner Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <img 
              src={user?.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'} 
              alt="Avatar" 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.profile?.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase">
                  {user?.status} MEMBER
                </span>
              </div>
              <p className="text-xs text-amber-800 font-extrabold mt-0.5">{user?.profile?.union_designation || 'Union Member'} • {user?.profile?.designation}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-600 mt-2 font-medium">
                <span>Member ID: <strong className="text-slate-900 font-extrabold">{user?.member_id || 'UNION-IND-104'}</strong></span>
                <span>•</span>
                <span>Circle: <strong className="text-slate-900 font-extrabold">{user?.profile?.circle || 'Indore'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300 flex items-center gap-2"
            >
              <User className="w-4 h-4 text-amber-700" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setShareDocModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Share Doc</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: ShieldCheck },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'directory', label: 'Union Directory', icon: Users },
            { id: 'events', label: 'Events & Passes', icon: Calendar },
            { id: 'announcements', label: 'Announcements', icon: AlertTriangle },
            { id: 'stories', label: 'Union Stories', icon: FileText },
            { id: 'documents', label: 'Private Documents', icon: Send },
            { id: 'notifications', label: `Notifications (${unreadCount})`, icon: Bell },
            { id: 'payments', label: 'My Payments', icon: CreditCard }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  active 
                    ? 'bg-amber-500 text-slate-950 shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Upcoming Events</span>
                <div className="text-2xl font-extrabold text-slate-900">{events.length}</div>
                <span className="text-xs text-amber-700 font-bold">Available to join</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Unread Notices</span>
                <div className="text-2xl font-extrabold text-slate-900">{unreadCount}</div>
                <span className="text-xs text-red-600 font-bold">Priority notifications</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Private Inbox Docs</span>
                <div className="text-2xl font-extrabold text-slate-900">{inboxDocs.length}</div>
                <span className="text-xs text-sky-700 font-bold">Shared with you</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Union Directory</span>
                <div className="text-2xl font-extrabold text-slate-900">{directory.length}</div>
                <span className="text-xs text-emerald-700 font-bold">Active discom members</span>
              </div>
            </div>

            {/* Two Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Recent Announcements & Events */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>Latest Union Notices</span>
                    </h3>
                    <button onClick={() => setActiveTab('announcements')} className="text-xs text-amber-700 font-bold hover:underline">View All</button>
                  </div>

                  <div className="space-y-3">
                    {announcements.slice(0, 3).map(a => (
                      <div key={a.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-amber-800 uppercase">{a.type}</span>
                          <span className="text-slate-500 font-mono">{a.start_date}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{a.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{a.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Shared Documents & Stories */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Send className="w-5 h-5 text-sky-600" />
                      <span>Private Documents Inbox</span>
                    </h3>
                    <button onClick={() => setActiveTab('documents')} className="text-xs text-sky-700 font-bold hover:underline">View All</button>
                  </div>

                  <div className="space-y-3">
                    {inboxDocs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">No private documents received yet.</div>
                    ) : (
                      inboxDocs.slice(0, 3).map(d => (
                        <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900">{d.sender_name}</span>
                            <span className="text-slate-500 font-mono">{new Date(d.sent_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-semibold text-xs text-sky-800">{d.title}</h4>
                          <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-amber-700 font-bold hover:underline inline-flex items-center gap-1 pt-1 font-mono">
                            <Download className="w-3 h-3" />
                            <span>Download {d.file_name}</span>
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Member Official Profile</h2>
                <p className="text-xs text-slate-500 font-medium">View and update your personal and contact details</p>
              </div>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{editingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>

            {editingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Phone</label>
                    <input
                      type="text"
                      value={profileForm.whatsapp}
                      onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Avatar / Photo URL</label>
                    <input
                      type="url"
                      value={profileForm.avatar_url}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bio & Discom Experience</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Save Profile Changes
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="text-slate-900 font-bold">{user?.profile?.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-amber-800 font-bold">{user?.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-slate-800">{user?.profile?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Contact:</span>
                    <span className="text-slate-800">{user?.profile?.emergency_contact || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Member ID (Admin Controlled):</span>
                    <span className="text-amber-700 font-extrabold">{user?.member_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Discom Company:</span>
                    <span className="text-slate-900 font-bold">{user?.profile?.company}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Circle / Division:</span>
                    <span className="text-slate-900 font-bold">{user?.profile?.circle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Union Position:</span>
                    <span className="text-sky-800 font-bold">{user?.profile?.union_designation}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UNION DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Union Directory</h2>
                <p className="text-xs text-slate-500 font-medium">Browse active MPWZ discom engineers and linemen</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {directory.map(m => (
                <div key={m.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-amber-300 transition-colors shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={m.avatar_url} alt={m.full_name} className="w-14 h-14 rounded-2xl object-cover border border-amber-500/50" />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{m.full_name}</h3>
                      <span className="text-xs text-amber-800 font-bold block">{m.union_designation || m.designation}</span>
                      <span className="text-[10px] font-mono text-slate-500">{m.member_id} • {m.circle}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {m.bio || `${m.company} - ${m.city}`}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">{m.phone || 'Phone Private'}</span>
                    {m.id !== user?.id && (
                      <button
                        onClick={() => openShareDocForMember(m)}
                        className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-bold hover:bg-sky-100 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Share Doc</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Events & Registered Passes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(evt => {
                const isReg = Boolean(evt.user_registration);
                return (
                  <div key={evt.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-amber-800">
                        <span>{evt.event_type}</span>
                        <span className="text-slate-500 font-mono">{evt.start_date}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900">{evt.title}</h3>
                      <p className="text-xs text-slate-600">{evt.venue}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      {isReg ? (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center justify-between font-bold">
                          <span>Pass: {evt.user_registration.pass_code}</span>
                          <span>{evt.user_registration.registration_status}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Not registered. Browse Events page to join.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Union Announcements Feed</h2>
            <div className="space-y-4">
              {announcements.map(a => (
                <div key={a.id} className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex justify-between text-xs font-bold text-amber-800">
                    <span>{a.type} NOTICE</span>
                    <span className="text-slate-500 font-mono">{a.start_date}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>
                  {a.attachment_url && (
                    <a href={a.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-sky-700 font-bold hover:underline pt-2 font-mono">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Gazette PDF</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: UNION STORIES */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Union Stories & Internal Feed</h2>
                <p className="text-xs text-slate-500 font-medium">Circulars, technical guides, and member posts</p>
              </div>
              <button
                onClick={() => setNewStoryModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Story</span>
              </button>
            </div>

            <div className="space-y-6">
              {stories.map(s => (
                <div key={s.id} className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <img src={s.author_avatar} alt={s.author_name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{s.author_name}</h4>
                      <span className="text-[11px] text-amber-800 font-bold">{s.author_title} • {new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase">{s.category}</span>
                    <h3 className="font-bold text-base text-slate-900">{s.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                  </div>

                  {s.attachment_url && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-mono font-medium">Attachment: {s.category}.pdf</span>
                      <a href={s.attachment_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-bold hover:bg-sky-100 transition-colors flex items-center gap-1.5 shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Attachment</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PRIVATE DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Private Document Sharing Center</h2>
                <p className="text-xs text-slate-500 font-medium">Secure member-to-member private file exchange</p>
              </div>
              <button
                onClick={() => setShareDocModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Share New Document</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Inbox */}
              <div className="space-y-4">
                <h3 className="font-bold text-base text-sky-800 border-b border-slate-200 pb-2">Shared With Me (Inbox)</h3>
                {inboxDocs.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 shadow-sm">Inbox is empty.</div>
                ) : (
                  inboxDocs.map(d => (
                    <div key={d.id} className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-900">From: {d.sender_name}</span>
                        <span className="text-slate-500 font-mono">{new Date(d.sent_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-sm text-sky-900">{d.title}</h4>
                      {d.message && <p className="text-xs text-slate-600">{d.message}</p>}
                      <div className="pt-2 flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-mono">{d.file_name} ({d.file_size})</span>
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="text-amber-800 hover:underline flex items-center gap-1 font-bold">
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sent */}
              <div className="space-y-4">
                <h3 className="font-bold text-base text-amber-800 border-b border-slate-200 pb-2">Sent By Me (Outbox)</h3>
                {sentDocs.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 shadow-sm">Outbox is empty.</div>
                ) : (
                  sentDocs.map(d => (
                    <div key={d.id} className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-900">To: {d.recipient_name}</span>
                        <span className="text-slate-500 font-mono">{new Date(d.sent_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-sm text-amber-900">{d.title}</h4>
                      {d.message && <p className="text-xs text-slate-600">{d.message}</p>}
                      <div className="pt-2 text-xs text-slate-500 font-mono">
                        {d.file_name} ({d.file_size})
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 8: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Notifications Center</h2>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-amber-700 font-bold hover:underline">Mark All Read</button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 rounded-2xl border ${n.is_read ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-300'} flex items-start justify-between gap-4`}>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono block mt-2">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => markAsRead(n.id)} className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold">
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">My Payment History</h2>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-medium">No payment history recorded.</div>
              ) : (
                payments.map(p => (
                  <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-amber-800 font-bold block">{p.payment_type} PAYMENT</span>
                      <span className="text-slate-900 font-bold">UTR: {p.transaction_id}</span>
                      <span className="text-slate-500 block text-[11px]">{p.payment_date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 block">₹{p.amount}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* SHARE DOC MODAL */}
      {shareDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl">
            <button onClick={() => setShareDocModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Share Private Document</h3>

            <form onSubmit={handleShareDocSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Recipient Member *</label>
                <select
                  required
                  value={docForm.recipient_id}
                  onChange={(e) => setDocForm({ ...docForm, recipient_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900"
                >
                  <option value="">-- Choose Member --</option>
                  {directory.filter(m => m.id !== user?.id).map(m => (
                    <option key={m.id} value={m.id}>{m.full_name} ({m.member_id} - {m.circle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Substation Grievance Report"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document File URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={docForm.file_url}
                  onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message to Recipient</label>
                <textarea
                  rows={2}
                  placeholder="Optional message..."
                  value={docForm.message}
                  onChange={(e) => setDocForm({ ...docForm, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold">
                Send Private Document
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH STORY MODAL */}
      {newStoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl">
            <button onClick={() => setNewStoryModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Publish Union Story Feed Post</h3>

            <form onSubmit={handleStorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Story Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Safety Review Meeting Summary"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={storyForm.category}
                  onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900"
                >
                  <option value="General Circular">General Circular</option>
                  <option value="Wage & Pension Orders">Wage & Pension Orders</option>
                  <option value="Safety Protocols">Safety Protocols</option>
                  <option value="Grievance Notices">Grievance Notices</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the story summary or circular details..."
                  value={storyForm.description}
                  onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Attachment PDF/Doc URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={storyForm.attachment_url}
                  onChange={(e) => setStoryForm({ ...storyForm, attachment_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                Publish Story Post
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
