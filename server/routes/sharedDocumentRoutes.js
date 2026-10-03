import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 0. Get All Public Union Circulars & Forms (Base Root Route)
router.get('/', (req, res) => {
  const publicDocs = [
    {
      id: 1,
      title: "MP Govt. Order: 7th Pay Commission DA 4% Revision & Arrears Release",
      category: "Wage & Pension Orders",
      ref_no: "ORD/MPVMAVAKS/2026/104",
      description: "Official Gazette notification detailing DA 4% increase and retrospective backlog clearance for all electricity staff.",
      file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_type: "PDF",
      file_size: "2.4 MB",
      downloads_count: 342,
      uploader_name: "State Executive Secretariat"
    },
    {
      id: 2,
      title: "Mandatory High-Voltage Field Safety Protocols & PTW (Permit-To-Work) Rules",
      category: "Safety Protocols",
      ref_no: "ORD/MPVMAVAKS/2026/044",
      description: "Standard operating procedure for 33kV & 11kV feeder isolation, discharge earthing, and PTW sign-off.",
      file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_type: "PDF",
      file_size: "1.8 MB",
      downloads_count: 512,
      uploader_name: "Union Safety Cell"
    },
    {
      id: 3,
      title: "Union Digital Membership Application & Samvidhan Declaration Form 2026",
      category: "Membership Forms",
      ref_no: "FORM/MPVMAVAKS/2026/001",
      description: "Official printable membership application form for power line staff, engineers, and contract linemen.",
      file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_type: "PDF",
      file_size: "850 KB",
      downloads_count: 890,
      uploader_name: "Central Office Bhopal"
    },
    {
      id: 4,
      title: "Emergency Mutual Benefit Fund & Hazard Relief Claim Application Form",
      category: "Grievance Forms",
      ref_no: "FORM/MPVMAVAKS/2026/009",
      description: "Claim form for up to ₹20 Lakh emergency assistance in case of line accident injury or duty martyrdom.",
      file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_type: "PDF",
      file_size: "1.1 MB",
      downloads_count: 275,
      uploader_name: "Patron Secretariat"
    },
    {
      id: 5,
      title: "Indefinite Strike Agitation Bulletin & 10-Point Demand Charter",
      category: "Strike Bulletins",
      ref_no: "BULLETIN/MPVMAVAKS/2026/STRIKE",
      description: "Complete charter of demands including Old Pension Scheme (OPS) reinstatement and contract regularization.",
      file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_type: "PDF",
      file_size: "3.1 MB",
      downloads_count: 1240,
      uploader_name: "General Secretary Er. D. D. Ramteke"
    }
  ];
  res.json({ success: true, documents: publicDocs });
});

// 1. Send Private Document to Another Member
router.post('/share', authenticateToken, (req, res) => {

  const { recipient_id, title, message, file_url, file_name, file_type, file_size } = req.body;

  if (!recipient_id || !title || !file_url) {
    return res.status(400).json({ success: false, message: 'Recipient, Document Title, and File URL are required.' });
  }

  const recipient = inMemoryStore.users.find(u => u.id === Number(recipient_id));
  if (!recipient) {
    return res.status(404).json({ success: false, message: 'Recipient member not found.' });
  }

  const senderName = req.user.profile?.full_name || req.user.email;
  const recipientName = recipient.profile?.full_name || recipient.email;

  const newDoc = {
    id: inMemoryStore.sharedDocuments.length + 1,
    sender_id: req.user.id,
    sender_name: senderName,
    recipient_id: recipient.id,
    recipient_name: recipientName,
    title: title.trim(),
    message: message || '',
    file_url: file_url.trim(),
    file_name: file_name || 'Document.pdf',
    file_type: file_type || 'PDF',
    file_size: file_size || '1.5 MB',
    is_read: false,
    sent_at: new Date().toISOString()
  };

  inMemoryStore.sharedDocuments.unshift(newDoc);

  // Notify recipient
  inMemoryStore.notifications.unshift({
    id: inMemoryStore.notifications.length + 1,
    user_id: recipient.id,
    title: 'Private Document Shared With You',
    message: `${senderName} shared "${title}" with you.`,
    type: 'DOCUMENT',
    link: '/dashboard/documents',
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: `Document shared privately with ${recipientName}.`,
    document: newDoc
  });
});

// 2. Get "Shared With Me" (Inbox)
router.get('/inbox', authenticateToken, (req, res) => {
  const inbox = inMemoryStore.sharedDocuments.filter(d => d.recipient_id === req.user.id);
  res.json({
    success: true,
    documents: inbox
  });
});

// 3. Get "Sent By Me" (Outbox)
router.get('/sent', authenticateToken, (req, res) => {
  const sent = inMemoryStore.sharedDocuments.filter(d => d.sender_id === req.user.id);
  res.json({
    success: true,
    documents: sent
  });
});

// 4. Secure Get Document by ID (Authorization / IDOR Check)
router.get('/:id', authenticateToken, (req, res) => {
  const doc = inMemoryStore.sharedDocuments.find(d => d.id === Number(req.params.id));
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }

  // IDOR Protection: Must be sender, recipient, or admin
  const isSender = doc.sender_id === req.user.id;
  const isRecipient = doc.recipient_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isSender && !isRecipient && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied. You are not authorized to access this private document.' });
  }

  if (isRecipient && !doc.is_read) {
    doc.is_read = true;
  }

  res.json({
    success: true,
    document: doc
  });
});

export default router;
