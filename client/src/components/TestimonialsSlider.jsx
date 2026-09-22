import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles, Building, Award } from 'lucide-react';

const DUMMY_TESTIMONIALS = [
  {
    id: 1,
    quote: "Joining Union Suyradev was a game changer for our company! We connected with enterprise partners and closed a $150,000 B2B service contract within our first month.",
    author_name: "Rahul Verma",
    author_title: "Founder & CEO",
    company: "Apex Tech Innovations",
    author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    result_badge: "$150,000 Contract Closed",
    rating: 5,
    industry: "Information Technology"
  },
  {
    id: 2,
    quote: "The quality of decision-makers on this platform is unmatched. I secured 3 strategic client referrals and expanded our fintech consulting operations across 4 new regions.",
    author_name: "Priya Sharma",
    author_title: "VP of Business Development",
    company: "Nexus Fintech Solutions",
    author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    result_badge: "3 Strategic Referrals",
    rating: 5,
    industry: "Fintech & Banking"
  },
  {
    id: 3,
    quote: "Through Union Suyradev's executive network, our clean energy venture partnered with commercial real estate developers for a 1.2MW rooftop solar installation project.",
    author_name: "Vikram Singh",
    author_title: "Co-Founder & Director",
    company: "SunGrid Clean Energy",
    author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    result_badge: "1.2MW Energy Partnership",
    rating: 5,
    industry: "Clean Energy"
  },
  {
    id: 4,
    quote: "Unlike crowded social platforms, Union Suyradev focuses purely on trust and mutual growth. We closed 4 high-value corporate deals through verified member referrals.",
    author_name: "Marcus Vance",
    author_title: "Managing Partner",
    company: "Vance Global Advisory",
    author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    result_badge: "4 Global M&A Deals",
    rating: 5,
    industry: "Management Consulting"
  },
  {
    id: 5,
    quote: "The monthly mastermind sessions connected us directly with healthcare industry leaders. We generated over $80,000 in new corporate wellness retainers.",
    author_name: "Dr. Ananya Deshmukh",
    author_title: "Chief Executive Officer",
    company: "HealthMind Systems",
    author_avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    result_badge: "$80,000 Retainer Revenue",
    rating: 5,
    industry: "Healthcare & Wellness"
  },
  {
    id: 6,
    quote: "Our brand marketing agency co-pitched with another Union member for a Series B startup campaign. The collaborative ecosystem here drives real revenue results.",
    author_name: "Sophia Chen",
    author_title: "Global Brand Director",
    company: "Lumina Growth Media",
    author_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    result_badge: "Series B Media Pitch Win",
    rating: 5,
    industry: "Marketing & Media"
  }
];

const TestimonialsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DUMMY_TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + DUMMY_TESTIMONIALS.length) % DUMMY_TESTIMONIALS.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % DUMMY_TESTIMONIALS.length);
  };

  return (
    <div 
      className="relative w-full py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Controls Top */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Verified Outcome Stories
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Testimonials Cards Grid Slider */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((offset) => {
          const itemIndex = (currentIndex + offset) % DUMMY_TESTIMONIALS.length;
          const item = DUMMY_TESTIMONIALS[itemIndex];
          return (
            <div 
              key={item.id}
              className="glass-card rounded-3xl p-6 border border-slate-700/80 glass-panel-hover flex flex-col justify-between space-y-4 group transition-all duration-500 transform hover:-translate-y-1.5 hover:border-brand-cyan/40 hover:shadow-glow-cyan"
            >
              <div className="space-y-3">
                {/* Result Badge & Rating */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold flex items-center gap-1">
                    ✨ {item.result_badge}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <p className="text-xs text-slate-200 leading-relaxed italic relative pt-2">
                  <Quote className="w-4 h-4 text-brand-cyan/40 inline-block mr-1 -mt-1" />
                  "{item.quote}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                <img
                  src={item.author_avatar}
                  alt={item.author_name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-cyan/50 shrink-0 group-hover:ring-brand-cyan transition-all"
                />
                <div className="truncate">
                  <h4 className="text-xs font-extrabold text-white truncate group-hover:text-brand-cyan transition-colors">
                    {item.author_name}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-400 truncate">
                    {item.author_title}
                  </p>
                  <p className="text-[10px] text-brand-cyan/80 truncate">
                    {item.company}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicator Dots */}
      <div className="flex items-center justify-center gap-2 pt-6">
        {DUMMY_TESTIMONIALS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-7 bg-brand-cyan shadow-glow-cyan'
                : 'w-2 bg-slate-700 hover:bg-slate-500'
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSlider;
