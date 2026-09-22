import React, { useState, useEffect } from 'react';
import api from '../services/api';
import OpportunityCard from '../components/OpportunityCard';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Search, Filter, Sparkles, X, CheckCircle2 } from 'lucide-react';

const Opportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [newOpp, setNewOpp] = useState({
    title: '',
    category: 'B2B Partnership',
    description: '',
    requirements: '',
    location: 'Global / Remote',
    budget_range: '$25,000 - $100,000'
  });
  const [posting, setPosting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/opportunities', {
        params: { search, category: selectedCategory }
      });
      if (res.data.success) {
        setOpportunities(res.data.opportunities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search, selectedCategory]);

  const handlePostOpportunity = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await api.post('/opportunities/create', newOpp);
      if (res.data.success) {
        setCreateModalOpen(false);
        setNewOpp({
          title: '',
          category: 'B2B Partnership',
          description: '',
          requirements: '',
          location: 'Global / Remote',
          budget_range: '$25,000 - $100,000'
        });
        await fetchOpportunities();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post opportunity');
    } finally {
      setPosting(false);
    }
  };

  const categories = ['All', 'B2B Partnership', 'Contract Opportunity', 'Client Referral', 'Co-Founding / Joint Venture'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold mb-2">
            <Briefcase className="w-4 h-4" /> Business Referrals Exchange
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Union <span className="gradient-text-cyan">Business Opportunities</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover active corporate tenders, joint venture proposals, and high-payout referral requests.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) alert('Please log in to post an opportunity!');
            else setCreateModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold text-xs shadow-glow-cyan hover:opacity-95 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Post Opportunity
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by title, keywords, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-cyan"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading business opportunities...</div>
      ) : opportunities.length === 0 ? (
        <div className="py-20 glass-panel rounded-3xl text-center space-y-3 border border-slate-800">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active opportunities matched</h3>
          <p className="text-xs text-slate-400">Be the first to post a new business lead!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}

      {/* Create Opportunity Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-card-dark relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1">Post Business Opportunity</h3>
            <p className="text-xs text-slate-400 mb-6">Share your referral request or contract pitch with Union members.</p>

            <form onSubmit={handlePostOpportunity} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud Security Audit Contract"
                  value={newOpp.title}
                  onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newOpp.category}
                    onChange={(e) => setNewOpp({ ...newOpp, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="B2B Partnership">B2B Partnership</option>
                    <option value="Contract Opportunity">Contract Opportunity</option>
                    <option value="Client Referral">Client Referral</option>
                    <option value="Co-Founding / Joint Venture">Joint Venture</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Budget / Fee Value</label>
                  <input
                    type="text"
                    placeholder="e.g. $50,000 retainer"
                    value={newOpp.budget_range}
                    onChange={(e) => setNewOpp({ ...newOpp, budget_range: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Opportunity Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe your project, target partners, and mutual revenue benefits..."
                  value={newOpp.description}
                  onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2 rounded-xl bg-brand-cyan text-navy-950 font-extrabold shadow-glow-cyan"
                >
                  {posting ? 'Publishing...' : 'Publish Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Opportunities;
