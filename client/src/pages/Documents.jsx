import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, Eye, Tag, Calendar, User, FileCheck, X } from 'lucide-react';
import api from '../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Wage & Pension Orders',
    'Safety Protocols',
    'Membership Forms',
    'Grievance Forms',
    'Strike Bulletins'
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data?.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Fetch documents error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.ref_no && doc.ref_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <FileText className="w-4 h-4 text-blue-600" /> MPWZ Union Official Documents & Circulars
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Union Circulars, Orders & Forms Hub
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Access, read, and download official Gazette notifications, Discom wage orders, safety protocols, membership forms, and grievance applications.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search circulars, ref no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading union circulars...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Circulars Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your category filter or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {doc.file_type || 'PDF'} • {doc.file_size || '1.5 MB'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono text-slate-600 font-semibold truncate">{doc.ref_no || 'MPWZ/UNION/2026'}</span>
                    <span>Downloads: {doc.downloads_count || 120}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <a
                      href={doc.file_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setPreviewDoc(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {previewDoc.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{previewDoc.ref_no}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{previewDoc.title}</h3>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-3">
                <p className="font-semibold">{previewDoc.description}</p>
                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-500">
                  <div>
                    <span className="block text-slate-500 font-semibold">Published By</span>
                    <span className="text-slate-900 font-bold">{previewDoc.uploader_name || 'MPWZ Central Committee'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-semibold">Format & Size</span>
                    <span className="text-slate-900 font-bold">{previewDoc.file_type || 'PDF'} ({previewDoc.file_size || '1.5 MB'})</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-semibold">Total Downloads</span>
                    <span className="text-slate-900 font-bold">{previewDoc.downloads_count || 120}</span>
                  </div>
                </div>
              </div>

              {/* Mock PDF Viewer Frame */}
              <div className="h-64 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <FileCheck className="w-12 h-12 text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Document Stream Ready</h4>
                  <p className="text-xs text-slate-500">Official MPWZ West Zone Electricity Discom Document File</p>
                </div>
                <a
                  href={previewDoc.file_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" /> Open Full Document File
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Documents;
