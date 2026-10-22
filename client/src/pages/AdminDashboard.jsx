import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard, UserCheck, Users, Calendar, CreditCard, AlertTriangle, FileText,
  Send, PhoneCall, Settings, CheckCircle2, XCircle, Eye, UserPlus, Check, X, Search,
  Filter, Sparkles, RefreshCw, ChevronRight, Edit3, ShieldAlert, Award, Download,
  Camera, UploadCloud, Trash2, Plus, ExternalLink, Image as ImageIcon, User, MessageSquare
} from 'lucide-react';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';
import ProfilePhotoModal from '../components/ProfilePhotoModal';

export default function AdminDashboard() {
  const { user, settings, updateProfile, updateProfilePhoto } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('analytics');

  // State data
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventRegs, setEventRegs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stories, setStories] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [systemSettingsForm, setSystemSettingsForm] = useState(settings || {});

  // Notices / Orders & Photos state
  const [ordersList, setOrdersList] = useState([]);
  const [photosList, setPhotosList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [viewAppModal, setViewAppModal] = useState(null);
  const [createUserModal, setCreateUserModal] = useState(null);
  const [generatedCredentialsModal, setGeneratedCredentialsModal] = useState(null);
  const [createEventModal, setCreateEventModal] = useState(false);
  const [editEventModal, setEditEventModal] = useState(null);
  const [publishingEvent, setPublishingEvent] = useState(false);
  const [createAnnounceModal, setCreateAnnounceModal] = useState(false);
  const [editAnnounceModal, setEditAnnounceModal] = useState(null);

  // Payment Verification Modals
  const [viewReceiptModal, setViewReceiptModal] = useState(null);
  const [rejectPaymentModal, setRejectPaymentModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Event Join Requests State & Modals
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [regStatusFilter, setRegStatusFilter] = useState('all');
  const [regSearch, setRegSearch] = useState('');
  const [rejectRegModal, setRejectRegModal] = useState(null);
  const [rejectRegReason, setRejectRegReason] = useState('');
  const [viewRegProofModal, setViewRegProofModal] = useState(null);
  const [manageEventRequestsModal, setManageEventRequestsModal] = useState(null);

  // Orders / Notices Modals & Form
  const [createOrderModal, setCreateOrderModal] = useState(false);
  const [editOrderModal, setEditOrderModal] = useState(null);
  const [orderForm, setOrderForm] = useState({
    titleEn: '', titleHi: '', category: 'Govt. Circulars',
    date: new Date().toLocaleDateString('en-GB'), doc_url: ''
  });

  // Photos Modals & Form
  const [createPhotoModal, setCreatePhotoModal] = useState(false);
  const [editPhotoModal, setEditPhotoModal] = useState(null);
  const [photoForm, setPhotoForm] = useState({
    titleEn: '', titleHi: '', category: 'Delegation',
    descriptionEn: '', descriptionHi: '', image_url: '', tag: 'Photo Highlight', date: 'Sep 2026'
  });

  const pdfInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const eventBannerInputRef = useRef(null);
  const announceAttachmentInputRef = useRef(null);

  const [eventForm, setEventForm] = useState({
    title: '', description: '', banner_url: '', event_type: 'GENERAL',
    start_date: '', end_date: '', start_time: '10:00 AM', venue: '',
    capacity: 500, is_paid: false, event_fee: '', payment_qr_url: '',
    payment_instructions: '', visibility: 'PUBLIC', status: 'REGISTRATION_OPEN',
    requires_approval: true
  });

  const [announceForm, setAnnounceForm] = useState({
    title: '', description: '', type: 'GENERAL', priority: 'NORMAL',
    attachment_url: '', start_date: new Date().toISOString().split('T')[0],
    expiry_date: '', target_audience: 'ALL_MEMBERS', is_popup: true
  });

  const [feedback, setFeedback] = useState(null);

  // Admin Profile & Photo States
  const [adminPhotoModalOpen, setAdminPhotoModalOpen] = useState(false);
  const [editAdminProfileModalOpen, setEditAdminProfileModalOpen] = useState(false);
  const [adminProfileForm, setAdminProfileForm] = useState({
    full_name: user?.profile?.full_name || '',
    phone: user?.profile?.phone || '',
    whatsapp: user?.profile?.whatsapp || '',
    city: user?.profile?.city || '',
    address: user?.profile?.address || '',
    bio: user?.profile?.bio || '',
    avatar_url: user?.profile?.avatar_url || ''
  });

  // Sync admin profile form with user
  useEffect(() => {
    if (user?.profile) {
      setAdminProfileForm({
        full_name: user.profile.full_name || '',
        phone: user.profile.phone || '',
        whatsapp: user.profile.whatsapp || '',
        city: user.profile.city || '',
        address: user.profile.address || '',
        bio: user.profile.bio || '',
        avatar_url: user.profile.avatar_url || ''
      });
    }
  }, [user]);

  const handleAdminProfileSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await updateProfile(adminProfileForm);
      if (res.success) {
        setFeedback({ success: 'Admin profile and photo updated successfully!' });
        setEditAdminProfileModalOpen(false);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update admin profile.');
    }
  };

  const handleAdminPhotoSave = async (newPhotoUrl) => {
    try {
      const res = await updateProfilePhoto(newPhotoUrl);
      if (res.success) {
        setAdminProfileForm(prev => ({ ...prev, avatar_url: newPhotoUrl }));
        setFeedback({ success: 'Admin profile photo updated successfully!' });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update admin profile photo.');
    }
  };

  useEffect(() => {
    fetchModuleData();
  }, [activeModule, statusFilter]);

  const fetchModuleData = async () => {
    setLoading(true);
    try {
      if (activeModule === 'analytics') {
        const res = await api.get('/admin/dashboard-analytics');
        if (res.data.success) setAnalytics(res.data);
      } else if (activeModule === 'orders') {
        const res = await api.get('/orders/list');
        if (res.data.success) setOrdersList(res.data.orders);
      } else if (activeModule === 'photos') {
        const res = await api.get('/photos/list');
        if (res.data.success) setPhotosList(res.data.photos);
      } else if (activeModule === 'pending_approvals') {
        const res = await api.get('/membership-applications/list?status=PENDING');
        if (res.data.success) setPendingApprovals(res.data.applications);
      } else if (activeModule === 'applications') {
        const res = await api.get(`/membership-applications/list${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`);
        if (res.data.success) setApplications(res.data.applications);
      } else if (activeModule === 'members') {
        const res = await api.get(`/members/admin/list${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`);
        if (res.data.success) setMembers(res.data.members);
      } else if (activeModule === 'events') {
        const res = await api.get('/events/list');
        if (res.data.success) setEvents(res.data.events);
      } else if (activeModule === 'registrations') {
        const res = await api.get('/events/admin/registrations/list');
        if (res.data.success) setEventRegs(res.data.registrations);
      } else if (activeModule === 'payments') {
        const res = await api.get(`/payments/admin/list${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`);
        if (res.data.success) setPayments(res.data.payments);
      } else if (activeModule === 'announcements') {
        const res = await api.get('/announcements/list');
        if (res.data.success) setAnnouncements(res.data.announcements);
      } else if (activeModule === 'contact') {
        const res = await api.get('/contact/admin/list');
        if (res.data.success) setContactRequests(res.data.inquiries);
      } else if (activeModule === 'settings') {
        const res = await api.get('/settings/public');
        if (res.data.success) setSystemSettingsForm(res.data.settings);
      }
    } catch (err) {
      console.error('Admin module fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndGenerate = async (appId) => {
    const targetApp = pendingApprovals.find(a => a.id === appId) || applications.find(a => a.id === appId);
    if (targetApp && !targetApp.payment_proof_url) {
      alert(`Cannot approve application for ${targetApp.full_name}: Payment receipt screenshot is missing. Admin verification requires an uploaded payment receipt.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to approve ${targetApp?.full_name || 'member'} and generate login credentials?`)) return;

    try {
      const res = await api.post(`/membership-applications/${appId}/approve-and-generate`);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setGeneratedCredentialsModal(res.data.credentials);
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve application and generate credentials.');
    }
  };

  const handleVerifyAppPayment = async (appId) => {
    try {
      const res = await api.put(`/membership-applications/${appId}/verify-payment`);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        fetchModuleData();
      }
    } catch (err) {
      setFeedback({ error: 'Failed to verify payment.' });
    }
  };

  const handleOpenCreateUserFromApp = async (appId) => {
    try {
      const res = await api.get(`/membership-applications/${appId}/prefill-user`);
      if (res.data.success) {
        setCreateUserModal(res.data.prefilledUser);
      }
    } catch (err) {
      alert('Failed to pre-fill user data.');
    }
  };

  const handleConfirmCreateUser = async (e) => {
    e.preventDefault();
    if (!createUserModal) return;

    try {
      const res = await api.post('/members/admin/create', createUserModal);
      if (res.data.success) {
        alert(res.data.message);
        setCreateUserModal(null);
        setViewAppModal(null);
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user account.');
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve & verify this payment?')) return;
    try {
      let res;
      if (viewReceiptModal?.isApp && viewReceiptModal?.appId) {
        res = await api.put(`/membership-applications/${viewReceiptModal.appId}/verify-payment`);
      } else {
        res = await api.put(`/payments/admin/${paymentId}/verify`);
      }
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setViewReceiptModal(null);
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify payment.');
    }
  };

  const handleRejectPayment = async (e) => {
    e?.preventDefault();
    if (!rejectPaymentModal) return;
    try {
      const res = await api.put(`/payments/admin/${rejectPaymentModal.id}/reject`, {
        remarks: rejectReason || 'Invalid transaction reference or proof screenshot.'
      });
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setRejectPaymentModal(null);
        setViewReceiptModal(null);
        setRejectReason('');
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject payment.');
    }
  };

  // File Upload Handlers
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setOrderForm(prev => ({ ...prev, doc_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoForm(prev => ({ ...prev, image_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Orders CRUD
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/orders/admin/create', orderForm);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setCreateOrderModal(false);
        setOrderForm({ titleEn: '', titleHi: '', category: 'Govt. Circulars', date: new Date().toLocaleDateString('en-GB'), doc_url: '' });
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create Notice / Circular Order.');
    }
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!editOrderModal) return;
    try {
      const res = await api.put(`/orders/admin/${editOrderModal.id}`, orderForm);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setEditOrderModal(null);
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update Notice / Circular Order.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this Notice / Circular Order?')) return;
    try {
      const res = await api.delete(`/orders/admin/${orderId}`);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete Notice / Circular Order.');
    }
  };

  // Photos CRUD
  const handleCreatePhoto = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/photos/admin/create', photoForm);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setCreatePhotoModal(false);
        setPhotoForm({ titleEn: '', titleHi: '', category: 'Delegation', descriptionEn: '', descriptionHi: '', image_url: '', tag: 'Photo Highlight', date: 'Sep 2026' });
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photo.');
    }
  };

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();
    if (!editPhotoModal) return;
    try {
      const res = await api.put(`/photos/admin/${editPhotoModal.id}`, photoForm);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setEditPhotoModal(null);
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update photo.');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo from the gallery?')) return;
    try {
      const res = await api.delete(`/photos/admin/${photoId}`);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete photo.');
    }
  };

  // Event Handlers
  const handleEventBannerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEventForm(prev => ({ ...prev, banner_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (publishingEvent) return;
    setPublishingEvent(true);
    try {
      const payload = {
        ...eventForm,
        event_fee: Number(eventForm.event_fee) || 0,
        is_paid: Number(eventForm.event_fee) > 0
      };
      const res = await api.post('/events/admin/create', payload);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setCreateEventModal(false);
        setEventForm({
          title: '', description: '', banner_url: '', event_type: 'GENERAL',
          start_date: '', end_date: '', start_time: '10:00 AM', venue: '',
          capacity: 500, is_paid: false, event_fee: '', payment_qr_url: '',
          payment_instructions: '', visibility: 'PUBLIC', status: 'REGISTRATION_OPEN',
          requires_approval: true
        });
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setPublishingEvent(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editEventModal || publishingEvent) return;
    setPublishingEvent(true);
    try {
      const payload = {
        ...eventForm,
        event_fee: Number(eventForm.event_fee) || 0,
        is_paid: Number(eventForm.event_fee) > 0
      };
      const res = await api.put(`/events/admin/${editEventModal.id}`, payload);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setEditEventModal(null);
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update event.');
    } finally {
      setPublishingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await api.delete(`/events/admin/${eventId}`);
      if (res.data.success) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setEventRegs(prev => prev.filter(r => r.event_id !== eventId));
        setFeedback({ success: res.data.message || 'Event permanently deleted.' });
        setTimeout(() => setFeedback(null), 4000);
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  // Event Join Request Handlers
  const handleApproveRegistration = async (regId) => {
    try {
      const res = await api.put(`/events/admin/registrations/${regId}/approve`);
      if (res.data.success) {
        setFeedback({ success: res.data.message || 'Member join request approved successfully!' });
        setTimeout(() => setFeedback(null), 4000);
        // Refresh event registrations
        const regRes = await api.get('/events/admin/registrations/list');
        if (regRes.data.success) setEventRegs(regRes.data.registrations);
        // Refresh events list to reflect updated counts
        const evRes = await api.get('/events/list');
        if (evRes.data.success) setEvents(evRes.data.events);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve join request.');
    }
  };

  const handleConfirmRejectRegistration = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!rejectRegModal) return;
    try {
      const res = await api.put(`/events/admin/registrations/${rejectRegModal.id}/reject`, {
        rejection_reason: rejectRegReason
      });
      if (res.data.success) {
        setFeedback({ success: res.data.message || 'Member join request rejected.' });
        setTimeout(() => setFeedback(null), 4000);
        setRejectRegModal(null);
        setRejectRegReason('');
        // Refresh event registrations
        const regRes = await api.get('/events/admin/registrations/list');
        if (regRes.data.success) setEventRegs(regRes.data.registrations);
        // Refresh events list
        const evRes = await api.get('/events/list');
        if (evRes.data.success) setEvents(evRes.data.events);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject join request.');
    }
  };

  // Announcement Handlers
  const handleAnnounceAttachmentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAnnounceForm(prev => ({ ...prev, attachment_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements/admin/create', announceForm);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setCreateAnnounceModal(false);
        setAnnounceForm({
          title: '', description: '', type: 'GENERAL', priority: 'NORMAL',
          attachment_url: '', start_date: new Date().toISOString().split('T')[0],
          expiry_date: '', target_audience: 'ALL_MEMBERS', is_popup: true
        });
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast announcement.');
    }
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    if (!editAnnounceModal) return;
    try {
      const res = await api.put(`/announcements/admin/${editAnnounceModal.id}`, announceForm);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        setEditAnnounceModal(null);
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update announcement notice.');
    }
  };

  const handleDeleteAnnouncement = async (announceId) => {
    if (!window.confirm('Are you sure you want to delete this notice/announcement?')) return;
    try {
      const res = await api.delete(`/announcements/admin/${announceId}`);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        fetchModuleData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement notice.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/settings/admin/update', systemSettingsForm);
      if (res.data.success) {
        setFeedback({ success: 'System Settings updated successfully!' });
      }
    } catch (err) {
      setFeedback({ error: 'Failed to update settings.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Admin Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative group shrink-0">
              <img
                src={user?.profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'}
                alt="Admin Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500 shadow-md group-hover:brightness-95 transition-all"
              />
              <button
                type="button"
                onClick={() => setAdminPhotoModalOpen(true)}
                className="absolute -bottom-1 -right-1 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md border-2 border-white transition-all transform hover:scale-110 active:scale-95"
                title="Upload / Change Admin Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">MPVMAVAKS Union Admin Control Center</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-extrabold uppercase">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Logged in as {user?.profile?.full_name} ({user?.email})</p>
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
              onClick={() => setEditAdminProfileModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={fetchModuleData}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveModule('announcements'); setCreateAnnounceModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Issue Strike / Notice</span>
            </button>
          </div>
        </div>

        {/* Sidebar / Module Nav Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
          {[
            { id: 'analytics', label: 'Analytics Hub', icon: LayoutDashboard },
            { id: 'chat', label: 'Union Group Chat', icon: MessageSquare, isExternal: true },
            { id: 'admin_profile', label: 'Admin Profile & Photo', icon: User },
            { id: 'orders', label: 'Correspondence & Circulars (PDF)', icon: FileText },
            { id: 'photos', label: 'Photo Gallery', icon: Camera },
            { id: 'pending_approvals', label: 'Pending Member Approvals', icon: UserCheck },
            { id: 'applications', label: 'Membership Requests', icon: FileText },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'events', label: 'Events & Agitations', icon: Calendar },
            {
              id: 'registrations',
              label: 'Event Join Requests',
              icon: Award,
              badge: (eventRegs || []).filter(r => r.registration_status === 'PENDING').length
            },
            { id: 'payments', label: 'Payments Verification', icon: CreditCard },
            { id: 'announcements', label: 'Announcements', icon: AlertTriangle },
            { id: 'contact', label: 'Contact Inquiries', icon: PhoneCall },
            { id: 'settings', label: 'System Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'chat') {
                    navigate('/chat');
                  } else {
                    setActiveModule(tab.id);
                    setStatusFilter('all');
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
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {feedback?.success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedback.success}</span>
          </div>
        )}

        {/* MODULE: ADMIN PROFILE & PHOTO */}
        {activeModule === 'admin_profile' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  <span>Admin Profile & Official Photo</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">Manage administrator credentials, contact information, and upload official display photo</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-extrabold uppercase">
                SUPER ADMIN
              </span>
            </div>

            <form onSubmit={handleAdminProfileSubmit} className="space-y-6">
              {/* Profile Photo Uploader with Device File Upload & Presets */}
              <ProfilePhotoUploader
                currentPhoto={adminProfileForm.avatar_url}
                onChange={(newPhoto) => setAdminProfileForm(prev => ({ ...prev, avatar_url: newPhoto }))}
                onInstantSave={handleAdminPhotoSave}
                showInstantSaveButton={true}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    value={adminProfileForm.full_name}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Mobile Phone</label>
                  <input
                    type="text"
                    value={adminProfileForm.phone}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Communication Number</label>
                  <input
                    type="text"
                    value={adminProfileForm.whatsapp}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, whatsapp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Head Office Location</label>
                  <input
                    type="text"
                    value={adminProfileForm.city}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
                <input
                  type="text"
                  value={adminProfileForm.address}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Bio & Leadership Summary</label>
                <textarea
                  rows={3}
                  value={adminProfileForm.bio}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Admin Profile & Photo</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODULE: NOTICES & ORDERS (PDF) */}
        {activeModule === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <span>Correspondence & Circulars Directory (Orders)</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Add, update, and delete union & government circulars with attached PDF documents.</p>
              </div>

              <button
                onClick={() => {
                  setOrderForm({ titleEn: '', titleHi: '', category: 'Govt. Circulars', date: new Date().toLocaleDateString('en-GB'), doc_url: '' });
                  setCreateOrderModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Correspondence / Circular (PDF)</span>
              </button>
            </div>

            {/* Notices List (Single-Line Underlined Style) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              {ordersList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-medium">No correspondence or circulars available.</div>
              ) : (
                <ul className="space-y-4 divide-y divide-slate-100">
                  {ordersList.map((item) => (
                    <li key={item.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 uppercase">
                            {item.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-400">{item.id}</span>
                        </div>
                        <a
                          href={item.doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group text-slate-900 hover:text-sky-700 font-semibold text-sm sm:text-base inline-block"
                        >
                          <span className="underline decoration-slate-400 group-hover:decoration-sky-600 underline-offset-4">
                            {item.titleEn}
                          </span>
                          <span className="text-slate-500 text-xs font-mono ml-1.5">({item.date})</span>
                        </a>
                        {item.titleHi && (
                          <div className="text-xs text-slate-500 font-medium italic">
                            {item.titleHi}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={item.doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                          <span>View PDF</span>
                        </a>
                        <button
                          onClick={() => {
                            setEditOrderModal(item);
                            setOrderForm({
                              titleEn: item.titleEn,
                              titleHi: item.titleHi || '',
                              category: item.category,
                              date: item.date,
                              doc_url: item.doc_url
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(item.id)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* MODULE: PHOTO GALLERY MANAGEMENT */}
        {activeModule === 'photos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-sky-600" />
                  <span>Photo Gallery & Media Banners</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Upload, update, and delete official event, delegation, and conference photos.</p>
              </div>

              <button
                onClick={() => {
                  setPhotoForm({ titleEn: '', titleHi: '', category: 'Delegation', descriptionEn: '', descriptionHi: '', image_url: '', tag: 'Photo Highlight', date: 'Sep 2026' });
                  setCreatePhotoModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Photo</span>
              </button>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photosList.map((photo) => (
                <div key={photo.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
                  <div className="h-48 overflow-hidden bg-slate-900 relative">
                    <img src={photo.url} alt={photo.titleEn || photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                      {photo.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{photo.titleEn || photo.title}</h3>
                      {photo.titleHi && <p className="text-xs text-slate-500 line-clamp-1 italic">{photo.titleHi}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">{photo.date}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditPhotoModal(photo);
                            setPhotoForm({
                              titleEn: photo.titleEn || photo.title || '',
                              titleHi: photo.titleHi || '',
                              category: photo.category || 'Delegation',
                              descriptionEn: photo.descriptionEn || photo.description || '',
                              descriptionHi: photo.descriptionHi || '',
                              image_url: photo.url || '',
                              tag: photo.tag || 'Photo Highlight',
                              date: photo.date || 'Sep 2026'
                            });
                          }}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
                          title="Edit Photo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 1: ANALYTICS HUB */}
        {activeModule === 'analytics' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                onClick={() => setActiveModule('pending_approvals')}
                className="p-6 rounded-3xl bg-amber-50 border border-amber-300 hover:border-amber-500 space-y-2 shadow-sm cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">Pending Member Approvals</span>
                  <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-3xl font-extrabold text-amber-900">{analytics.stats.pendingApprovals || analytics.stats.pendingApplications}</div>
                <span className="text-xs text-amber-800 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Paid & awaiting credentials
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Active Members</span>
                <div className="text-3xl font-extrabold text-slate-900">{analytics.stats.activeMembers} / {analytics.stats.totalMembers}</div>
                <span className="text-xs text-emerald-700 font-bold">Registered discom staff</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pending UTR Payments</span>
                <div className="text-3xl font-extrabold text-sky-700">{analytics.stats.pendingPayments}</div>
                <span className="text-xs text-slate-500 font-semibold">Requires manual verification</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Upcoming Events</span>
                <div className="text-3xl font-extrabold text-slate-900">{analytics.stats.upcomingEvents}</div>
                <span className="text-xs text-amber-700 font-bold">{analytics.stats.totalEventRegistrations} registrations</span>
              </div>
            </div>

            {/* Audit Logs Trail */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900">Recent Admin Activity Audit Trail</h3>
              <div className="space-y-3 font-mono text-xs">
                {analytics.recentActivity.map(log => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-amber-800 font-bold block">{log.action}</span>
                      <span className="text-slate-800">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE: PENDING MEMBER APPROVALS */}
        {activeModule === 'pending_approvals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  <span>Pending Member Approvals</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Listing users who've paid but aren't yet approved. Click "Approve & Generate Credentials" next to each to generate & email login access.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-mono">
                {pendingApprovals.length} Pending Approval{pendingApprovals.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">App No</th>
                      <th className="p-4">Applicant Details</th>
                      <th className="p-4">District / Office</th>
                      <th className="p-4">UTR Transaction</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4 text-right">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {pendingApprovals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                          ✨ No pending member approvals! All paid applicants have been approved & credentials generated.
                        </td>
                      </tr>
                    ) : (
                      pendingApprovals.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-amber-800">{app.application_no}</td>
                          <td className="p-4 font-sans">
                            <span className="font-bold text-slate-900 block">{app.full_name}</span>
                            <span className="text-[11px] text-slate-500">{app.email}</span>
                            <span className="text-[10px] text-slate-400 block">{app.mobile}</span>
                          </td>
                          <td className="p-4 font-sans text-slate-700">
                            <div>{app.district_name || app.district}</div>
                            <div className="text-[10px] text-slate-500">{app.office_name || app.post_name}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {app.payment_proof_url ? (
                                <img
                                  src={app.payment_proof_url}
                                  alt="Receipt Screenshot"
                                  onClick={() => setViewReceiptModal({
                                    id: app.id,
                                    applicantName: app.full_name,
                                    payment_type: 'MEMBERSHIP',
                                    amount: app.registration_fee || 500,
                                    transaction_id: app.transaction_id || 'N/A',
                                    status: app.payment_status || 'SUBMITTED',
                                    payment_proof_url: app.payment_proof_url,
                                    appId: app.id,
                                    isApp: true
                                  })}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-105 transition-transform shrink-0 shadow-xs"
                                />
                              ) : null}
                              <div>
                                <span className="text-sky-800 font-bold block">{app.transaction_id || 'N/A'}</span>
                                <span className="text-[10px] text-slate-500 font-sans block">{app.payment_date}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-sans">
                            <div className="space-y-1.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${app.payment_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}>
                                {app.payment_status}
                              </span>
                              {app.payment_proof_url ? (
                                <button
                                  onClick={() => setViewReceiptModal({
                                    id: app.id,
                                    applicantName: app.full_name,
                                    payment_type: 'MEMBERSHIP',
                                    amount: app.registration_fee || 500,
                                    transaction_id: app.transaction_id || 'N/A',
                                    status: app.payment_status || 'SUBMITTED',
                                    payment_proof_url: app.payment_proof_url,
                                    appId: app.id,
                                    isApp: true
                                  })}
                                  className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] border border-sky-200 flex items-center gap-1.5 transition-colors shrink-0"
                                  title="View Uploaded Payment Receipt / Screenshot"
                                >
                                  <Eye className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                  <span>View Payment Receipt</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-red-500 font-bold block">No Receipt Screenshot</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleApproveAndGenerate(app.id)}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-extrabold text-xs shadow-sm transition-colors flex items-center justify-end gap-1.5 ml-auto"
                            >
                              <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
                              <span>Approve & Generate Credentials</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: MEMBERSHIP APPLICATIONS */}
        {activeModule === 'applications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Membership Join Applications</h2>
                <p className="text-xs text-slate-500 font-medium">Review applications, verify payment UTRs, and click "Create User" to activate</p>
              </div>

              <div className="flex items-center gap-2">
                {['all', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${statusFilter === st ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Application No</th>
                      <th className="p-4">Applicant Name</th>
                      <th className="p-4">Mobile / Email</th>
                      <th className="p-4">UTR / Payment</th>
                      <th className="p-4">App Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">No applications found.</td>
                      </tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-amber-800">{app.application_no}</td>
                          <td className="p-4 font-sans font-bold text-slate-900">{app.full_name}</td>
                          <td className="p-4 text-slate-700">
                            <div>{app.mobile}</div>
                            <div className="text-[10px] text-slate-500 font-sans">{app.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="text-sky-800 font-bold block">{app.transaction_id || 'N/A'}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${app.payment_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                  {app.payment_status}
                                </span>
                                {app.payment_proof_url && (
                                  <button
                                    onClick={() => setViewReceiptModal({
                                      id: app.id,
                                      applicantName: app.full_name,
                                      payment_type: 'MEMBERSHIP',
                                      amount: app.registration_fee || 500,
                                      transaction_id: app.transaction_id || 'N/A',
                                      status: app.payment_status || 'SUBMITTED',
                                      payment_proof_url: app.payment_proof_url,
                                      appId: app.id,
                                      isApp: true
                                    })}
                                    className="px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[10px] border border-sky-200 flex items-center gap-1 transition-colors"
                                  >
                                    <Eye className="w-3 h-3 text-sky-600 shrink-0" />
                                    <span>Receipt</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${app.application_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900' :
                                app.application_status === 'REJECTED' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                              }`}>
                              {app.application_status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {app.application_status === 'PENDING' ? (
                              <button
                                onClick={() => handleApproveAndGenerate(app.id)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-extrabold text-[11px] inline-flex items-center gap-1 shadow-sm"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                                <span>Approve & Generate Credentials</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenCreateUserFromApp(app.id)}
                                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans font-bold text-[11px]"
                              >
                                View User Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: MEMBERS MANAGEMENT */}
        {activeModule === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Discom Members Roster</h2>
                <p className="text-xs text-slate-500 font-medium">View active, inactive, or suspended members</p>
              </div>

              <div className="flex items-center gap-2">
                {['all', 'active', 'inactive', 'suspended'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${statusFilter === st ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Member ID</th>
                      <th className="p-4">Name & Designation</th>
                      <th className="p-4">Circle</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {members.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-amber-800">{m.member_id}</td>
                        <td className="p-4 font-sans">
                          <span className="font-bold text-slate-900 block">{m.profile?.full_name}</span>
                          <span className="text-[11px] text-slate-500">{m.email}</span>
                        </td>
                        <td className="p-4 font-sans text-slate-700">{m.profile?.circle || 'Indore'}</td>
                        <td className="p-4 uppercase font-bold text-sky-800">{m.role}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${m.status === 'active' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                            }`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: EVENTS MANAGEMENT */}
        {activeModule === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>Event & Agitation Management</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Create, update, and manage state conventions, workshops, and strike rallies.</p>
              </div>
              <button
                onClick={() => {
                  setEventForm({
                    title: '', description: '', banner_url: '', event_type: 'GENERAL',
                    start_date: new Date().toISOString().split('T')[0], end_date: '', start_time: '10:00 AM', venue: '',
                    capacity: 500, is_paid: false, event_fee: '', payment_qr_url: '',
                    payment_instructions: '', visibility: 'PUBLIC', status: 'REGISTRATION_OPEN',
                    requires_approval: true
                  });
                  setCreateEventModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(e => {
                const pendingForThisEvent = (eventRegs || []).filter(r => r.event_id === e.id && r.registration_status === 'PENDING').length;

                return (
                  <div key={e.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                    {e.banner_url && (
                      <div className="h-40 overflow-hidden bg-slate-900 relative">
                        <img src={e.banner_url} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                          {e.event_type}
                        </div>
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase">
                          {Number(e.event_fee) > 0 ? `₹${e.event_fee} Entry Fee` : 'Free Entry'}
                        </div>
                      </div>
                    )}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 uppercase">
                            {e.event_type}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">{e.status}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base line-clamp-2">{e.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{e.description}</p>
                        <div className="text-xs text-slate-500 font-medium space-y-1">
                          <div>📍 <strong>{e.venue}</strong> • 📅 <span>{e.start_date ? String(e.start_date).slice(0, 10) : ''}</span></div>
                          <div className="text-[11px] text-slate-500">
                            {e.requires_approval !== false ? '🛡️ Admin approval required to join' : '⚡ Instant delegate join'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2 flex-wrap">
                        <div>
                          <span className="font-mono font-bold text-sky-700 block">
                            {e.is_paid && Number(e.event_fee) > 0 ? `Charges: ₹${e.event_fee}` : 'Charges: FREE'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {e.registered_count || 0} Confirmed Attendees
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedEventFilter(String(e.id));
                              setActiveModule('registrations');
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors ${
                              pendingForThisEvent > 0
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm animate-pulse'
                                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200'
                            }`}
                            title="Manage Member Join Requests"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Requests</span>
                            {pendingForThisEvent > 0 && (
                              <span className="px-1 py-0.2 rounded-full text-[9px] bg-red-600 text-white font-black">
                                {pendingForThisEvent}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setEditEventModal(e);
                              setEventForm({
                                title: e.title || '',
                                description: e.description || '',
                                banner_url: e.banner_url || '',
                                event_type: e.event_type || 'GENERAL',
                                start_date: e.start_date ? String(e.start_date).slice(0, 10) : '',
                                end_date: e.end_date ? String(e.end_date).slice(0, 10) : '',
                                start_time: e.start_time || '10:00 AM',
                                venue: e.venue || '',
                                capacity: e.capacity || 500,
                                is_paid: Boolean(e.is_paid || Number(e.event_fee) > 0),
                                event_fee: Number(e.event_fee || 0) > 0 ? Number(e.event_fee) : '',
                                payment_qr_url: e.payment_qr_url || '',
                                payment_instructions: e.payment_instructions || '',
                                visibility: e.visibility || 'PUBLIC',
                                status: e.status || 'REGISTRATION_OPEN',
                                requires_approval: e.requires_approval !== undefined ? Boolean(e.requires_approval) : true
                              });
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
                            title="Edit Event"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(e.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULE: EVENT JOIN REQUESTS & PASSES APPROVAL */}
        {activeModule === 'registrations' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Member Event Participation Management</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Event Join Requests & Member Approvals
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Review member requests to attend union conventions, rallies, and workshops. Approve or reject delegate passes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await api.get('/events/admin/registrations/list');
                        if (res.data.success) setEventRegs(res.data.registrations);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Total Requests</span>
                  <span className="text-2xl font-black text-slate-900">{eventRegs.length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 block uppercase">Pending Approval</span>
                  <span className="text-2xl font-black text-amber-800">
                    {eventRegs.filter(r => (r.registration_status || 'PENDING') === 'PENDING').length}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 block uppercase">Approved / Confirmed</span>
                  <span className="text-2xl font-black text-emerald-800">
                    {eventRegs.filter(r => r.registration_status === 'CONFIRMED').length}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold text-rose-700 block uppercase">Rejected</span>
                  <span className="text-2xl font-black text-rose-800">
                    {eventRegs.filter(r => r.registration_status === 'REJECTED').length}
                  </span>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[200px] sm:min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search member, email, UTR, pass..."
                      value={regSearch}
                      onChange={(e) => setRegSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Filter by Event */}
                  <select
                    value={selectedEventFilter}
                    onChange={(e) => setSelectedEventFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Events ({events.length})</option>
                    {events.map(evt => (
                      <option key={evt.id} value={evt.id}>{evt.title}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'PENDING', label: 'Pending Approval' },
                    { id: 'CONFIRMED', label: 'Approved' },
                    { id: 'REJECTED', label: 'Rejected' }
                  ].map(tab => {
                    const active = regStatusFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setRegStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Join Requests Table */}
              {(() => {
                const filteredRegs = (eventRegs || []).filter(r => {
                  if (selectedEventFilter !== 'all' && Number(r.event_id) !== Number(selectedEventFilter)) {
                    return false;
                  }
                  if (regStatusFilter !== 'all' && (r.registration_status || 'PENDING').toUpperCase() !== regStatusFilter.toUpperCase()) {
                    return false;
                  }
                  if (regSearch) {
                    const q = regSearch.toLowerCase();
                    const name = (r.member_name || '').toLowerCase();
                    const email = (r.member_email || '').toLowerCase();
                    const phone = (r.member_phone || '').toLowerCase();
                    const pass = (r.pass_code || '').toLowerCase();
                    const utr = (r.transaction_id || '').toLowerCase();
                    const evtTitle = (r.event_title || '').toLowerCase();
                    if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !pass.includes(q) && !utr.includes(q) && !evtTitle.includes(q)) {
                      return false;
                    }
                  }
                  return true;
                });

                if (filteredRegs.length === 0) {
                  return (
                    <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">No event join requests found.</p>
                      <p className="text-xs text-slate-500">
                        {regStatusFilter !== 'all' ? `No requests with status "${regStatusFilter}".` : 'When members request to join an event, they will appear here for admin approval.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="p-3.5">Member Details</th>
                          <th className="p-3.5">Event Information</th>
                          <th className="p-3.5">Charges & Payment</th>
                          <th className="p-3.5">Request Date & Pass</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredRegs.map(reg => {
                          const isPending = (reg.registration_status || 'PENDING') === 'PENDING';
                          const isConfirmed = reg.registration_status === 'CONFIRMED';
                          const isRejected = reg.registration_status === 'REJECTED';
                          const feeAmount = Number(reg.amount || reg.event_fee || 0);

                          return (
                            <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                              {/* Member */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={reg.member_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                                    alt={reg.member_name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-xs">{reg.member_name}</h4>
                                    <p className="text-[11px] text-slate-500 font-mono">{reg.member_email || reg.member_phone}</p>
                                    <p className="text-[10px] text-amber-800 font-semibold">{reg.employee_id || `ID: ${reg.user_id}`} • {reg.member_circle || 'Indore'}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Event */}
                              <td className="p-3.5 max-w-xs">
                                <h5 className="font-bold text-slate-900 leading-snug line-clamp-2">{reg.event_title}</h5>
                                <p className="text-[11px] text-slate-500 mt-0.5">📅 {reg.event_date || 'Upcoming'}</p>
                                <p className="text-[10px] text-slate-400 truncate">📍 {reg.event_venue || 'Indore HQ'}</p>
                              </td>

                              {/* Charges & Payment */}
                              <td className="p-3.5">
                                <div className="space-y-1">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    feeAmount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {feeAmount > 0 ? `₹${feeAmount} Charges` : 'Free Entry'}
                                  </span>

                                  {reg.transaction_id && (
                                    <div className="text-[11px] font-mono text-slate-700 font-bold">
                                      UTR: {reg.transaction_id}
                                    </div>
                                  )}

                                  {reg.payment_proof_url && (
                                    <button
                                      type="button"
                                      onClick={() => setViewRegProofModal(reg)}
                                      className="text-[10px] text-sky-700 hover:text-sky-800 font-bold underline flex items-center gap-1"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>View Receipt Proof</span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Pass Code & Date */}
                              <td className="p-3.5">
                                <div className="space-y-1">
                                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
                                    {reg.pass_code}
                                  </span>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {reg.registered_at ? new Date(reg.registered_at).toLocaleDateString() : 'Recent'}
                                  </p>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="p-3.5">
                                {isPending && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                    ⏳ Pending Approval
                                  </span>
                                )}
                                {isConfirmed && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300 inline-flex items-center gap-1">
                                    ✕ Rejected
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isPending && (
                                    <>
                                      <button
                                        onClick={() => handleApproveRegistration(reg.id)}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all"
                                        title="Approve Member Join Request"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Approve</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setRejectRegModal(reg);
                                          setRejectRegReason('');
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all"
                                        title="Reject Join Request"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Reject</span>
                                      </button>
                                    </>
                                  )}

                                  {isConfirmed && (
                                    <button
                                      onClick={() => {
                                        setRejectRegModal(reg);
                                        setRejectRegReason('');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] font-bold border border-slate-200 transition-colors"
                                      title="Revoke / Reject"
                                    >
                                      Revoke
                                    </button>
                                  )}

                                  {isRejected && (
                                    <button
                                      onClick={() => handleApproveRegistration(reg.id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors"
                                      title="Re-approve Member"
                                    >
                                      Re-Approve
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* MODULE: ANNOUNCEMENTS & STRIKE BULLETINS MANAGEMENT */}
        {activeModule === 'announcements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Announcements & Strike Bulletins Directory</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Publish, broadcast, update, and delete urgent union announcements and top-screen popup notices.</p>
              </div>

              <button
                onClick={() => {
                  setAnnounceForm({
                    title: '', description: '', type: 'GENERAL', priority: 'NORMAL',
                    attachment_url: '', start_date: new Date().toISOString().split('T')[0],
                    expiry_date: '', target_audience: 'ALL_MEMBERS', is_popup: true
                  });
                  setCreateAnnounceModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Notice / Strike Bulletin</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              {announcements.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-medium">No announcements broadcasted yet.</div>
              ) : (
                <ul className="space-y-4 divide-y divide-slate-100">
                  {announcements.map((announce) => (
                    <li key={announce.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${announce.type === 'STRIKE' ? 'bg-red-100 text-red-900 border border-red-300' :
                              announce.type === 'URGENT' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-sky-100 text-sky-800'
                            }`}>
                            {announce.type}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${announce.priority === 'CRITICAL' ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                            Priority: {announce.priority}
                          </span>
                          {announce.is_popup && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-900 uppercase">
                              ✨ Top Screen Alert
                            </span>
                          )}
                          <span className="text-xs font-mono text-slate-400">Date: {announce.start_date}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base">{announce.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{announce.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {announce.attachment_url && (
                          <a
                            href={announce.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                            <span>Attachment</span>
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setEditAnnounceModal(announce);
                            setAnnounceForm({
                              title: announce.title || '',
                              description: announce.description || '',
                              type: announce.type || 'GENERAL',
                              priority: announce.priority || 'NORMAL',
                              attachment_url: announce.attachment_url || '',
                              start_date: announce.start_date || new Date().toISOString().split('T')[0],
                              expiry_date: announce.expiry_date || '',
                              target_audience: announce.target_audience || 'ALL_MEMBERS',
                              is_popup: announce.is_popup !== undefined ? Boolean(announce.is_popup) : true
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAnnouncement(announce.id)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* MODULE 5: UNIFIED PAYMENTS VERIFICATION */}
        {activeModule === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Unified Payments Verification Center</h2>
                <p className="text-xs text-slate-500 mt-1">Review uploaded receipt screenshots, verify UTR reference numbers, and approve or reject payment requests.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Applicant / Member</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Transaction UTR</th>
                    <th className="p-4">Receipt Proof</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 font-sans font-medium text-xs">
                        No payment verification records found.
                      </td>
                    </tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-amber-800">{p.payment_type}</td>
                        <td className="p-4 font-sans text-slate-900 font-bold">
                          <div>{p.applicantName}</div>
                          {p.phone && p.phone !== 'N/A' && <div className="text-[10px] text-slate-400 font-normal">{p.phone}</div>}
                        </td>
                        <td className="p-4 font-extrabold text-slate-900">₹{p.amount}</td>
                        <td className="p-4 text-sky-800 font-bold">{p.transaction_id || 'N/A'}</td>
                        <td className="p-4 font-sans">
                          {p.payment_proof_url ? (
                            <div className="flex items-center gap-2">
                              {p.payment_proof_url.startsWith('data:image') || p.payment_proof_url.includes('unsplash') || p.payment_proof_url.startsWith('http') ? (
                                <img
                                  src={p.payment_proof_url}
                                  alt="Receipt Screenshot"
                                  onClick={() => setViewReceiptModal(p)}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-105 transition-transform shrink-0 shadow-xs"
                                />
                              ) : null}
                              <button
                                onClick={() => setViewReceiptModal(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] border border-sky-200 flex items-center gap-1.5 transition-colors shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5 text-sky-600" />
                                <span>View Receipt</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal italic text-[11px]">No Receipt</span>
                          )}
                        </td>
                        <td className="p-4 font-sans">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${p.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                              p.status === 'REJECTED' ? 'bg-red-100 text-red-900 border border-red-200' :
                                'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-2">
                            {p.status !== 'VERIFIED' && (
                              <button
                                onClick={() => handleVerifyPayment(p.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                                title="Approve & Verify Payment"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}
                            {p.status !== 'REJECTED' && (
                              <button
                                onClick={() => { setRejectPaymentModal(p); setRejectReason(''); }}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                title="Reject Payment"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 6: SYSTEM SETTINGS */}
        {activeModule === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Union & Payment System Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Union Full Name</label>
                <input
                  type="text"
                  value={systemSettingsForm.union_name || ''}
                  onChange={(e) => setSystemSettingsForm({ ...systemSettingsForm, union_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Union Short Name</label>
                <input
                  type="text"
                  value={systemSettingsForm.union_short_name || ''}
                  onChange={(e) => setSystemSettingsForm({ ...systemSettingsForm, union_short_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Registration Fee (₹)</label>
                <input
                  type="number"
                  value={systemSettingsForm.registration_fee || 500}
                  onChange={(e) => setSystemSettingsForm({ ...systemSettingsForm, registration_fee: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  value={systemSettingsForm.upi_id || ''}
                  onChange={(e) => setSystemSettingsForm({ ...systemSettingsForm, upi_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment WhatsApp Helpline</label>
                <input
                  type="text"
                  value={systemSettingsForm.payment_whatsapp_number || ''}
                  onChange={(e) => setSystemSettingsForm({ ...systemSettingsForm, payment_whatsapp_number: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono"
                />
              </div>
            </div>

            <button type="submit" className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
              Save Configuration Changes
            </button>
          </form>
        )}

      </div>

      {/* CREATE USER PREFILLED MODAL */}
      {createUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Member Account from Application</h3>
              <button onClick={() => setCreateUserModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleConfirmCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Member ID (Generated)</label>
                  <input
                    type="text"
                    required
                    value={createUserModal.member_id}
                    onChange={(e) => setCreateUserModal({ ...createUserModal, member_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-amber-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={createUserModal.email}
                    onChange={(e) => setCreateUserModal({ ...createUserModal, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={createUserModal.full_name}
                    onChange={(e) => setCreateUserModal({ ...createUserModal, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Circle</label>
                  <input
                    type="text"
                    value={createUserModal.circle}
                    onChange={(e) => setCreateUserModal({ ...createUserModal, circle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                Activate User Account & Grant Dashboard Access
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {(createEventModal || editEventModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                <span>{editEventModal ? 'Edit Event Details' : 'Create New Event / Agitation'}</span>
              </h3>
              <button onClick={() => { if (!publishingEvent) { setCreateEventModal(false); setEditEventModal(null); } }} disabled={publishingEvent} className="text-slate-400 hover:text-slate-700 disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editEventModal ? handleUpdateEvent : handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zonal Delegate Convention 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Type *</label>
                  <select
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="STRIKE">STRIKE / AGITATION</option>
                    <option value="MEETING">MEETING</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="MEMORANDUM">MEMORANDUM</option>
                    <option value="CONVENTION">CONVENTION</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="Central Office Bhopal"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="REGISTRATION_OPEN">REGISTRATION OPEN</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Visibility</label>
                  <select
                    value={eventForm.visibility || 'PUBLIC'}
                    onChange={(e) => setEventForm({ ...eventForm, visibility: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="PUBLIC">PUBLIC (Everyone)</option>
                    <option value="MEMBERS_ONLY">MEMBERS ONLY</option>
                  </select>
                </div>
              </div>

              {/* Event Joining Charges & Approval Settings */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-slate-800 text-xs">Event Joining Charges / Fee (₹) *</label>
                    <p className="text-[11px] text-slate-500">Enter 0 for Free Event, or specify registration fee amount.</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    Number(eventForm.event_fee) > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {Number(eventForm.event_fee) > 0 ? `Charges: ₹${eventForm.event_fee}` : 'Free Entry'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (Free Event)"
                      value={eventForm.event_fee ?? ''}
                      onFocus={(e) => {
                        if (e.target.value === '0') e.target.select();
                      }}
                      onChange={(e) => {
                        let val = e.target.value;
                        // Strip leading zeros e.g. "0500" -> "500", but allow standalone "0"
                        if (val.length > 1 && /^0\d+/.test(val)) {
                          val = val.replace(/^0+/, '') || '0';
                          e.target.value = val;
                        }
                        const fee = val === '' ? '' : Math.max(0, Number(val));
                        setEventForm({
                          ...eventForm,
                          event_fee: val === '' ? '' : (isNaN(fee) ? 0 : fee),
                          is_paid: Number(fee) > 0
                        });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(eventForm.is_paid || Number(eventForm.event_fee) > 0)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEventForm({
                            ...eventForm,
                            is_paid: checked,
                            event_fee: checked && (!eventForm.event_fee || Number(eventForm.event_fee) === 0) ? 100 : (!checked ? '' : eventForm.event_fee)
                          });
                        }}
                        className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                      />
                      <span>Paid Event (Requires fee)</span>
                    </label>
                  </div>
                </div>

                {/* Member Join Request & Admin Approval Setting */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Require Admin Approval</span>
                    <span className="text-[11px] text-slate-500">Members request to join, and admin can approve or reject each member.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventForm.requires_approval !== false}
                      onChange={(e) => setEventForm({ ...eventForm, requires_approval: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                {Number(eventForm.event_fee) > 0 && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">Payment Instructions (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Scan QR code and pay via UPI, submit UTR number."
                        value={eventForm.payment_instructions || ''}
                        onChange={(e) => setEventForm({ ...eventForm, payment_instructions: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Event Banner Image Upload */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">Event Banner Image</label>
                <div className="border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-4 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    ref={eventBannerInputRef}
                    onChange={handleEventBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => eventBannerInputRef.current && eventBannerInputRef.current.click()}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    {eventForm.banner_url ? (
                      <img src={eventForm.banner_url} alt="Banner Preview" className="w-24 h-16 object-cover rounded-xl border border-sky-300 mb-1" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-sky-600" />
                    )}
                    <span className="text-xs font-bold text-sky-900">
                      {eventForm.banner_url ? 'Banner Image Selected ✓ Click to Change' : 'Click to Upload Event Banner Image'}
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Or enter direct Image URL (e.g. https://...)"
                  value={eventForm.banner_url}
                  onChange={(e) => setEventForm({ ...eventForm, banner_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={publishingEvent}
                  onClick={() => { setCreateEventModal(false); setEditEventModal(null); }}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishingEvent}
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed text-white font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {publishingEvent && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                  <span>{publishingEvent ? (editEventModal ? 'Updating...' : 'Publishing Event...') : (editEventModal ? 'Update Event' : 'Publish Event')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ANNOUNCEMENT / STRIKE MODAL */}
      {(createAnnounceModal || editAnnounceModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>{editAnnounceModal ? 'Edit Notice / Strike Bulletin' : 'Issue Notice / Strike Bulletin'}</span>
              </h3>
              <button onClick={() => { setCreateAnnounceModal(false); setEditAnnounceModal(null); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editAnnounceModal ? handleUpdateAnnouncement : handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indefinite Strike & Protest Notice"
                  value={announceForm.title}
                  onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Type</label>
                  <select
                    value={announceForm.type}
                    onChange={(e) => setAnnounceForm({ ...announceForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-bold"
                  >
                    <option value="STRIKE">STRIKE / HADTAL</option>
                    <option value="URGENT">URGENT</option>
                    <option value="GENERAL">GENERAL</option>
                    <option value="MEETING">MEETING</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={announceForm.priority}
                    onChange={(e) => setAnnounceForm({ ...announceForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (Top Popup Alert)</option>
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="is_popup"
                  checked={announceForm.is_popup}
                  onChange={(e) => setAnnounceForm({ ...announceForm, is_popup: e.target.checked })}
                  className="accent-red-600 w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="is_popup" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Display as Top-Screen Popup Banner Alert for all visitors
                </label>
              </div>

              {/* Notice Attachment Upload */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">Notice Attachment File (PDF / Image)</label>
                <div className="border-2 border-dashed border-red-300 bg-red-50/40 hover:bg-red-50 rounded-2xl p-4 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    ref={announceAttachmentInputRef}
                    onChange={handleAnnounceAttachmentUpload}
                    accept=".pdf,image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => announceAttachmentInputRef.current && announceAttachmentInputRef.current.click()}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <UploadCloud className="w-6 h-6 text-red-600" />
                    <span className="text-xs font-bold text-red-900">
                      {announceForm.attachment_url ? 'Attachment Attached ✓ Click to Change' : 'Click to Upload Notice PDF / Image Attachment'}
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Or enter direct Attachment URL (e.g. https://...)"
                  value={announceForm.attachment_url}
                  onChange={(e) => setAnnounceForm({ ...announceForm, attachment_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Description / Demands *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write notice details and instructions..."
                  value={announceForm.description}
                  onChange={(e) => setAnnounceForm({ ...announceForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCreateAnnounceModal(false); setEditAnnounceModal(null); }}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md">
                  {editAnnounceModal ? 'Update Notice' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATED CREDENTIALS SUCCESS MODAL */}
      {generatedCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>Member Approved & Credentials Generated</span>
              </div>
              <button onClick={() => setGeneratedCredentialsModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                <span>Portal Login Credentials</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Dispatched to Email</span>
              </div>

              <div className="space-y-2 text-xs font-mono bg-white p-3.5 rounded-xl border border-amber-200">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-sans">Member Name:</span>
                  <strong className="text-slate-900 font-sans">{generatedCredentialsModal.applicant_name}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-sans">Login ID / Member ID:</span>
                  <strong className="text-amber-800 font-bold">{generatedCredentialsModal.member_id}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-sans">Registered Email:</span>
                  <strong className="text-sky-800">{generatedCredentialsModal.email}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Temporary Password:</span>
                  <strong className="text-slate-950 font-bold bg-amber-100 px-2 py-0.5 rounded text-xs">{generatedCredentialsModal.temp_password}</strong>
                </div>
              </div>

              <p className="text-[11px] text-amber-950 font-medium">
                ✉️ An automated notification has been dispatched to <strong>{generatedCredentialsModal.email}</strong>. The member can now log in using either their Email or Member ID and this temporary password.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`MPVMAVAKS Union Credentials:\nLogin ID / Member ID: ${generatedCredentialsModal.member_id}\nEmail: ${generatedCredentialsModal.email}\nTemp Password: ${generatedCredentialsModal.temp_password}`);
                  alert('Credentials copied to clipboard!');
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Copy Credentials
              </button>
              <button
                onClick={() => setGeneratedCredentialsModal(null)}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ORDER (NOTICE) MODAL WITH PDF UPLOAD */}
      {(createOrderModal || editOrderModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>{editOrderModal ? 'Edit Notice / Circular' : 'Add New Notice / Circular'}</span>
              </h3>
              <button onClick={() => { setCreateOrderModal(false); setEditOrderModal(null); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editOrderModal ? handleUpdateOrder : handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Notice Title (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MP Government Order: 7th Pay Commission DA 4% Revision"
                  value={orderForm.titleEn}
                  onChange={(e) => setOrderForm({ ...orderForm, titleEn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Notice Title (Hindi Translation)</label>
                <input
                  type="text"
                  placeholder="e.g. म.प्र. शासन आदेश: 7वें वेतन आयोग का 4% महंगाई भत्ता (DA) संशोधन..."
                  value={orderForm.titleHi}
                  onChange={(e) => setOrderForm({ ...orderForm, titleHi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category *</label>
                  <select
                    value={orderForm.category}
                    onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="Govt. Circulars">Govt. Circulars</option>
                    <option value="SC/ST Circulars">SC/ST Circulars</option>
                    <option value="Normal Circulars">Normal Circulars</option>
                    <option value="Notices">Correspondence & Directives</option>
                    <option value="Safety Directives">Safety & PTW Rules</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Notice Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 24/09/2026"
                    value={orderForm.date}
                    onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* PDF Document Upload */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">PDF Document File *</label>
                <div className="border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-4 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    ref={pdfInputRef}
                    onChange={handlePdfUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                  <div
                    onClick={() => pdfInputRef.current && pdfInputRef.current.click()}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <UploadCloud className="w-6 h-6 text-sky-600" />
                    <span className="text-xs font-bold text-sky-900">
                      {orderForm.doc_url ? 'PDF Attached ✓ Click to Change File' : 'Click to Upload Notice PDF Document'}
                    </span>
                    <span className="text-[10px] text-slate-500">Supports PDF documents up to 10MB</span>
                  </div>
                </div>

                {/* PDF URL preview/text input */}
                <input
                  type="text"
                  placeholder="Or enter direct PDF URL (e.g. https://...)"
                  value={orderForm.doc_url}
                  onChange={(e) => setOrderForm({ ...orderForm, doc_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCreateOrderModal(false); setEditOrderModal(null); }}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                >
                  {editOrderModal ? 'Update Notice Order' : 'Publish Notice Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PHOTO MODAL WITH IMAGE UPLOAD */}
      {(createPhotoModal || editPhotoModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-sky-600" />
                <span>{editPhotoModal ? 'Edit Photo Details' : 'Upload New Photo'}</span>
              </h3>
              <button onClick={() => { setCreatePhotoModal(false); setEditPhotoModal(null); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editPhotoModal ? handleUpdatePhoto : handleCreatePhoto} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Photo Title (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Level Discom Management Meeting"
                  value={photoForm.titleEn}
                  onChange={(e) => setPhotoForm({ ...photoForm, titleEn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Photo Title (Hindi Translation)</label>
                <input
                  type="text"
                  placeholder="e.g. उच्च स्तरीय डिस्कॉम प्रबंधन बैठक..."
                  value={photoForm.titleHi}
                  onChange={(e) => setPhotoForm({ ...photoForm, titleHi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category *</label>
                  <select
                    value={photoForm.category}
                    onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="Delegation">Discom Delegations</option>
                    <option value="Constitution">Samvidhan Presentation</option>
                    <option value="Felicitation">Felicitations & Welcome</option>
                    <option value="Events">Union Events & Agitations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Date Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Sep 2026"
                    value={photoForm.date}
                    onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Photo Image File Upload */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">Photo Image File *</label>
                <div className="border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-4 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => photoInputRef.current && photoInputRef.current.click()}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    {photoForm.image_url ? (
                      <img src={photoForm.image_url} alt="Uploaded preview" className="w-20 h-20 object-cover rounded-xl border border-sky-300 mb-1" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-sky-600" />
                    )}
                    <span className="text-xs font-bold text-sky-900">
                      {photoForm.image_url ? 'Image Selected ✓ Click to Change' : 'Click to Upload Photo Image'}
                    </span>
                    <span className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</span>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <input
                  type="text"
                  placeholder="Or enter direct Image URL (e.g. /images/gallery/...)"
                  value={photoForm.image_url}
                  onChange={(e) => setPhotoForm({ ...photoForm, image_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCreatePhotoModal(false); setEditPhotoModal(null); }}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                >
                  {editPhotoModal ? 'Update Photo' : 'Upload Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payment Receipt Modal */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Payment Receipt & Verification</h3>
                  <p className="text-xs text-slate-400 font-medium">Applicant: {viewReceiptModal.applicantName}</p>
                </div>
              </div>
              <button
                onClick={() => setViewReceiptModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 bg-slate-50/50">
              {/* Payment Summary Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Payment Type</span>
                  <span className="font-bold text-slate-900">{viewReceiptModal.payment_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Amount</span>
                  <span className="font-extrabold text-emerald-700 text-sm">₹{viewReceiptModal.amount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Transaction UTR</span>
                  <span className="font-mono font-bold text-sky-700">{viewReceiptModal.transaction_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status</span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${viewReceiptModal.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                      viewReceiptModal.status === 'REJECTED' ? 'bg-red-100 text-red-900 border border-red-200' :
                        'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                    {viewReceiptModal.status}
                  </span>
                </div>
              </div>

              {/* Receipt Screenshot / Document Display */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <span>Uploaded Receipt Screenshot</span>
                  </h4>
                  {viewReceiptModal.payment_proof_url && (
                    <a
                      href={viewReceiptModal.payment_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      download="payment-receipt-screenshot"
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open / Download Original</span>
                    </a>
                  )}
                </div>

                {viewReceiptModal.payment_proof_url ? (
                  <div className="bg-slate-900/5 rounded-xl p-2 flex items-center justify-center min-h-[240px] max-h-[420px] overflow-auto border border-slate-200">
                    {viewReceiptModal.payment_proof_url.startsWith('data:application/pdf') ? (
                      <iframe
                        src={viewReceiptModal.payment_proof_url}
                        title="Receipt PDF"
                        className="w-full h-80 rounded-lg"
                      />
                    ) : (
                      <img
                        src={viewReceiptModal.payment_proof_url}
                        alt="Uploaded Payment Receipt Screenshot"
                        className="max-h-[380px] max-w-full rounded-lg object-contain border border-slate-200 shadow-md"
                      />
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No receipt screenshot uploaded for this payment request.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setViewReceiptModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {viewReceiptModal.status !== 'REJECTED' && (
                  <button
                    onClick={() => {
                      const target = viewReceiptModal;
                      setViewReceiptModal(null);
                      setRejectPaymentModal(target);
                      setRejectReason('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Payment</span>
                  </button>
                )}

                {viewReceiptModal.status !== 'VERIFIED' && (
                  <button
                    onClick={() => handleVerifyPayment(viewReceiptModal.id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify Payment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {rejectPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRejectPayment} className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-red-100 text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Reject Payment Proof</h3>
                <p className="text-xs text-slate-500 font-medium">Applicant: {rejectPaymentModal.applicantName}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-700">Rejection Reason / Remarks</label>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid transaction UTR reference, unreadable payment screenshot, or fee mismatch."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectPaymentModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT ADMIN PROFILE MODAL */}
      {editAdminProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Administrator Profile</h3>
                  <p className="text-xs text-slate-500 font-medium">Update admin profile details and official photograph</p>
                </div>
              </div>
              <button
                onClick={() => setEditAdminProfileModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminProfileSubmit} className="space-y-5 text-xs">
              <ProfilePhotoUploader
                currentPhoto={adminProfileForm.avatar_url}
                onChange={(newPhoto) => setAdminProfileForm(prev => ({ ...prev, avatar_url: newPhoto }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={adminProfileForm.full_name}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={adminProfileForm.phone}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">WhatsApp Communication</label>
                  <input
                    type="text"
                    value={adminProfileForm.whatsapp}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, whatsapp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">City Location</label>
                  <input
                    type="text"
                    value={adminProfileForm.city}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Office Address</label>
                <input
                  type="text"
                  value={adminProfileForm.address}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Leadership Bio</label>
                <textarea
                  rows={3}
                  value={adminProfileForm.bio}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-sans"
                />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditAdminProfileModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT EVENT REGISTRATION MODAL */}
      {rejectRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Reject Event Join Request</span>
              </h3>
              <button onClick={() => setRejectRegModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to reject the join request from <strong>{rejectRegModal.member_name}</strong> for event <strong>{rejectRegModal.event_title}</strong>?
            </p>

            <form onSubmit={handleConfirmRejectRegistration} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rejection Reason / Remarks (Optional)</label>
                <textarea
                  rows={3}
                  value={rejectRegReason}
                  onChange={(e) => setRejectRegReason(e.target.value)}
                  placeholder="e.g. Quota full for this division, or unverified fee payment."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectRegModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REGISTRATION PAYMENT PROOF MODAL */}
      {viewRegProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Event Payment Receipt Proof</h3>
                <p className="text-xs text-slate-500">
                  {viewRegProofModal.member_name} • UTR: <strong className="text-slate-800 font-mono">{viewRegProofModal.transaction_id || 'N/A'}</strong>
                </p>
                <p className="text-[11px] text-sky-700 font-bold mt-0.5">{viewRegProofModal.event_title}</p>
              </div>
              <button onClick={() => setViewRegProofModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[220px]">
              {viewRegProofModal.payment_proof_url && (
                viewRegProofModal.payment_proof_url.startsWith('data:application/pdf') ||
                viewRegProofModal.payment_proof_url.toLowerCase().endsWith('.pdf')
              ) ? (
                <iframe
                  src={viewRegProofModal.payment_proof_url}
                  title="Payment Receipt PDF"
                  className="w-full h-80 rounded-xl"
                />
              ) : (
                <img
                  src={viewRegProofModal.payment_proof_url}
                  alt="Payment Receipt"
                  className="w-full h-full max-h-[55vh] object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <a
                href={viewRegProofModal.payment_proof_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Size</span>
              </a>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                viewRegProofModal.registration_status === 'CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : viewRegProofModal.registration_status === 'REJECTED'
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                Status: {viewRegProofModal.registration_status || 'PENDING'}
              </span>
            </div>

            {/* Quick Action Buttons for Admin Review */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewRegProofModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                {viewRegProofModal.registration_status !== 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => {
                      const regId = viewRegProofModal.id;
                      setViewRegProofModal(null);
                      handleApproveRegistration(regId);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Request</span>
                  </button>
                )}

                {viewRegProofModal.registration_status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewRegProofModal;
                      setViewRegProofModal(null);
                      setRejectRegModal(target);
                      setRejectRegReason('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Photo Modal */}
      <ProfilePhotoModal
        isOpen={adminPhotoModalOpen}
        onClose={() => setAdminPhotoModalOpen(false)}
        initialPhoto={user?.profile?.avatar_url || ''}
        onSave={handleAdminPhotoSave}
        title="Update Admin Profile Photo"
        subtitle="Upload your photo from your device or choose an official portrait"
      />

    </div>
  );
}

