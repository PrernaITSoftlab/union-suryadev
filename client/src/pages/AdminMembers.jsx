import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, ShieldCheck, UserX, CheckCircle, Edit2, ArrowLeft, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editMember, setEditMember] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    member_id: '',
    designation: '',
    company: '',
    circle: '',
    phone: '',
    role: 'user',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAdminMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/members');
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
    fetchAdminMembers();
  }, []);

  const handleUpdateStatus = async (id, status, role) => {
    try {
      const res = await api.put(`/admin/members/${id}`, { status, role });
      if (res.data.success) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: status || m.status, role: role || m.role } : m));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleOpenEdit = (m) => {
    const p = m.profile || {};
    setEditMember(m);
    setEditForm({
      full_name: p.full_name || m.full_name || '',
      email: m.email || '',
      member_id: m.member_id || m.employee_id || '',
      designation: p.designation || p.title || m.designation || '',
      company: p.company || m.company || 'MP West Zone Electricity Discom',
      circle: p.circle || m.circle || '',
      phone: p.phone || m.phone || '',
      role: m.role || 'user',
      status: m.status || 'active'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editMember) return;
    setIsSubmitting(true);
    try {
      const res = await api.put(`/admin/members/${editMember.id}`, editForm);
      if (res.data.success) {
        setMembers(prev => prev.map(m => {
          if (m.id === editMember.id) {
            const updatedProfile = {
              ...(m.profile || {}),
              full_name: editForm.full_name,
              designation: editForm.designation,
              company: editForm.company,
              circle: editForm.circle,
              phone: editForm.phone
            };
            return {
              ...m,
              email: editForm.email,
              member_id: editForm.member_id,
              role: editForm.role,
              status: editForm.status,
              full_name: editForm.full_name,
              profile: updatedProfile
            };
          }
          return m;
        }));
        setSuccessMessage(`Member "${editForm.full_name}" updated successfully!`);
        setTimeout(() => setSuccessMessage(''), 3500);
        setEditMember(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const term = search.toLowerCase();
    const p = m.profile || {};
    const name = p.full_name || m.full_name || '';
    const memId = m.member_id || m.employee_id || '';
    const comp = p.company || m.company || '';
    const circle = p.circle || m.circle || '';
    const desig = p.designation || m.designation || '';

    return m.email.toLowerCase().includes(term) ||
           name.toLowerCase().includes(term) ||
           memId.toLowerCase().includes(term) ||
           comp.toLowerCase().includes(term) ||
           circle.toLowerCase().includes(term) ||
           desig.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link to="/admin" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 border border-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Member Accounts Administration</h1>
          <p className="text-xs text-slate-500 font-medium">Manage and edit registered member records, credentials, and union status</p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm w-full max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by member name, ID, email, circle, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>
        <div className="text-xs font-bold text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
          Total Members: <span className="text-blue-700 font-black">{filteredMembers.length}</span> / {members.length}
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Member Profile</th>
                <th className="py-4 px-6">Member ID</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Designation & Circle</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center text-slate-500 font-medium">Loading member database...</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-slate-500 font-medium">No members match your search criteria.</td></tr>
              ) : filteredMembers.map((m) => {
                const p = m.profile || {};
                const fullName = p.full_name || m.full_name || 'Member';
                const memberId = m.member_id || m.employee_id || `MPAVAKS-${String(m.id).padStart(4, '0')}`;
                const designation = p.designation || p.title || m.designation || 'Staff';
                const circle = p.circle || m.circle || 'Indore';

                return (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                          alt={fullName}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{fullName}</div>
                          <div className="text-[11px] text-slate-500">{m.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-blue-700">
                      {memberId}
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleUpdateStatus(m.id, null, m.role === 'admin' ? 'user' : 'admin')}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase transition-colors ${
                          m.role === 'admin' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                        title="Click to toggle Role"
                      >
                        {m.role === 'admin' ? 'Admin' : 'User'}
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{designation}</div>
                      <div className="text-[11px] text-slate-500">{circle}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize border ${
                        m.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>

                      {m.status === 'active' ? (
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'suspended', null)}
                          className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200 hover:bg-rose-100 transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'active', null)}
                          className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Member Details</h3>
                  <p className="text-xs text-slate-500">Updating member account #{editMember.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="e.g. Er. Suryadev JS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Member ID</label>
                  <input
                    type="text"
                    value={editForm.member_id}
                    onChange={(e) => setEditForm({ ...editForm, member_id: e.target.value })}
                    placeholder="e.g. MPAVAKS-0001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    placeholder="e.g. Assistant Engineer (AE)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Circle / Location</label>
                  <input
                    type="text"
                    value={editForm.circle}
                    onChange={(e) => setEditForm({ ...editForm, circle: e.target.value })}
                    placeholder="e.g. Indore City Circle"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+91 98260 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company / Department</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    placeholder="MP West Zone Electricity Discom"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMembers;