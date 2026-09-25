import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';

export default function AnnouncementPopup() {
  const { visiblePopups, dismissPopup } = useNotification();
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(10);

  const currentPopup = visiblePopups[currentPopupIndex];

  useEffect(() => {
    if (!currentPopup) return;

    setTimeRemaining(10);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPopup?.id]);

  if (!currentPopup) return null;

  const isUrgent = ['STRIKE', 'URGENT', 'EMERGENCY', 'CRITICAL'].includes(currentPopup.type) || currentPopup.priority === 'CRITICAL';

  return (
    <div className="fixed top-20 right-4 left-4 md:left-auto md:right-6 md:w-[350px] sm:w-[320px] z-50 transition-all duration-300 transform translate-y-0">
      <div className={`relative overflow-hidden rounded-xl border shadow-xl backdrop-blur-xl ${
        isUrgent 
          ? 'bg-red-50/95 border-red-300 text-red-950 shadow-red-500/10'
          : 'bg-white/95 border-amber-300 text-slate-900 shadow-lg'
      }`}>
        {/* Top Header Bar */}
        <div className={`px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
          isUrgent ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
        }`}>
          <div className="flex items-center gap-1.5">
            {isUrgent ? <ShieldAlert className="w-3.5 h-3.5 text-white animate-pulse" /> : <Bell className="w-3.5 h-3.5 text-slate-950" />}
            <span>{currentPopup.type} NOTICE</span>
            {visiblePopups.length > 1 && (
              <span className="ml-1 px-1 py-0.2 rounded bg-black/20 text-white text-[9px]">
                {currentPopupIndex + 1}/{visiblePopups.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono opacity-80">{timeRemaining}s</span>
            <button
              onClick={() => dismissPopup(currentPopup.id)}
              className="p-0.5 rounded hover:bg-black/10 transition-colors"
              title="Close notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3 flex flex-col gap-1">
          <h4 className="font-bold text-xs leading-snug tracking-tight text-slate-900">
            {currentPopup.title}
          </h4>
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
            {currentPopup.description}
          </p>

          <div className="mt-1 flex items-center justify-between pt-1 border-t border-slate-200/60">
            <Link
              to="/events"
              onClick={() => dismissPopup(currentPopup.id)}
              className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                isUrgent ? 'text-red-700 hover:text-red-900' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            {visiblePopups.length > 1 && (
              <button
                onClick={() => setCurrentPopupIndex((prev) => (prev + 1) % visiblePopups.length)}
                className="text-[10px] text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Next Notice
              </button>
            )}
          </div>
        </div>

        {/* Timer progress bar */}
        <div className="h-0.5 bg-slate-200 w-full">
          <div 
            className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-red-600' : 'bg-amber-500'}`} 
            style={{ width: `${(timeRemaining / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
