import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import {
  MessageSquare,
  Users,
  Send,
  Plus,
  Search,
  MoreVertical,
  Shield,
  ShieldCheck,
  UserPlus,
  UserMinus,
  LogOut,
  Trash2,
  X,
  Check,
  CheckCheck,
  Info,
  ArrowLeft,
  Smile,
  Hash,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Globe
} from 'lucide-react';

const PRESET_AVATARS = [
  { label: 'Central Executive', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80' },
  { label: 'Indore Engineers', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
  { label: 'High Voltage Safety', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Pension & Rights', url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Linemen Brigade', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=400&q=80' },
  { label: 'Power Substation', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80' }
];

const CATEGORIES = [
  { id: 'ALL', label: 'All Groups', labelHi: 'सभी समूह' },
  { id: 'CENTRAL', label: 'Central State', labelHi: 'प्रांतीय कार्यसमिति' },
  { id: 'DISTRICT', label: 'Circle / District', labelHi: 'जिला एवं वृत्त' },
  { id: 'SAFETY', label: 'Safety & PTW', labelHi: 'सुरक्षा एवं PTW' },
  { id: 'ADVOCACY', label: 'Pension & Rights', labelHi: 'वेतन व पेंशन' },
  { id: 'GENERAL', label: 'General', labelHi: 'सामान्य' }
];

const QUICK_EMOJIS = ['👍', '⚡', '🚩', '✊', '📋', '✅', '📢', '🙏', '💡', '⚠️'];

export default function GroupChat() {
  const { user, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // State
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchGroupQuery, setSearchGroupQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);

  // Create Group Form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'GENERAL',
    circle: 'All Circles',
    avatar_url: PRESET_AVATARS[0].url,
    member_ids: []
  });
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Directory Search for Members
  const [directory, setDirectory] = useState([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // Edit Group Form (Admin only)
  const [editGroupData, setEditGroupData] = useState({
    name: '',
    description: '',
    category: 'GENERAL',
    circle: 'All Circles'
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Alert banner
  const [feedback, setFeedback] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeGroupIdRef = useRef(activeGroupId);
  activeGroupIdRef.current = activeGroupId;

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Fetch groups list
  const fetchGroups = async (silent = false) => {
    try {
      if (!silent) setLoadingGroups(true);
      const res = await api.get('/chat/groups');
      if (res.data.success) {
        setGroups(res.data.groups || []);
        // Select first group if none active
        if (!activeGroupIdRef.current && res.data.groups?.length > 0) {
          const first = res.data.groups[0];
          setActiveGroupId(first.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      if (!silent) setLoadingGroups(false);
    }
  };

  // Fetch group details and messages
  const fetchGroupData = async (groupId, silent = false) => {
    if (!groupId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const [groupRes, msgsRes] = await Promise.all([
        api.get(`/chat/groups/${groupId}`),
        api.get(`/chat/groups/${groupId}/messages?limit=100`)
      ]);

      if (groupRes.data.success) {
        setActiveGroup(groupRes.data.group);
        setEditGroupData({
          name: groupRes.data.group.name || '',
          description: groupRes.data.group.description || '',
          category: groupRes.data.group.category || 'GENERAL',
          circle: groupRes.data.group.circle || 'All Circles'
        });
      }

      if (msgsRes.data.success) {
        setMessages(msgsRes.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch group data:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Fetch directory for member selection
  const fetchDirectory = async (searchTerm = '') => {
    try {
      setLoadingDirectory(true);
      const res = await api.get(`/chat/directory?search=${encodeURIComponent(searchTerm)}`);
      if (res.data.success) {
        setDirectory(res.data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch directory:', err);
    } finally {
      setLoadingDirectory(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchGroups();
  }, []);

  // When active group changes
  useEffect(() => {
    if (activeGroupId) {
      fetchGroupData(activeGroupId);
      setShowMobileList(false);
      setTimeout(() => scrollToBottom(false), 200);
    }
  }, [activeGroupId]);

  // Fast polling for active group messages (every 2.5s)
  useEffect(() => {
    if (!activeGroupId) return;
    const interval = setInterval(() => {
      fetchGroupData(activeGroupId, true);
    }, 2500);
    return () => clearInterval(interval);
  }, [activeGroupId]);

  // Slower polling for groups list (every 7s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGroups(true);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !activeGroupId || sendingMessage) return;

    // Optimistic message
    const tempId = Date.now();
    const optimisticMsg = {
      id: tempId,
      group_id: activeGroupId,
      sender_id: user?.id,
      sender_name: user?.profile?.full_name || user?.email?.split('@')[0] || 'You',
      sender_avatar: user?.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      sender_designation: user?.profile?.union_designation || user?.profile?.designation || 'Member',
      sender_member_id: user?.member_id || '',
      message_text: trimmed,
      is_system: false,
      is_mine: true,
      created_at: new Date().toISOString(),
      optimistic: true
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInputText('');
    setSendingMessage(true);

    try {
      const res = await api.post(`/chat/groups/${activeGroupId}/messages`, {
        message_text: trimmed
      });

      if (res.data.success && res.data.message) {
        setMessages(prev => prev.map(m => m.id === tempId ? res.data.message : m));
        // Refresh groups to update last_message
        fetchGroups(true);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast(err.response?.data?.message || 'Failed to send message', 'error');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSendingMessage(false);
      inputRef.current?.focus();
    }
  };

  // Create Group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast('Please enter a group name', 'error');
      return;
    }

    try {
      setCreatingGroup(true);
      const res = await api.post('/chat/groups', {
        ...createForm,
        member_ids: selectedMemberIds
      });

      if (res.data.success) {
        showToast('Group created successfully! 🎉', 'success');
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          description: '',
          category: 'GENERAL',
          circle: 'All Circles',
          avatar_url: PRESET_AVATARS[0].url,
          member_ids: []
        });
        setSelectedMemberIds([]);
        await fetchGroups();
        if (res.data.group?.id) {
          setActiveGroupId(res.data.group.id);
        }
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      showToast(err.response?.data?.message || 'Failed to create group', 'error');
    } finally {
      setCreatingGroup(false);
    }
  };

  // Update Group Info (Admin)
  const handleUpdateGroupSettings = async (e) => {
    e.preventDefault();
    if (!activeGroupId) return;

    try {
      setSavingSettings(true);
      const res = await api.put(`/chat/groups/${activeGroupId}`, editGroupData);
      if (res.data.success) {
        setActiveGroup(res.data.group);
        setIsEditingSettings(false);
        showToast('Group settings updated!', 'success');
        fetchGroups(true);
      }
    } catch (err) {
      console.error('Failed to update group:', err);
      showToast(err.response?.data?.message || 'Failed to update group', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Members to Group
  const handleAddMembersSubmit = async () => {
    if (!activeGroupId || selectedMemberIds.length === 0) return;

    try {
      const res = await api.post(`/chat/groups/${activeGroupId}/members`, {
        user_ids: selectedMemberIds
      });
      if (res.data.success) {
        showToast('Members added to group successfully!', 'success');
        setShowAddMembersModal(false);
        setSelectedMemberIds([]);
        fetchGroupData(activeGroupId);
        fetchGroups(true);
      }
    } catch (err) {
      console.error('Failed to add members:', err);
      showToast(err.response?.data?.message || 'Failed to add members', 'error');
    }
  };

  // Remove Member
  const handleRemoveMember = async (targetUserId, memberName) => {
    if (!activeGroupId) return;
    if (!window.confirm(`Are you sure you want to remove "${memberName}" from this group?`)) return;

    try {
      const res = await api.delete(`/chat/groups/${activeGroupId}/members/${targetUserId}`);
      if (res.data.success) {
        showToast(res.data.message || 'Member removed', 'success');
        fetchGroupData(activeGroupId);
        fetchGroups(true);
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      showToast(err.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  // Leave Group
  const handleLeaveGroup = async () => {
    if (!activeGroupId || !user) return;
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      const res = await api.delete(`/chat/groups/${activeGroupId}/members/${user.id}`);
      if (res.data.success) {
        showToast('You have left the group.', 'info');
        setShowInfoModal(false);
        setActiveGroupId(null);
        setActiveGroup(null);
        await fetchGroups();
      }
    } catch (err) {
      console.error('Failed to leave group:', err);
      showToast(err.response?.data?.message || 'Failed to leave group', 'error');
    }
  };

  // Delete Group (Admin/Creator only)
  const handleDeleteGroup = async () => {
    if (!activeGroupId) return;
    if (!window.confirm(`Are you ABSOLUTELY sure you want to DELETE "${activeGroup?.name}"? All chat history will be permanently deleted.`)) return;

    try {
      const res = await api.delete(`/chat/groups/${activeGroupId}`);
      if (res.data.success) {
        showToast(res.data.message || 'Group deleted successfully', 'success');
        setShowInfoModal(false);
        setActiveGroupId(null);
        setActiveGroup(null);
        await fetchGroups();
      }
    } catch (err) {
      console.error('Failed to delete group:', err);
      showToast(err.response?.data?.message || 'Failed to delete group', 'error');
    }
  };

  // Format timestamp helper
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Format date header helper
  const formatDateHeader = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return 'Today';
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Filter groups
  const filteredGroups = groups.filter(g => {
    const matchesSearch = !searchGroupQuery ||
      g.name.toLowerCase().includes(searchGroupQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchGroupQuery.toLowerCase())) ||
      (g.circle && g.circle.toLowerCase().includes(searchGroupQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter messages
  const filteredMessages = messages.filter(m => {
    if (!messageSearchQuery.trim()) return true;
    return (m.message_text && m.message_text.toLowerCase().includes(messageSearchQuery.toLowerCase())) ||
           (m.sender_name && m.sender_name.toLowerCase().includes(messageSearchQuery.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-slate-100/70 pt-20 pb-8 px-2 sm:px-4 lg:px-8">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-24 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all transform animate-bounce ${
          feedback.type === 'error'
            ? 'bg-rose-600 text-white shadow-rose-200'
            : feedback.type === 'info'
            ? 'bg-amber-600 text-white shadow-amber-200'
            : 'bg-emerald-600 text-white shadow-emerald-200'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Main Chat Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[600px]">

          <div className="flex-1 flex overflow-hidden">
            {/* LEFT COLUMN: Groups List Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col bg-slate-50/50 ${
              showMobileList ? 'flex' : 'hidden md:flex'
            }`}>

              {/* Sidebar Header */}
              <div className="p-4 bg-white border-b border-slate-200/80">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-slate-900 leading-tight">
                        {language === 'hi' ? 'ग्रुप संवाद' : 'Group Chat'}
                      </h1>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{language === 'hi' ? 'लाइव कनेक्टेड' : 'Live Connected'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      fetchDirectory('');
                      setShowCreateModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
                    title="Create New Group"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{language === 'hi' ? 'नया ग्रुप' : 'New Group'}</span>
                  </button>
                </div>

                {/* Group Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'ग्रुप या मंडल खोजें...' : 'Search union groups...'}
                    value={searchGroupQuery}
                    onChange={(e) => setSearchGroupQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs rounded-xl border border-transparent focus:border-sky-500 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  {searchGroupQuery && (
                    <button
                      onClick={() => setSearchGroupQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 text-xs">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-lg font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {language === 'hi' ? cat.labelHi : cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Groups List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {loadingGroups ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-sky-500" />
                    <span>Loading union channels...</span>
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <Hash className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">No chat groups found</p>
                    <p>Create a new group to begin discussing union matters.</p>
                  </div>
                ) : (
                  filteredGroups.map(group => {
                    const isActive = group.id === activeGroupId;
                    return (
                      <div
                        key={group.id}
                        onClick={() => {
                          setActiveGroupId(group.id);
                          setShowMobileList(false);
                        }}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all border-l-4 ${
                          isActive
                            ? 'bg-sky-50/70 border-sky-600'
                            : 'hover:bg-slate-100/70 border-transparent'
                        }`}
                      >
                        {/* Group Avatar */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={group.avatar_url || PRESET_AVATARS[0].url}
                            alt={group.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = PRESET_AVATARS[0].url;
                            }}
                          />
                          {group.is_admin && (
                            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm" title="Group Admin">
                              <ShieldCheck className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Group Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-sky-950 font-bold' : 'text-slate-800'}`}>
                              {group.name}
                            </h3>
                            {group.last_message && (
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {formatTime(group.last_message.created_at)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 uppercase">
                              {group.category || 'GROUP'}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              {group.members_count || 1}
                            </span>
                          </div>

                          {/* Last message preview */}
                          <p className="text-xs text-slate-500 truncate">
                            {group.last_message ? (
                              <span>
                                <span className="font-medium text-slate-600">{group.last_message.sender_name?.split(' ')[0]}: </span>
                                {group.last_message.message_text}
                              </span>
                            ) : (
                              <span className="italic text-slate-400">No messages yet</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer User Info */}
              <div className="p-3 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user?.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt="Current user"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {user?.profile?.full_name || user?.email?.split('@')[0] || 'Member'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {user?.profile?.union_designation || user?.profile?.designation || user?.member_id || 'Union Member'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchGroups(false)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Refresh groups"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Active Chat Room */}
            <div className={`flex-1 flex flex-col bg-slate-50 ${
              showMobileList ? 'hidden md:flex' : 'flex'
            }`}>
              {activeGroup ? (
                <>
                  {/* Chat Room Header */}
                  <div className="p-3.5 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Back button on mobile */}
                      <button
                        onClick={() => setShowMobileList(true)}
                        className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      {/* Group Avatar */}
                      <div
                        onClick={() => setShowInfoModal(true)}
                        className="relative cursor-pointer group flex-shrink-0"
                      >
                        <img
                          src={activeGroup.avatar_url || PRESET_AVATARS[0].url}
                          alt={activeGroup.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform shadow-xs"
                          onError={(e) => {
                            e.currentTarget.src = PRESET_AVATARS[0].url;
                          }}
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>

                      {/* Title & Info */}
                      <div
                        onClick={() => setShowInfoModal(true)}
                        className="cursor-pointer min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 truncate">
                            {activeGroup.name}
                          </h2>
                          {activeGroup.is_admin && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-2">
                          <span>{activeGroup.members_count || 1} members</span>
                          <span>•</span>
                          <span className="text-sky-600 font-medium">{activeGroup.circle || 'All Circles'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => setShowMessageSearch(!showMessageSearch)}
                        className={`p-2 rounded-xl transition-colors ${
                          showMessageSearch ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                        title="Search in messages"
                      >
                        <Search className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          fetchDirectory('');
                          setShowAddMembersModal(true);
                        }}
                        className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        title="Add members"
                      >
                        <UserPlus className="w-4 h-4 text-sky-600" />
                        <span>Add</span>
                      </button>

                      <button
                        onClick={() => setShowInfoModal(true)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Group info & members roster"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Message Search Sub-bar */}
                  {showMessageSearch && (
                    <div className="p-2.5 bg-sky-50/70 border-b border-sky-100 flex items-center gap-2 animate-fadeIn">
                      <Search className="w-4 h-4 text-sky-600 ml-2" />
                      <input
                        type="text"
                        placeholder="Filter messages in this chat..."
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        className="flex-1 bg-white text-xs px-3 py-1.5 rounded-lg border border-sky-200 focus:outline-none focus:border-sky-500"
                        autoFocus
                      />
                      {messageSearchQuery && (
                        <span className="text-xs text-sky-700 font-semibold px-2">
                          {filteredMessages.length} match(es)
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setMessageSearchQuery('');
                          setShowMessageSearch(false);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Message Thread Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {loadingMessages ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-sky-500" />
                        <span>Loading conversation history...</span>
                      </div>
                    ) : filteredMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                        <div className="w-16 h-16 rounded-3xl bg-sky-100/60 text-sky-600 flex items-center justify-center mb-3">
                          <MessageSquare className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-bold text-slate-800 mb-1">Welcome to {activeGroup.name}!</h4>
                        <p className="text-xs text-slate-500 max-w-sm">
                          This is the beginning of the group chat. Send a message to collaborate with fellow union brothers and officers.
                        </p>
                      </div>
                    ) : (
                      filteredMessages.map((msg, index) => {
                        const isMine = msg.is_mine || msg.sender_id === user?.id;
                        const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
                        const showDateHeader = !prevMsg || formatDateHeader(msg.created_at) !== formatDateHeader(prevMsg.created_at);

                        // Render System Announcements
                        if (msg.is_system) {
                          return (
                            <React.Fragment key={msg.id || index}>
                              {showDateHeader && (
                                <div className="flex items-center justify-center my-3">
                                  <span className="text-[11px] font-semibold bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full shadow-2xs">
                                    {formatDateHeader(msg.created_at)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-center my-2">
                                <div className="text-[11px] font-medium text-slate-500 bg-white/80 border border-slate-200 px-4 py-1.5 rounded-full shadow-2xs text-center max-w-md">
                                  {msg.message_text}
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        }

                        // Regular Message Bubble
                        return (
                          <React.Fragment key={msg.id || index}>
                            {showDateHeader && (
                              <div className="flex items-center justify-center my-3">
                                <span className="text-[11px] font-semibold bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full shadow-2xs">
                                  {formatDateHeader(msg.created_at)}
                                </span>
                              </div>
                            )}

                            <div className={`flex items-end gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              {/* Other User Avatar */}
                              {!isMine && (
                                <img
                                  src={msg.sender_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                                  alt={msg.sender_name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 mb-1 flex-shrink-0"
                                  title={msg.sender_name}
                                />
                              )}

                              {/* Bubble */}
                              <div className={`max-w-[85%] sm:max-w-md lg:max-w-lg rounded-2xl p-3.5 shadow-sm transition-all ${
                                isMine
                                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-xs'
                                  : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                              }`}>
                                {/* Sender Info (For others) */}
                                {!isMine && (
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs font-bold text-sky-700">
                                      {msg.sender_name}
                                    </span>
                                    {msg.sender_designation && (
                                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium truncate max-w-[150px]">
                                        {msg.sender_designation}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Message Content */}
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                  isMine ? 'text-white' : 'text-slate-800'
                                }`}>
                                  {msg.message_text}
                                </p>

                                {/* Timestamp & Status */}
                                <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                                  isMine ? 'text-sky-100' : 'text-slate-400'
                                }`}>
                                  <span>{formatTime(msg.created_at)}</span>
                                  {isMine && (
                                    <span>
                                      {msg.optimistic ? (
                                        <RefreshCw className="w-3 h-3 animate-spin text-sky-200" />
                                      ) : (
                                        <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Emoji Bar */}
                  <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5" />
                    </span>
                    {QUICK_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInputText(prev => prev + emoji);
                          inputRef.current?.focus();
                        }}
                        className="text-base hover:scale-125 hover:bg-white p-1 rounded-lg transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Message Composer Input Form */}
                  <div className="p-3.5 bg-white border-t border-slate-200/80">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Message ${activeGroup.name}... (Press Enter)`}
                        className="flex-1 bg-slate-100 hover:bg-slate-100/90 focus:bg-white px-4 py-3 rounded-2xl text-sm border border-transparent focus:border-sky-500 focus:outline-none transition-all placeholder:text-slate-400"
                        disabled={sendingMessage}
                      />

                      <button
                        type="submit"
                        disabled={!inputText.trim() || sendingMessage}
                        className={`p-3 rounded-2xl text-white font-semibold flex items-center justify-center transition-all ${
                          inputText.trim() && !sendingMessage
                            ? 'bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-500/25 active:scale-95'
                            : 'bg-slate-300 cursor-not-allowed text-slate-500'
                        }`}
                        title="Send message"
                      >
                        {sendingMessage ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* No Active Group Selected */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-20 h-20 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4 shadow-sm">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Union Channel</h3>
                  <p className="text-sm text-slate-500 max-w-md mb-6">
                    Join open discussions, safety protocol forums, and circle conventions with electricity board staff across Madhya Pradesh.
                  </p>
                  <button
                    onClick={() => {
                      fetchDirectory('');
                      setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Group</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: CREATE GROUP */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-sky-600 to-blue-600 text-white">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-bold">Create New Union Chat Group</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhopal Central Testing Lab Forum"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 bg-white"
                  >
                    <option value="GENERAL">General Discussion</option>
                    <option value="CENTRAL">Central Executive (प्रांतीय कार्यसमिति)</option>
                    <option value="DISTRICT">Circle / District Division</option>
                    <option value="SAFETY">Safety & PTW Protocols</option>
                    <option value="ADVOCACY">Pension (OPS) & Pay Scale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Discom Circle
                  </label>
                  <select
                    value={createForm.circle}
                    onChange={(e) => setCreateForm({ ...createForm, circle: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 bg-white"
                  >
                    <option value="All Circles">All Circles (Statewide)</option>
                    <option value="Indore City Circle">Indore City Circle</option>
                    <option value="Indore O&M Circle">Indore O&M Circle</option>
                    <option value="Ujjain Circle">Ujjain Circle</option>
                    <option value="Bhopal Head Office">Bhopal Head Office</option>
                    <option value="Jabalpur Power HQ">Jabalpur Power HQ</option>
                    <option value="Gwalior Discom">Gwalior Discom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Purpose
                </label>
                <textarea
                  rows="2"
                  placeholder="State the objective, meeting agendas, or circular discussion for this group..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
                ></textarea>
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Group Photo / Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((item, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCreateForm({ ...createForm, avatar_url: item.url })}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                        createForm.avatar_url === item.url
                          ? 'border-sky-600 ring-2 ring-sky-300 scale-105'
                          : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                      title={item.label}
                    >
                      <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                      {createForm.avatar_url === item.url && (
                        <span className="absolute inset-0 bg-sky-600/30 flex items-center justify-center text-white">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Members Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Invite Members ({selectedMemberIds.length} selected)
                  </label>
                  <span className="text-[11px] text-slate-500">You are automatically Group Admin</span>
                </div>

                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search member by name, ID or circle..."
                    value={directorySearch}
                    onChange={(e) => {
                      setDirectorySearch(e.target.value);
                      fetchDirectory(e.target.value);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {loadingDirectory ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading members...</div>
                  ) : directory.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No members found.</div>
                  ) : (
                    directory.map(m => {
                      const isSelected = selectedMemberIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedMemberIds(prev => 
                              isSelected ? prev.filter(id => id !== m.id) : [...prev, m.id]
                            );
                          }}
                          className={`p-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-sky-50/70' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={m.avatar_url}
                              alt={m.full_name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{m.full_name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{m.designation} • {m.circle}</p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Submit Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup || !createForm.name.trim()}
                  className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-md disabled:bg-slate-300"
                >
                  {creatingGroup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Create Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GROUP INFO & ADMIN CONTROLS */}
      {showInfoModal && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold">Group Details & Admin Controls</h3>
              </div>
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  setIsEditingSettings(false);
                }}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Profile Card */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={activeGroup.avatar_url || PRESET_AVATARS[0].url}
                  alt={activeGroup.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-300 shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">{activeGroup.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase">
                      {activeGroup.category}
                    </span>
                    <span className="text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {activeGroup.circle}
                    </span>
                  </div>
                  {activeGroup.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {activeGroup.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Settings Edit Section */}
              {activeGroup.is_admin && (
                <div className="border border-amber-200/80 bg-amber-50/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Admin Settings
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingSettings(!isEditingSettings)}
                      className="text-xs font-semibold text-amber-800 hover:underline"
                    >
                      {isEditingSettings ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                  </div>

                  {isEditingSettings && (
                    <form onSubmit={handleUpdateGroupSettings} className="space-y-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Group Name</label>
                        <input
                          type="text"
                          value={editGroupData.name}
                          onChange={(e) => setEditGroupData({ ...editGroupData, name: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Description</label>
                        <textarea
                          rows="2"
                          value={editGroupData.description}
                          onChange={(e) => setEditGroupData({ ...editGroupData, description: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={savingSettings}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm"
                        >
                          {savingSettings ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Members Roster */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-600" />
                    Members Roster ({activeGroup.members?.length || 0})
                  </h4>

                  {activeGroup.is_admin && (
                    <button
                      onClick={() => {
                        fetchDirectory('');
                        setShowAddMembersModal(true);
                      }}
                      className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-bold"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {activeGroup.members?.map(m => {
                    const isGroupAdmin = m.role === 'ADMIN' || m.is_creator;
                    const canRemove = activeGroup.is_admin && m.user_id !== user?.id;

                    return (
                      <div key={m.id || m.user_id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={m.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                            alt={m.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 truncate">{m.full_name}</p>
                              {m.user_id === user?.id && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded font-medium">You</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {m.designation || 'Member'} • {m.member_id || m.circle || 'Union'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isGroupAdmin ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-amber-600" /> Admin
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              Member
                            </span>
                          )}

                          {canRemove && (
                            <button
                              onClick={() => handleRemoveMember(m.user_id, m.full_name)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove member"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Danger Zone Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleLeaveGroup}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Group</span>
                </button>

                {(activeGroup.is_admin || isAdmin) && (
                  <button
                    type="button"
                    onClick={handleDeleteGroup}
                    className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-white hover:bg-rose-600 font-bold px-3 py-2 rounded-xl border border-rose-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Group</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD MEMBERS TO EXISTING GROUP */}
      {showAddMembersModal && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-sky-600 text-white">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-bold">Add Members to {activeGroup.name}</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddMembersModal(false);
                  setSelectedMemberIds([]);
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search member directory..."
                  value={directorySearch}
                  onChange={(e) => {
                    setDirectorySearch(e.target.value);
                    fetchDirectory(e.target.value);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl max-h-72 overflow-y-auto">
                {directory
                  .filter(m => !activeGroup.members?.some(curr => curr.user_id === m.id))
                  .map(m => {
                    const isSelected = selectedMemberIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMemberIds(prev =>
                            isSelected ? prev.filter(id => id !== m.id) : [...prev, m.id]
                          );
                        }}
                        className={`p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-sky-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={m.avatar_url}
                            alt={m.full_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{m.full_name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{m.designation} • {m.circle}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  {selectedMemberIds.length} member(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowAddMembersModal(false);
                      setSelectedMemberIds([]);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMembersSubmit}
                    disabled={selectedMemberIds.length === 0}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg disabled:bg-slate-300"
                  >
                    Add Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
