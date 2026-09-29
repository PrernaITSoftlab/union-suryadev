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
      <div className="relative overflow-hidden rounded-xl border border-sky-200 bg-white/95 text-slate-900 shadow-xl shadow-sky-500/10 backdrop-blur-xl">
        {/* Top Header Bar */}
        <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 text-white">
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-sky-100" />
            <span>{currentPopup.type} NOTICE</span>
            {visiblePopups.length > 1 && (
              <span className="ml-1 px-1 py-0.2 rounded bg-white/20 text-white text-[9px]">
                {currentPopupIndex + 1}/{visiblePopups.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono opacity-80">{timeRemaining}s</span>
            <button
              onClick={() => dismissPopup(currentPopup.id)}
              className="p-0.5 rounded hover:bg-white/20 transition-colors"
              title="Close notice"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 flex flex-col gap-1">
          <h4 className="font-bold text-xs leading-snug tracking-tight text-slate-900">
            {currentPopup.title}
          </h4>
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
            {currentPopup.description}
          </p>

          <div className="mt-1 flex items-center justify-between pt-2 border-t border-slate-100">
            <Link
              to="/events"
              onClick={() => dismissPopup(currentPopup.id)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3 text-sky-600" />
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
        <div className="h-0.5 bg-slate-100 w-full">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-1000" 
            style={{ width: `${(timeRemaining / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
