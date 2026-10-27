import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  User, Users, Calendar, AlertTriangle, FileText, Send, Bell, CreditCard,
  CheckCircle, Clock, Search, Upload, Download, Eye, Plus, ShieldCheck, Lock, Edit3, X, Share2, Camera,
  ArrowRight, MapPin, MessageSquare, Ticket, CheckCircle2, QrCode, ExternalLink, Printer, AlertCircle
} from 'lucide-react';
import MemberCard from '../components/MemberCard';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';
import ProfilePhotoModal from '../components/ProfilePhotoModal';

export default function UserDashboard() {
  const { user, updateProfile, updateProfilePhoto } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.replace('/dashboard', '').replace(/^\//, '');
    if (path === 'profile' || path === 'card') return 'profile';
    return 'overview';
  });

  // Sync activeTab with URL path
  useEffect(() => {
    const path = location.pathname.replace('/dashboard', '').replace(/^\//, '');
    if (path === 'profile' || path === 'card') {
      setActiveTab('profile');
    } else if (['overview', 'directory', 'events', 'announcements', 'stories', 'documents', 'notifications', 'payments'].includes(path)) {
      setActiveTab(path);
    }
  }, [location.pathname]);

  // Data states
  const [directory, setDirectory] = useState([]);
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stories, setStories] = useState([]);
  const [inboxDocs, setInboxDocs] = useState([]);
  const [sentDocs, setSentDocs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendeePassModalEvent, setAttendeePassModalEvent] = useState(null);
  const [viewReceiptModal, setViewReceiptModal] = useState(null);

  // Modals & Form States
  const [editingProfile, setEditingProfile] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
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

  // Sync profile form when user updates
  useEffect(() => {
    if (user?.profile) {
      setProfileForm({
        full_name: user.profile.full_name || '',
        phone: user.profile.phone || '',
        whatsapp: user.profile.whatsapp || '',
        address: user.profile.address || '',
        city: user.profile.city || '',
        bio: user.profile.bio || '',
        avatar_url: user.profile.avatar_url || '',
        emergency_contact: user.profile.emergency_contact || ''
      });
    }
  }, [user]);

  const handleQuickPhotoSave = async (newPhotoUrl) => {
    try {
      const res = await updateProfilePhoto(newPhotoUrl);
      if (res.success) {
        setProfileForm(prev => ({ ...prev, avatar_url: newPhotoUrl }));
        setFeedback({ success: 'Profile photo updated successfully!' });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile photo.');
    }
  };

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
      if (activeTab === 'overview' || activeTab === 'profile' || activeTab === 'events') {
        const [evtRes, regRes] = await Promise.all([
          api.get(`/events/list?_t=${Date.now()}`),
          api.get(`/events/my-registrations?_t=${Date.now()}`)
        ]);
        if (evtRes.data?.success) setEvents(evtRes.data.events);
        if (regRes.data?.success) setMyRegistrations(regRes.data.registrations);
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
      if (activeTab === 'overview' || activeTab === 'profile' || activeTab === 'payments') {
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
            <div className="relative group shrink-0">
              <img
                src={user?.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md group-hover:brightness-95 transition-all"
              />
              <button
                type="button"
                onClick={() => setPhotoModalOpen(true)}
                className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md border-2 border-white transition-all transform hover:scale-110 active:scale-95"
                title="Change Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.profile?.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase">
                  {user?.status} MEMBER
                </span>
              </div>
              <p className="text-xs text-amber-800 font-extrabold mt-0.5">{user?.profile?.union_designation || 'Union Member'} • {user?.profile?.designation}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-600 mt-2 font-medium">
                <span>Member ID: <strong className="text-slate-900 font-extrabold">{user?.member_id || 'MPAVAKS-0001'}</strong></span>
                <span>•</span>
                <span>Circle: <strong className="text-slate-900 font-extrabold">{user?.profile?.circle || 'Indore'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Group Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Digital Member Card</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300 flex items-center gap-2"
            >
              <User className="w-4 h-4 text-amber-700" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setShareDocModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Share Doc</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: ShieldCheck },
            { id: 'chat', label: 'Live Group Chat', icon: MessageSquare, isExternal: true },
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
                onClick={() => {
                  if (tab.id === 'chat') {
                    navigate('/chat');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${tab.id === 'chat'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                  : active
                  ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-600/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${tab.id === 'chat' ? 'text-sky-600' : ''}`} />
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
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Unread Correspondence</span>
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
                      <span>Latest Union Correspondence</span>
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
                <h2 className="text-xl font-bold text-slate-900">Member Official Profile & ID Card</h2>
                <p className="text-xs text-slate-500 font-medium">View and download your official digital union identity card and employment records</p>
              </div>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{editingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Official Member Identity Card with Download PDF */}
            <div className="border-b border-slate-100 pb-6">
              <MemberCard
                member={editingProfile ? { ...user, profile: { ...user?.profile, ...profileForm } } : user}
              />
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                    <input
                      type="text"
                      value={profileForm.emergency_contact}
                      onChange={(e) => setProfileForm({ ...profileForm, emergency_contact: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Circle Division</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Profile Photo Uploader (Device Upload, Drag & Drop, Presets) */}
                <div className="pt-2">
                  <ProfilePhotoUploader
                    currentPhoto={profileForm.avatar_url}
                    onChange={(newPhoto) => setProfileForm(prev => ({ ...prev, avatar_url: newPhoto }))}
                  />
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

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
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

            {/* My Event Registrations & Attendee Passes in Member Profile */}
            <div className="pt-8 border-t border-slate-100 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    <Calendar className="w-3 h-3 text-sky-700" />
                    <span>Member Event Participation • कार्यक्रम सहभागिता</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    My Event Registrations & Attendee Passes
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Review your convention join requests, payment receipts, and official entry passes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Browse Upcoming Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {myRegistrations.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No event join requests recorded yet.</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You haven't requested to attend any union events yet. Join upcoming conventions, delegate summits, or safety workshops!
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5 mt-2"
                  >
                    <span>Explore Upcoming Events</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myRegistrations.map(reg => {
                    const isConfirmed = reg.registration_status === 'CONFIRMED';
                    const isPending = reg.registration_status === 'PENDING';
                    const isRejected = reg.registration_status === 'REJECTED';
                    const isPaid = Boolean(reg.is_paid || Number(reg.amount) > 0);

                    return (
                      <div
                        key={reg.id}
                        className={`p-5 rounded-3xl border transition-all space-y-3.5 shadow-sm ${
                          isConfirmed
                            ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                            : isRejected
                            ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                            : 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 inline-block shadow-xs">
                              {reg.event_type || 'Union Program'}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 leading-snug">
                              {reg.event_title}
                            </h4>
                            <p className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{reg.event_venue || 'Indore HQ'}</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border block ${
                              isPaid
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}>
                              {isPaid ? `₹${reg.amount || reg.event_fee}` : 'Free Entry'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              {reg.event_date || 'Upcoming'}
                            </span>
                          </div>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/60">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Attendance Status</span>
                            {isConfirmed && (
                              <span className="font-extrabold text-emerald-700 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved to Attend
                              </span>
                            )}
                            {isPending && (
                              <span className="font-extrabold text-amber-700 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Admin Review
                              </span>
                            )}
                            {isRejected && (
                              <span className="font-extrabold text-rose-700 flex items-center gap-1 mt-0.5">
                                <X className="w-3.5 h-3.5 text-rose-600" /> Request Rejected
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Payment Status</span>
                            {isPaid ? (
                              <span className={`font-extrabold flex items-center gap-1 mt-0.5 ${
                                reg.payment_status === 'CONFIRMED' || reg.payment_status === 'VERIFIED'
                                  ? 'text-emerald-700'
                                  : reg.payment_status === 'REJECTED'
                                  ? 'text-rose-700'
                                  : 'text-amber-700'
                              }`}>
                                {reg.payment_status === 'CONFIRMED' || reg.payment_status === 'VERIFIED' ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified ✓
                                  </>
                                ) : reg.payment_status === 'REJECTED' ? (
                                  <>
                                    <X className="w-3.5 h-3.5" /> Rejected
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5" /> Under Verification
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-semibold block mt-0.5">
                                Free Entry (No Fee)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Payment UTR & Receipt Proof if Paid */}
                        {isPaid && (
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] font-mono flex items-center justify-between gap-2 shadow-xs">
                            <span className="text-slate-700 truncate">
                              UTR: <strong className="text-slate-900">{reg.transaction_id || 'N/A'}</strong>
                            </span>
                            {reg.payment_proof_url && (
                              <button
                                type="button"
                                onClick={() => setViewReceiptModal(reg.payment_proof_url)}
                                className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Receipt</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Rejection Notice */}
                        {isRejected && (
                          <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-900 text-xs space-y-1">
                            <span className="font-bold block text-rose-950">Rejection Remark:</span>
                            <span className="text-[11px] block">
                              {reg.rejection_reason || 'Join request rejected by admin. You cannot attend this event without approval.'}
                            </span>
                            <div className="text-right pt-0.5">
                              <button
                                type="button"
                                onClick={() => navigate('/events')}
                                className="text-[11px] font-bold text-rose-800 hover:underline"
                              >
                                Re-apply with corrected details →
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Attendance Action & Pass Code */}
                        <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                          {isConfirmed ? (
                            <>
                              <div className="space-y-0.5">
                                <span className="text-[9px] uppercase tracking-wider text-emerald-800 font-extrabold block">Official Pass Code</span>
                                <span className="font-mono text-xs font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 inline-block">
                                  {reg.pass_code}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const targetEvt = events.find(e => Number(e.id) === Number(reg.event_id)) || {
                                    id: reg.event_id,
                                    title: reg.event_title,
                                    start_date: reg.event_date,
                                    start_time: reg.event_time,
                                    venue: reg.event_venue,
                                    user_registration: reg
                                  };
                                  setAttendeePassModalEvent({
                                    ...targetEvt,
                                    user_registration: reg
                                  });
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>View Attendee Pass</span>
                              </button>
                            </>
                          ) : isPending ? (
                            <div className="w-full text-center p-2 rounded-xl bg-amber-100/60 border border-amber-200 text-amber-900 text-[11px] font-medium">
                              ⚠️ Request under review. Only approved members can attend this event.
                            </div>
                          ) : (
                            <div className="w-full text-center p-2 rounded-xl bg-rose-100/60 border border-rose-200 text-rose-900 text-[11px] font-medium">
                              ✕ Attendance pass not issued. Contact union administration for help.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: UNION DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Union Directory</h2>
                <p className="text-xs text-slate-500 font-medium">Browse active MPVMAVAKS discom engineers and linemen</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Events & Join Requests</h2>
                <p className="text-xs text-slate-500 font-medium">Track your delegate pass approvals and join union conventions</p>
              </div>
              <button
                onClick={() => navigate('/events')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Browse All Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(evt => {
                const isReg = Boolean(evt.user_registration);
                const regStatus = (evt.user_registration?.registration_status || '').toUpperCase();
                return (
                  <div key={evt.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-800 uppercase tracking-wider">{evt.event_type}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            Number(evt.event_fee) > 0
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {Number(evt.event_fee) > 0 ? `₹${evt.event_fee}` : 'Free Entry'}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">{evt.start_date}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">{evt.title}</h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      {isReg ? (
                        regStatus === 'CONFIRMED' ? (
                          <div className="space-y-2">
                            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Approved Pass:</span>
                                <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                  {evt.user_registration.pass_code}
                                </span>
                              </span>
                              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-200">
                                Confirmed
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1">
                              {evt.user_registration.payment_proof_url && (
                                <button
                                  type="button"
                                  onClick={() => setViewReceiptModal(evt.user_registration.payment_proof_url)}
                                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-200"
                                >
                                  <Eye className="w-3 h-3 text-slate-500" />
                                  <span>View Receipt</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setAttendeePassModalEvent(evt)}
                                className="ml-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>View Attendee Pass</span>
                              </button>
                            </div>
                          </div>
                        ) : regStatus === 'REJECTED' ? (
                          <div className="space-y-2">
                            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold">
                                <span className="flex items-center gap-1.5 text-rose-700">
                                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span>Request Rejected • Cannot Attend</span>
                                </span>
                                <span className="text-[10px] uppercase font-bold text-rose-700">Rejected</span>
                              </div>
                              <p className="text-[11px] text-rose-800 font-medium pl-5">
                                Reason: {evt.user_registration.rejection_reason || 'Join request was not approved by administration.'}
                              </p>
                            </div>
                            <div className="text-right">
                              <button
                                onClick={() => navigate(`/events?id=${evt.id}`)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                              >
                                <span>Re-Apply with New Receipt</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Join Request Pending Approval</span>
                              </span>
                              {evt.user_registration.transaction_id && (
                                <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                                  UTR: {evt.user_registration.transaction_id}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-amber-800 px-1">
                              <span>⚠️ Only approved members can attend this event.</span>
                              {evt.user_registration.payment_proof_url && (
                                <button
                                  type="button"
                                  onClick={() => setViewReceiptModal(evt.user_registration.payment_proof_url)}
                                  className="text-sky-700 hover:text-sky-800 font-bold underline flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View Receipt</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">Not registered yet</span>
                          <button
                            onClick={() => navigate(`/events?id=${evt.id}`)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                          >
                            <span>{Number(evt.event_fee) > 0 ? `Request to Join (₹${evt.event_fee})` : 'Request to Join (Free)'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">My Payment History</h2>
                <p className="text-xs text-slate-500 font-medium">Verify transaction references, receipts, and payment approval status</p>
              </div>
              <button
                onClick={() => navigate('/events')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
              >
                Browse Paid Events
              </button>
            </div>

            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-200">
                  No payment history recorded.
                </div>
              ) : (
                payments.map(p => {
                  const isVerified = p.status === 'VERIFIED' || p.status === 'CONFIRMED' || p.status === 'SUCCESS';
                  const isRejected = p.status === 'REJECTED';

                  return (
                    <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-amber-800 font-bold">
                            {p.payment_type} PAYMENT
                          </span>
                          {p.event_title && (
                            <span className="font-sans font-bold text-slate-900 text-xs">
                              • {p.event_title}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-slate-700 text-[11px] flex-wrap">
                          <span>UTR: <strong className="text-slate-900 font-mono">{p.transaction_id || 'N/A'}</strong></span>
                          <span>Date: {p.payment_date || (p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A')}</span>
                        </div>

                        {p.remarks && (
                          <p className="font-sans text-[11px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                            Note: {p.remarks}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                        <span className="text-base font-extrabold text-slate-900">₹{p.amount}</span>
                        <div className="flex items-center gap-2">
                          {p.payment_proof_url && (
                            <button
                              type="button"
                              onClick={() => setViewReceiptModal(p.payment_proof_url)}
                              className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 text-[10px] font-bold flex items-center gap-1 font-sans transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Receipt Proof</span>
                            </button>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isRejected
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {isVerified ? 'VERIFIED' : isRejected ? 'REJECTED' : 'PENDING REVIEW'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
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

      {/* Profile Photo Quick Update Modal */}
      <ProfilePhotoModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        initialPhoto={user?.profile?.avatar_url || ''}
        onSave={handleQuickPhotoSave}
        title="Update Member Profile Photo"
        subtitle="Upload your photo from your computer/device or choose an official portrait"
      />

      {/* Official Union Attendee Pass Modal */}
      {attendeePassModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setAttendeePassModalEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pass Header */}
            <div className="text-center border-b border-slate-100 pb-4 space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-300">
                Official Delegate Entry Pass
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">MPVMAVAKS Union Assembly</h3>
              <p className="text-xs text-slate-500">M.P. Electricity Board Commissioned Employees Union</p>
            </div>

            {/* Pass Ticket Body */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white space-y-4 shadow-xl border border-sky-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-sky-300 font-bold uppercase tracking-wider block">Program / Event</span>
                  <h4 className="text-base font-extrabold text-white leading-snug mt-0.5">{attendeePassModalEvent.title}</h4>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold shrink-0">
                  APPROVED ATTENDEE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Delegate Member</span>
                  <span className="font-bold text-white block truncate">{user?.profile?.full_name || user?.email}</span>
                  <span className="text-[10px] font-mono text-amber-400">{user?.member_id || `ID: ${user?.id}`}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Discom Circle</span>
                  <span className="font-bold text-white block truncate">{user?.profile?.circle || 'Indore Region'}</span>
                  <span className="text-[10px] text-slate-300 truncate block">{user?.profile?.designation || 'Member'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Date & Time</span>
                  <span className="font-bold text-white block">{attendeePassModalEvent.start_date}</span>
                  <span className="text-[10px] text-slate-300 block">{attendeePassModalEvent.start_time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Assembly Venue</span>
                  <span className="font-bold text-white block truncate">{attendeePassModalEvent.venue}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold block">Entry: Gate Verified</span>
                </div>
              </div>

              {/* Pass Code Barcode simulation */}
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold block">Verification Pass Code</span>
                  <span className="font-mono text-sm sm:text-base font-black tracking-widest text-amber-300 block">
                    {attendeePassModalEvent.user_registration?.pass_code || attendeePassModalEvent.pass_code || 'PASS-CONFIRMED'}
                  </span>
                </div>
                <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-1">
                Notice: Non-transferable digital pass. Only approved members with valid identity card can attend.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print / Save Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setAttendeePassModalEvent(null)}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Payment Receipt Preview</h3>
              <button onClick={() => setViewReceiptModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[220px]">
              {viewReceiptModal.startsWith('data:application/pdf') ? (
                <iframe
                  src={viewReceiptModal}
                  title="Receipt Document"
                  className="w-full h-80 rounded-xl"
                />
              ) : (
                <img
                  src={viewReceiptModal}
                  alt="Receipt Preview"
                  className="w-full h-full max-h-[55vh] object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={viewReceiptModal}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Tab</span>
              </a>

              <button
                type="button"
                onClick={() => setViewReceiptModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
