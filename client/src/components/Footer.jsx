import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Network, Mail, ShieldCheck, FileText, ArrowRight, Heart, Globe, Linkedin, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const [modalType, setModalType] = useState(null); // 'privacy' | 'terms' | null
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 text-slate-400 pt-16 pb-12 relative overflow-hidden">
      
      {/* Subtle Glow Background Node */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center shadow-glow-cyan">
                <Network className="w-5 h-5 text-navy-950 font-bold" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                UNION <span className="gradient-text-cyan">SUYRADEV</span>
              </span>
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier ecosystem for business leaders, founders, and professionals to create trusted connections, generate qualified referrals, and accelerate collaborative growth.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-cyan hover:border-brand-cyan/50 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-cyan hover:border-brand-cyan/50 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-cyan hover:border-brand-cyan/50 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://unionsuyradev.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-cyan hover:border-brand-cyan/50 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-brand-cyan transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-brand-cyan transition-colors">About Us</Link></li>
              <li><Link to="/network" className="hover:text-brand-cyan transition-colors">Interactive Graph</Link></li>
              <li><Link to="/members" className="hover:text-brand-cyan transition-colors">Members Directory</Link></li>
              <li><Link to="/opportunities" className="hover:text-brand-cyan transition-colors">Business Opportunities</Link></li>
              <li><Link to="/events" className="hover:text-brand-cyan transition-colors">Upcoming Events</Link></li>
            </ul>
          </div>

          {/* Community & Network */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Ecosystem</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="hover:text-brand-cyan transition-colors">Contact Support</Link></li>
              <li><button onClick={() => setModalType('privacy')} className="hover:text-brand-cyan transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => setModalType('terms')} className="hover:text-brand-cyan transition-colors text-left">Terms of Service</button></li>
              <li><Link to="/login" className="hover:text-brand-cyan transition-colors">Member Portal</Link></li>
              <li><Link to="/admin" className="hover:text-brand-cyan transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Connected</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe for weekly curated business referrals, VIP networking events, and member spotlights.
            </p>
            {newsletterSubscribed ? (
              <div className="p-3 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold text-center">
                ✨ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-brand-cyan text-navy-950 font-bold hover:bg-cyan-300 transition-colors text-xs flex items-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Union Suyradev Network. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setModalType('privacy')} className="hover:text-slate-300">Privacy Policy</button>
            <button onClick={() => setModalType('terms')} className="hover:text-slate-300">Terms & Conditions</button>
            <span className="flex items-center gap-1 text-slate-400">
              Built for Growth <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>

      </div>

      {/* Privacy / Terms Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-card-dark relative">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            {modalType === 'privacy' ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-cyan" /> Privacy Policy
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  At Union Suyradev, we treat your professional privacy with utmost priority. All member contact information is guarded by strict role-based encryption and is shared strictly upon mutual connection agreement.
                </p>
                <h4 className="text-sm font-semibold text-white">Data Collection & Protection</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We collect profile details (industry, company, skills) to calculate accurate professional recommendation graphs. We never sell your personal contact info to third-party advertisers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-blue" /> Terms & Conditions
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  By joining Union Suyradev, you agree to maintain professional etiquette, execute transparent business referral practices, and respect community members.
                </p>
                <h4 className="text-sm font-semibold text-white">Community Code of Conduct</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Spamming, deceptive business claims, or unapproved mass automated messaging lead to immediate account suspension by Union Suyradev administrators.
                </p>
              </div>
            )}
            <div className="pt-6 mt-6 border-t border-slate-800 text-right">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
