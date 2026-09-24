import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  LayoutDashboard, UserCheck, Users, Calendar, CreditCard, AlertTriangle, FileText, 
  Send, PhoneCall, Settings, CheckCircle2, XCircle, Eye, UserPlus, Check, X, Search, 
  Filter, Sparkles, RefreshCw, ChevronRight, Edit3, ShieldAlert, Award, Download
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, settings } = useAuth();
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

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [viewAppModal, setViewAppModal] = useState(null);
  const [createUserModal, setCreateUserModal] = useState(null);
  const [generatedCredentialsModal, setGeneratedCredentialsModal] = useState(null);
  const [createEventModal, setCreateEventModal] = useState(false);
  const [createAnnounceModal, setCreateAnnounceModal] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '', description: '', banner_url: '', event_type: 'GENERAL',
    start_date: '', end_date: '', start_time: '10:00 AM', venue: '',
    capacity: 500, is_paid: false, event_fee: 0, payment_qr_url: '',
    payment_instructions: '', status: 'REGISTRATION_OPEN'
  });

  const [announceForm, setAnnounceForm] = useState({
    title: '', description: '', type: 'GENERAL', priority: 'NORMAL',
    attachment_url: '', start_date: new Date().toISOString().split('T')[0],
    expiry_date: '', target_audience: 'ALL_MEMBERS', is_popup: true
  });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchModuleData();
  }, [activeModule, statusFilter]);

  const fetchModuleData = async () => {
    setLoading(true);
    try {
      if (activeModule === 'analytics') {
        const res = await api.get('/admin/dashboard-analytics');
        if (res.data.success) setAnalytics(res.data);
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
    try {
      const res = await api.put(`/payments/admin/${paymentId}/verify`);
      if (res.data.success) {
        setFeedback({ success: res.data.message });
        fetchModuleData();
      }
    } catch (err) {
      alert('Failed to verify payment.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/events/admin/create', eventForm);
      if (res.data.success) {
        setCreateEventModal(false);
        fetchModuleData();
      }
    } catch (err) {
      alert('Failed to create event.');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements/admin/create', announceForm);
      if (res.data.success) {
        setCreateAnnounceModal(false);
        fetchModuleData();
      }
    } catch (err) {
      alert('Failed to broadcast announcement.');
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
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">MPWZ Union Admin Control Center</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-extrabold uppercase">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Logged in as {user?.profile?.full_name} ({user?.email})</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {[
            { id: 'analytics', label: 'Analytics Hub', icon: LayoutDashboard },
            { id: 'pending_approvals', label: 'Pending Member Approvals', icon: UserCheck },
            { id: 'applications', label: 'Membership Requests', icon: FileText },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'events', label: 'Events & Agitations', icon: Calendar },
            { id: 'registrations', label: 'Event Passes', icon: Award },
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
                onClick={() => { setActiveModule(tab.id); setStatusFilter('all'); }}
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

        {feedback?.success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedback.success}</span>
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
                            <span className="text-sky-800 font-bold block">{app.transaction_id || 'N/A'}</span>
                            <span className="text-[10px] text-slate-500 font-sans">{app.payment_date}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              app.payment_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {app.payment_status}
                            </span>
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                      statusFilter === st ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                            <span className="text-sky-800 font-bold block">{app.transaction_id || 'N/A'}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              app.payment_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {app.payment_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              app.application_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900' :
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                      statusFilter === st ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.status === 'active' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Event & Agitation Management</h2>
                <p className="text-xs text-slate-500 font-medium">Create state conventions, workshops, and delegate meetings</p>
              </div>
              <button
                onClick={() => setCreateEventModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map(e => (
                <div key={e.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
                  <div className="flex justify-between text-xs font-bold text-amber-800 uppercase">
                    <span>{e.event_type}</span>
                    <span className="text-slate-500 font-mono">{e.status}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{e.title}</h3>
                  <p className="text-xs text-slate-600">{e.venue} • {e.start_date}</p>
                  <div className="pt-2 text-xs font-mono text-slate-700 border-t border-slate-100 font-medium">
                    Fee: {e.is_paid ? `₹${e.event_fee}` : 'FREE'} • Delegates: {e.registered_count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 5: UNIFIED PAYMENTS VERIFICATION */}
        {activeModule === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Unified Payments Verification Center</h2>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Applicant / Member</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Transaction UTR</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="p-4 font-bold text-amber-800">{p.payment_type}</td>
                      <td className="p-4 font-sans text-slate-900 font-bold">{p.applicantName}</td>
                      <td className="p-4 font-extrabold text-slate-900">₹{p.amount}</td>
                      <td className="p-4 text-sky-800 font-bold">{p.transaction_id}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {p.status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyPayment(p.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[11px]"
                          >
                            Verify Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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

      {/* CREATE EVENT MODAL */}
      {createEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create New Event / Agitation</h3>
              <button onClick={() => setCreateEventModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zonal Delegate Convention 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="Polo Ground HQ Indore"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                  />
                </div>
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

              <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                Publish Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT / STRIKE MODAL */}
      {createAnnounceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Issue Notice / Strike Bulletin</span>
              </h3>
              <button onClick={() => setCreateAnnounceModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indefinite Strike & Protest Notice"
                  value={announceForm.title}
                  onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
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

              <button type="submit" className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold">
                Broadcast & Trigger Popup Notice
              </button>
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
                  navigator.clipboard.writeText(`MPWZ Union Credentials:\nLogin ID / Member ID: ${generatedCredentialsModal.member_id}\nEmail: ${generatedCredentialsModal.email}\nTemp Password: ${generatedCredentialsModal.temp_password}`);
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

    </div>
  );
}
