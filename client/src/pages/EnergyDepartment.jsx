import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Zap, ShieldCheck, Building2, Globe, Phone, Mail, 
  MapPin, ExternalLink, ChevronRight, Search, CheckCircle2, Cpu, 
  Activity, ArrowUpRight, BarChart3, Radio, Server, Layers, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function EnergyDepartment() {
  const { t, isHindi } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  // Auto-scroll to section hash if provided in URL (e.g., #mp-power-management)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const organizations = [
    {
      id: 'mp-power-management',
      acronym: 'MPPMCL',
      nameEn: 'M.P. Power Management Company Ltd.',
      nameHi: 'म.प्र. पावर मैनेजमेंट कंपनी लिमिटेड',
      tagline: 'Apex Bulk Power Procurement, Load Dispatch & Holding Utility',
      type: 'Apex Power Trading & Tariff Management',
      headquarters: 'Shakti Bhawan, Rampur, Jabalpur - 482008 (M.P.)',
      website: 'https://mppmcl.mp.gov.in',
      phone: '0761-2661111 / 2660500',
      email: 'contact@mppmcl.mp.gov.in',
      established: '2012 (Post MPSEB Restructuring)',
      bgBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      accentColor: 'indigo',
      descriptionEn: 'M.P. Power Management Company Limited (MPPMCL) functions as the apex holding company and nodal power procurement agency for the Government of Madhya Pradesh. It is responsible for long-term and short-term bulk power purchase from thermal, hydro, solar, and wind generation sources, power trading on national energy exchanges (IEX/PXIL), tariff filings before MPERC, and enterprise IT & data management for all three state distribution utilities.',
      descriptionHi: 'म.प्र. पावर मैनेजमेंट कंपनी लिमिटेड (MPPMCL) मध्य प्रदेश सरकार की शीर्ष होल्डिंग कंपनी और नोडल बिजली खरीद एजेंसी है। यह तापीय, जलविद्युत, सौर और पवन ऊर्जा स्रोतों से थोक बिजली खरीद, राष्ट्रीय ऊर्जा एक्सचेंजों पर बिजली व्यापार, MPERC के समक्ष टैरिफ याचिकाओं और राज्य की तीनों वितरण कंपनियों के लिए आईटी बुनियादी ढांचे के प्रबंधन हेतु जिम्मेदार है।',
      keyDetails: [
        { label: 'Bulk Power Procurement', val: 'Over 22,000+ MW peak power demand managed across state grid.' },
        { label: 'Power Trading Operations', val: 'Active trading on Indian Energy Exchange (IEX) & PXIL for optimal power costs.' },
        { label: 'State IT & ERP Infrastructure', val: 'Unified enterprise resource planning, billing systems & state data centers.' },
        { label: 'Regulatory Filings', val: 'Aggregate Revenue Requirement (ARR) petitions with MPERC for West, Central & East Discoms.' },
        { label: 'Renewable Power Integration', val: 'Execution of long-term PPAs for Rewa Solar, Omkareshwar Floating Solar & Wind IPPs.' }
      ],
      stats: [
        { title: 'State Power Demand', count: '22,000+ MW' },
        { title: 'Generators under PPA', count: '45+ Plants' },
        { title: 'Discoms Managed', count: '3 Utilities' }
      ],
      images: [
        {
          src: '/images/energy-dept/mppmcl-hq.jpg',
          caption: 'Shakti Bhawan HQ, Jabalpur - MP Power Management Company Operations Center',
          tag: 'Corporate Secretariat'
        },
        {
          src: '/images/energy-dept/mppmcl-control.jpg',
          caption: 'State Power Trading & Bulk Supply Control Room',
          tag: 'Load Scheduling & IT Hub'
        }
      ]
    },
    {
      id: 'mp-power-transmission',
      acronym: 'MPPTCL',
      nameEn: 'M.P. Power Transmission Company Ltd.',
      nameHi: 'म.प्र. पावर ट्रांसमिशन कंपनी लिमिटेड (एम.पी. ट्रांसको)',
      tagline: 'State Transmission Utility (STU) & Extra High Voltage (EHV) Grid',
      type: 'Extra High Voltage (EHV) Grid & SLDC',
      headquarters: 'Block No. 2, Shakti Bhawan, Rampur, Jabalpur - 482008 (M.P.)',
      website: 'https://www.mptransco.nic.in',
      phone: '0761-2660074 / 2660500',
      email: 'mptransco@nic.in',
      established: '2002 (Incorporated under Companies Act)',
      bgBadge: 'bg-sky-100 text-sky-800 border-sky-200',
      accentColor: 'sky',
      descriptionEn: 'M.P. Power Transmission Company Limited (MPPTCL / Transco) is the designated State Transmission Utility (STU) responsible for wheeling high-voltage electric power reliably across all 55 districts of Madhya Pradesh. MPPTCL constructs, operates, and maintains Extra High Voltage (EHV) substations and transmission networks ranging from 132kV, 220kV up to 400kV, alongside operating the State Load Dispatch Centre (SLDC Jabalpur).',
      descriptionHi: 'म.प्र. पावर ट्रांसमिशन कंपनी लिमिटेड (MPPTCL / ट्रांसको) मध्य प्रदेश की राज्य ट्रांसमिशन उपयोगिता (STU) है, जो राज्य के सभी 55 जिलों में उच्च वोल्टेज बिजली के सुचारू संचरण के लिए जिम्मेदार है। यह 132kV, 220kV और 400kV के एक्स्ट्रा हाई वोल्टेज (EHV) सब-स्टेशनों और ग्रिड नेटवर्क का निर्माण एवं रखरखाव करती है।',
      keyDetails: [
        { label: 'EHV Transmission Lines', val: '42,000+ Circuit Kilometers (ckm) of 400kV, 220kV & 132kV lines.' },
        { label: 'Grid Substations Capacity', val: '415+ EHV Substations with 75,000+ MVA Transformation Capacity.' },
        { label: 'SLDC Jabalpur Command', val: '24x7 real-time grid monitoring, frequency management & telemetry.' },
        { label: 'Substation Automation (SCADA)', val: 'Substation SCADA integration, numerical relays & auto fault locators.' },
        { label: 'Green Energy Corridor (GEC)', val: 'Dedicated high-voltage grid lines for Rewa Solar & Mega Hydro evacuation.' }
      ],
      stats: [
        { title: 'Transmission Lines', count: '42,000+ ckm' },
        { title: 'EHV Substations', count: '415+ Grid Nodes' },
        { title: 'Grid Reliability Rate', count: '99.85%' }
      ],
      images: [
        {
          src: '/images/energy-dept/mpptcl-substation.jpg',
          caption: '400kV Extra High Voltage (EHV) Grid Substation Switchyard',
          tag: 'Substation Infrastructure'
        },
        {
          src: '/images/energy-dept/mpptcl-lines.jpg',
          caption: 'High Tension Transmission Lines & Pylons across Madhya Pradesh',
          tag: 'EHV Grid Lines'
        }
      ]
    },
    {
      id: 'mp-west-zone',
      acronym: 'MPPKVVCL Indore',
      nameEn: 'M.P. Paschim Kshetra Vidyut Vitaran Co. Ltd. (West Zone)',
      nameHi: 'म.प्र. पश्चिम क्षेत्र विद्युत वितरण कंपनी लिमिटेड (इंदौर)',
      tagline: 'Western Discom Serving Malwa & Nimar Electricity Distribution',
      type: 'Electricity Distribution (15 Western Districts)',
      headquarters: 'GPH Campus, Polo Ground, Indore - 452003 (M.P.)',
      website: 'https://mpwz.co.in',
      phone: '1912 (Toll Free) / 0731-2426300',
      email: 'support@mpwz.co.in',
      established: '2002 (Western Electricity Discom)',
      bgBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accentColor: 'emerald',
      descriptionEn: 'M.P. Paschim Kshetra Vidyut Vitaran Company Limited (MP West Zone Discom) handles retail power distribution across 15 western districts of MP including Indore, Ujjain, Dewas, Ratlam, Dhar, Khargone, Khandwa, Mandsaur, and Neemuch circles. Serving over 55+ Lakh consumers, West Discom is recognized nationally for pioneering smart metering, SCADA distribution automation, Urja Tejas mobile portal, and robust lineman safety protocols.',
      descriptionHi: 'म.प्र. पश्चिम क्षेत्र विद्युत वितरण कंपनी लिमिटेड (इंदौर डिस्कॉम) इंदौर, उज्जैन, देवास, रतलाम, धार, खरगोन, खंडवा, मंदसौर सहित 15 पश्चिमी जिलों में बिजली वितरण और खुदरा आपूर्ति संभालती है। 55 लाख से अधिक उपभोक्ताओं की सेवा करने वाली यह कंपनी स्मार्ट मीटरिंग और वितरण स्वचालन में अग्रणी है।',
      keyDetails: [
        { label: 'Jurisdiction & Circles', val: '15 Malwa-Nimar Districts: Indore, Ujjain, Dewas, Ratlam, Dhar, Khargone, Khandwa, Mandsaur, Neemuch, Jhabua, Alirajpur, Burhanpur, Barwani, Agar, Shajapur.' },
        { label: 'Consumer Base Served', val: 'Over 55+ Lakh active domestic, commercial, agricultural & industrial accounts.' },
        { label: 'Smart Metering Pioneer', val: '10+ Lakh smart meters deployed in Indore & Ujjain with automated billing.' },
        { label: 'Feeder Separation Scheme', val: 'Dedicated 24x7 domestic feeders and 10-hour scheduled farm power supply.' },
        { label: 'Union Executive Base', val: 'Primary operational hub for MPVMAVAKS Power Union field engineers & linemen.' }
      ],
      stats: [
        { title: 'Registered Consumers', count: '55+ Lakhs' },
        { title: 'Districts Covered', count: '15 Circles' },
        { title: 'Consumer Helpline', count: '1912 Toll-Free' }
      ],
      images: [
        {
          src: '/images/energy-dept/mpwest-indore.jpg',
          caption: 'GPH Corporate Office & Smart Command Center, Polo Ground Indore',
          tag: 'Discom HQ & Control Room'
        },
        {
          src: '/images/energy-dept/mpwest-linemen.jpg',
          caption: '33/11kV Substation & Field Linemen Service Ops in West Discom',
          tag: 'Field Maintenance Crew'
        }
      ]
    },
    {
      id: 'mp-central-zone',
      acronym: 'MPMKVVCL Bhopal',
      nameEn: 'M.P. Madhya Kshetra Vidyut Vitaran Co. Ltd. (Central Zone)',
      nameHi: 'म.प्र. मध्य क्षेत्र विद्युत वितरण कंपनी लिमिटेड (भोपाल)',
      tagline: 'Central Discom Serving Bhopal & Gwalior Power Distribution',
      type: 'Electricity Distribution (16 Central Districts)',
      headquarters: 'Nishta Parisar, Bijli Nagar, Govindpura, Bhopal - 462023 (M.P.)',
      website: 'https://portal.mpcz.in',
      phone: '1912 (Toll Free) / 0755-2602033',
      email: 'md@mpcz.in',
      established: '2002 (Central Electricity Discom)',
      bgBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      accentColor: 'amber',
      descriptionEn: 'M.P. Madhya Kshetra Vidyut Vitaran Company Limited (MP Central Discom) manages retail electricity distribution across 16 central districts of Madhya Pradesh spanning Bhopal and Gwalior administrative divisions. Operating through Nishta Parisar HQ in Bhopal, MPMKVVCL delivers electricity to 50+ Lakh consumers and leads digital initiatives such as UPAY App, AI meter audit verification, and PM Surya Ghar rooftop solar implementations.',
      descriptionHi: 'म.प्र. मध्य क्षेत्र विद्युत वितरण कंपनी लिमिटेड (भोपाल डिस्कॉम) भोपाल और ग्वालियर प्रशासनिक संभागों के 16 मध्य जिलों में बिजली वितरण का संचालन करती है। गोविंदपुरा भोपाल स्थित निष्ठा परिसर मुख्यालय से संचालित यह कंपनी 50 लाख से अधिक उपभोक्ताओं को सेवाएं प्रदान करती है।',
      keyDetails: [
        { label: 'Districts Covered', val: '16 Central Districts: Bhopal, Sehore, Raisen, Rajgarh, Vidisha, Gwalior, Guna, Bhind, Morena, Sheopur, Datia, Shivpuri, Ashoknagar, Betul, Narmadapuram, Harda.' },
        { label: 'Digital UPAY Portal', val: 'AI-assisted self meter reading, digital bill payment & WhatsApp helpline.' },
        { label: 'Nishta Parisar Training', val: 'State-of-the-art power line safety institute and transformer repair testing.' },
        { label: 'Rooftop Solar Expansion', val: 'Extensive grid solar installations under PM Surya Ghar Muft Bijli Yojana.' },
        { label: 'High Voltage Distribution (HVDS)', val: 'Systemic conversion of low voltage agricultural feeders to prevent line loss.' }
      ],
      stats: [
        { title: 'Consumers Served', count: '50+ Lakhs' },
        { title: 'Central Districts', count: '16 Districts' },
        { title: 'Training Center', count: 'Nishta Parisar' }
      ],
      images: [
        {
          src: '/images/energy-dept/mpcentral-bhopal.jpg',
          caption: 'Nishta Parisar Corporate Headquarters, Govindpura Bhopal',
          tag: 'Central Discom HQ'
        },
        {
          src: '/images/energy-dept/mpcentral-grid.jpg',
          caption: '33/11kV Distribution Transformer Substation Infrastructure',
          tag: 'Distribution Network'
        }
      ]
    },
    {
      id: 'mp-east-zone',
      acronym: 'MPPKVVCL Jabalpur',
      nameEn: 'M.P. Poorv Kshetra Vidyut Vitaran Co. Ltd. (East Zone)',
      nameHi: 'म.प्र. पूर्व क्षेत्र विद्युत वितरण कंपनी लिमिटेड (जबलपुर)',
      tagline: 'Eastern Discom Serving Mahakaushal, Vindhya & Bundelkhand',
      type: 'Electricity Distribution (20 Eastern Districts)',
      headquarters: 'Block No. 7, Shakti Bhawan, Rampur, Jabalpur - 482008 (M.P.)',
      website: 'https://mpez.co.in',
      phone: '1912 (Toll Free) / 0761-2666040',
      email: 'info@mpez.co.in',
      established: '2002 (Eastern Electricity Discom)',
      bgBadge: 'bg-purple-100 text-purple-800 border-purple-200',
      accentColor: 'purple',
      descriptionEn: 'M.P. Poorv Kshetra Vidyut Vitaran Company Limited (MP East Zone Discom) is responsible for electricity distribution across 20 eastern districts in Jabalpur, Sagar, Rewa, and Shahdol regions. Covering the largest geographical footprint in Madhya Pradesh, East Discom powers agricultural regions, tribal forest belts, and heavy industrial hubs such as cement plants in Satna and coal mines in Singrauli.',
      descriptionHi: 'म.प्र. पूर्व क्षेत्र विद्युत वितरण कंपनी लिमिटेड (जबलपुर डिस्कॉम) जबलपुर, सागर, रीवा और शहडोल संभागों के 20 पूर्वी जिलों में विद्युत आपूर्ति का संचालन करती है। यह कंपनी रीवा सोलर, सतना सीमेंट और सिंगरौली कोयला खदानों सहित विशाल औद्योगिक क्षेत्रों को बिजली प्रदान करती है।',
      keyDetails: [
        { label: 'Jurisdiction Footprint', val: '20 Eastern Districts: Jabalpur, Sagar, Rewa, Satna, Chhindwara, Katni, Seoni, Narsinghpur, Mandla, Dindori, Balaghat, Damoh, Panna, Tikamgarh, Chhatarpur, Shahdol, Umaria, Anuppur, Singrauli, Sidhi.' },
        { label: 'Industrial & Mining Grid', val: 'Dedicated high-capacity feeders for Singrauli coalfields & Satna cement corridors.' },
        { label: 'Rural & Forest Grid Coverage', val: 'Expanded 33kV distribution lines across tribal forest belts in Mandla & Balaghat.' },
        { label: 'Smart Discom Services', val: 'Unified 1912 helpline, online bill payment & spot billing machine integration.' },
        { label: 'Substation Modernization', val: 'Upgraded 33/11kV substations with vacuum circuit breakers & remote monitoring.' }
      ],
      stats: [
        { title: 'Geographical Footprint', count: '20 Districts' },
        { title: 'Active Consumers', count: '60+ Lakhs' },
        { title: 'Industrial Feeders', count: '1,200+ Lines' }
      ],
      images: [
        {
          src: '/images/energy-dept/mpeast-jabalpur.jpg',
          caption: 'Shakti Bhawan Block 7 - East Discom Secretariat, Jabalpur',
          tag: 'Corporate Secretariat'
        },
        {
          src: '/images/energy-dept/mpeast-lines.jpg',
          caption: 'Power Distribution Lines & Substation Infrastructure in Eastern MP',
          tag: 'Regional Grid Network'
        }
      ]
    }
  ];

  // Filter organizations by search or tab
  const filteredOrgs = organizations.filter(org => {
    const matchesTab = activeTab === 'all' || org.id === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      org.nameEn.toLowerCase().includes(q) ||
      org.nameHi.toLowerCase().includes(q) ||
      org.acronym.toLowerCase().includes(q) ||
      org.headquarters.toLowerCase().includes(q) ||
      org.descriptionEn.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Banner Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 text-white relative overflow-hidden py-14 lg:py-20 border-b border-sky-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs sm:text-sm tracking-wider uppercase mb-3">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>{isHindi ? 'मध्य प्रदेश शासन - ऊर्जा विभाग' : 'Government of Madhya Pradesh - Energy Department'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {isHindi ? 'मध्य प्रदेश विद्युत क्षेत्र संगठन' : 'M.P. Energy Department & Power Sector Utilities'}
          </h1>

          <p className="mt-4 text-slate-300 max-w-3xl text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
            {isHindi 
              ? 'मध्य प्रदेश के ऊर्जा क्षेत्र के 5 प्रमुख घटकों: थोक बिजली प्रबंधन (MPPMCL), एक्स्ट्रा हाई वोल्टेज ट्रांसमिशन (MPPTCL), और तीनों क्षेत्र वितरण कंपनियों (पश्चिम, मध्य व पूर्व डिस्कॉम) की संपूर्ण आधिकारिक जानकारी।'
              : 'Detailed operational overview, infrastructure specifications, service mandates, and key information for all 5 state power sector organizations under the Energy Department, Govt. of Madhya Pradesh.'}
          </p>

          {/* Quick Stats Grid */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-sky-300 font-mono">5</div>
              <div className="text-xs text-slate-300 font-medium mt-1">{isHindi ? 'प्रमुख शक्ति निकाय' : 'Power Organizations'}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">22,000+</div>
              <div className="text-xs text-slate-300 font-medium mt-1">{isHindi ? 'मेगावाट पिक लोड' : 'MW Peak Grid Capacity'}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">42,000+</div>
              <div className="text-xs text-slate-300 font-medium mt-1">{isHindi ? 'किमी EHV लाइने' : 'ckm Transmission Lines'}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">1.65+</div>
              <div className="text-xs text-slate-300 font-medium mt-1">{isHindi ? 'करोड़ कुल उपभोक्ता' : 'Crore Total Consumers'}</div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Organization Filter Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-30 backdrop-blur-md bg-white/95">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'all' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isHindi ? 'सभी 5 संगठन (All 5)' : 'All 5 Organizations'}
            </button>

            {organizations.map(org => (
              <button
                key={org.id}
                onClick={() => {
                  setActiveTab(org.id);
                  const el = document.getElementById(org.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === org.id 
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {org.acronym}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? "संगठन या सेवा खोजें..." : "Search organization or service..."}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

        </div>

        {/* Organizations Detailed List */}
        <div className="mt-8 space-y-12">
          {filteredOrgs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-base">{isHindi ? 'कोई संगठन नहीं मिला' : 'No organization matched your search'}</p>
              <p className="text-xs text-slate-500 mt-1">{isHindi ? 'कृपया दूसरा कीवर्ड खोजें।' : 'Please try clearing your search query or switching tabs.'}</p>
            </div>
          ) : (
            filteredOrgs.map((org, index) => (
              <section
                key={org.id}
                id={org.id}
                className="bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden scroll-mt-24 transition-all hover:shadow-xl"
              >
                {/* Section Top Header */}
                <div className="p-6 sm:p-8 bg-slate-900 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800">
                  <div className="space-y-2 max-w-3xl z-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${org.bgBadge}`}>
                        {org.acronym}
                      </span>
                      <span className="text-xs font-bold text-sky-300 bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-800/60">
                        {org.type}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {isHindi ? org.nameHi : org.nameEn}
                    </h2>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-300">
                      {isHindi ? org.nameEn : org.nameHi}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{org.headquarters}</span>
                    </p>
                  </div>

                  {/* External Portal Button */}
                  <div className="shrink-0 z-10">
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-sky-500/25"
                    >
                      <span>{isHindi ? 'आधिकारिक पोर्टल (Visit Website)' : 'Official Portal'}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Section Body */}
                <div className="p-6 sm:p-8 space-y-8">
                  
                  {/* Overview Description */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-sky-600" />
                      <span>{isHindi ? 'संक्षिप्त विवरण एवं भूमिका' : 'Organizational Role & Overview'}</span>
                    </h4>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
                      {isHindi ? org.descriptionHi : org.descriptionEn}
                    </p>
                  </div>

                  {/* Key Services & Specs Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{isHindi ? 'मुख्य विशेषताएं एवं सेवाएं' : 'Key Details & Core Mandate'}</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {org.keyDetails.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-200 transition-colors flex items-start gap-3"
                        >
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">{item.label}</span>
                            <span className="text-xs text-slate-600 mt-0.5 block leading-relaxed">{item.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High Resolution Authentic Realistic Images Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-indigo-600" />
                        <span>{isHindi ? 'प्रामाणिक अवसंरचना एवं स्थल चित्र' : 'Authentic Infrastructure & Office Visuals'}</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">{isHindi ? 'वास्तविक तस्वीरें' : 'Real Field Photographs'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {org.images.map((img, imgIdx) => (
                        <div 
                          key={imgIdx} 
                          onClick={() => setSelectedImageModal(img)}
                          className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer shadow-sm hover:shadow-md transition-all"
                        >
                          <img 
                            src={img.src} 
                            alt={img.caption} 
                            className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-4 flex flex-col justify-end">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-600/90 text-white text-[10px] font-extrabold uppercase tracking-wider w-max mb-1.5">
                              {img.tag}
                            </span>
                            <p className="text-white text-xs font-bold leading-snug drop-shadow-md">
                              {img.caption}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Info Bar: Contact & Fast Stats */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="font-mono text-slate-900 font-bold">{org.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="text-slate-800">{org.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {org.stats.map((st, stIdx) => (
                        <div key={stIdx} className="text-right">
                          <span className="text-xs font-black text-slate-900 block font-mono">{st.count}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{st.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </section>
            ))
          )}
        </div>

        {/* Comparative Summary Table Section */}
        <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-slate-900">
              {isHindi ? 'मध्य प्रदेश ऊर्जा विभाग - संगठन तुलनात्मक सार' : 'M.P. Power Sector Organizations Quick Matrix'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi ? 'पांचों सरकारी संस्थाओं के मुख्यालय, कार्यक्षेत्र एवं संपर्क सूत्र' : 'Overview matrix of headquarters, operational domain, and helplines across all 5 entities.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3.5 rounded-tl-xl">{isHindi ? 'संगठन का नाम' : 'Organization'}</th>
                  <th className="p-3.5">{isHindi ? 'मुख्यालय' : 'Headquarters'}</th>
                  <th className="p-3.5">{isHindi ? 'मुख्य कार्यक्षेत्र' : 'Primary Domain'}</th>
                  <th className="p-3.5">{isHindi ? 'हेल्पलाइन / संपर्क' : 'Helpline'}</th>
                  <th className="p-3.5 rounded-tr-xl">{isHindi ? 'पोर्टल' : 'Website'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {organizations.map(org => (
                  <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {org.acronym}
                    </td>
                    <td className="p-3.5 text-slate-700 whitespace-nowrap">
                      {org.headquarters.split(',')[1] || org.headquarters}
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {org.type}
                    </td>
                    <td className="p-3.5 font-mono text-sky-700 font-bold whitespace-nowrap">
                      {org.phone.split('/')[0]}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <a 
                        href={org.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-800 font-bold inline-flex items-center gap-1"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Image Modal Lightbox */}
      {selectedImageModal && (
        <div 
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center cursor-pointer animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 text-xs font-bold transition-colors z-20"
            >
              ✕ Close
            </button>
            <img 
              src={selectedImageModal.src} 
              alt={selectedImageModal.caption} 
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-5 bg-slate-900 text-white">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block mb-1">
                {selectedImageModal.tag}
              </span>
              <p className="text-sm font-bold text-slate-100">{selectedImageModal.caption}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
