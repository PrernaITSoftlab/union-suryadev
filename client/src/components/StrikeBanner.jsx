import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, X, Clock, MapPin } from 'lucide-react';
import api from '../services/api';

const StrikeBanner = () => {
  const [strikeAlert, setStrikeAlert] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchStrikeAlert = async () => {
      try {
        const res = await api.get('/strike/current');
        if (res.data?.success && res.data.alert) {
          setStrikeAlert(res.data.alert);
        }
      } catch (err) {
        console.error('Strike alert fetch error:', err);
      }
    };
    fetchStrikeAlert();
  }, []);

  if (dismissed || !strikeAlert || !strikeAlert.is_active) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white border-b border-sky-400/30 shadow-xl relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          {/* Alert Title & Badge */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-950/40 text-sky-200 border border-sky-300/40 shrink-0">
              <AlertTriangle className="w-5 h-5 text-sky-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white text-sky-950">
                  {strikeAlert.badge_text || 'URGENT UNION ALERT'}
                </span>
                <span className="text-xs text-sky-100 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-200" /> {strikeAlert.strike_date} | {strikeAlert.strike_time}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                {strikeAlert.title}
              </h3>
            </div>
          </div>

          {/* Action Link & Dismiss */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-1 md:pt-0">
            <Link
              to="/strike-alerts"
              className="px-4 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-950 font-extrabold text-xs transition-transform transform hover:scale-105 flex items-center gap-1 shadow-md whitespace-nowrap"
            >
              <span>View Demands & Venue</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg hover:bg-sky-800/80 text-sky-200 hover:text-white"
              aria-label="Close Notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StrikeBanner;
