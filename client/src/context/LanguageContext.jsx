import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  // Navigation & General
  "Home": { en: "Home", hi: "मुख्य पृष्ठ" },
  "About Us": { en: "About Us", hi: "हमारे बारे में" },
  "Notices": { en: "Notices", hi: "सूचनाएं" },
  "Order": { en: "Order", hi: "आदेश" },
  "Board of Union": { en: "Board of Union", hi: "संघ मंडल" },
  "Energy Department": { en: "Energy Department", hi: "ऊर्जा विभाग" },
  "Events": { en: "Events", hi: "कार्यक्रम" },
  "Contact Us": { en: "Contact Us", hi: "संपर्क करें" },
  "Join Now": { en: "Join Now", hi: "सदस्य बनें" },
  "JOIN UNION NOW": { en: "JOIN UNION NOW", hi: "यूनियन से जुड़ें" },
  "Login": { en: "Login", hi: "लॉगिन" },
  "MEMBER LOGIN": { en: "MEMBER LOGIN", hi: "सदस्य लॉगिन" },
  "Admin Portal": { en: "Admin Portal", hi: "एडमिन पोर्टल" },
  "Member Dashboard": { en: "Member Dashboard", hi: "सदस्य डैशबोर्ड" },
  "Dashboard Hub": { en: "Dashboard Hub", hi: "डैशबोर्ड हब" },
  "My Profile": { en: "My Profile", hi: "मेरी प्रोफ़ाइल" },
  "System Settings": { en: "System Settings", hi: "सिस्टम सेटिंग्स" },
  "Sign Out": { en: "Sign Out", hi: "साइन आउट" },
  "Notifications": { en: "Notifications", hi: "सूचनाएं" },
  "Mark all read": { en: "Mark all read", hi: "सभी पढ़ें" },
  "No notifications yet.": { en: "No notifications yet.", hi: "अभी कोई सूचना नहीं है।" },
  "Western Zone Electricity Discom": { en: "Western Zone Electricity Discom", hi: "पश्चिम क्षेत्र विद्युत वितरण कंपनी" },

  // Hero Section & Home Page
  "Madhya Pradesh West Zone Discom Employees Union": {
    en: "Madhya Pradesh West Zone Discom Employees Union",
    hi: "मध्य प्रदेश पश्चिम क्षेत्र डिस्कॉम कर्मचारी संघ"
  },
  "Uniting Power Engineers & Field Staff for": {
    en: "Uniting Power Engineers & Field Staff for",
    hi: "विद्युत इंजीनियरों और क्षेत्रीय कर्मचारियों का संगठन"
  },
  "Safety, Dignity & Rights": {
    en: "Safety, Dignity & Rights",
    hi: "सुरक्षा, सम्मान और अधिकार"
  },
  "Empowering over 15,000+ electricity personnel across Indore, Ujjain, Dewas, Ratlam, Dhar, Khargone, Khandwa, Mandsaur, and Neemch discom circles with legal guidance, wage protection, OPS agitation, and hazard insurance.": {
    en: "Empowering over 15,000+ electricity personnel across Indore, Ujjain, Dewas, Ratlam, Dhar, Khargone, Khandwa, Mandsaur, and Neemch discom circles with legal guidance, wage protection, OPS agitation, and hazard insurance.",
    hi: "इंदौर, उज्जैन, देवास, रतलाम, धार, खरगोन, खंडवा, मंदसौर और नीमच डिस्कॉम सर्किलों के 15,000+ विद्युत कर्मियों को कानूनी मार्गदर्शन, वेतन सुरक्षा, ओपीएस आंदोलन और जोखिम बीमा से सशक्त बनाना।"
  },
  "Legal & OPS Rights": { en: "Legal & OPS Rights", hi: "कानूनी व ओपीएस अधिकार" },
  "₹20L Hazard Relief": { en: "₹20L Hazard Relief", hi: "₹20 लाख जोखिम राहत" },
  "Digital Member ID": { en: "Digital Member ID", hi: "डिजिटल सदस्य आईडी" },
  "Discom Members": { en: "Discom Members", hi: "डिस्कॉम सदस्य" },
  "Union Member": { en: "Union Member", hi: "यूनियन सदस्य" },
  "MP West Zone": { en: "MP West Zone", hi: "म.प्र. पश्चिम क्षेत्र" },
  "Digital QR Join": { en: "Digital QR Join", hi: "डिजिटल क्यूआर पंजीकरण" },

  // Home Page Features & Sections
  "Important Union Announcements": { en: "Important Union Announcements", hi: "महत्वपूर्ण यूनियन घोषणाएं" },
  "Latest notifications, gazette orders, and strike bulletins": {
    en: "Latest notifications, gazette orders, and strike bulletins",
    hi: "नवीनतम सूचनाएं, राजपत्र आदेश और हड़ताल बुलेटिन"
  },
  "View All Notices": { en: "View All Notices", hi: "सभी सूचनाएं देखें" },
  "Why Join Us": { en: "Why Join Us", hi: "हमसे क्यों जुड़ें" },
  "Protecting Every Lineman, Engineer & Staff Member": {
    en: "Protecting Every Lineman, Engineer & Staff Member",
    hi: "हर लाइनमैन, इंजीनियर और कर्मचारी की सुरक्षा"
  },
  "MPWZ Union provides a unified institutional voice to ensure physical safety, wage progression, pension security, and mutual employee relief.": {
    en: "MPWZ Union provides a unified institutional voice to ensure physical safety, wage progression, pension security, and mutual employee relief.",
    hi: "एमपीडब्ल्यूजेड संघ शारीरिक सुरक्षा, वेतन वृद्धि, पेंशन सुरक्षा और कर्मचारियों की सहायता सुनिश्चित करने के लिए एक एकीकृत आवाज प्रदान करता है।"
  },
  "Field Safety Protocols": { en: "Field Safety Protocols", hi: "फ़ील्ड सुरक्षा नियम" },
  "Mandatory Permit-To-Work (PTW) rules, insulated high-voltage gear, and earthing discharge rod standards for 33kV & 11kV lines.": {
    en: "Mandatory Permit-To-Work (PTW) rules, insulated high-voltage gear, and earthing discharge rod standards for 33kV & 11kV lines.",
    hi: "33kV और 11kV लाइनों के लिए परमिट-टू-वर्क (PTW) नियम, इंसुलेटेड उच्च-वोल्टेज गियर और अर्थिंग डिस्चार्ज छड़ मानक।"
  },
  "Wage & Grade Pay": { en: "Wage & Grade Pay", hi: "वेतन एवं ग्रेड पे" },
  "Advocating 7th Pay Commission arrears, Dearness Allowance (DA) revisions, and prompt pay anomaly rectification.": {
    en: "Advocating 7th Pay Commission arrears, Dearness Allowance (DA) revisions, and prompt pay anomaly rectification.",
    hi: "7वें वेतन आयोग के बकाए, महंगाई भत्ते (DA) में संशोधन और वेतन विसंगतियों के त्वरित निवारण का समर्थन।"
  },
  "Contract Regularization": { en: "Contract Regularization", hi: "संविदा नियमितीकरण" },
  "Strong legal advocate for absorbing outsource & contract linemen into regular discom cadres with pension rights.": {
    en: "Strong legal advocate for absorbing outsource & contract linemen into regular discom cadres with pension rights.",
    hi: "आउटसोर्स और संविदा लाइनमैनों को पेंशन अधिकारों के साथ नियमित डिस्कॉम कैडर में शामिल करने का मजबूत कानूनी समर्थन।"
  },
  "Mutual Benefit Fund": { en: "Mutual Benefit Fund", hi: "पारस्परिक लाभ कोष" },
  "Emergency financial relief of up to ₹20 Lakhs for families of linemen injured or deceased during electrical grid duty.": {
    en: "Emergency financial relief of up to ₹20 Lakhs for families of linemen injured or deceased during electrical grid duty.",
    hi: "ग्रिड ड्यूटी के दौरान घायल या मृत लाइनमैन के परिवारों के लिए ₹20 लाख तक की आपातकालीन वित्तीय सहायता।"
  },
  "Official Photo Highlights": { en: "Official Photo Highlights", hi: "आधिकारिक फोटो की झलकियां" },
  "Union Activities & Delegation Gallery": { en: "Union Activities & Delegation Gallery", hi: "यूनियन गतिविधियां और प्रतिनिधिमंडल गैलरी" },
  "Empirical moments of MPWZ Union leadership engaging discom management, celebrating employee honors, and advocating for power engineers & linemen.": {
    en: "Empirical moments of MPWZ Union leadership engaging discom management, celebrating employee honors, and advocating for power engineers & linemen.",
    hi: "एमपीडब्ल्यूजेड संघ के नेतृत्व द्वारा डिस्कॉम प्रबंधन के साथ जुड़ाव, कर्मचारी सम्मान उत्सव और विद्युत इंजीनियरों व लाइनमैनों के अधिकारों की वकालत के पल।"
  },
  "Upcoming Union Events & Conventions": { en: "Upcoming Union Events & Conventions", hi: "आगामी यूनियन कार्यक्रम और सम्मेलन" },
  "Conventions, safety workshops, and zonal delegate meetings": {
    en: "Conventions, safety workshops, and zonal delegate meetings",
    hi: "सम्मेलन, सुरक्षा कार्यशालाएं और ज़ोनल प्रतिनिधि बैठकें"
  },
  "Browse All Events": { en: "Browse All Events", hi: "सभी कार्यक्रम देखें" },
  "Discom HQ Notice": { en: "Discom HQ Notice", hi: "डिस्कॉम मुख्यालय सूचना" },
  "Active Union Notice": { en: "Active Union Notice", hi: "सक्रिय यूनियन सूचना" },
  "INDEFINITE STRIKE AGITATION": { en: "INDEFINITE STRIKE AGITATION", hi: "अनिश्चितकालीन हड़ताल आंदोलन" },
  "Demand for Old Pension Scheme (OPS), regularization of contract linemen, and ₹20 Lakh accident relief.": {
    en: "Demand for Old Pension Scheme (OPS), regularization of contract linemen, and ₹20 Lakh accident relief.",
    hi: "पुरानी पेंशन योजना (OPS), संविदा लाइनमैनों के नियमितीकरण और ₹20 लाख दुर्घटना राहत की मांग।"
  },
  "View Full Charter of Demands": { en: "View Full Charter of Demands", hi: "मांगों का पूर्ण चार्टर देखें" },
  "Membership Registration": { en: "Membership Registration", hi: "सदस्यता पंजीकरण" },
  "Scan QR & Join": { en: "Scan QR & Join", hi: "क्यूआर स्कैन कर जुड़ें" },

  // Footer
  "Quick Navigation": { en: "Quick Navigation", hi: "त्वरित नेविगेशन" },
  "Home Page": { en: "Home Page", hi: "मुख्य पृष्ठ" },
  "About Union & Leadership": { en: "About Union & Leadership", hi: "संघ और नेतृत्व के बारे में" },
  "Upcoming Events & Agitations": { en: "Upcoming Events & Agitations", hi: "आगामी कार्यक्रम और आंदोलन" },
  "Apply for Membership (Join Now)": { en: "Apply for Membership (Join Now)", hi: "सदस्यता के लिए आवेदन करें (अभी जुड़ें)" },
  "Contact Office": { en: "Contact Office", hi: "संपर्क कार्यालय" },
  "Member & Admin Portal Login": { en: "Member & Admin Portal Login", hi: "सदस्य व एडमिन पोर्टल लॉगिन" },
  "Central Office": { en: "Central Office", hi: "केंद्रीय कार्यालय" },
  "Union Helpline & QR": { en: "Union Helpline & QR", hi: "यूनियन हेल्पलाइन व क्यूआर" },
  "UPI Registration & Event Payments QR active 24/7. Contact WhatsApp support for verification assistance.": {
    en: "UPI Registration & Event Payments QR active 24/7. Contact WhatsApp support for verification assistance.",
    hi: "यूपीआई पंजीकरण और इवेंट भुगतान क्यूआर 24/7 सक्रिय है। सत्यापन सहायता के लिए व्हाट्सएप सपोर्ट से संपर्क करें।"
  },
  "All rights reserved.": { en: "All rights reserved.", hi: "सर्वाधिकार सुरक्षित।" },
  "Terms of Service": { en: "Terms of Service", hi: "सेवा की शर्तें" },
  "Privacy Policy": { en: "Privacy Policy", hi: "गोपनीयता नीति" },
  "Lineman Safety Manual": { en: "Lineman Safety Manual", hi: "लाइनमैन सुरक्षा मैनुअल" },

  // About Page
  "About MPWZ Discom Employees Union": { en: "About MPWZ Discom Employees Union", hi: "म.प्र. पश्चिम क्षेत्र डिस्कॉम कर्मचारी संघ के बारे में" },
  "Empowering 15,000+ power sector personnel across 9 discom circles in Madhya Pradesh.": {
    en: "Empowering 15,000+ power sector personnel across 9 discom circles in Madhya Pradesh.",
    hi: "मध्य प्रदेश के 9 डिस्कॉम सर्किलों में 15,000+ विद्युत क्षेत्र के कर्मियों को सशक्त बनाना।"
  },
  "Our Core Mission": { en: "Our Core Mission", hi: "हमारा मुख्य उद्देश्य" },
  "To protect line staff and power engineers from hazardous working conditions, secure fair wages, agitate for Old Pension Scheme (OPS), and deliver instant emergency relief to families of martyrs of electricity grid maintenance.": {
    en: "To protect line staff and power engineers from hazardous working conditions, secure fair wages, agitate for Old Pension Scheme (OPS), and deliver instant emergency relief to families of martyrs of electricity grid maintenance.",
    hi: "लाइन स्टाफ और पावर इंजीनियरों को खतरनाक कामकाजी परिस्थितियों से बचाना, उचित वेतन सुरक्षित करना, पुरानी पेंशन योजना (OPS) के लिए आंदोलन करना और विद्युत ग्रिड रखरखाव के शहीदों के परिवारों को तत्काल आपातकालीन सहायता प्रदान करना।"
  },
  "Key Union Pillars": { en: "Key Union Pillars", hi: "संघ के मुख्य स्तंभ" },
  "Legal Defense & PTW Rights": { en: "Legal Defense & PTW Rights", hi: "कानूनी रक्षा और पीटीडब्ल्यू अधिकार" },
  "Pension & Wage Security": { en: "Pension & Wage Security", hi: "पेंशन एवं वेतन सुरक्षा" },
  "Accident & Hazard Fund": { en: "Accident & Hazard Fund", hi: "दुर्घटना एवं जोखिम कोष" },
  "Union Executive Leadership": { en: "Union Executive Leadership", hi: "संघ का कार्यकारी नेतृत्व" },

  // Events Page
  "Union Events, Notices & Agitations": { en: "Union Events, Notices & Agitations", hi: "संघ के कार्यक्रम, सूचनाएं और आंदोलन" },
  "Stay informed on strike calls, gazette notifications, safety rallies, and zonal delegate conventions.": {
    en: "Stay informed on strike calls, gazette notifications, safety rallies, and zonal delegate conventions.",
    hi: "हड़ताल की घोषणाओं, राजपत्र अधिसूचनाओं, सुरक्षा रैलियों और ज़ोनल प्रतिनिधि सम्मेलनों से अवगत रहें।"
  },
  "All Notices": { en: "All Notices", hi: "सभी सूचनाएं" },
  "Strike Agitation": { en: "Strike Agitation", hi: "हड़ताल आंदोलन" },
  "General Notice": { en: "General Notice", hi: "सामान्य सूचना" },
  "Gazette Order": { en: "Gazette Order", hi: "राजपत्र आदेश" },
  "Search notices & events...": { en: "Search notices & events...", hi: "सूचनाएं और कार्यक्रम खोजें..." },
  "Register for Event": { en: "Register for Event", hi: "कार्यक्रम के लिए पंजीकरण करें" },

  // Contact Page
  "Get in Touch with Central Union Office": { en: "Get in Touch with Central Union Office", hi: "केंद्रीय संघ कार्यालय से संपर्क करें" },
  "Have questions regarding membership, PTW safety complaints, OPS campaign, or emergency hazard relief? Reach out to our central secretariat.": {
    en: "Have questions regarding membership, PTW safety complaints, OPS campaign, or emergency hazard relief? Reach out to our central secretariat.",
    hi: "सदस्यता, PTW सुरक्षा शिकायतों, OPS अभियान, या आपातकालीन जोखिम राहत के संबंध में प्रश्न हैं? हमारे केंद्रीय सचिवालय से संपर्क करें।"
  },
  "Central Secretariat HQ": { en: "Central Secretariat HQ", hi: "केंद्रीय सचिवालय मुख्यालय" },
  "Phone Helpline": { en: "Phone Helpline", hi: "फोन हेल्पलाइन" },
  "Email Support": { en: "Email Support", hi: "ईमेल सहायता" },
  "Send us a Message": { en: "Send us a Message", hi: "हमें संदेश भेजें" },
  "Full Name": { en: "Full Name", hi: "पूरा नाम" },
  "Mobile Number": { en: "Mobile Number", hi: "मोबाइल नंबर" },
  "Email Address": { en: "Email Address", hi: "ईमेल पता" },
  "Subject": { en: "Subject", hi: "विषय" },
  "Message": { en: "Message", hi: "संदेश" },
  "Submit Message": { en: "Submit Message", hi: "संदेश भेजें" },

  // Join Now Page
  "Apply for Union Membership": { en: "Apply for Union Membership", hi: "संघ की सदस्यता के लिए आवेदन करें" },
  "Join over 15,000+ power engineers and field line staff. Get official digital QR Member ID, legal defense, and hazard relief coverage.": {
    en: "Join over 15,000+ power engineers and field line staff. Get official digital QR Member ID, legal defense, and hazard relief coverage.",
    hi: "15,000+ से अधिक पावर इंजीनियरों और फ़ील्ड लाइन स्टाफ से जुड़ें। आधिकारिक डिजिटल क्यूआर सदस्य आईडी, कानूनी रक्षा और जोखिम राहत कवरेज प्राप्त करें।"
  },
  "Step 1: Personal & Service Details": { en: "Step 1: Personal & Service Details", hi: "चरण 1: व्यक्तिगत और सेवा विवरण" },
  "Step 2: Discom Posting & Circle": { en: "Step 2: Discom Posting & Circle", hi: "चरण 2: डिस्कॉम पोस्टिंग और सर्कल" },
  "Step 3: Payment Verification & Submit": { en: "Step 3: Payment Verification & Submit", hi: "चरण 3: भुगतान सत्यापन और सबमिट" },
  "Employee Code / Samagra ID": { en: "Employee Code / Samagra ID", hi: "कर्मचारी कोड / समग्र आईडी" },
  "Discom Circle": { en: "Discom Circle", hi: "डिस्कॉम सर्कल" },
  "Designation / Cadre": { en: "Designation / Cadre", hi: "पद / कैडर" },
  "Upload Payment Screenshot": { en: "Upload Payment Screenshot", hi: "भुगतान स्क्रीनशॉट अपलोड करें" },
  "Transaction Reference Number (UTR)": { en: "Transaction Reference Number (UTR)", hi: "ट्रांजैक्शन संदर्भ संख्या (UTR)" },
  "Complete Registration": { en: "Complete Registration", hi: "पंजीकरण पूरा करें" },

  // Login Page
  "Union Member & Admin Login": { en: "Union Member & Admin Login", hi: "संघ सदस्य और एडमिन लॉगिन" },
  "Enter your registered email address and password to access member services or administrative control panel.": {
    en: "Enter your registered email address and password to access member services or administrative control panel.",
    hi: "सदस्य सेवाओं या प्रशासनिक नियंत्रण पैनल तक पहुंचने के लिए अपना पंजीकृत ईमेल पता और पासवर्ड दर्ज करें।"
  },
  "Password": { en: "Password", hi: "पासवर्ड" },
  "Forgot Password?": { en: "Forgot Password?", hi: "पासवर्ड भूल गए?" },
  "Sign In": { en: "Sign In", hi: "साइन इन करें" },

  // Dashboards
  "Welcome back": { en: "Welcome back", hi: "आपका स्वागत है" },
  "Member Status": { en: "Member Status", hi: "सदस्य स्थिति" },
  "Verified Active Member": { en: "Verified Active Member", hi: "सत्यापित सक्रिय सदस्य" },
  "Digital ID Card": { en: "Digital ID Card", hi: "डिजिटल आईडी कार्ड" },
  "Download ID Card": { en: "Download ID Card", hi: "आईडी कार्ड डाउनलोड करें" },
  "Recent Announcements": { en: "Recent Announcements", hi: "हाल की घोषणाएं" },
  "Total Members": { en: "Total Members", hi: "कुल सदस्य" },
  "Pending Verifications": { en: "Pending Verifications", hi: "लंबित सत्यापन" }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key, fallback) => {
    if (!key) return '';
    const item = translations[key];
    if (item && item[language]) {
      return item[language];
    }
    if (language === 'hi' && fallback && typeof fallback === 'object' && fallback.hi) {
      return fallback.hi;
    }
    return (fallback && typeof fallback === 'string') ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isHindi: language === 'hi' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
