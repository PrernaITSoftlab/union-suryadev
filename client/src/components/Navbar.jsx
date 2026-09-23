import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Shield, Menu, X, Bell, User, LogOut, ChevronDown, CheckCircle2, 
  FileText, Calendar, Users, Home, Info, PhoneCall, UserPlus, LogIn, LayoutDashboard, Settings
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout, settings } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Union Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 block group-hover:text-amber-600 transition-colors">
                {settings?.union_short_name || 'MPWZ UNION'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide hidden sm:block">
                Western Zone Electricity Discom
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive('/') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive('/about') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              About Us
            </Link>
            <Link 
              to="/events" 
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive('/events') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Events
            </Link>
            <Link 
              to="/contact" 
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${isActive('/contact') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Contact Us
            </Link>

            {user ? (
              <Link 
                to={isAdmin ? '/admin/dashboard' : '/dashboard'} 
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 ${location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{isAdmin ? 'Admin Portal' : 'Member Dashboard'}</span>
              </Link>
            ) : (
              <Link 
                to="/join" 
                className={`ml-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-1.5 ${isActive('/join') ? 'bg-amber-600 text-white' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-amber-500/20'}`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Join Now</span>
              </Link>
            )}
          </nav>

          {/* User Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 relative transition-colors border border-slate-200"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md shadow-red-500/30 animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-amber-700 font-bold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No notifications yet.
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
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-amber-50/70' : ''}`}
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
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    <img
                      src={user.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-lg object-cover border border-amber-500/50 shadow-sm"
                    />
                    <div className="text-left">
                      <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                        {user.profile?.full_name?.split(' ')[0] || 'Member'}
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold block">
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
                          className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-amber-700 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard Hub</span>
                        </Link>
                        {!isAdmin && (
                          <Link
                            to="/dashboard/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-amber-700 flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-amber-700 flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            <span>System Settings</span>
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
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-amber-600" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
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
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            About Us
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            Events
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-100"
          >
            Contact Us
          </Link>

          {user ? (
            <>
              <Link
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-bold text-amber-700 bg-amber-50"
              >
                {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/join"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-slate-950"
              >
                Join Now
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-900"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
