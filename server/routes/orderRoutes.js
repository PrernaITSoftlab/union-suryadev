import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initial Default Orders List
export const INITIAL_ORDERS = [
  {
    id: "ORD/MPVMAVAKS/2026/104",
    num_id: 1,
    titleEn: "MP Government Order: 7th Pay Commission DA 4% Revision & Backlog Arrears Payout Release Order",
    titleHi: "म.प्र. शासन आदेश: 7वें वेतन आयोग का 4% महंगाई भत्ता (DA) संशोधन एवं बकाया एरियर भुगतान आदेश।",
    date: "24/09/2026",
    category: "Govt. Circulars",
    doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "ORD/MPVMAVAKS/2026/089",
    num_id: 2,
    titleEn: "SC/ST Reservation Roster, Cadre Promotion Seniority & Backlog Vacancy Filling Directive",
    titleHi: "अनुसूचित जाति / जनजाति पदोन्नति रोस्टर, वरिष्ठता सूची एवं बैकलॉग पद पूर्ति निर्देश।",
    date: "12/09/2026",
    category: "SC/ST Circulars",
    doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "ORD/MPVMAVAKS/2026/072",
    num_id: 3,
    titleEn: "Normal Circular: Employee Annual Increment, CUG Mobile Allowance & Revised Leave Rules 2026",
    titleHi: "सामान्य परिपत्र: कर्मचारी वार्षिक वेतन वृद्धि, सीयूजी मोबाइल भत्ता एवं संशोधित अवकाश नियमावली 2026।",
    date: "28/08/2026",
    category: "Normal Circulars",
    doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "ORD/MPVMAVAKS/2026/058",
    num_id: 4,
    titleEn: "Notice: Annual Zonal Delegate Conference & Union Executive Representation Election Schedule",
    titleHi: "सूचना: वार्षिक ज़ोनल प्रतिनिधि सम्मेलन एवं संघ कार्यकारिणी चुनाव कार्यक्रम।",
    date: "15/08/2026",
    category: "Notices",
    doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "ORD/MPVMAVAKS/2026/044",
    num_id: 5,
    titleEn: "Mandatory 33kV & 11kV Line High-Voltage Field Safety & PTW (Permit-To-Work) Directive",
    titleHi: "33kV एवं 11kV लाइन उच्च-वोल्टेज फ़ील्ड सुरक्षा एवं परमिट-टू-वर्क (PTW) अनिवार्य निर्देश।",
    date: "02/07/2026",
    category: "Safety Directives",
    doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "ORD/MPVMAVAKS/2026/030",
    num_id: 6,
    titleEn: "Govt. Order: Discom Employee Group Cashless Health Insurance & Medical Reimbursement Slabs",
    titleHi: "शासकीय आदेश: डिस्कॉम कर्मचारी कैशलेस स्वास्थ्य बीमा एवं चिकित्सा प्रतिपूर्ति दरें।",
    date: "18/06/2026",
    category: "Govt. Circulars",
    doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "ORD/MPVMAVAKS/2026/015",
    num_id: 7,
    titleEn: "SC/ST Welfare Scheme, Children Higher Education Grant & Housing Assistance Circular",
    titleHi: "अजा/अजजा कल्याण योजना, बच्चों की उच्च शिक्षा अनुदान एवं आवास सहायता परिपत्र।",
    date: "05/05/2026",
    category: "SC/ST Circulars",
    doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "ORD/MPVMAVAKS/2025/112",
    num_id: 8,
    titleEn: "Normal Circular: Substation Operation Shift Roster, OT Allowance & Night Duty Standards",
    titleHi: "सामान्य परिपत्र: सबस्टेशन संचालन पाली रोस्टर, ओवरटाइम भत्ता एवं रात्रिकालीन ड्यूटी नियम।",
    date: "14/12/2025",
    category: "Normal Circulars",
    doc_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    created_at: new Date().toISOString()
  }
];

// Initialize inMemoryStore orders array if not present
if (!inMemoryStore.orders) {
  inMemoryStore.orders = [...INITIAL_ORDERS];
}

// 1. Get Public Orders List
router.get('/list', optionalAuth, (req, res) => {
  const { category, search } = req.query;
  let list = inMemoryStore.orders || INITIAL_ORDERS;

  if (category && category !== 'All') {
    list = list.filter(item => item.category === category);
  }

  if (search) {
    const term = search.toLowerCase();
    list = list.filter(item => 
      item.titleEn.toLowerCase().includes(term) ||
      (item.titleHi && item.titleHi.toLowerCase().includes(term)) ||
      item.id.toLowerCase().includes(term) ||
      item.date.includes(term)
    );
  }

  res.json({
    success: true,
    orders: list
  });
});

// 2. Admin: Create Notice / Circular Order
router.post('/admin/create', authenticateToken, requireAdmin, (req, res) => {
  const { titleEn, titleHi, category, date, doc_url } = req.body;

  if (!titleEn || !category || !doc_url) {
    return res.status(400).json({ success: false, message: 'Title (English), Category, and PDF Document are required.' });
  }

  const num_id = (inMemoryStore.orders ? inMemoryStore.orders.length : 0) + 1;
  const id = `ORD/MPVMAVAKS/${new Date().getFullYear()}/${String(num_id).padStart(3, '0')}`;

  const newOrder = {
    id,
    num_id,
    titleEn: titleEn.trim(),
    titleHi: (titleHi || titleEn).trim(),
    category: category.trim(),
    date: date || new Date().toLocaleDateString('en-GB'),
    doc_url: doc_url.trim(),
    created_at: new Date().toISOString(),
    created_by: req.user.id
  };

  if (!inMemoryStore.orders) {
    inMemoryStore.orders = [...INITIAL_ORDERS];
  }

  inMemoryStore.orders.unshift(newOrder);

  // Add audit log
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'NOTICE_ORDER_CREATED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'NOTICE_ORDER',
    entity_id: String(num_id),
    details: `Added new Notice/Circular: ${newOrder.titleEn}`,
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Notice / Circular Order created successfully with PDF document.',
    order: newOrder
  });
});

// 3. Admin: Update Notice / Circular Order
router.put('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  const { titleEn, titleHi, category, date, doc_url } = req.body;
  const targetId = req.params.id;

  if (!inMemoryStore.orders) {
    inMemoryStore.orders = [...INITIAL_ORDERS];
  }

  const orderIndex = inMemoryStore.orders.findIndex(o => String(o.id) === String(targetId) || String(o.num_id) === String(targetId));
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Notice / Circular Order not found.' });
  }

  const existing = inMemoryStore.orders[orderIndex];

  const updatedOrder = {
    ...existing,
    titleEn: titleEn ? titleEn.trim() : existing.titleEn,
    titleHi: titleHi ? titleHi.trim() : existing.titleHi,
    category: category ? category.trim() : existing.category,
    date: date || existing.date,
    doc_url: doc_url ? doc_url.trim() : existing.doc_url,
    updated_at: new Date().toISOString(),
    updated_by: req.user.id
  };

  inMemoryStore.orders[orderIndex] = updatedOrder;

  // Add audit log
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'NOTICE_ORDER_UPDATED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'NOTICE_ORDER',
    entity_id: String(existing.id),
    details: `Updated Notice/Circular: ${updatedOrder.titleEn}`,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Notice / Circular Order updated successfully.',
    order: updatedOrder
  });
});

// 4. Admin: Delete Notice / Circular Order
router.delete('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  const targetId = req.params.id;

  if (!inMemoryStore.orders) {
    inMemoryStore.orders = [...INITIAL_ORDERS];
  }

  const orderIndex = inMemoryStore.orders.findIndex(o => String(o.id) === String(targetId) || String(o.num_id) === String(targetId));
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Notice / Circular Order not found.' });
  }

  const deleted = inMemoryStore.orders.splice(orderIndex, 1)[0];

  // Add audit log
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'NOTICE_ORDER_DELETED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'NOTICE_ORDER',
    entity_id: String(deleted.id),
    details: `Deleted Notice/Circular: ${deleted.titleEn}`,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Notice / Circular Order deleted successfully.'
  });
});

export default router;
