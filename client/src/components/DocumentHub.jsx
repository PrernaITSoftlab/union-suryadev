import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  UploadCloud, 
  Share2, 
  Download, 
  Trash2, 
  Search, 
  Plus, 
  X, 
  Eye, 
  Sparkles, 
  Lock, 
  Globe, 
  Users, 
  Check, 
  Copy,
  Tag,
  Building,
  Filter
} from 'lucide-react';

const DocumentHub = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'

  // Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: 'PDF',
    category: 'Technical Whitepaper',
    access_level: 'public',
    tags: ''
  });

  const categories = [
    'All',
    'Technical Whitepaper',
    'Compliance & Banking',
    'Contract Template',
    'Company Pitch Deck',
    'Case Study',
    'Research Report'
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title || !formData.description) {
      setError('Title and description are required.');
      return;
    }
    setUploading(true);
    try {
      const res = await api.post('/documents', formData);
      if (res.data.success) {
        setUploadModalOpen(false);
        setFormData({
          title: '',
          description: '',
          file_url: '',
          file_type: 'PDF',
          category: 'Technical Whitepaper',
          access_level: 'public',
          tags: ''
        });
        await fetchDocuments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this shared document?')) return;
    try {
      const res = await api.delete(`/documents/${docId}`);
      if (res.data.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url || window.location.href);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDocs = documents.filter(doc => {
    if (activeTab === 'my' && doc.uploader_id !== user?.id) return false;
    if (categoryFilter !== 'All' && doc.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (search) {
      const term = search.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(term);
      const matchDesc = doc.description.toLowerCase().includes(term);
      const matchTags = doc.tags && doc.tags.some(t => t.toLowerCase().includes(term));
      const matchUploader = doc.uploader_name && doc.uploader_name.toLowerCase().includes(term);
      return matchTitle || matchDesc || matchTags || matchUploader;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
            <FileText className="w-4 h-4 text-blue-600" /> MPWZ Union Official Circulars & Resources
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Upload & Share <span className="text-blue-600 font-black">Union Circulars & Orders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access Discom orders, safety guidelines, wage agreement circulars, and official union gazettes.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <UploadCloud className="w-4 h-4" /> Share New Document
        </button>
      </div>

      {/* Control & Filtering Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Shared ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Uploads ({documents.filter(d => d.uploader_id === user?.id).length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">Loading shared document repository...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl text-center space-y-3 border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No documents found</h3>
          <p className="text-xs text-slate-500">Be the first to upload and share a resource with the community.</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" /> Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const isMyDoc = doc.uploader_id === user?.id || user?.role === 'admin';
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md flex flex-col justify-between space-y-4 relative group transition-all"
              >
                <div className="space-y-3">
                  {/* Category Pill & Access Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase">
                      {doc.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold flex items-center gap-1">
                      {doc.access_level === 'public' ? <Globe className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                      {doc.file_type || 'PDF'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {doc.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Shared By Author Info */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={doc.uploader?.avatar_url || doc.uploader_avatar}
                        alt={doc.uploader?.full_name || doc.uploader_name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-500 shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{doc.uploader?.full_name || doc.uploader_name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{doc.uploader?.company || doc.uploader_company}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={doc.file_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download / View
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(doc.file_url, doc.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold"
                      title="Share link"
                    >
                      {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>

                    {isMyDoc && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-slate-900">
            
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Upload & Share Document</h3>
                <p className="text-xs text-slate-500">Share valuable papers, contracts, or decks with Union members.</p>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discom Safety Guidelines & Lineman SOP 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description & Key Highlights *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief summary of what members will find in this document..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">File Format</label>
                  <select
                    value={formData.file_type}
                    onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="PPTX">Presentation (.pptx)</option>
                    <option value="ZIP">Archive (.zip)</option>
                    <option value="LINK">External Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">File Download / View URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/my-document.pdf (Default test link if blank)"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Safety, Discom, WageAgreement, Rules"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md"
                >
                  {uploading ? 'Sharing...' : 'Publish & Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentHub;
