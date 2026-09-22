import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import NetworkGraphVisualizer from '../components/NetworkGraphVisualizer';
import MemberCard from '../components/MemberCard';
import OpportunityCard from '../components/OpportunityCard';
import EventCard from '../components/EventCard';
import TestimonialsSlider from '../components/TestimonialsSlider';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Building2, 
  Award,
  ChevronRight,
  Handshake
} from 'lucide-react';
import api from '../services/api';
import AuthModal from '../components/AuthModal';

const Home = () => {
  const [members, setMembers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memRes, oppRes, evtRes] = await Promise.all([
          api.get('/members'),
          api.get('/opportunities?featured=true'),
          api.get('/events')
        ]);

        if (memRes.data.success) setMembers(memRes.data.members.slice(0, 4));
        if (oppRes.data.success) setOpportunities(oppRes.data.opportunities.slice(0, 3));
        if (evtRes.data.success) setEvents(evtRes.data.events.slice(0, 3));
      } catch (err) {
        console.error('Home data load error:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 lg:pt-16 overflow-hidden">
        
        {/* Background glow node spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-brand-blue/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Copy (5 cols) */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-brand-cyan/40 text-brand-cyan text-xs font-bold shadow-glow-cyan">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>The Next Generation Business Network</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Connect. Collaborate. <br />
                <span className="gradient-text-cyan">Grow Together.</span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Union Suyradev empowers business owners, executives, and innovators to build trusted professional relationships, exchange high-value client referrals, and unlock capital opportunities.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold text-sm shadow-glow-cyan hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Handshake className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>Join the Network</span>
                </button>

                <Link
                  to="/members"
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-2xl glass-panel text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-brand-cyan shrink-0" />
                  <span>Explore Members</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Verified Leaders
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-brand-cyan shrink-0" /> 40+ Industries
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" /> Direct Referrals
                </span>
              </div>

            </div>

            {/* Right Hero Visual Area (7 cols): Hero Slider */}
            <div className="lg:col-span-7">
              <HeroSlider />
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE PLATFORM METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Active Members', value: '12,400+', icon: Users, color: 'text-brand-cyan' },
            { label: 'Businesses Connected', value: '3,800+', icon: Building2, color: 'text-brand-blue' },
            { label: 'Opportunities Generated', value: '$15M+', icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Events & Masterminds', value: '450+', icon: Calendar, color: 'text-amber-400' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/80 shadow-card-dark text-center space-y-1.5">
                <Icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto ${stat.color}`} />
                <div className="text-xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-700/80 shadow-card-dark relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold">
                <Award className="w-4 h-4 shrink-0" /> About Union Suyradev
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Built on Trust, Driven by Collaboration, Designed for Growth.
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Union Suyradev is an exclusive business networking ecosystem created to help CEOs, founders, and industry leaders build meaningful long-term relationships, share qualified business referrals, and discover growth opportunities.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {[
                  { title: 'Vision', desc: 'To create Asia’s most trusted digital ecosystem for business match-making.' },
                  { title: 'Mission', desc: 'Empower member businesses with qualified referrals and direct executive connections.' }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" /> {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Values Cards */}
            <div className="space-y-3.5">
              {[
                { title: 'Verified High-Trust Network', body: 'Strict member vetting ensures every connection is authentic and high value.' },
                { title: 'Structured Referral Channels', body: 'Turn warm introductions into recurring enterprise contracts.' },
                { title: 'Exclusive Masterminds & Summits', body: 'Monthly virtual and in-person summits designed for executive collaboration.' }
              ].map((val, idx) => (
                <div key={idx} className="p-4 sm:p-5 rounded-2xl glass-card border border-slate-700/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center shrink-0 font-extrabold text-xs sm:text-sm">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white">{val.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{val.body}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (4-Step Visual Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            How Union Suyradev Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            A seamless 4-step path to turn digital introductions into lasting business growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { step: '01', title: 'Join Network', desc: 'Create your executive profile & set networking preferences.', color: 'from-blue-500 to-cyan-500' },
            { step: '02', title: 'Build Profile', desc: 'Highlight your business offerings, target clients, & expertise.', color: 'from-cyan-500 to-teal-500' },
            { step: '03', title: 'Connect', desc: 'Discover matched professionals & send direct connection requests.', color: 'from-purple-500 to-blue-500' },
            { step: '04', title: 'Grow Together', desc: 'Exchange referrals, pitch opportunities, & close contracts.', color: 'from-emerald-500 to-cyan-500' }
          ].map((item, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-700/80 relative flex flex-col justify-between group">
              <div>
                <span className={`inline-block px-3 py-1 rounded-xl bg-gradient-to-r ${item.color} text-navy-950 font-extrabold text-xs mb-3 shadow-glow-cyan`}>
                  Step {item.step}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-brand-cyan transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-brand-cyan font-bold">
                <span>Phase {idx + 1}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE NETWORK VISUALIZATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NetworkGraphVisualizer />
      </section>

      {/* 6. FEATURED MEMBERS DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white">
              Discover Industry Leaders
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect with verified executives across technology, finance, energy, and consulting.
            </p>
          </div>
          <Link
            to="/members"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-brand-cyan border border-slate-700 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            <span>View All Members</span> <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onOpenDetails={(m) => setSelectedMember(m)}
            />
          ))}
        </div>
      </section>

      {/* 7. BUSINESS OPPORTUNITIES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white">
              Latest Business Referrals & Contracts
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore open partnerships, joint ventures, and client requests posted by members.
            </p>
          </div>
          <Link
            to="/opportunities"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-brand-cyan border border-slate-700 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            <span>View Opportunities</span> <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </section>

      {/* 8. UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white">
              Upcoming Summits & Masterminds
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Join structured speed-networking sessions and executive roundtables.
            </p>
          </div>
          <Link
            to="/events"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-brand-cyan border border-slate-700 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            <span>All Events</span> <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </section>

      {/* 9. TESTIMONIALS & SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Member Testimonials & Success Stories
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Discover how leaders and founders generate recurring B2B contract growth through Union Suyradev.
          </p>
        </div>

        {/* Interactive Auto-Sliding Testimonial Cards Carousel */}
        <TestimonialsSlider />
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-14 border border-brand-cyan/30 text-center relative overflow-hidden shadow-glow-cyan">
          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your next opportunity could be <span className="gradient-text-cyan">one connection away.</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Join thousands of verified business leaders on Union Suyradev today and start building high-impact relationships.
            </p>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold text-sm sm:text-base shadow-glow-cyan hover:opacity-95 transition-all transform hover:scale-105"
              >
                Join Union Suyradev
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-card-dark relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedMember.profile?.avatar_url}
                alt={selectedMember.profile?.full_name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-cyan shrink-0"
              />
              <div className="truncate">
                <h3 className="text-lg font-bold text-white truncate">{selectedMember.profile?.full_name}</h3>
                <p className="text-xs text-brand-cyan font-bold truncate">{selectedMember.profile?.title}</p>
                <p className="text-xs text-slate-400 truncate">{selectedMember.profile?.company}</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{selectedMember.profile?.bio}</p>
            <div className="space-y-1.5 text-xs">
              <p className="text-slate-400">Industry: <span className="text-white font-semibold">{selectedMember.profile?.industry}</span></p>
              <p className="text-slate-400">Location: <span className="text-white font-semibold">{selectedMember.profile?.location}</span></p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {authModalOpen && (
        <AuthModal initialTab="register" onClose={() => setAuthModalOpen(false)} />
      )}

    </div>
  );
};

export default Home;
