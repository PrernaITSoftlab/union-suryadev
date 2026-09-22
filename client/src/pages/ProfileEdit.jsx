import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Building, MapPin, Globe, Linkedin, Twitter, Phone, Save, CheckCircle2, ArrowLeft } from 'lucide-react';

const ProfileEdit = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const profile = user?.profile || {};

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    avatar_url: profile.avatar_url || '',
    title: profile.title || '',
    company: profile.company || '',
    industry: profile.industry || 'Financial Technology',
    location: profile.location || 'Mumbai, India',
    bio: profile.bio || '',
    skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || '',
    services: Array.isArray(profile.services) ? profile.services.join(', ') : profile.services || '',
    website: profile.website || '',
    linkedin: profile.linkedin || '',
    twitter: profile.twitter || '',
    phone: profile.phone || ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const sampleAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-extrabold text-white">Member Profile Editor</h1>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-6 text-xs">
        
        {/* Avatar Selection */}
        <div>
          <label className="font-bold text-slate-300 block mb-2">Profile Photo Avatar</label>
          <div className="flex items-center gap-4">
            <img
              src={formData.avatar_url || sampleAvatars[0]}
              alt="Avatar Preview"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-cyan shadow-glow-cyan"
            />
            <div className="flex flex-wrap gap-2">
              {sampleAvatars.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Avatar ${idx}`}
                  onClick={() => setFormData({ ...formData, avatar_url: url })}
                  className={`w-10 h-10 rounded-xl object-cover cursor-pointer hover:opacity-100 transition-opacity ${
                    formData.avatar_url === url ? 'ring-2 ring-brand-cyan' : 'opacity-60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Professional Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Company / Organization</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-300 block mb-1">Executive Bio</label>
          <textarea
            rows="4"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Skills (comma separated)</label>
            <input
              type="text"
              placeholder="Fintech, M&A Advisory, Enterprise Sales"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Services (comma separated)</label>
            <input
              type="text"
              placeholder="Consulting, Payment API Integration"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Website URL</label>
            <input
              type="url"
              placeholder="https://company.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">LinkedIn Profile</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-right">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold shadow-glow-cyan hover:opacity-95 flex items-center justify-center gap-2 ml-auto"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default ProfileEdit;
