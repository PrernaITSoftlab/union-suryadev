import express from 'express';

const router = express.Router();

// Get current active strike alert data
router.get('/current', (req, res) => {
  res.json({
    success: true,
    alert: {
      id: "STRIKE-2026-MP-01",
      is_active: true,
      priority: "CRITICAL",
      title: "अनिश्चितकालीन कामबंद आंदोलन - पुरानी पेंशन (OPS) एवं संविदा नियमितीकरण हेतु",
      strike_date: "15 अक्टूबर 2026",
      strike_time: "प्रातः 09:00 बजे से",
      venue: "समस्त वृत्त कार्यालय (Circle Offices) एवं डिस्कॉम मुख्यालय इंदौर/भोपाल",
      demands: [
        "1. 2004 के बाद नियुक्त समस्त विद्युत कर्मियों हेतु पुरानी पेंशन योजना (OPS) तुरंत बहाल की जावे।",
        "2. आउटसोर्स एवं संविदा लाइनमैनों का नियमित डिस्कॉम कैडर में समावेशन किया जावे।",
        "3. 33kV/11kV ग्रिड लाइन ड्यूटी के दौरान दुर्घटना में शहीद या गंभीर घायल कर्मचारियों को ₹20 लाख तात्कालिक राहत राशि।",
        "4. 7वें वेतन आयोग का बकाया महंगाई भत्ता (DA 4%) एरियर एकमुश्त जारी किया जावे।",
        "5. समस्त 53 जिलों में पदोन्नति रोस्टर (Backlog Promotion Roster) समयसीमा में पूर्ण किया जावे।"
      ],
      instructions: "समस्त वृत्त एवं संभाग अध्यक्षों को निर्देशित किया जाता है कि शांतिपूर्ण विरोध प्रदर्शन एवं 24x7 कंट्रोल रूम की ड्यूटी सुनिश्चित करें। आपातकालीन अस्पताल एवं पेयजल आपूर्ति लाइनों हेतु PTW परमिट नियमानुसार जारी रहेंगे।",
      helpline_contacts: [
        { circle: "इंदौर मुख्य कंट्रोल रूम", contact: "+91 94249 44041" },
        { circle: "उज्जैन एवं देवास संभाग", contact: "+91 83198 64691" },
        { circle: "भोपाल केंद्रीय सचिवालय", contact: "+91 94793 65273" }
      ],
      notice_doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  });
});

export default router;
