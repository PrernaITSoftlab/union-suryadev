import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, Menu, X, Bell, User, LogOut, ChevronDown, CheckCircle2, 
  FileText, Calendar, Users, Home, Info, PhoneCall, UserPlus, LogIn, LayoutDashboard, Settings, Languages
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout, settings } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { language, toggleLanguage, t, isHindi } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [energyDropdownOpen, setEnergyDropdownOpen] = useState(false);
  const [boardDropdownOpen, setBoardDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm w-full">
      <div className="max-w-[1440px] mx-auto px-2.5 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-20 gap-1.5 sm:gap-3">
          
          {/* Logo & Union Title */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img 
              src={settings?.logo_url || "/images/union-logo.png"} 
              alt="MPVMAVAKS Union Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform shrink-0" 
            />
            <div className="whitespace-nowrap">
              <span className="font-extrabold text-sm sm:text-base lg:text-lg xl:text-xl tracking-tight text-slate-900 block group-hover:text-sky-600 transition-colors">
                {settings?.union_short_name || 'MPVMAVAKS UNION'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide hidden xl:block">
                {t('Western Zone Electricity Discom')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 flex-nowrap shrink-0">
            <Link 
              to="/" 
              className={`px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${isActive('/') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {t('Home')}
            </Link>
            <Link 
              to="/about" 
              className={`px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${isActive('/about') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {t('About Us')}
            </Link>
            <div 
              className="relative"
              onMouseEnter={() => setBoardDropdownOpen(true)}
              onMouseLeave={() => setBoardDropdownOpen(false)}
            >
              <Link 
                to="/board-of-union" 
                className={`px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${isActive('/board-of-union') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
                onClick={() => setBoardDropdownOpen(false)}
              >
                <span>{t('Board of Union')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${boardDropdownOpen ? 'rotate-180 text-sky-600' : 'text-slate-400'}`} />
              </Link>

              {boardDropdownOpen && (
                <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 mb-1">
                    <span className="font-extrabold text-xs text-slate-900 block">{t('Board of Union')}</span>
                    <span className="text-[10px] text-slate-500 block">Executive Leaders & Directory (18 Heads)</span>
                  </div>

                  <Link
                    to="/board-of-union"
                    onClick={() => setBoardDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold text-sky-700 hover:bg-sky-50 transition-colors flex items-center justify-between"
                  >
                    <span>View All 18 Executive Officers</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">18 Heads</span>
                  </Link>

                  <div className="h-px bg-slate-100 my-1"></div>

                  <Link
                    to="/board-of-union"
                    onClick={() => setBoardDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <img src="/images/board/v-s-mehto.jpg" alt="V. S. Mehto" className="w-8 h-8 rounded-lg object-cover border border-sky-400 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 group-hover:text-sky-700 block">
                        {isHindi ? '1. मा व्ही एस महतो' : '1. Shri V. S. Mehto'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {isHindi ? 'प्रांतीय वरिष्ठ उपाध्यक्ष' : 'Senior Vice President'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/board-of-union"
                    onClick={() => setBoardDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <img src="/images/board/suryadev-jaysingh.jpg" alt="Suryadev Jaysingh" className="w-8 h-8 rounded-lg object-cover border border-sky-400 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 group-hover:text-sky-700 block">
                        {isHindi ? '2. इंजी सूर्यदेव जयसिंह' : '2. Er. Suryadev Jaysingh'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {isHindi ? 'प्रांतीय अध्यक्ष' : 'State President'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/board-of-union"
                    onClick={() => setBoardDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <img src="/images/board/m-l-shakya.jpg" alt="M. L. Shakya" className="w-8 h-8 rounded-lg object-cover border border-sky-400 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 group-hover:text-sky-700 block">
                        {isHindi ? '3. मा एम एल शाक्य' : '3. Shri M. L. Shakya'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {isHindi ? 'संस्थापक / मुख्य संरक्षक' : 'Founder & Patron'}
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/board-of-union"
                    onClick={() => setBoardDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <img src="/images/board/d-d-ramteke.jpg" alt="D. D. Ramteke" className="w-8 h-8 rounded-lg object-cover border border-sky-400 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 group-hover:text-sky-700 block">
                        {isHindi ? '4. इंजी डी डी रामटेके' : '4. Er. D. D. Ramteke'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {isHindi ? 'प्रांतीय महासचिव' : 'General Secretary'}
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            <Link 
              to="/orders" 
              className={`px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${isActive('/orders') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {t('Order')}
            </Link>
            <Link 
              to="/events" 
              className={`px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${isActive('/events') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {t('Events')}
            </Link>
            <Link 
              to="/notices" 
              className={`px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${isActive('/notices') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {t('Notices')}
            </Link>
            <div 
              className="relative"
              onMouseEnter={() => setEnergyDropdownOpen(true)}
              onMouseLeave={() => setEnergyDropdownOpen(false)}
            >
              <Link 
                to="/energy-department" 
                className={`px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${isActive('/energy-department') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
                onClick={() => setEnergyDropdownOpen(false)}
              >
                <span>{t('Energy Department')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${energyDropdownOpen ? 'rotate-180 text-sky-600' : 'text-slate-400'}`} />
              </Link>

              {energyDropdownOpen && (
                <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 mb-1">
                    <span className="font-extrabold text-xs text-slate-900 block">{t('Energy Department')}</span>
                    <span className="text-[10px] text-slate-500 block">{t('Madhya Pradesh Power Utilities & Organizations')}</span>
                  </div>

                  <Link
                    to="/energy-department"
                    onClick={() => setEnergyDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold text-sky-700 hover:bg-sky-50 transition-colors flex items-center justify-between"
                  >
                    <span>{t('All Energy Department Organizations')}</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">5 Entities</span>
                  </Link>

                  <div className="h-px bg-slate-100 my-1"></div>

                  <Link
                    to="/energy-department#mp-power-management"
                    onClick={() => setEnergyDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 transition-colors group"
                  >
                    <span className="font-bold block text-slate-900 group-hover:text-sky-700">1. M.P. Power Management Co. Ltd.</span>
                    <span className="text-[10px] text-slate-500 block">MPPMCL Apex Power Trading & Procurement</span>
                  </Link>

                  <Link
                    to="/energy-department#mp-power-transmission"
                    onClick={() => setEnergyDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 transition-colors group"
                  >
                    <span className="font-bold block text-slate-900 group-hover:text-sky-700">2. M.P. Power Transmission</span>
                    <span className="text-[10px] text-slate-500 block">MPPTCL Extra High Voltage EHV Grid</span>
                  </Link>

                  <Link
                    to="/energy-department#mp-west-zone"
                    onClick={() => setEnergyDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 transition-colors group"
                  >
                    <span className="font-bold block text-slate-900 group-hover:text-sky-700">3. M.P. West Zone (MPPKVVCL)</span>
                    <span className="text-[10px] text-slate-500 block">Indore Discom (15 Malwa & Nimar Districts)</span>
                  </Link>

                  <Link
                    to="/energy-department#mp-central-zone"
                    onClick={() => setEnergyDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 transition-colors group"
                  >
                    <span className="font-bold block text-slate-900 group-hover:text-sky-700">4. M.P. Central (MPMKVVCL)</span>
                    <span className="text-[10px] text-slate-500 block">Bhopal Discom (16 Central Districts)</span>
                  </Link>

                  <Link
                    to="/energy-department#mp-east-zone"
                    onClick={() => setEnergyDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs hover:bg-slate-100 text-slate-800 transition-colors group"
                  >
                    <span className="font-bold block text-slate-900 group-hover:text-sky-700">5. M.P. East (MPPKVVCL)</span>
                    <span className="text-[10px] text-slate-500 block">Jabalpur Discom (20 Eastern Districts)</span>
                  </Link>
                </div>
              )}
            </div>
            <Link 
              to="/contact" 
              className={`px-1.5 xl:px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${isActive('/contact') ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {t('Contact Us')}
            </Link>

            {user ? (
              <Link 
                to={isAdmin ? '/admin/dashboard' : '/dashboard'} 
                className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>{isAdmin ? t('Admin Portal') : t('Member Dashboard')}</span>
              </Link>
            ) : (
              <Link 
                to="/join" 
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-bold transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0 ${isActive('/join') ? 'bg-sky-600 text-white' : 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sky-500/20'}`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Join Now')}</span>
              </Link>
            )}
          </nav>

          {/* User Right Section */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 whitespace-nowrap shrink-0">
            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-[11px] xl:text-xs font-bold transition-all shadow-sm whitespace-nowrap shrink-0"
              title={language === 'en' ? 'हिंदी में बदलें (Switch to Hindi)' : 'Switch to English (अंग्रेजी)'}
            >
              <Languages className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {user ? (
              <>
                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 relative transition-colors border border-slate-200"
                    title={t('Notifications')}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md shadow-red-500/30 animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{t('Notifications')}</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-sky-700 font-bold hover:underline"
                          >
                            {t('Mark all read')}
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            {t('No notifications yet.')}
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.link) navigate(n.link);
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-sky-50/70' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-xs text-slate-900">{n.title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    <img
                      src={user.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                      alt="Avatar"
                      className="w-7 h-7 rounded-lg object-cover border border-sky-500/50 shadow-sm"
                    />
                    <div className="text-left">
                      <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">
                        {user.profile?.full_name?.split(' ')[0] || 'Member'}
                      </span>
                      <span className="text-[9px] text-sky-700 font-bold block">
                        {isAdmin ? 'ADMIN' : (user.member_id || 'MEMBER')}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100">
                      <div className="p-3.5 bg-slate-50">
                        <span className="text-xs font-bold text-slate-900 block">{user.profile?.full_name}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-sky-700 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>{t('Dashboard Hub')}</span>
                        </Link>
                        {!isAdmin && (
                          <Link
                            to="/dashboard/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-sky-700 flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            <span>{t('My Profile')}</span>
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-sky-700 flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            <span>{t('System Settings')}</span>
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('Sign Out')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-2.5 xl:px-3.5 py-1.5 rounded-xl text-[11px] xl:text-xs 2xl:text-sm font-semibold bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{t('Login')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button & Language Switcher */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-bold"
            >
              <Languages className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'en' ? 'हिं' : 'EN'}</span>
            </button>

            {user && unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
                {unreadCount}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            {t('Home')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            {t('About Us')}
          </Link>
          <Link
            to="/board-of-union"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            {t('Board of Union')}
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            {t('Order')}
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            {t('Events')}
          </Link>
          <Link
            to="/notices"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            {t('Notices')}
          </Link>
          <div className="space-y-1">
            <Link
              to="/energy-department"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>{t('Energy Department')}</span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">5 Sub-Sections</span>
            </Link>
            <div className="pl-4 space-y-1 border-l-2 border-sky-200 ml-3">
              <Link to="/energy-department#mp-power-management" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs font-semibold text-slate-600 hover:text-sky-700">1. M.P. Power Management Co. Ltd</Link>
              <Link to="/energy-department#mp-power-transmission" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs font-semibold text-slate-600 hover:text-sky-700">2. M.P. Power Transmission</Link>
              <Link to="/energy-department#mp-west-zone" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs font-semibold text-slate-600 hover:text-sky-700">3. M.P. West Zone (Indore)</Link>
              <Link to="/energy-department#mp-central-zone" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs font-semibold text-slate-600 hover:text-sky-700">4. M.P. Central (Bhopal)</Link>
              <Link to="/energy-department#mp-east-zone" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs font-semibold text-slate-600 hover:text-sky-700">5. M.P. East (Jabalpur)</Link>
            </div>
          </div>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            {t('Contact Us')}
          </Link>

          {user ? (
            <>
              <Link
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-bold text-sky-700 bg-sky-50"
              >
                {isAdmin ? t('Admin Portal') : t('Member Dashboard')}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50"
              >
                {t('Sign Out')}
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/join"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white"
              >
                {t('Join Now')}
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-900"
              >
                {t('Login')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
