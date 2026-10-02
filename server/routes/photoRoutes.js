import express from 'express';
import { inMemoryStore } from '../config/db.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initial Default Photos List
export const INITIAL_PHOTOS = [
  {
    id: 105,
    url: '/images/gallery/constitution-presentation-cgm-hr-bhopal.png',
    titleEn: 'Presenting a Copy of the Constitution of India to Chief General Manager (HR), Bhopal',
    titleHi: 'मुख्य महाप्रबंधक (HR) भोपाल को संविधान की प्रति भेंट करते हुए',
    category: 'Constitution',
    categoryLabel: 'Samvidhan Presentation',
    descriptionEn: 'Union delegation led by State President Er. Suryadev Jaysingh presenting a bound ceremonial copy of the Constitution of India (Bharat Ka Samvidhan) to the Chief General Manager (HR), MPMKVVCL Bhopal.',
    descriptionHi: 'संघ के प्रांतीय अध्यक्ष इंजी सूर्यदेव जयसिंह एवं प्रतिनिधिमंडल द्वारा मध्य क्षेत्र विद्युत वितरण कंपनी के मुख्य महाप्रबंधक (HR) भोपाल को भारत का संविधान ग्रंथ भेंट किया गया।',
    alt: 'Union leadership presenting Constitution of India book to Chief General Manager HR Bhopal',
    date: 'Sep 2026',
    tag: 'Samvidhan Presentation',
    created_at: new Date().toISOString()
  },
  {
    id: 101,
    url: '/images/gallery/discom-talks-news-clipping.png',
    titleEn: 'Discom & Union Historic Talks Agreement (Singaji Samachar)',
    titleHi: 'डिस्कॉम एवं संघ के बीच ऐतिहासिक वार्ता समझौता (सिंगाजी समाचार)',
    category: 'Delegation',
    categoryLabel: 'News & Press Releases',
    descriptionEn: 'Singaji Samachar news publication highlighting the successful historic negotiation between MP West Discom management and Union delegation.',
    descriptionHi: 'मध्य प्रदेश पश्चिम क्षेत्र डिस्कॉम प्रबंधन एवं संघ प्रतिनिधिमंडल के बीच 49 सूत्रीय मांगों पर बनी सहमति का समाचार पत्र कवरेज।',
    alt: 'Newspaper clipping of MP West Discom and Union 49-point historic agreement',
    date: 'Sep 2026',
    tag: 'Historic Agreement',
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    url: '/images/gallery/discom-management-meeting.jpg',
    titleEn: 'High-Level Discom Management Meeting',
    titleHi: 'उच्च स्तरीय डिस्कॉम प्रबंधन बैठक',
    category: 'Delegation',
    categoryLabel: 'Discom Delegations',
    descriptionEn: 'Union President Er. Suryadev Jaysingh & executive delegates holding high-level demand charter discussions with MP West Discom management.',
    descriptionHi: 'प्रांतीय अध्यक्ष इंजी सूर्यदेव जयसिंह एवं प्रतिनिधिमंडल डिस्कॉम मुख्यालय में प्रबंधन के साथ बैठक करते हुए।',
    alt: 'Er. Suryadev Jaysingh and union leadership seated at Discom conference meeting',
    date: 'Sep 2026',
    tag: 'Conference Room',
    created_at: new Date().toISOString()
  },
  {
    id: 103,
    url: '/images/gallery/union-discom-felicitation.png',
    titleEn: 'Management Reception & Floral Welcome',
    titleHi: 'प्रबंधन स्वागत एवं पुष्प गुच्छ भेंट',
    category: 'Felicitation',
    categoryLabel: 'Felicitations & Honors',
    descriptionEn: 'Union leaders felicitating Discom Executive with floral bouquet following successful 49-point agreement.',
    descriptionHi: 'सफल समझौते के पश्चात संघ पदाधिकारियों द्वारा डिस्कॉम प्रबंधन का स्वागत।',
    alt: 'Union leaders felicitating discom official with a flower bouquet in boardroom',
    date: 'Sep 2026',
    tag: 'Felicitation',
    created_at: new Date().toISOString()
  },
  {
    id: 104,
    url: '/images/gallery/union-historic-negotiation.png',
    titleEn: 'Union Delegate Council Bilateral Talks',
    titleHi: 'संघ प्रतिनिधि परिषद द्विपक्षीय वार्ता',
    category: 'Delegation',
    categoryLabel: 'Discom Delegations',
    descriptionEn: 'Full executive delegate council seated at Discom Conference Table during employee welfare negotiation.',
    descriptionHi: 'कर्मचारी कल्याण एवं अधिकारों हेतु आयोजित द्विपक्षीय बैठक।',
    alt: 'Union delegates and circle leaders seated around long conference table during talks',
    date: 'Sep 2026',
    tag: 'Delegation',
    created_at: new Date().toISOString()
  }
];

// Initialize inMemoryStore photos array if not present
if (!inMemoryStore.photos) {
  inMemoryStore.photos = [...INITIAL_PHOTOS];
}

// 1. Get Public Photos List
router.get('/list', optionalAuth, (req, res) => {
  const { category, search } = req.query;
  let list = inMemoryStore.photos || INITIAL_PHOTOS;

  if (category && category !== 'All') {
    list = list.filter(item => item.category === category);
  }

  if (search) {
    const term = search.toLowerCase();
    list = list.filter(item => 
      (item.titleEn && item.titleEn.toLowerCase().includes(term)) ||
      (item.titleHi && item.titleHi.toLowerCase().includes(term)) ||
      (item.descriptionEn && item.descriptionEn.toLowerCase().includes(term)) ||
      (item.descriptionHi && item.descriptionHi.toLowerCase().includes(term)) ||
      item.category.toLowerCase().includes(term)
    );
  }

  res.json({
    success: true,
    photos: list
  });
});

// 2. Admin: Upload New Photo
router.post('/admin/create', authenticateToken, requireAdmin, (req, res) => {
  const { titleEn, titleHi, category, descriptionEn, descriptionHi, image_url, tag, date } = req.body;

  if (!titleEn || !category || !image_url) {
    return res.status(400).json({ success: false, message: 'Photo Title (English), Category, and Image File/URL are required.' });
  }

  const newId = (inMemoryStore.photos ? inMemoryStore.photos.length : 0) + 201;

  const newPhoto = {
    id: newId,
    url: image_url.trim(),
    titleEn: titleEn.trim(),
    titleHi: (titleHi || titleEn).trim(),
    category: category.trim(),
    categoryLabel: category.trim(),
    descriptionEn: descriptionEn ? descriptionEn.trim() : titleEn.trim(),
    descriptionHi: descriptionHi ? descriptionHi.trim() : (titleHi || titleEn).trim(),
    alt: titleEn.trim(),
    date: date || 'Sep 2026',
    tag: tag || category.trim(),
    created_at: new Date().toISOString(),
    created_by: req.user.id
  };

  if (!inMemoryStore.photos) {
    inMemoryStore.photos = [...INITIAL_PHOTOS];
  }

  inMemoryStore.photos.unshift(newPhoto);

  // Add audit log
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'PHOTO_UPLOADED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'PHOTO_GALLERY',
    entity_id: String(newId),
    details: `Uploaded new Photo: ${newPhoto.titleEn}`,
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Photo uploaded successfully to union gallery.',
    photo: newPhoto
  });
});

// 3. Admin: Update Photo
router.put('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  const { titleEn, titleHi, category, descriptionEn, descriptionHi, image_url, tag, date } = req.body;
  const targetId = Number(req.params.id);

  if (!inMemoryStore.photos) {
    inMemoryStore.photos = [...INITIAL_PHOTOS];
  }

  const photoIndex = inMemoryStore.photos.findIndex(p => p.id === targetId);
  if (photoIndex === -1) {
    return res.status(404).json({ success: false, message: 'Photo not found.' });
  }

  const existing = inMemoryStore.photos[photoIndex];

  const updatedPhoto = {
    ...existing,
    url: image_url ? image_url.trim() : existing.url,
    titleEn: titleEn ? titleEn.trim() : existing.titleEn,
    titleHi: titleHi ? titleHi.trim() : existing.titleHi,
    category: category ? category.trim() : existing.category,
    categoryLabel: category ? category.trim() : existing.categoryLabel,
    descriptionEn: descriptionEn ? descriptionEn.trim() : existing.descriptionEn,
    descriptionHi: descriptionHi ? descriptionHi.trim() : existing.descriptionHi,
    tag: tag ? tag.trim() : existing.tag,
    date: date || existing.date,
    updated_at: new Date().toISOString(),
    updated_by: req.user.id
  };

  inMemoryStore.photos[photoIndex] = updatedPhoto;

  // Add audit log
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'PHOTO_UPDATED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'PHOTO_GALLERY',
    entity_id: String(targetId),
    details: `Updated Photo: ${updatedPhoto.titleEn}`,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Photo updated successfully.',
    photo: updatedPhoto
  });
});

// 4. Admin: Delete Photo
router.delete('/admin/:id', authenticateToken, requireAdmin, (req, res) => {
  const targetId = Number(req.params.id);

  if (!inMemoryStore.photos) {
    inMemoryStore.photos = [...INITIAL_PHOTOS];
  }

  const photoIndex = inMemoryStore.photos.findIndex(p => p.id === targetId);
  if (photoIndex === -1) {
    return res.status(404).json({ success: false, message: 'Photo not found.' });
  }

  const deleted = inMemoryStore.photos.splice(photoIndex, 1)[0];

  // Add audit log
  inMemoryStore.auditLogs.unshift({
    id: inMemoryStore.auditLogs.length + 1,
    action: 'PHOTO_DELETED',
    actor_id: req.user.id,
    actor_name: req.user.profile?.full_name || 'Admin',
    entity_type: 'PHOTO_GALLERY',
    entity_id: String(targetId),
    details: `Deleted Photo: ${deleted.titleEn || deleted.title}`,
    created_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Photo deleted successfully.'
  });
});

export default router;
