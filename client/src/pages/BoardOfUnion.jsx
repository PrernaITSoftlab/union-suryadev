import React, { useState } from 'react';
import { 
  Shield, Users, Award, MapPin, Mail, Phone, CheckCircle2, 
  Search, Star, ChevronRight, UserCheck, Sparkles, Filter, Info, Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function BoardOfUnion() {
  const { settings } = useAuth();
  const { t, isHindi } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeaderModal, setSelectedLeaderModal] = useState(null);

  // All 18 Heads of Board of Union
  const leaders = [
    {
      id: 1,
      nameHi: "मा व्ही एस महतो",
      nameEn: "Shri V. S. Mehto",
      titleHi: "प्रांतीय वरिष्ठ उपाध्यक्ष",
      titleEn: "Prantiya Varishtha Upadhyaksha (Senior Vice President)",
      category: "central",
      isTopHead: true,
      badge: "Senior Vice President",
      image: "/images/board/v-s-mehto.jpg",
      phone: "+91 83198 64691",
      email: "mpmavaks@gmail.com",
      circle: "State Executive Committee",
      roleEn: "Executive Vice Leadership & Cadre Operations",
      roleHi: "वरिष्ठ कार्यकारी नेतृत्व एवं संगठन संचालन",
      bioEn: "Senior Vice President guiding overall organizational structure, inter-discom employee advocacy, and dispute resolution for electricity personnel.",
      bioHi: "विद्युत कर्मचारियों के अधिकारों, संभाग स्तर पर संगठन सुदृढ़ीकरण और कर्मचारी कल्याण योजनाओं के क्रियान्वयन के मुख्य मार्गदर्शक।"
    },
    {
      id: 2,
      nameHi: "इंजी सूर्यदेव जयसिंह",
      nameEn: "Er. Suryadev Jaysingh",
      titleHi: "प्रांतीय अध्यक्ष",
      titleEn: "Prantiya Adhyaksha (State President)",
      category: "central",
      isTopHead: true,
      badge: "State President",
      image: "/images/board/suryadev-jaysingh.jpg",
      phone: "+91 94249 44041",
      email: "mpmavaks@gmail.com",
      circle: "State Executive Committee",
      roleEn: "Central Union Head & State Executive Lead",
      roleHi: "केंद्रीय संगठन प्रमुख एवं राज्य कार्यकारिणी अध्यक्ष",
      bioEn: "State President leading executive decisions, policy negotiations with energy discom management, legal defense, and agitation programs for 15,000+ power personnel.",
      bioHi: "15,000+ विद्युत अभियंताओं व कर्मचारियों के अधिकारों, वेतन सुधार एवं पेंशन आंदोलन (OPS) के नेतृत्वकर्ता।"
    },
    {
      id: 3,
      nameHi: "मा एम एल शाक्य",
      nameEn: "Shri M. L. Shakya",
      titleHi: "संस्थापक / मुख्य संरक्षक",
      titleEn: "Sansthapak / Chief Patron (Founder)",
      category: "patron",
      isTopHead: true,
      badge: "Founder & Patron",
      image: "/images/board/m-l-shakya.jpg",
      phone: "+91 94793 65273",
      email: "mpmavaks@gmail.com",
      circle: "Patron Secretariat",
      roleEn: "Union Founder & Chief Visionary Advisor",
      roleHi: "यूनियन संस्थापक एवं मुख्य नीति सलाहकार",
      bioEn: "Chief Founder of MPVMAVAKS Union whose vision established the institutional voice for power line staff, safety standards, and cadre insurance protection.",
      bioHi: "यूनियन के दूरदर्शी संस्थापक जिन्होंने विद्युत कर्मियों के लिए संस्थागत मंच, सुरक्षा प्रोटोकॉल और दुर्घटना बीमा फंड की नींव रखी।"
    },
    {
      id: 4,
      nameHi: "इंजी डी डी रामटेके",
      nameEn: "Er. D. D. Ramteke",
      titleHi: "प्रांतीय महासचिव",
      titleEn: "Prantiya Mahasachiv (General Secretary)",
      category: "central",
      isTopHead: true,
      badge: "General Secretary",
      image: "/images/board/d-d-ramteke.jpg",
      phone: "+91 94258 06787",
      email: "mpmavaks@gmail.com",
      circle: "Central Secretariat Bhopal",
      roleEn: "Chief Secretariat & Administrative Operations",
      roleHi: "मुख्य सचिवालय एवं प्रशासनिक मामले",
      bioEn: "General Secretary directing central secretariat administration, discom correspondence, strike notifications, and state delegate coordination.",
      bioHi: "केंद्रीय सचिवालय के प्रशासनिक प्रमुख, ऊर्जा प्रबंधन पत्राचार एवं राज्य प्रतिनिधि सम्मेलनों के संयोजक।"
    },
    {
      id: 5,
      nameHi: "इंजी गजरा मेहता",
      nameEn: "Er. Gajra Mehta",
      titleHi: "प्रांतीय संरक्षक एवं तकनीकी सलाहकार",
      titleEn: "Chief Patron & Technical Safety Advisor",
      category: "patron",
      isTopHead: false,
      badge: "Chief Technical Patron",
      image: "/images/board/leader-5.jpg",
      phone: "+91 89899 84101",
      email: "mpmavaks@gmail.com",
      circle: "Patron Council",
      roleEn: "High-Voltage Field Safety Standards",
      roleHi: "उच्च-वोल्टेज सुरक्षा मानक परामर्शदाता",
      bioEn: "Technical advisor advocating mandatory Permit-To-Work (PTW) rules and insulated gear compliance across 33kV & 11kV lines.",
      bioHi: "33kV व 11kV लाइनों के लिए PTW नियम व इंसुलेटेड सुरक्षा उपकरणों की अनिवार्यता के मुख्य विशेषज्ञ।"
    },
    {
      id: 6,
      nameHi: "श्री मनोज जोशी",
      nameEn: "Shri Manoj Joshi",
      titleHi: "प्रांतीय उपाध्यक्ष (इंदौर संभाग)",
      titleEn: "Prantiya Upadhyaksha (Indore Division)",
      category: "regional",
      isTopHead: false,
      badge: "Vice President - Indore",
      image: "/images/board/leader-6.jpg",
      phone: "+91 98260 11001",
      email: "indore@mpmavaks.org",
      circle: "Indore Discom Circle",
      roleEn: "Indore Regional Cadre Administration",
      roleHi: "इंदौर संभाग कर्मचारी प्रशासन",
      bioEn: "Managing field operations, smart meter worker safety, and discom HQ grievances in Indore metro circle.",
      bioHi: "इंदौर शहर व ग्रामीण वृत्तों में बिजली कर्मियों की समस्याओं व स्मार्ट मीटर सुरक्षा का प्रबंधन।"
    },
    {
      id: 7,
      nameHi: "श्री दीपक सोलंकी",
      nameEn: "Shri Deepak Solanki",
      titleHi: "प्रांतीय संगठन सचिव",
      titleEn: "Prantiya Sangathan Sachiv (Organization Secretary)",
      category: "central",
      isTopHead: false,
      badge: "Organization Secretary",
      image: "/images/board/leader-7.jpg",
      phone: "+91 98260 11002",
      email: "org@mpmavaks.org",
      circle: "State Executive Committee",
      roleEn: "Membership Expansion & Zonal Mobilization",
      roleHi: "सदस्यता विस्तार एवं प्रांतीय संगठन अभियान",
      bioEn: "Directing state-wide digital membership drives and zonal delegate elections.",
      bioHi: "डिजिटल सदस्य आईडी वितरण व राज्य प्रतिनिधि चुनाव अभियान के प्रमुख।"
    },
    {
      id: 8,
      nameHi: "श्री कैलाश बैरागी",
      nameEn: "Shri Kailash Bairagi",
      titleHi: "प्रांतीय सचिव (उज्जैन संभाग)",
      titleEn: "Zonal Secretary (Ujjain Circle)",
      category: "regional",
      isTopHead: false,
      badge: "Zonal Sec - Ujjain",
      image: "/images/board/leader-8.jpg",
      phone: "+91 98260 11003",
      email: "ujjain@mpmavaks.org",
      circle: "Ujjain Discom Circle",
      roleEn: "Ujjain Region Grievances & PTW Assistance",
      roleHi: "उज्जैन संभाग शिकायत निवारण",
      bioEn: "Representing power engineers & linemen across Ujjain, Nagda, and Mahakal circle.",
      bioHi: "उज्जैन व आसपास के उप-संभागों में कर्मचारियों के वेतन व सुरक्षा मामलों के प्रभारी।"
    },
    {
      id: 9,
      nameHi: "इंजी संजय कुलकर्णी",
      nameEn: "Er. Sanjay Kulkarni",
      titleHi: "प्रांतीय कोषाध्यक्ष",
      titleEn: "Prantiya Koshadhyaksha (Treasurer)",
      category: "central",
      isTopHead: false,
      badge: "State Treasurer",
      image: "/images/board/leader-9.jpg",
      phone: "+91 98260 11004",
      email: "finance@mpmavaks.org",
      circle: "Central Finance Secretariat",
      roleEn: "Union Audit & Hazard Fund Disbursement",
      roleHi: "यूनियन कोष एवं दुर्घटना राहत वितरण",
      bioEn: "Overseeing union treasury, audit compliance, and ₹20 Lakh accident relief payouts.",
      bioHi: "यूनियन वित्त लेखा, ऑडिट एवं ₹20 लाख दुर्घटना राहत कोष के प्रभारी।"
    },
    {
      id: 10,
      nameHi: "श्री राकेश वर्मा",
      nameEn: "Shri Rakesh Verma",
      titleHi: "प्रांतीय सह-सचिव (धार संभाग)",
      titleEn: "Joint Secretary (Dhar Region)",
      category: "regional",
      isTopHead: false,
      badge: "Joint Sec - Dhar",
      image: "/images/board/leader-10.jpg",
      phone: "+91 98260 11005",
      email: "dhar@mpmavaks.org",
      circle: "Dhar Discom Circle",
      roleEn: "Tribal Region Line Staff Safety",
      roleHi: "आदिवासी अंचल लाइन स्टाफ सुरक्षा",
      bioEn: "Coordinating rural electrification safety gear and fast-track medical aid in Dhar circle.",
      bioHi: "धार व कुक्षी ग्रामीण सर्किलों में लाइनमैन सुरक्षा सामग्री की त्वरित उपलब्धता।"
    },
    {
      id: 11,
      nameHi: "श्री मोहनलाल यादव",
      nameEn: "Shri Mohanlal Yadav",
      titleHi: "प्रांतीय मीडिया प्रभारी",
      titleEn: "Chief Press & Media Coordinator",
      category: "advisory",
      isTopHead: false,
      badge: "Media Spokesperson",
      image: "/images/board/leader-11.jpg",
      phone: "+91 98260 11006",
      email: "media@mpmavaks.org",
      circle: "Press Cell Bhopal",
      roleEn: "Press Releases & Agitation Bulletins",
      roleHi: "प्रेस विज्ञप्ति एवं आंदोलन सूचना",
      bioEn: "Chief union spokesperson managing newspaper announcements, TV press briefs, and official gazette publications.",
      bioHi: "यूनियन समाचार पत्र विज्ञप्ति, प्रेस ब्रीफिंग व मांग पत्रों के अधिकृत प्रवक्ता।"
    },
    {
      id: 12,
      nameHi: "इंजी अनिता उपाध्याय",
      nameEn: "Er. Anita Upadhyay",
      titleHi: "प्रांतीय महिला प्रतिनिधि व सुरक्षा अधिकारी",
      titleEn: "Women Cadre Head & Safety Officer",
      category: "advisory",
      isTopHead: false,
      badge: "Women Cadre Head",
      image: "/images/board/leader-12.jpg",
      phone: "+91 98260 11007",
      email: "women@mpmavaks.org",
      circle: "State Executive",
      roleEn: "Female Engineers & Staff Welfare",
      roleHi: "महिला अभियंता व कर्मचारी कल्याण",
      bioEn: "Advocating work environment dignity, maternity rights, and workplace safety for female power sector personnel.",
      bioHi: "महिला बिजली अधिकारियों व कर्मचारियों के कार्यस्थल अधिकारों की संभाग प्रमुख।"
    },
    {
      id: 13,
      nameHi: "श्री सुरेंद्र चौहान",
      nameEn: "Shri Surendra Chouhan",
      titleHi: "प्रांतीय प्रचार सचिव (मंदसौर-नीमच)",
      titleEn: "Propaganda Secretary (Mandsaur-Neemuch)",
      category: "regional",
      isTopHead: false,
      badge: "Regional Sec - Malwa Border",
      image: "/images/board/leader-13.jpg",
      phone: "+91 98260 11008",
      email: "mandsaur@mpmavaks.org",
      circle: "Mandsaur-Neemuch Circle",
      roleEn: "Border Circle Mobilization",
      roleHi: "सीमावर्ती वृत्त संगठन अभियान",
      bioEn: "Organizing delegate meetings and strike preparation rallies across Mandsaur and Neemuch divisions.",
      bioHi: "मंदसौर व नीमच क्षेत्र में कर्मचारी सम्मेलनों व धरना प्रदर्शनों के आयोजक।"
    },
    {
      id: 14,
      nameHi: "श्री भगवान दास",
      nameEn: "Shri Bhagwan Das",
      titleHi: "प्रांतीय संयुक्त मंत्री",
      titleEn: "Joint Minister & Regional Delegate",
      category: "regional",
      isTopHead: false,
      badge: "Joint Minister",
      image: "/images/board/leader-14.jpg",
      phone: "+91 98260 11009",
      email: "niwari@mpmavaks.org",
      circle: "Eastern Border Circle",
      roleEn: "Inter-Discom Coordination",
      roleHi: "अंतर्-डिस्कॉम समन्वय",
      bioEn: "Building solidarity between West, Central, and East discom union branches.",
      bioHi: "पश्चिम, मध्य व पूर्व डिस्कॉम संघ शाखाओं के बीच परस्पर समन्वय के प्रमुख।"
    },
    {
      id: 15,
      nameHi: "इंजी आर के शर्मा",
      nameEn: "Er. R. K. Sharma",
      titleHi: "प्रांतीय विधिक व तकनीकी सलाहकार",
      titleEn: "Chief Legal & Technical Advisor",
      category: "advisory",
      isTopHead: false,
      badge: "Legal Panel Head",
      image: "/images/board/leader-15.jpg",
      phone: "+91 94250 12345",
      email: "legal@mpmavaks.org",
      circle: "Legal Advisory Board",
      roleEn: "Court Litigation & OPS Legal Advocacy",
      roleHi: "न्यायालयीन विधिक रक्षा व पेंशन केस",
      bioEn: "Senior advocate representing contract linemen regularization lawsuits in MP High Court.",
      bioHi: "मध्य प्रदेश उच्च न्यायालय में संविदा लाइनमैन नियमितीकरण मामलों के प्रमुख अधिवक्ता।"
    },
    {
      id: 16,
      nameHi: "श्री संतोष पाटीदार",
      nameEn: "Shri Santosh Patidar",
      titleHi: "प्रांतीय कार्यालय सचिव (भोपाल HQ)",
      titleEn: "Central Office Secretary (Bhopal HQ)",
      category: "central",
      isTopHead: false,
      badge: "HQ Admin Secretary",
      image: "/images/board/leader-16.jpg",
      phone: "+91 94251 23456",
      email: "hq@mpmavaks.org",
      circle: "Central Secretariat Bhopal",
      roleEn: "Govindpura HQ Administration",
      roleHi: "गोविंदपुरा कार्यालय प्रशासन",
      bioEn: "Managing daily administrative workflow, member ID issuance, and official state records.",
      bioHi: "गोविंदपुरा भोपाल स्थित केंद्रीय कार्यालय के दैनिक प्रशासन व रिकॉर्ड प्रभारी।"
    },
    {
      id: 17,
      nameHi: "श्रीमती सुनीता मालवीय",
      nameEn: "Smt. Sunita Malviya",
      titleHi: "प्रांतीय कल्याण समिति अध्यक्ष",
      titleEn: "Employee Welfare Committee Chair",
      category: "advisory",
      isTopHead: false,
      badge: "Welfare Chair",
      image: "/images/board/leader-17.jpg",
      phone: "+91 94252 34567",
      email: "welfare@mpmavaks.org",
      circle: "Welfare Committee",
      roleEn: "Medical Relief & Martyrs Mutual Fund",
      roleHi: "चिकित्सा राहत व शहीद कोष",
      bioEn: "Directing emergency financial support for families of injured linemen during grid duty.",
      bioHi: "ड्यूटी के दौरान घायल या दुर्घटनाग्रस्त कर्मियों के परिवारों को आर्थिक मदद प्रदान करने वाली समिति प्रमुख।"
    },
    {
      id: 18,
      nameHi: "इंजी विक्रम सिंह परमार",
      nameEn: "Er. Vikram Singh Parmar",
      titleHi: "प्रांतीय युवा मोर्चा अध्यक्ष",
      titleEn: "Youth Wing & Contract Staff President",
      category: "regional",
      isTopHead: false,
      badge: "Youth & Contract Cadre Head",
      image: "/images/board/leader-18.jpg",
      phone: "+91 94253 45678",
      email: "youth@mpmavaks.org",
      circle: "Youth & Contract Cadre Cell",
      roleEn: "Outsource & Contract Linemen Advocacy",
      roleHi: "संविदा व आउटसोर्स लाइनमैन अधिकार",
      bioEn: "Leading youth power engineers and contract staff rallies for regular cadre absorption and equal pay.",
      bioHi: "संविदा एवं आउटसोर्स लाइनमैनों के नियमितीकरण व समान काम-समान वेतन आंदोलन के अध्यक्ष।"
    }
  ];

  const filteredLeaders = leaders;
  const top4Heads = leaders.filter(l => l.isTopHead);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Banner Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 text-white relative overflow-hidden py-14 lg:py-20 border-b border-sky-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs sm:text-sm tracking-wider uppercase mb-3">
            <Users className="w-4 h-4 text-sky-400" />
            <span>{isHindi ? 'संघ मंडल - 18 प्रमुख पदाधिकारी निर्देशिका' : 'Board of Union • 18 Executive Officers Directory'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {isHindi ? 'म.प्र. विद्युत कर्मचारी संघ - कार्यसमिति मंडल' : 'Board of Union & Executive Leadership'}
          </h1>

          <p className="mt-4 text-slate-300 max-w-3xl text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
            {isHindi 
              ? 'संस्थापक, प्रांतीय अध्यक्ष, प्रांतीय वरिष्ठ उपाध्यक्ष, प्रांतीय महासचिव सहित संघ मंडल के सभी 18 प्रमुख पदाधिकारियों का संपूर्ण परिचय, संपर्क सूत्र एवं संगठनात्मक दायित्व।'
              : 'Official directory of all 18 executive heads of MPVMAVAKS Union, including Founder, State President, Senior Vice President, General Secretary, and Zonal Leaders protecting 15,000+ power personnel.'}
          </p>

          {/* Header Quick Badges */}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-sky-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>18 Executive Heads</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>4 Main Officers</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>15 Discom Circles</span>
            </span>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        
        {/* TOP 4 MAIN HEADS SPECIAL FEATURE SECTION */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-black text-sky-700 uppercase tracking-widest block">{isHindi ? 'केंद्रीय शीर्ष नेतृत्व' : 'Central Executive Apex Heads'}</span>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
                <span>{isHindi ? 'संघ मंडल के 4 मुख्य संरक्षक एवं प्रांतीय पदाधिकारी' : 'Top 4 Executive Leaders of Union'}</span>
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full w-max">
              {isHindi ? 'आधिकारिक चित्र व विवरण' : 'Verified Official Photos'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {top4Heads.map((head) => (
              <div 
                key={head.id}
                onClick={() => setSelectedLeaderModal(head)}
                className="bg-white rounded-3xl border-2 border-sky-200 shadow-lg hover:border-sky-500 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                {/* Image Container with Custom Framing */}
                <div className="relative bg-slate-900 overflow-hidden h-72 sm:h-80">
                  <img 
                    src={head.image} 
                    alt={head.nameHi} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-sky-600/90 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                    #{head.id} • {head.badge}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black tracking-tight leading-tight">
                      {isHindi ? head.nameHi : head.nameEn}
                    </h3>
                    <p className="text-xs font-bold text-sky-300 mt-0.5">
                      {isHindi ? head.nameEn : head.nameHi}
                    </p>
                  </div>
                </div>

                {/* Details Content */}
                <div className="p-5 space-y-3 bg-white flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="text-xs font-black text-slate-900 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-xl text-center">
                      {isHindi ? head.titleHi : head.titleEn}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 text-center font-mono">
                      {isHindi ? head.titleEn : head.titleHi}
                    </p>
                    
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 pt-2 italic border-t border-slate-100">
                      "{isHindi ? head.bioHi : head.bioEn}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-bold">{head.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate text-[11px]">{head.circle}</span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* FULL 18 HEADS DIRECTORY GRID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" />
              <span>{isHindi ? 'संघ मंडल - समस्त 18 पदाधिकारियों की सूची' : 'Complete 18 Leaders Executive Directory'}</span>
            </h2>
            <span className="text-xs font-mono font-bold text-slate-500">
              {filteredLeaders.length} of 18 Heads
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredLeaders.map((leader) => (
              <div 
                key={leader.id}
                onClick={() => setSelectedLeaderModal(leader)}
                className={`bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group ${
                  leader.isTopHead ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <img 
                      src={leader.image} 
                      alt={leader.nameEn} 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover object-top border-2 border-sky-500 shadow-md shrink-0 group-hover:scale-105 transition-transform" 
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                          #{leader.id}
                        </span>
                        {leader.isTopHead && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                            <span>Top Officer</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-sky-700 transition-colors">
                        {isHindi ? leader.nameHi : leader.nameEn}
                      </h3>
                      <p className="text-xs font-bold text-slate-500">
                        {isHindi ? leader.nameEn : leader.nameHi}
                      </p>
                      <p className="text-xs font-black text-sky-700 pt-0.5">
                        {isHindi ? leader.titleHi : leader.titleEn}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[10px] font-bold">
                      {isHindi ? leader.roleHi : leader.roleEn}
                    </span>

                    <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-2">
                      "{isHindi ? leader.bioHi : leader.bioEn}"
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs font-mono space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-bold">{leader.phone}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">{leader.circle.split(' ')[0]}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY TABLE OF ALL 18 HEADS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-slate-900">
              {isHindi ? 'म.प्र. विद्युत कर्मचारी संघ - 18 पदाधिकारियों का विवरण तालिका' : 'Board of Union - Complete 18 Officers Table'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi ? 'सभी 18 प्रांतीय एवं संभागीय पदाधिकारियों के पद, वृत्त एवं संपर्क नंबर' : 'Comprehensive roster of all 18 executive heads, titles, and circles.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3.5 rounded-tl-xl">#</th>
                  <th className="p-3.5">{isHindi ? 'पदाधिकारी का नाम' : 'Name'}</th>
                  <th className="p-3.5">{isHindi ? 'पदनाम' : 'Title / Designation'}</th>
                  <th className="p-3.5">{isHindi ? 'वृत्त / संभाग' : 'Circle / Region'}</th>
                  <th className="p-3.5 rounded-tr-xl">{isHindi ? 'संपर्क नंबर' : 'Contact Phone'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {leaders.map(l => (
                  <tr key={l.id} className={`hover:bg-slate-50 transition-colors ${l.isTopHead ? 'bg-sky-50/50 font-bold' : ''}`}>
                    <td className="p-3.5 text-slate-400 font-mono">#{l.id}</td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      <div>{isHindi ? l.nameHi : l.nameEn}</div>
                      <div className="text-[10px] font-semibold text-slate-500">{isHindi ? l.nameEn : l.nameHi}</div>
                    </td>
                    <td className="p-3.5 text-sky-800 font-extrabold">
                      {isHindi ? l.titleHi : l.titleEn}
                    </td>
                    <td className="p-3.5 text-slate-700 whitespace-nowrap">
                      {l.circle}
                    </td>
                    <td className="p-3.5 font-mono text-slate-900 font-bold whitespace-nowrap">
                      {l.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* LEADER DETAIL MODAL LIGHTBOX */}
      {selectedLeaderModal && (
        <div 
          onClick={() => setSelectedLeaderModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center cursor-pointer animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-lg w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedLeaderModal(null)}
              className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-2 text-xs font-bold transition-colors z-20"
            >
              ✕ Close
            </button>
            
            <div className="relative bg-slate-900 h-64 sm:h-72">
              <img 
                src={selectedLeaderModal.image} 
                alt={selectedLeaderModal.nameEn} 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-0.5 rounded bg-sky-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  #{selectedLeaderModal.id} • {selectedLeaderModal.badge}
                </span>
                <h3 className="text-xl font-extrabold mt-1">
                  {isHindi ? selectedLeaderModal.nameHi : selectedLeaderModal.nameEn}
                </h3>
                <p className="text-xs text-sky-300 font-bold">
                  {isHindi ? selectedLeaderModal.nameEn : selectedLeaderModal.nameHi}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">{isHindi ? 'पद एवं वृत्त' : 'Designation & Circle'}</span>
                <p className="text-base font-extrabold text-slate-900">
                  {isHindi ? selectedLeaderModal.titleHi : selectedLeaderModal.titleEn}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedLeaderModal.circle}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-900 block">{isHindi ? 'संगठनात्मक कार्य' : 'Responsibilities'}</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {isHindi ? selectedLeaderModal.bioHi : selectedLeaderModal.bioEn}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Phone className="w-4 h-4 text-sky-600" />
                  <span>{selectedLeaderModal.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>{selectedLeaderModal.email}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
