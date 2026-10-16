import React, { useState } from 'react';
import { X, Copy, Check, Share2, Calendar, MapPin, MessageSquare, Send, Globe, Mail, Sparkles } from 'lucide-react';

export default function EventShareModal({ isOpen, onClose, event }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mpvmavaksunion.org';
  const shareUrl = `${origin}/events?id=${event.id}`;
  const shareTitle = `MPVMAVAKS Union: ${event.title}`;
  const shareText = `📢 ${event.title}\n📅 Date: ${event.start_date}${event.start_time ? ` (${event.start_time})` : ''}\n📍 Venue: ${event.venue}\n\n👉 View details & register on the Union portal:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Join us for ${event.title} at ${event.venue} on ${event.start_date}.`,
          url: shareUrl
        });
      } catch (_) {
        // User cancelled or share failed
      }
    }
  };

  const socialChannels = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.67-.7c.97.57 1.771.882 2.79.883l.002.001c3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.77-5.77-5.77zm0-2.172c4.379 0 7.938 3.56 7.939 7.942 0 4.38-3.56 7.939-7.941 7.939-1.341-.001-2.613-.341-3.729-.939l-4.3 1.127 1.149-4.195c-.689-1.189-1.059-2.544-1.059-3.932 0-4.382 3.56-7.942 7.941-7.942z"/>
        </svg>
      ),
      bg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Telegram',
      icon: <Send className="w-4 h-4" />,
      bg: 'bg-sky-500 hover:bg-sky-400 text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bg: 'bg-slate-900 hover:bg-slate-800 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
        </svg>
      ),
      bg: 'bg-blue-600 hover:bg-blue-500 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      bg: 'bg-sky-700 hover:bg-sky-600 text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Email',
      icon: <Mail className="w-4 h-4" />,
      bg: 'bg-slate-700 hover:bg-slate-600 text-white',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 space-y-5 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Share2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Share Union Program
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Invite colleagues, delegates & linemen to participate
            </p>
          </div>
        </div>

        {/* Event Preview Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex gap-3 items-center">
          {event.banner_url && (
            <img
              src={event.banner_url}
              alt={event.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider block">
              {event.event_type || 'UNION EVENT'}
            </span>
            <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">
              {event.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <span className="truncate">{event.start_date}</span>
              <span>•</span>
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Quick Social Channels Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Share via Social Channels
          </label>
          <div className="grid grid-cols-3 gap-2">
            {socialChannels.map((channel) => (
              <a
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${channel.bg}`}
              >
                {channel.icon}
                <span className="text-[11px]">{channel.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Native Web Share API if supported on device */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Share via Phone / Device Menu</span>
          </button>
        )}

        {/* Direct Link Copy Field */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">
            Copy Event Direct Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => e.target.select()}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-600 font-semibold animate-in fade-in">
              ✓ Direct link copied to clipboard! You can paste and share it anywhere.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
