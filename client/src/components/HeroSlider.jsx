import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react';

const SLIDER_IMAGES = [
  {
    url: '/images/gallery/constitution-presentation-office.jpg',
    title: 'Presentation of "Bharat Ka Samvidhan"',
    subtitle: 'Union leaders presenting the Constitution of India to executive discom authority.',
    badge: 'Official Delegation',
    alt: 'Union leaders presenting Bharat Ka Samvidhan (Constitution of India) book to discom official'
  },
  {
    url: '/images/gallery/ambedkar-jayanti-celebration.jpg',
    title: 'Dr. B.R. Ambedkar Jayanti Celebration',
    subtitle: 'Office bearers and members celebrating Ambedkar Jayanti under MP Vidyut Mandal banner.',
    badge: 'Union Event',
    alt: 'Union committee members wearing sashes at Dr. Ambedkar Jayanti celebration'
  },
  {
    url: '/images/gallery/union-discom-meeting.jpg',
    title: 'Discom Senior Officers Dialogue',
    subtitle: 'MPWZ Union delegation presenting key demands and memorandum at Discom HQ.',
    badge: 'Discom Dialogue',
    alt: 'MPWZ Discom Union delegation in discussion with senior discom official at executive desk'
  },
  {
    url: '/images/gallery/union-delegation-felicitation.jpg',
    title: 'Executive Management Felicitation',
    subtitle: 'Delegation leaders presenting floral bouquet and official file submissions.',
    badge: 'Felicitation',
    alt: 'Union leaders presenting a bouquet of flowers and files to senior discom manager'
  },
  {
    url: '/images/gallery/union-representatives-meeting.jpg',
    title: 'MP West Zone Representative Council',
    subtitle: 'Zonal union delegates gathered for employee welfare consultation and strike planning.',
    badge: 'Zonal Meeting',
    alt: 'Union delegates and representatives standing together in a conference room meeting'
  },
  {
    url: '/images/gallery/constitution-honoring-discom-head.jpg',
    title: 'Honoring Discom Leadership with Samvidhan',
    subtitle: 'Presenting copy of Constitution of India to senior discom chief engineer.',
    badge: 'Honor & Dignity',
    alt: 'Union members presenting Constitution of India book to discom officer at his desk'
  },
  {
    url: '/images/gallery/union-welcome-management.jpg',
    title: 'Welcoming Senior Discom Management',
    subtitle: 'Union delegation felicitating discom officials during bilateral discussions.',
    badge: 'Bilateral Talks',
    alt: 'Delegation members handing over a bouquet to a discom executive at his desk'
  },
  {
    url: '/images/gallery/union-committee-honoring-officer.jpg',
    title: 'Joint Committee Reception Ceremony',
    subtitle: 'Executive board members honoring discom leadership at formal reception.',
    badge: 'Reception',
    alt: 'Union representatives felicitating an officer with flowers across conference table'
  },
  {
    url: '/images/gallery/union-executive-board-meeting.jpg',
    title: 'Executive Board Review Session',
    subtitle: 'Meeting senior discom officers to resolve linemen safety & DA arrears.',
    badge: 'Executive Review',
    alt: 'Union delegates standing around executive desk presenting flower bouquet and files'
  },
  {
    url: '/images/gallery/union-leadership-felicitation.jpg',
    title: 'Union Leadership Greeting Ceremony',
    subtitle: 'Key union representatives welcoming discom department leadership.',
    badge: 'Felicitation',
    alt: 'Four union leaders felicitating a discom officer with a colorful bouquet'
  }
];

const HeroSlider = ({ compact = false }) => {
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
      className={`relative w-full overflow-hidden shadow-2xl group bg-slate-900 ${compact
        ? 'h-[340px] xs:h-[380px] sm:h-[420px] lg:h-[450px] rounded-3xl'
        : 'h-[380px] xs:h-[420px] sm:h-[480px] lg:h-[520px] rounded-3xl'
        }`}
    >
      {/* Background Images Crossfade */}
      {SLIDER_IMAGES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
        >
          <img
            src={slide.url}
            alt={slide.alt || slide.title}
            loading={index === 0 ? "eager" : "lazy"}
            className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700"
          />
          {/* Subtle bottom gradient for controls visibility */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/60 to-transparent" />
        </div>
      ))}

      {/* Left Arrow Navigation */}
      <button
        onClick={goToPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/60 text-white hover:text-slate-950 hover:bg-amber-400 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-lg"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Arrow Navigation */}
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/60 text-white hover:text-slate-950 hover:bg-amber-400 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-lg"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators Dots Bar */}
      <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5">
        {SLIDER_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`rounded-full transition-all duration-300 ${compact ? 'h-1.5' : 'h-2'
              } ${idx === currentIndex
                ? compact ? 'w-6 bg-amber-400 shadow-sm' : 'w-8 bg-amber-400 shadow-sm'
                : compact ? 'w-1.5 bg-white/50 hover:bg-white' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};

export default HeroSlider;

