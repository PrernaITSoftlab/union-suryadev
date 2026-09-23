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
    <div className="fixed top-24 right-4 left-4 md:left-auto md:right-6 md:w-[480px] z-50 transition-all duration-300 transform translate-y-0">
      <div className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
        isUrgent 
          ? 'bg-red-50 border-red-300 text-red-950 shadow-red-500/10'
          : 'bg-white border-amber-300 text-slate-900 shadow-xl'
      }`}>
        {/* Top Header Bar */}
        <div className={`px-4 py-2 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider ${
          isUrgent ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
        }`}>
          <div className="flex items-center gap-2">
            {isUrgent ? <ShieldAlert className="w-4 h-4 text-white animate-bounce" /> : <Bell className="w-4 h-4 text-slate-950" />}
            <span>{currentPopup.type} NOTICE</span>
            {visiblePopups.length > 1 && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-black/20 text-white text-[10px]">
                {currentPopupIndex + 1} of {visiblePopups.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono opacity-90">Visible {timeRemaining}s</span>
            <button
              onClick={() => dismissPopup(currentPopup.id)}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col gap-2">
          <h4 className="font-extrabold text-base leading-snug tracking-tight text-slate-900">
            {currentPopup.title}
          </h4>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {currentPopup.description}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <Link
              to="/events"
              onClick={() => dismissPopup(currentPopup.id)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                isUrgent ? 'text-red-700 hover:text-red-900' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <span>View Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {visiblePopups.length > 1 && (
              <button
                onClick={() => setCurrentPopupIndex((prev) => (prev + 1) % visiblePopups.length)}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Next Notice
              </button>
            )}
          </div>
        </div>

        {/* Timer progress bar */}
        <div className="h-1 bg-slate-200 w-full">
          <div 
            className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-red-600' : 'bg-amber-500'}`} 
            style={{ width: `${(timeRemaining / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
