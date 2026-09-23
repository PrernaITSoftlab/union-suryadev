import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const SLIDER_IMAGES = [
  {
    url: '/images/hero/hero-1.jpg',
    title: 'Presentation of "Bharat Ka Samvidhan"',
    subtitle: 'Union Suyradev leaders presenting the Constitution of India at executive delegation meeting.',
    badge: 'High-Trust Delegation'
  },
  {
    url: '/images/hero/hero-2.jpg',
    title: 'Executive Board Floral Welcome',
    subtitle: 'Welcoming senior industry advisors & government dignitaries to Union Suyradev network.',
    badge: 'Executive Leadership'
  },
  {
    url: '/images/hero/hero-3.jpg',
    title: 'Cross-Sector Business Collaboration',
    subtitle: 'Executive delegation meeting fostering inter-industry partnerships & growth.',
    badge: 'Community Network'
  },
  {
    url: '/images/hero/hero-4.jpg',
    title: 'Strategic Referral & Governance Council',
    subtitle: 'Senior leaders aligning on transparent B2B referral channels & compliance.',
    badge: 'Strategic Alliance'
  },
  {
    url: '/images/hero/hero-5.jpg',
    title: 'Corporate Honor & Partnership Ceremony',
    subtitle: 'Celebrating milestone business referrals and strategic joint venture contracts.',
    badge: 'Honor Ceremony'
  }
];

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDER_IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDER_IMAGES.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length);
  };

  const currentSlide = SLIDER_IMAGES[currentIndex];

  return (
    <div 
      className="relative w-full h-[360px] xs:h-[400px] sm:h-[460px] lg:h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-md group bg-white"
    >
      {/* Background Images Crossfade */}
      {SLIDER_IMAGES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient Overlay for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/30" />
        </div>
      ))}

      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-white/90 border border-blue-200 text-blue-800 text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse shrink-0" />
          {currentSlide.badge}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-white text-[10px] font-mono backdrop-blur-md">
          {currentIndex + 1} / {SLIDER_IMAGES.length}
        </span>
      </div>

      {/* Left Arrow Navigation */}
      <button
        onClick={goToPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 border border-slate-200 text-slate-800 hover:text-white hover:bg-blue-600 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-md"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Arrow Navigation */}
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 border border-slate-200 text-slate-800 hover:text-white hover:bg-blue-600 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-md"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Bottom Content Overlay & Captions */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-5 sm:p-7 space-y-2">
        <h3 className="text-lg sm:text-2xl font-extrabold text-white leading-tight drop-shadow-md">
          {currentSlide.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 max-w-xl line-clamp-2 leading-relaxed drop-shadow">
          {currentSlide.subtitle}
        </p>

        {/* Slide Indicators Dots Bar */}
        <div className="flex items-center gap-2 pt-3">
          {SLIDER_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-blue-500 shadow-sm'
                  : 'w-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default HeroSlider;
