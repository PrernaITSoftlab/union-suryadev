import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Network, 
  Users, 
  Briefcase, 
  Calendar, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  Zap,
  Info,
  Mail,
  Home
} from 'lucide-react';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, logout, switchDemoUser, isAdmin } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Network Graph', path: '/network', icon: Network },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Contact', path: '/contact', icon: Mail }
  ];

  const isActive = (path) => location.pathname === path;

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-lg border-b border-slate-800/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto pl-2 pr-3 sm:pl-4 sm:pr-6 lg:pl-4 lg:pr-8 h-16 sm:h-18 flex items-center justify-between gap-2 flex-nowrap">
          
          {/* Logo with reduced left padding and compact size */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center p-0.5 shadow-glow-cyan transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Network className="w-4 h-4 sm:w-5 sm:h-5 text-brand-cyan group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-sm sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1 whitespace-nowrap">
                UNION <span className="gradient-text-cyan">SUYRADEV</span>
              </span>
              <span className="text-[8px] sm:text-[9.5px] font-semibold tracking-wider text-slate-400 uppercase hidden md:block whitespace-nowrap">
                Professional Networking Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links in Single Line */}
          <nav className="hidden xl:flex items-center space-x-1 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    active
                      ? 'text-brand-cyan bg-brand-cyan/15 border border-brand-cyan/30 shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-brand-cyan' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls in Single Line */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap">
            
            {/* Quick Demo Switcher Pill */}
            <button 
              onClick={() => switchDemoUser(isAdmin ? 'member' : 'admin')}
              className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[10.5px] font-semibold text-slate-200 hover:text-white hover:border-brand-cyan/50 flex items-center gap-1 transition-all shadow-sm shrink-0 whitespace-nowrap"
              title="Toggle Demo Roles (Admin vs Member)"
            >
              <Zap className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline">Role:</span>
              <span className="text-brand-cyan font-bold">{isAdmin ? 'Admin' : 'Member'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0 flex-nowrap">
                
                {/* Notifications Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white relative transition-all shrink-0"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-cyan text-navy-950 font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-glow-cyan animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Drawer */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 glass-panel rounded-2xl shadow-card-dark p-4 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-brand-cyan" /> Notifications
                        </h4>
                        <span className="text-xs text-slate-400">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto my-2 space-y-2 pr-1">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 py-6 text-center">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.link) navigate(n.link);
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3 rounded-xl cursor-pointer text-xs transition-colors ${
                                n.is_read ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-800/90 text-white border-l-2 border-brand-cyan'
                              }`}
                            >
                              <div className="font-bold text-slate-200">{n.title}</div>
                              <div className="text-slate-400 mt-0.5">{n.message}</div>
                              <div className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Button Dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 transition-all shrink-0"
                  >
                    <img
                      src={user.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"}
                      alt={user.profile?.full_name}
                      className="w-7 h-7 rounded-lg object-cover ring-2 ring-brand-cyan/40"
                    />
                    <span className="text-xs font-semibold max-w-[80px] sm:max-w-[110px] truncate hidden md:inline-block whitespace-nowrap">
                      {user.profile?.full_name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl p-2 border border-slate-700/80 shadow-card-dark z-50">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-bold text-white truncate">{user.profile?.full_name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-cyan/20 text-brand-cyan">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-brand-cyan" /> Dashboard & Activity
                      </Link>

                      <Link
                        to="/connections"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <Network className="w-4 h-4 text-brand-blue" /> My Connections
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-amber-300 hover:bg-amber-500/10"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Dashboard
                        </Link>
                      )}

                      <div className="pt-1 mt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
                <button
                  onClick={() => openAuth('login')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 hover:shadow-glow-cyan transition-all transform hover:-translate-y-0.5 flex items-center gap-1 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> <span>Join Network</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white xl:hidden shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand-cyan/20 text-brand-cyan'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-cyan" />
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-center text-xs font-bold text-white"
                  >
                    My Member Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-300 text-center text-xs font-bold border border-amber-500/30"
                    >
                      Admin Dashboard Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-center text-xs font-bold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => openAuth('login')}
                    className="py-2.5 rounded-xl bg-slate-800 text-center text-xs font-bold text-white"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="py-2.5 rounded-xl bg-brand-cyan text-navy-950 text-center text-xs font-extrabold shadow-glow-cyan"
                  >
                    Join Network
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal initialTab={authModalTab} onClose={() => setAuthModalOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
