import React from 'react';
import { Award, Users, Building, ShieldCheck, Heart, Sparkles, CheckCircle, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold">
          <Award className="w-4 h-4" /> About Union Suyradev
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Pioneering the Next Era of <span className="gradient-text-cyan">Professional Connections</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Union Suyradev was created with a clear imperative: to replace superficial social connection noise with deep, trust-verified business referral networks.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: ShieldCheck, title: 'Trust & Authenticity', desc: 'Every business profile on Union Suyradev is verified to ensure meaningful decision-maker interactions.', color: 'text-brand-cyan' },
          { icon: Building, title: 'Cross-Industry Synergy', desc: 'Connecting Leaders across Fintech, Clean Energy, Real Estate, Cybersecurity, and Executive Consulting.', color: 'text-brand-blue' },
          { icon: Sparkles, title: 'High-Value Referral Loops', desc: 'Facilitating multi-million dollar contracts, joint venture opportunities, and strategic introductions.', color: 'text-amber-400' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-panel rounded-3xl p-8 border border-slate-700/80 space-y-4">
              <Icon className={`w-10 h-10 ${item.color}`} />
              <h3 className="text-xl font-extrabold text-white">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Leadership & Values */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-700/80 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Our Foundational Principles</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            We believe that long-term business success is achieved through genuine relationships, transparent value exchange, and relentless mutual support.
          </p>
          <div className="space-y-3">
            {[
              'Direct peer-to-peer executive matchmaking',
              'Zero spam policy with strict community moderation',
              'Structured referral tracking and deal analytics',
              'Global mastermind roundtables & annual summits'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-4 text-center">
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden ring-4 ring-brand-cyan/40">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              alt="Aarav Suyradev"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Aarav Suyradev</h3>
            <p className="text-xs text-brand-cyan">Founder & Community Director</p>
          </div>
          <p className="text-xs text-slate-400 italic max-w-sm mx-auto">
            "When professionals align around shared trust and clear opportunity goals, market boundaries dissolve. Welcome to Union Suyradev."
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          to="/members"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan text-navy-950 font-extrabold text-sm shadow-glow-cyan"
        >
          Explore Union Members <Users className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

export default About;
