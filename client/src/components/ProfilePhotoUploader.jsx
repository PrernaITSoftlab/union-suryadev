import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, Trash2, Check, RefreshCw, Image as ImageIcon, Link as LinkIcon, Sparkles } from 'lucide-react';

export const PRESET_AVATARS = [
  {
    id: 'male-1',
    name: 'Executive Portrait 1',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'female-1',
    name: 'Officer Portrait 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'male-2',
    name: 'Engineer Portrait 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'female-2',
    name: 'Engineer Portrait 2',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'male-3',
    name: 'Officer Portrait 3',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'male-4',
    name: 'Leadership Portrait 4',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  }
];

export default function ProfilePhotoUploader({
  currentPhoto = '',
  onChange,
  onInstantSave = null,
  isSaving = false,
  showInstantSaveButton = false
}) {
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef(null);

  const defaultFallback = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
  const displayPhoto = currentPhoto || defaultFallback;

  const processFile = (file) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    // Validate size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`Photo size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit. Please upload a smaller photo.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (onChange) onChange(dataUrl);
      setSuccessMsg('Photo uploaded and preview updated ✓');
      setTimeout(() => setSuccessMsg(''), 4000);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the selected image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const handlePresetSelect = (presetUrl) => {
    setErrorMsg('');
    setSuccessMsg('Preset portrait selected ✓');
    if (onChange) onChange(presetUrl);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('/')) {
      setErrorMsg('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }
    setErrorMsg('');
    if (onChange) onChange(urlInput.trim());
    setSuccessMsg('Custom photo URL applied ✓');
    setUrlInput('');
    setShowUrlField(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleReset = () => {
    if (onChange) onChange(defaultFallback);
    setSuccessMsg('Photo reset to default portrait ✓');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Profile Photo & Official Avatar
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">PNG, JPG, WEBP (Max 5MB)</span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Preview & Dropzone Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Live Photo Preview */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="relative group">
            <img
              src={displayPhoto}
              alt="Profile Preview"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-500 shadow-md transition-transform group-hover:scale-102"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="absolute -bottom-1 -right-1 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md border border-white transition-transform active:scale-95"
              title="Upload new image"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] font-bold text-slate-700 mt-2">Live Preview</span>
          <span className="text-[10px] text-slate-400">Used on ID Card & Dashboard</span>
        </div>

        {/* Upload Dropzone */}
        <div className="sm:col-span-8 space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
          />

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              dragOver
                ? 'border-amber-500 bg-amber-50/70 scale-[0.99]'
                : 'border-slate-300 bg-white hover:border-amber-400 hover:bg-amber-50/30'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-0.5">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-900">
              <span className="text-amber-700 underline font-extrabold">Click to browse</span> or drag and drop photo
            </p>
            <p className="text-[11px] text-slate-500">Supports PNG, JPG, WEBP up to 5MB</p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Choose From Device</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlField(!showUrlField)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-all"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Enter Photo URL</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 text-xs font-semibold border border-slate-200 hover:border-red-200 flex items-center gap-1.5 transition-all ml-auto"
              title="Reset to default portrait"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {showInstantSaveButton && onInstantSave && (
            <button
              type="button"
              onClick={() => onInstantSave(currentPhoto)}
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Photo Now</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* URL Input Form Collapsible */}
      {showUrlField && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 animate-in fade-in">
          <label className="block text-[11px] font-bold text-slate-700">Web Image URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/my-photo.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Quick Preset Avatars Selection */}
      <div className="space-y-2 pt-2 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Or choose an official profile portrait:</span>
          </span>
          <span className="text-[10px] text-slate-400">1-click select</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_AVATARS.map((preset) => {
            const isSelected = currentPhoto === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.url)}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all p-1 bg-white flex flex-col items-center ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
                title={preset.name}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                />
                {isSelected && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                    ✓
                  </span>
                )}
                <span className="text-[9px] font-bold text-slate-600 truncate w-full mt-1 text-center group-hover:text-amber-800">
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
