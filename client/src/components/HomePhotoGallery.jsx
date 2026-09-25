import React, { useState } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Award, FileText, Users, Calendar, Sparkles } from 'lucide-react';

export const GALLERY_PHOTOS = [
  {
    id: 1,
    url: '/images/gallery/constitution-presentation-office.jpg',
    title: 'Presentation of "Bharat Ka Samvidhan" Book',
    category: 'Constitution',
    categoryLabel: 'Samvidhan Presentation',
    description: 'Union delegation presenting a bound copy of the Constitution of India (Bharat Ka Samvidhan) to senior discom executive at officer desk.',
    alt: 'Union leaders presenting Bharat Ka Samvidhan (Constitution of India) book to discom official',
    date: 'Sep 2026',
    tag: 'Official Delegation'
  },
  {
    id: 2,
    url: '/images/gallery/ambedkar-jayanti-celebration.jpg',
    title: 'Dr. B.R. Ambedkar Jayanti Celebration',
    category: 'Events',
    categoryLabel: 'Special Events',
    description: 'Union committee office bearers celebrating Ambedkar Jayanti at Dr. Bhim Janm-Bhoomi venue under MP Vidyut Mandal banner.',
    alt: 'Union committee members wearing sashes at Dr. Ambedkar Jayanti celebration',
    date: 'Apr 2026',
    tag: 'Union Agitation'
  },
  {
    id: 3,
    url: '/images/gallery/union-discom-meeting.jpg',
    title: 'Senior Officer Bilateral Discom Meeting',
    category: 'Delegation',
    categoryLabel: 'Discom Delegations',
    description: 'MPWZ Discom Employees Union delegation presenting official files and employee demand charter to discom chief engineer.',
    alt: 'MPWZ Discom Union delegation in discussion with senior discom official at executive desk',
    date: 'Sep 2026',
    tag: 'Executive Table'
  },
  {
    id: 4,
    url: '/images/gallery/union-delegation-felicitation.jpg',
    title: 'Executive Management Floral Welcome',
    category: 'Felicitation',
    categoryLabel: 'Felicitations & Honors',
    description: 'Union leadership presenting a fresh flower bouquet and official file submissions during formal meeting at Discom HQ.',
    alt: 'Union leaders presenting a bouquet of flowers and files to senior discom manager',
    date: 'Sep 2026',
    tag: 'Management Welcome'
  },
  {
    id: 5,
    url: '/images/gallery/union-representatives-meeting.jpg',
    title: 'MP West Zone Representative Consultation',
    category: 'Delegation',
    categoryLabel: 'Discom Delegations',
    description: 'Zonal union delegates and circle leaders gathered for employee welfare consultation and strike action mobilization.',
    alt: 'Union delegates and representatives standing together in a conference room meeting',
    date: 'Sep 2026',
    tag: 'Zonal Council'
  },
  {
    id: 6,
    url: '/images/gallery/constitution-honoring-discom-head.jpg',
    title: 'Honoring Discom Leadership with Samvidhan',
    category: 'Constitution',
    categoryLabel: 'Samvidhan Presentation',
    description: 'Presenting a ceremonial copy of Constitution of India to discom department head at executive office chamber.',
    alt: 'Union members presenting Constitution of India book to discom officer at his desk',
    date: 'Sep 2026',
    tag: 'Samvidhan Honor'
  },
  {
    id: 7,
    url: '/images/gallery/union-welcome-management.jpg',
    title: 'Welcoming Senior Discom Management',
    category: 'Felicitation',
    categoryLabel: 'Felicitations & Honors',
    description: 'Union delegation felicitating discom officials with flowers during bilateral discussions on linemen safety gear.',
    alt: 'Delegation members handing over a bouquet to a discom executive at his desk',
    date: 'Sep 2026',
    tag: 'Felicitation'
  },
  {
    id: 8,
    url: '/images/gallery/union-committee-honoring-officer.jpg',
    title: 'Joint Committee Reception & Welcome',
    category: 'Felicitation',
    categoryLabel: 'Felicitations & Honors',
    description: 'Executive board members honoring discom leadership at formal conference room reception table.',
    alt: 'Union representatives felicitating an officer with flowers across conference table',
    date: 'Sep 2026',
    tag: 'Joint Reception'
  },
  {
    id: 9,
    url: '/images/gallery/union-executive-board-meeting.jpg',
    title: 'Executive Board Demands Review Session',
    category: 'Delegation',
    categoryLabel: 'Discom Delegations',
    description: 'Meeting senior discom officers to resolve contract linemen regularization, DA arrears & risk allowance.',
    alt: 'Union delegates standing around executive desk presenting flower bouquet and files',
    date: 'Sep 2026',
    tag: 'Cadre Demands'
  },
  {
    id: 10,
    url: '/images/gallery/union-leadership-felicitation.jpg',
    title: 'Union Leadership Greeting Ceremony',
    category: 'Felicitation',
    categoryLabel: 'Felicitations & Honors',
    description: 'Key union representatives welcoming discom department head in official boardroom.',
    alt: 'Four union leaders felicitating a discom officer with a colorful bouquet',
    date: 'Sep 2026',
    tag: 'Boardroom Welcome'
  }
];

const CATEGORIES = [
  { key: 'ALL', label: 'All Activities' },
  { key: 'Delegation', label: 'Discom Delegations' },
  { key: 'Constitution', label: 'Samvidhan Presentation' },
  { key: 'Felicitation', label: 'Felicitations' },
  { key: 'Events', label: 'Union Events' }
];

export default function HomePhotoGallery() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredPhotos = activeTab === 'ALL'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter(p => p.category === activeTab);

  const openLightbox = (id) => {
    const idx = filteredPhotos.findIndex(p => p.id === id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const prevSlide = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const nextSlide = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section className="py-20 bg-slate-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>Official Photo Highlights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Union Photo Gallery
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Empirical moments of MPWZ Union leadership engaging discom management, celebrating employee honors, and advocating for power engineers & linemen.
            </p>
          </div>

          {/* Category Filtering Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${activeTab === cat.key
                  ? 'bg-slate-900 text-amber-400 border border-slate-800 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Cards Grid - Borderless Full Size Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(photo.id)}
              className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative aspect-[4/3] bg-slate-900"
            >
              <img
                src={photo.url}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="p-3.5 rounded-full bg-amber-500 text-slate-950 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal - Full Size Photo View */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-opacity animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-6xl w-full h-full max-h-[92vh] flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-red-500 hover:text-white text-white border border-slate-700 transition-all shadow-2xl backdrop-blur-md"
              aria-label="Close photo"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Full Size Image */}
            <img
              src={currentPhoto.url}
              alt={currentPhoto.alt}
              className="max-h-[88vh] max-w-[92vw] w-auto h-auto object-contain rounded-2xl shadow-2xl"
            />

            {/* Prev / Next Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 transition-all shadow-2xl backdrop-blur-md"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 transition-all shadow-2xl backdrop-blur-md"
              aria-label="Next photo"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
