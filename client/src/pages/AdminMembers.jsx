import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, ShieldCheck, UserX, CheckCircle, Edit2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredMembers = members.filter(m => {
    const term = search.toLowerCase();
    const p = m.profile || {};
    return m.email.toLowerCase().includes(term) ||
           p.full_name?.toLowerCase().includes(term) ||
           p.company?.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link to="/admin" className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 border border-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900">Member Accounts Administration</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by member name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Member Profile</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Industry & Company</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-slate-500 font-medium">Loading member database...</td></tr>
              ) : filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                        alt={m.profile?.full_name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-100 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{m.profile?.full_name || 'User'}</div>
                        <div className="text-[11px] text-slate-500">{m.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleUpdateStatus(m.id, null, m.role === 'admin' ? 'user' : 'admin')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase transition-colors ${
                        m.role === 'admin' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {m.role === 'admin' ? 'Admin' : 'User'}
                    </button>
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800">{m.profile?.company || 'N/A'}</div>
                    <div className="text-[11px] text-slate-500">{m.profile?.industry || 'N/A'}</div>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize border ${
                      m.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {m.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right space-x-2">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminMembers;
