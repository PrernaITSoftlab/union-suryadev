import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  CreditCard, Download, Printer, RotateCw, Check, CheckCircle2,
  ShieldCheck, Copy, Sparkles, Share2, ExternalLink, QrCode as QrIcon,
  Building, MapPin, Phone, Mail, Calendar, User, Award, Lock, Zap, Eye
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { urlToBase64, generateMemberQrCode, getBarcodePattern } from '../utils/memberCardHelpers';

/**
 * High-definition SVG Barcode component
 */
const BarcodeSvg = ({ value = 'MPAVAKS-0001', height = 36 }) => {
  const bars = useMemo(() => getBarcodePattern(value), [value]);
  let currentX = 10;
  const barElements = [];

  bars.forEach((width, index) => {
    // Alternate black bar and white space
    if (index % 2 === 0) {
      barElements.push(
        <rect
          key={index}
          x={currentX}
          y="2"
          width={width * 1.6}
          height={height - 12}
          fill="#0F172A"
        />
      );
    }
    currentX += width * 1.6;
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${Math.max(currentX + 10, 160)} ${height}`}
        className="w-full h-8"
        preserveAspectRatio="none"
      >
        {barElements}
      </svg>
      <span className="font-mono text-[9px] tracking-[0.25em] text-slate-800 font-bold -mt-0.5">
        {value}
      </span>
    </div>
  );
};

/**
 * Realistic Gold EMV Smart Chip SVG
 */
const EmvChipSvg = ({ className = "w-10 h-7" }) => (
  <svg viewBox="0 0 44 32" className={className} fill="none">
    <rect width="44" height="32" rx="4" fill="url(#chip-grad)" stroke="#92400E" strokeWidth="0.8" />
    <path d="M0 11H16M0 21H16M28 11H44M28 21H44M16 6V26M28 6V26" stroke="#78350F" strokeWidth="0.75" />
    <circle cx="22" cy="16" r="4.5" fill="none" stroke="#78350F" strokeWidth="0.75" />
    <defs>
      <linearGradient id="chip-grad" x1="0" y1="0" x2="44" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.4" stopColor="#F59E0B" />
        <stop offset="0.7" stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Official MPVMAVAKS Union Rubber Seal Stamp SVG
 */
const UnionSealStamp = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 2" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="#D97706" strokeWidth="2" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#D97706" strokeWidth="1" />
    <path
      id="seal-text-path-top"
      d="M 18,50 A 32,32 0 0,1 82,50"
      fill="none"
    />
    <path
      id="seal-text-path-bottom"
      d="M 82,50 A 32,32 0 0,1 18,50"
      fill="none"
    />
    <text fill="#D97706" fontSize="7.5" fontWeight="900" letterSpacing="0.8">
      <textPath href="#seal-text-path-top" startOffset="50%" textAnchor="middle">
        MPVMAVAKS UNION
      </textPath>
    </text>
    <text fill="#D97706" fontSize="6.5" fontWeight="bold" letterSpacing="0.6">
      <textPath href="#seal-text-path-bottom" startOffset="50%" textAnchor="middle">
        ★ OFFICIAL VERIFIED ★
      </textPath>
    </text>
    <text x="50" y="48" fill="#B45309" fontSize="9" fontWeight="900" textAnchor="middle">
      REGD.
    </text>
    <text x="50" y="58" fill="#B45309" fontSize="8" fontWeight="800" textAnchor="middle">
      4404
    </text>
  </svg>
);

/**
 * Main MemberCard Component
 */
export default function MemberCard({
  member,
  onOpenDetails,
  variant = 'official',
  className = ''
}) {
  const { user: authUser, settings } = useAuth();
  const { t, isHindi } = useLanguage();

  // If member is passed use that, else use logged-in auth user
  const effectiveUser = member || authUser;
  const profile = effectiveUser?.profile || {};

  // Core Member Information
  const memberId = effectiveUser?.member_id || 'MPAVAKS-0002';
  const fullName = profile.full_name || 'Shri Vikramaditya Patel';
  const unionDesignation = profile.union_designation || 'Zonal Secretary (Ujjain Zone)';
  const designation = profile.designation || profile.occupation || 'Line Superintendent Grade-I';
  const company = profile.company || 'MP West Zone Electricity Discom';
  const circle = profile.circle || 'Ujjain Circle';
  const district = profile.district || profile.city || (circle ? circle.replace(/Circle|Corporate/gi, '').trim() : 'Ujjain');
  const officeAddress = profile.office_address || `${circle}, ${company}`;
  const post = designation || unionDesignation || 'Line Superintendent Grade-I';
  const phone = profile.phone || '+91 94250 88776';
  const emergencyPhone = profile.emergency_contact || '+91 98261 00000';
  const joiningDate = profile.joining_date || '2026-10-22';
  const memberStatus = (effectiveUser?.status || 'active').toUpperCase();
  const avatarUrl = profile.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
  const formatReadableDate = (val, fallback = 'N/A') => {
    if (!val) return fallback;
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(val);
    }
  };
  const dob = profile.dob || '1985-08-20';
  const formattedDob = formatReadableDate(dob, '20 Aug 1985');
  const fatherName = profile.father_husband_name || 'Shri R. S. Chouhan';
  const bloodGroup = profile.blood_group || 'O+';
  const address = profile.address || `${district}, Madhya Pradesh`;
  const issuedOn = profile.joining_date
    ? formatReadableDate(profile.joining_date)
    : '22 Oct 2026';
  const unionWebsite = settings?.website || 'www.mpvmavaksunion.org';

  // UI Interactive States
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardTheme, setCardTheme] = useState('lightblue'); // 'lightblue' | 'gold'
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('interactive'); // 'interactive' | 'side-by-side'

  // Hidden references for high-res PDF generation
  const printableSheetRef = useRef(null);
  const standaloneFrontRef = useRef(null);
  const standaloneBackRef = useRef(null);

  // Pre-load QR Code and images as base64 to ensure 100% reliable PDF generation without CORS issues
  useEffect(() => {
    let isMounted = true;

    async function prepareCardAssets() {
      try {
        const qr = await generateMemberQrCode({
          memberId,
          fullName,
          designation,
          circle,
          unionRole: unionDesignation
        });
        if (isMounted && qr) setQrDataUrl(qr);

        const avatarB64 = await urlToBase64(avatarUrl);
        if (isMounted && avatarB64) setAvatarBase64(avatarB64);

        const logoB64 = await urlToBase64('/images/union-logo.png');
        if (isMounted && logoB64) setLogoBase64(logoB64);
      } catch (err) {
        console.warn('Error preparing member card assets:', err);
      }
    }

    prepareCardAssets();
    return () => { isMounted = false; };
  }, [memberId, fullName, avatarUrl, designation, circle, unionDesignation]);

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  /**
   * PDF Generator: Produces a high-resolution, multi-page, properly formatted PDF:
   * Page 1: Official Printable ID Card Certificate & Cut-out Sheet (A4 Landscape)
   * Page 2: Standalone Front Side in exact ISO CR80 standard card format (85.6mm × 54mm)
   * Page 3: Standalone Back Side in exact ISO CR80 standard card format (85.6mm × 54mm)
   */
  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      // 1. Capture Printable A4 Sheet
      if (!printableSheetRef.current || !standaloneFrontRef.current || !standaloneBackRef.current) {
        throw new Error('Card elements not ready for export');
      }

      const captureOptions = {
        scale: 2.8,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FFFFFF',
        logging: false
      };

      // Render Page 1 (A4 Sheet)
      const sheetCanvas = await html2canvas(printableSheetRef.current, captureOptions);
      const sheetImgData = sheetCanvas.toDataURL('image/png');

      // Render Page 2 (Front Standalone CR80)
      const frontCanvas = await html2canvas(standaloneFrontRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#EBF5FB',
        logging: false
      });
      const frontImgData = frontCanvas.toDataURL('image/png');

      // Render Page 3 (Back Standalone CR80)
      const backCanvas = await html2canvas(standaloneBackRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FFFFFF',
        logging: false
      });
      const backImgData = backCanvas.toDataURL('image/png');

      // Initialize jsPDF A4 Landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Page 1: Full printable sheet (297mm × 210mm)
      pdf.addImage(sheetImgData, 'PNG', 0, 0, 297, 210, '', 'FAST');

      // Page 2: Standalone Front Side (Standard CR80 85.6mm × 54mm)
      pdf.addPage([85.6, 54], 'landscape');
      pdf.addImage(frontImgData, 'PNG', 0, 0, 85.6, 54, '', 'FAST');

      // Page 3: Standalone Back Side (Standard CR80 85.6mm × 54mm)
      pdf.addPage([85.6, 54], 'landscape');
      pdf.addImage(backImgData, 'PNG', 0, 0, 85.6, 54, '', 'FAST');

      // Save PDF with clear naming
      const safeId = memberId.replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`MPVMAVAKS-MemberCard-${safeId}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Unable to generate Member Card PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Backwards compatibility for directory networking view
  if (variant === 'network' && onOpenDetails) {
    return (
      <div
        onClick={() => onOpenDetails(effectiveUser)}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md cursor-pointer transition-all"
      >
        <div className="flex items-center gap-4">
          <img
            src={avatarBase64 || avatarUrl}
            alt={fullName}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/30"
          />
          <div>
            <h3 className="font-bold text-sm text-slate-900">{fullName}</h3>
            <span className="text-xs text-amber-700 font-bold block">{unionDesignation}</span>
            <span className="text-[10px] font-mono text-slate-500">{memberId} • {circle}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Card Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {t('Digital ID Card', 'Official Member Identity Card')}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {memberStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              ISO/IEC 7810 ID-1 standard PVC format with cryptographic QR verification
            </p>
          </div>
        </div>

        {/* Action Buttons: Download PDF, Print, Flip */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Flip Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Flip to see front/back side"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-600 transition-transform" />
            <span>{isFlipped ? 'View Front Side' : 'View Back Side'}</span>
          </button>

          {/* Theme Selector */}
          <button
            type="button"
            onClick={() => setCardTheme(cardTheme === 'lightblue' ? 'gold' : 'lightblue')}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Toggle card aesthetic theme"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>{cardTheme === 'lightblue' ? 'Light Blue (Default)' : 'Executive Gold'}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Quick print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Primary Action: Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-md hover:shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {generatingPdf ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Member Card (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Card Showcase Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">

        {/* 3D Flip Card Container */}
        <div
          className="w-full max-w-[480px] cursor-pointer group"
          style={{ perspective: '1200px' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="w-full transition-all duration-700 relative"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >

            {/* ================= FRONT SIDE (Interactive Display) ================= */}
            <div
              className={`w-full aspect-[85.6/54] rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden select-none shadow-xl transition-all ${
                cardTheme === 'gold'
                  ? 'bg-gradient-to-br from-[#070B19] via-[#0F172A] to-[#1E293B] border-2 border-amber-500/70 text-white shadow-amber-500/10'
                  : 'bg-gradient-to-br from-[#EBF5FB] via-[#E1EFFF] to-[#D5E8FD] border-2 border-sky-400 text-slate-900 shadow-sky-500/10'
              }`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              {/* Subtle Guilloche & Grid Watermark Pattern */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none network-bg-grid"
                style={{ backgroundSize: '16px 16px' }}
              />

              {/* Holographic Sheen Overlay */}
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000" />

              {/* CARD HEADER */}
              <div className={`relative z-10 flex items-start justify-between gap-3 border-b-2 pb-2 ${cardTheme === 'gold' ? 'border-amber-500/30' : 'border-sky-400/80'}`}>
                <div className="flex items-center gap-2.5">
                  <img
                    src={logoBase64 || '/images/union-logo.png'}
                    alt="Union Logo"
                    className={`w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full p-0.5 border-2 shrink-0 ${cardTheme === 'gold' ? 'bg-white/10 border-amber-400/60' : 'bg-white border-sky-600 shadow-xs'}`}
                  />
                  <div>
                    <h4 className={`text-[10px] sm:text-[11px] leading-tight uppercase tracking-tight font-black ${cardTheme === 'gold' ? 'text-amber-400' : 'text-[#0B2545]'}`}>
                      म.प्र.वि.म. आरक्षित वर्ग अधिकारी / कर्मचारी संघ
                    </h4>
                    <h5 className={`text-[11px] sm:text-[12px] leading-tight tracking-wider uppercase font-black ${cardTheme === 'gold' ? 'text-white' : 'text-[#1E3A8A]'}`}>
                      MP Electricity Department
                    </h5>
                    <p className={`text-[8px] sm:text-[8.5px] font-mono tracking-wider font-bold ${cardTheme === 'gold' ? 'text-slate-300' : 'text-slate-700'}`}>
                      M.P. West Zone Electricity Distribution Co. • Regd. No. 4404
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-black tracking-widest uppercase block ${cardTheme === 'gold' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-[#1E3A8A] text-white shadow-xs'}`}>
                    DIGITAL ID
                  </span>
                  <span className={`text-[7.5px] font-mono block mt-0.5 font-bold ${cardTheme === 'gold' ? 'text-slate-400' : 'text-slate-600'}`}>
                    CR80 STANDARD
                  </span>
                </div>
              </div>

              {/* CARD MAIN BODY */}
              <div className="relative z-10 flex items-start gap-3.5 sm:gap-4 my-auto">
                {/* Photo on left corner */}
                <div className="shrink-0">
                  <div className="relative">
                    <img
                      src={avatarBase64 || avatarUrl}
                      alt={fullName}
                      crossOrigin="anonymous"
                      className={`w-20 h-24 sm:w-22 sm:h-26 rounded-xl object-cover border-2 shadow-md shrink-0 ${cardTheme === 'gold' ? 'border-amber-400 bg-slate-800' : 'border-blue-600 bg-white'}`}
                      style={{ width: '88px', height: '104px', objectFit: 'cover' }}
                    />
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Active Member" />
                  </div>
                </div>

                {/* Name, Post, office address, District, Mobile No. on right hand side */}
                <div className="flex-1 min-w-0 space-y-1 pl-0.5">
                  <div>
                    <h2 className={`text-base sm:text-lg font-black leading-tight truncate tracking-tight ${cardTheme === 'gold' ? 'text-white' : 'text-[#0A192F]'}`}>
                      {fullName}
                    </h2>
                    <p className={`text-[11px] sm:text-xs font-black truncate ${cardTheme === 'gold' ? 'text-amber-400' : 'text-blue-900'}`}>
                      {unionDesignation}
                    </p>
                  </div>

                  <div className={`space-y-0.5 text-[10.5px] sm:text-[11px] ${cardTheme === 'gold' ? 'text-slate-200' : 'text-black'}`}>
                    <div className="flex items-center gap-1.5 truncate">
                      <Zap className={`w-3.5 h-3.5 shrink-0 stroke-[2.5] ${cardTheme === 'gold' ? 'text-amber-400' : 'text-blue-700'}`} />
                      <span className={`font-black ${cardTheme === 'gold' ? 'text-amber-300' : 'text-blue-950'}`}>Post:</span>
                      <span className="truncate font-extrabold">{post}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Building className={`w-3.5 h-3.5 shrink-0 stroke-[2.5] ${cardTheme === 'gold' ? 'text-sky-400' : 'text-blue-700'}`} />
                      <span className={`font-black ${cardTheme === 'gold' ? 'text-amber-300' : 'text-blue-950'}`}>Office:</span>
                      <span className="truncate font-extrabold">{officeAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[2.5]" />
                      <span className={`font-black ${cardTheme === 'gold' ? 'text-amber-300' : 'text-blue-950'}`}>District:</span>
                      <span className="truncate font-black">{district}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className={`w-3.5 h-3.5 shrink-0 stroke-[2.5] ${cardTheme === 'gold' ? 'text-slate-300' : 'text-blue-700'}`} />
                      <span className={`font-black ${cardTheme === 'gold' ? 'text-amber-300' : 'text-blue-950'}`}>Mobile:</span>
                      <span className="truncate font-mono font-black">{phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD FOOTER: ID NO & ISSUED ON (LEFT BOTTOM), CHIP & QR (RIGHT BOTTOM) */}
              <div className={`relative z-10 flex items-end justify-between gap-2 border-t-2 pt-1.5 ${cardTheme === 'gold' ? 'border-amber-500/30' : 'border-sky-400/80'}`}>
                {/* Left Bottom: ID No. & Issued on */}
                <div className="space-y-0.5">
                  <div
                    onClick={handleCopyId}
                    className={`px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono font-black tracking-wider flex items-center gap-1.5 transition-colors cursor-copy shadow-sm ${
                      cardTheme === 'gold'
                        ? 'bg-slate-900 border border-amber-400/50 text-amber-300 hover:bg-slate-800'
                        : 'bg-[#0F172A] text-white hover:bg-slate-800'
                    }`}
                    title="Click to copy Member ID"
                  >
                    <span className="text-amber-400 font-bold text-[9.5px]">ID NO:</span>
                    <span className="text-white font-mono font-black tracking-wide">{memberId}</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
                  </div>
                  <div className={`text-[9.5px] sm:text-[10px] font-mono font-bold block pl-0.5 ${cardTheme === 'gold' ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                    <span className="text-slate-700 font-bold">Issued on:</span> <span className="font-black text-black">{issuedOn}</span>
                  </div>
                </div>

                {/* Right Bottom: EMV Smart Chip, QR Code & Signature */}
                <div className="flex items-center gap-2">
                  <EmvChipSvg className="w-8 h-6 sm:w-9 sm:h-6.5 shrink-0" />
                  <div className="text-right">
                    <span className={`text-[7.5px] font-mono block leading-tight font-bold ${cardTheme === 'gold' ? 'text-slate-300' : 'text-slate-700'}`}>
                      AUTH SIGN
                    </span>
                    <span className={`text-[8.5px] font-serif italic block font-black ${cardTheme === 'gold' ? 'text-amber-300' : 'text-black'}`}>
                      Rajesh Sharma
                    </span>
                  </div>
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Verification QR"
                      className="w-8 h-8 sm:w-9 sm:h-9 bg-white p-0.5 rounded object-contain shrink-0 border-2 border-sky-400 shadow-xs"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ================= BACK SIDE (Interactive Display) ================= */}
            <div
              className="w-full aspect-[85.6/54] rounded-2xl p-4 sm:p-5 text-slate-900 bg-white border-2 border-slate-300 flex flex-col justify-between select-none shadow-2xl absolute inset-0 overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Magnetic Stripe */}
              <div className="-mx-4 sm:-mx-5 -mt-4 sm:-mt-5 h-8 bg-slate-900 flex items-center justify-between px-4">
                <span className="text-[8px] font-mono text-slate-400 tracking-widest">
                  MPVMAVAKS SECURE CARD TRACK
                </span>
                <span className="text-[8.5px] font-mono text-amber-400 font-black">
                  {memberId}
                </span>
              </div>

              {/* Back Content Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[8.5px] sm:text-[9.5px]">
                {/* Left Column: Member Confidential Info */}
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black uppercase text-amber-900 tracking-wide block">
                    Member Record
                  </span>
                  <div className="border-b border-slate-100 pb-0.5">
                    <span className="text-slate-600 block text-[7.5px] font-bold">Father/Spouse:</span>
                    <span className="font-black text-black truncate block text-[9.5px]">{fatherName}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-0.5">
                    <span className="text-slate-600 block text-[7.5px] font-bold">DOB / Blood Group:</span>
                    <span className="font-mono font-black text-black text-[9.5px]">{formattedDob} • {bloodGroup}</span>
                  </div>
                  <div className="border-b border-slate-100 pb-0.5">
                    <span className="text-slate-600 block text-[7.5px] font-bold">Emergency Contact:</span>
                    <span className="font-mono font-black text-amber-900 text-[9.5px]">{emergencyPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[7.5px] font-bold">Circle Headquarters:</span>
                    <span className="font-extrabold text-black truncate block text-[9.5px]">{address}</span>
                  </div>
                </div>

                {/* Right Column: Union Rules & Seal */}
                <div className="space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] font-black uppercase text-slate-950 tracking-wide block">
                      Official Declaration
                    </span>
                    <p className="text-[7.5px] text-slate-800 leading-tight mt-0.5 font-semibold">
                      1. This card is non-transferable and remains the official property of MPVMAVAKS Union.
                    </p>
                    <p className="text-[7.5px] text-slate-800 leading-tight font-semibold">
                      2. Entitles bearer to official representation, grievance defense, and union welfare fund.
                    </p>
                    <p className="text-[7.5px] text-slate-800 leading-tight font-semibold">
                      3. If found, please return to: Central Secretariat, Govindpura, Bhopal.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <UnionSealStamp className="w-10 h-10 shrink-0 opacity-85" />
                    <div className="text-right">
                      <span className="font-serif italic font-black text-[9.5px] text-black block leading-tight">
                        Rajesh Sharma
                      </span>
                      <span className="text-[7px] font-mono text-slate-700 uppercase block font-bold">
                        Gen. Secretary
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Barcode & Helpline & Union Website */}
              <div className="border-t border-slate-300 pt-1 flex items-center justify-between gap-3">
                <div className="flex-1 max-w-[180px]">
                  <BarcodeSvg value={memberId} height={32} />
                </div>
                <div className="text-right text-[8px] font-mono">
                  <span className="block font-black text-black">Helpline: +91 94249 44041</span>
                  <span className="block font-bold text-slate-800">mpmavaks@gmail.com</span>
                  <span className="block font-black text-blue-700 underline text-[9px]">{unionWebsite}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Info Column & Instructions */}
        <div className="w-full lg:max-w-xs space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Verified Membership Credentials</span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Your Member ID <strong className="font-mono text-amber-950 font-black">{memberId}</strong> is registered under MP West Zone Electricity Discom with lifetime union rights.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <span className="text-[11px] font-extrabold uppercase text-slate-700 tracking-wider block">
              Cardholder Quick Actions
            </span>

            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <span>{isFlipped ? 'View Front Side' : 'Flip to View Back Side'}</span>
              <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            </button>

            <button
              type="button"
              onClick={handleCopyId}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <span>{copiedId ? 'Copied to Clipboard!' : 'Copy Unique Member ID'}</span>
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{generatingPdf ? 'Generating PDF...' : 'Download Member Card PDF'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Container positioned offscreen with full opacity for html2canvas capture */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0px',
          pointerEvents: 'none',
          zIndex: -1000
        }}
      >

        {/* CONTAINER 1: FULL A4 PRINTABLE MEMBERSHIP SHEET */}
        <div
          ref={printableSheetRef}
          className="w-[1120px] h-[792px] bg-white p-8 flex flex-col justify-between text-slate-900 font-sans"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Ornate Header */}
          <div className="border-b-2 border-amber-600 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={logoBase64 || '/images/union-logo.png'}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-xl font-black text-amber-900 tracking-tight">
                  मध्य प्रदेश विद्युत मंडल आरक्षित वर्ग अधिकारी / कर्मचारी संघ
                </h1>
                <h2 className="text-base font-extrabold text-slate-900 tracking-wider">
                  MP Electricity Department
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  Regd. No. 4404 under Trade Unions Act 1926 • MP West Zone Electricity Distribution Discom
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold uppercase inline-block">
                OFFICIAL VERIFIED IDENTITY SLIP
              </span>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Issued: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Center Cards (Front and Back Side-by-Side for Direct Cutting & Folding) */}
          <div className="my-auto py-2">
            <div className="text-center mb-2">
              <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                ✂ CUT ALONG OUTER DASHED BOUNDARY • FOLD ALONG CENTER LINE FOR PVC SLEEVE ✂
              </span>
            </div>

            <div className="flex items-center justify-center gap-6 border-2 border-dashed border-amber-500/60 p-4 rounded-3xl bg-slate-50/50">

              {/* CARD FRONT (Exact 85.6mm x 54mm equivalent ~ 460px x 290px) */}
              <div
                className="w-[460px] h-[290px] rounded-2xl p-4 text-slate-900 flex flex-col justify-between relative overflow-hidden shadow-md bg-gradient-to-br from-[#EBF5FB] via-[#E1EFFF] to-[#D5E8FD] border-2 border-sky-400"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-sky-400/80 pb-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={logoBase64 || '/images/union-logo.png'}
                      alt="Logo"
                      className="w-9 h-9 object-contain rounded-full bg-white p-0.5 border-2 border-sky-600 shadow-xs"
                    />
                    <div>
                      <h4 className="text-[10.5px] font-black text-[#0B2545] leading-tight uppercase tracking-tight">
                        म.प्र.वि.म. आरक्षित वर्ग संघ
                      </h4>
                      <h5 className="text-[11.5px] font-black text-[#1E3A8A] leading-tight uppercase tracking-wide">
                        MP Electricity Department
                      </h5>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#1E3A8A] text-white text-[9px] font-mono font-black tracking-wider uppercase shadow-xs">
                    DIGITAL ID
                  </span>
                </div>

                {/* Body: Photo on left corner; Name, Post, Office Address, District, Mobile No. on right hand side */}
                <div className="flex items-start gap-3.5 my-auto">
                  {/* Photo on left corner */}
                  <div className="shrink-0">
                    <img
                      src={avatarBase64 || avatarUrl}
                      alt={fullName}
                      crossOrigin="anonymous"
                      className="w-20 h-24 rounded-xl object-cover border-2 border-blue-600 shadow-sm bg-white shrink-0"
                      style={{ width: '84px', height: '102px', objectFit: 'cover', minWidth: '84px', minHeight: '102px' }}
                    />
                  </div>

                  {/* Details on right hand side */}
                  <div className="flex-1 min-w-0 space-y-1 pl-1">
                    <h2 className="text-[15px] font-black text-[#0A192F] truncate leading-tight tracking-tight">{fullName}</h2>
                    <div className="text-[11px] flex items-center gap-1.5 truncate">
                      <Zap className="w-3.5 h-3.5 text-blue-700 shrink-0 stroke-[2.5]" />
                      <span className="text-blue-950 font-black">Post:</span>
                      <span className="font-extrabold text-black truncate">{post}</span>
                    </div>
                    <div className="text-[10.5px] flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-blue-700 shrink-0 stroke-[2.5]" />
                      <span className="text-blue-950 font-black">Office:</span>
                      <span className="font-extrabold text-black truncate">{officeAddress}</span>
                    </div>
                    <div className="text-[10.5px] flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[2.5]" />
                      <span className="text-blue-950 font-black">District:</span>
                      <span className="font-black text-black truncate">{district}</span>
                    </div>
                    <div className="text-[11px] flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-blue-700 shrink-0 stroke-[2.5]" />
                      <span className="text-blue-950 font-black">Mobile:</span>
                      <span className="font-mono font-black text-black truncate">{phone}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: ID No. & Issued on on left bottom; EMV chip, Auth sign, QR on right bottom */}
                <div className="flex items-end justify-between border-t-2 border-sky-400/80 pt-1.5">
                  <div className="space-y-0.5">
                    <div className="px-2.5 py-1 rounded-md bg-[#0F172A] text-white shadow-sm inline-flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono font-bold text-[9.5px]">ID NO:</span>
                      <span className="text-white font-mono font-black text-[11px] tracking-wider">{memberId}</span>
                    </div>
                    <div className="text-[9.5px] font-mono font-bold text-[#0F172A] mt-0.5">
                      <span className="text-slate-700 font-bold">Issued on:</span> <span className="font-black text-black">{issuedOn}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <EmvChipSvg className="w-8 h-5.5 shrink-0" />
                    <div className="text-right">
                      <span className="text-[7px] font-mono text-slate-700 block leading-tight font-bold">AUTH SIGN</span>
                      <span className="text-[8.5px] font-serif italic text-black font-black block leading-tight">Rajesh Sharma</span>
                    </div>
                    {qrDataUrl && (
                      <img src={qrDataUrl} alt="QR" className="w-8 h-8 bg-white p-0.5 rounded border-2 border-sky-400 object-contain shadow-xs" />
                    )}
                  </div>
                </div>
              </div>

              {/* FOLD CUT DIVIDER */}
              <div className="h-[280px] flex flex-col items-center justify-between text-slate-400 font-mono text-[9px]">
                <span>✂</span>
                <div className="w-0.5 h-full border-r-2 border-dashed border-amber-500 my-2" />
                <span className="rotate-90 origin-center whitespace-nowrap text-[8px] font-bold text-slate-500">
                  FOLD HERE
                </span>
                <div className="w-0.5 h-full border-r-2 border-dashed border-amber-500 my-2" />
                <span>✂</span>
              </div>

              {/* CARD BACK (Exact 85.6mm x 54mm equivalent ~ 460px x 290px) */}
              <div
                className="w-[460px] h-[290px] rounded-2xl p-4 text-slate-900 bg-white border-2 border-slate-400 flex flex-col justify-between shadow-md overflow-hidden"
              >
                {/* Magnetic Stripe */}
                <div className="-mx-4 -mt-4 h-7 bg-slate-900 flex items-center justify-between px-4">
                  <span className="text-[7.5px] font-mono text-slate-400 tracking-widest">
                    MPVMAVAKS SECURE TRACK
                  </span>
                  <span className="text-[8.5px] font-mono text-amber-400 font-black">
                    {memberId}
                  </span>
                </div>

                {/* Back Body */}
                <div className="grid grid-cols-2 gap-2 text-[8px] pt-1">
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase text-amber-900 block tracking-wide">
                      Member Record
                    </span>
                    <div>
                      <span className="text-slate-600 block text-[7.5px] font-bold">Father/Spouse:</span>
                      <span className="font-black text-black truncate block text-[9.5px]">{fatherName}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[7.5px] font-bold">DOB / Blood Group:</span>
                      <span className="font-mono font-black text-black text-[9.5px]">{formattedDob} • {bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[7.5px] font-bold">Emergency Phone:</span>
                      <span className="font-mono font-black text-amber-900 text-[9.5px]">{emergencyPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[7.5px] font-bold">Circle Office:</span>
                      <span className="font-extrabold text-black truncate block text-[9.5px]">{address}</span>
                    </div>
                  </div>

                  <div className="space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9.5px] font-black uppercase text-slate-950 block tracking-wide">
                        Rules & Validity
                      </span>
                      <p className="text-[7.5px] text-slate-800 leading-tight mt-0.5 font-semibold">
                        1. Official non-transferable property of MPVMAVAKS Union.
                      </p>
                      <p className="text-[7.5px] text-slate-800 leading-tight font-semibold">
                        2. Entitles bearer to union advocacy, hazard coverage & welfare rights.
                      </p>
                      <p className="text-[7.5px] text-slate-800 leading-tight font-semibold">
                        3. If found, please return to Secretariat, Govindpura, Bhopal.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <UnionSealStamp className="w-9 h-9 opacity-85" />
                      <div className="text-right">
                        <span className="font-serif italic font-black text-[9.5px] text-black block leading-tight">
                          Rajesh Sharma
                        </span>
                        <span className="text-[7px] font-mono text-slate-700 block uppercase font-bold">
                          Gen. Secretary
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Barcode & Union Website */}
                <div className="border-t border-slate-300 pt-1 flex items-center justify-between gap-2">
                  <div className="flex-1 max-w-[160px]">
                    <BarcodeSvg value={memberId} height={28} />
                  </div>
                  <div className="text-right text-[8px] font-mono">
                    <span className="block font-black text-black">+91 94249 44041</span>
                    <span className="block font-bold text-slate-800">mpmavaks@gmail.com</span>
                    <span className="block font-black text-blue-700 underline text-[9px]">{unionWebsite}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Printable Sheet Footer */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
            <div>
              <span>Official Verification Hash: </span>
              <strong className="text-slate-700">{memberId}-{Date.now().toString(36).toUpperCase()}</strong>
            </div>
            <div>
              <span>Registered Office: 138, Private Bijli Nagar Colony, Govindpura, Bhopal - 462023</span>
            </div>
          </div>
        </div>

        {/* CONTAINER 2: STANDALONE FRONT CARD (FOR EXACT CR80 PAGE 2) */}
        <div
          ref={standaloneFrontRef}
          className="w-[500px] h-[316px] rounded-2xl p-5 text-slate-900 flex flex-col justify-between bg-gradient-to-br from-[#EBF5FB] via-[#E1EFFF] to-[#D5E8FD] border-2 border-sky-400"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-sky-400/80 pb-2">
            <div className="flex items-center gap-2.5">
              <img
                src={logoBase64 || '/images/union-logo.png'}
                alt="Logo"
                className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border-2 border-sky-600 shadow-xs"
              />
              <div>
                <h4 className="text-[11px] font-black text-[#0B2545] leading-tight uppercase tracking-tight">
                  म.प्र.वि.म. आरक्षित वर्ग अधिकारी / कर्मचारी संघ
                </h4>
                <h5 className="text-[12px] font-black text-[#1E3A8A] leading-tight uppercase tracking-wide">
                  MP Electricity Department
                </h5>
                <p className="text-[8.5px] font-mono font-bold text-slate-700">
                  M.P. West Zone Discom • Regd. No. 4404
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#1E3A8A] text-white text-[10px] font-mono font-black tracking-wider uppercase shadow-xs">
              DIGITAL ID
            </span>
          </div>

          {/* Body: Photo on left corner; Name, Post, Office Address, District, Mobile No. on right hand side */}
          <div className="flex items-start gap-4 my-auto">
            <div className="shrink-0">
              <img
                src={avatarBase64 || avatarUrl}
                alt={fullName}
                crossOrigin="anonymous"
                className="w-22 h-26 rounded-xl object-cover border-2 border-blue-600 shadow-sm bg-white shrink-0"
                style={{ width: '88px', height: '104px', objectFit: 'cover', minWidth: '88px', minHeight: '104px' }}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1 pl-1">
              <h2 className="text-lg font-black text-[#0A192F] truncate leading-tight tracking-tight">{fullName}</h2>
              <div className="text-[11.5px] flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-blue-700 shrink-0 stroke-[2.5]" />
                <span className="text-blue-950 font-black">Post:</span>
                <span className="font-extrabold text-black truncate">{post}</span>
              </div>
              <div className="text-[11px] flex items-center gap-1.5 truncate">
                <Building className="w-3.5 h-3.5 text-blue-700 shrink-0 stroke-[2.5]" />
                <span className="text-blue-950 font-black">Office:</span>
                <span className="font-extrabold text-black truncate">{officeAddress}</span>
              </div>
              <div className="text-[11px] flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[2.5]" />
                <span className="text-blue-950 font-black">District:</span>
                <span className="font-black text-black truncate">{district}</span>
              </div>
              <div className="text-[11.5px] flex items-center gap-1.5 truncate">
                <Phone className="w-3.5 h-3.5 text-blue-700 shrink-0 stroke-[2.5]" />
                <span className="text-blue-950 font-black">Mobile:</span>
                <span className="font-mono font-black text-black truncate">{phone}</span>
              </div>
            </div>
          </div>

          {/* Footer: ID No. & Issued on on left bottom; EMV chip, Auth sign, QR on right bottom */}
          <div className="flex items-end justify-between border-t-2 border-sky-400/80 pt-2">
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 rounded-md bg-[#0F172A] text-white shadow-sm inline-flex items-center gap-1.5">
                <span className="text-amber-400 font-mono font-bold text-[10px]">ID NO:</span>
                <span className="text-white font-mono font-black text-xs tracking-wider">{memberId}</span>
              </div>
              <div className="text-[10px] font-mono font-bold text-[#0F172A] mt-0.5">
                <span className="text-slate-700 font-bold">Issued on:</span> <span className="font-black text-black">{issuedOn}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <EmvChipSvg className="w-9 h-6.5 shrink-0" />
              <div className="text-right">
                <span className="text-[7.5px] font-mono text-slate-700 block leading-tight font-bold">AUTH SIGN</span>
                <span className="text-[9px] font-serif italic text-black font-black block leading-tight">Rajesh Sharma</span>
              </div>
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR" className="w-8 h-8 bg-white p-0.5 rounded border-2 border-sky-400 object-contain shadow-xs" />
              )}
            </div>
          </div>
        </div>

        {/* CONTAINER 3: STANDALONE BACK CARD (FOR EXACT CR80 PAGE 3) */}
        <div
          ref={standaloneBackRef}
          className="w-[500px] h-[316px] rounded-2xl p-5 text-slate-900 bg-white border-2 border-slate-400 flex flex-col justify-between overflow-hidden"
        >
          {/* Magnetic Stripe */}
          <div className="-mx-5 -mt-5 h-8 bg-slate-900 flex items-center justify-between px-5">
            <span className="text-[8px] font-mono text-slate-400 tracking-widest">
              MPVMAVAKS SECURE CARD TRACK
            </span>
            <span className="text-[9px] font-mono text-amber-400 font-black">
              {memberId}
            </span>
          </div>

          {/* Back Body */}
          <div className="grid grid-cols-2 gap-3 text-[9px] pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-900 block tracking-wide">
                Member Record
              </span>
              <div>
                <span className="text-slate-600 block text-[8px] font-bold">Father/Spouse:</span>
                <span className="font-black text-black truncate block text-[10px]">{fatherName}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[8px] font-bold">DOB / Blood Group:</span>
                <span className="font-mono font-black text-black text-[10px]">{formattedDob} • {bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[8px] font-bold">Emergency Phone:</span>
                <span className="font-mono font-black text-amber-900 text-[10px]">{emergencyPhone}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[8px] font-bold">Circle Office:</span>
                <span className="font-extrabold text-black truncate block text-[10px]">{address}</span>
              </div>
            </div>

            <div className="space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-950 block tracking-wide">
                  Rules & Validity
                </span>
                <p className="text-[8px] text-slate-800 leading-tight mt-0.5 font-semibold">
                  1. Official non-transferable property of MPVMAVAKS Union.
                </p>
                <p className="text-[8px] text-slate-800 leading-tight font-semibold">
                  2. Entitles bearer to union advocacy, hazard coverage & welfare rights.
                </p>
                <p className="text-[8px] text-slate-800 leading-tight font-semibold">
                  3. If found, please return to Secretariat, Govindpura, Bhopal.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <UnionSealStamp className="w-10 h-10 opacity-85" />
                <div className="text-right">
                  <span className="font-serif italic font-black text-[10px] text-black block leading-tight">
                    Rajesh Sharma
                  </span>
                  <span className="text-[7.5px] font-mono text-slate-700 block uppercase font-bold">
                    Gen. Secretary
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Barcode & Union Website */}
          <div className="border-t border-slate-300 pt-1.5 flex items-center justify-between gap-2">
            <div className="flex-1 max-w-[180px]">
              <BarcodeSvg value={memberId} height={32} />
            </div>
            <div className="text-right text-[8.5px] font-mono">
              <span className="block font-black text-black">+91 94249 44041</span>
              <span className="block font-bold text-slate-800">mpmavaks@gmail.com</span>
              <span className="block font-black text-blue-700 underline text-[10px]">{unionWebsite}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
