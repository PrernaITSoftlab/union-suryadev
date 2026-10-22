import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import membershipApplicationRoutes from './routes/membershipApplicationRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import sharedDocumentRoutes from './routes/sharedDocumentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import strikeRoutes from './routes/strikeRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Route Mounts for Union Management System (mounted with /api/api, /api, and root prefix for total reliability)
const mountRoute = (pathPrefix, routeHandler) => {
  app.use(`/api/api${pathPrefix}`, routeHandler);
  app.use(`/api${pathPrefix}`, routeHandler);
  app.use(pathPrefix, routeHandler);
};

mountRoute('/auth', authRoutes);
mountRoute('/members', memberRoutes);
mountRoute('/membership-applications', membershipApplicationRoutes);
mountRoute('/events', eventRoutes);
mountRoute('/payments', paymentRoutes);
mountRoute('/announcements', announcementRoutes);
mountRoute('/notifications', notificationRoutes);
mountRoute('/stories', storyRoutes);
mountRoute('/documents', sharedDocumentRoutes);
mountRoute('/contact', contactRoutes);
mountRoute('/settings', settingsRoutes);
mountRoute('/admin', adminRoutes);
mountRoute('/orders', orderRoutes);
mountRoute('/photos', photoRoutes);
mountRoute('/strike', strikeRoutes);
mountRoute('/opportunities', opportunityRoutes);

// Health check endpoint (all paths)
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    app: 'MPVMAVAKS Union Official API Platform',
    organization: 'Madhya Pradesh West Zone Electricity Distribution Company Union',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/api/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ MPVMAVAKS Union API Server running on port ${PORT}`);
  console.log(`🌐 Health check available at: http://127.0.0.1:${PORT}/api/health`);
});
