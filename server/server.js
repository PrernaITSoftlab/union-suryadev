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
import chatRoutes from './routes/chatRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Origin authorization logic
const defaultOrigins = [
  'https://mpvmavaks.in',
  'https://www.mpvmavaks.in',
  'http://mpvmavaks.in',
  'http://www.mpvmavaks.in',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

const envOrigins = (process.env.ALLOWED_ORIGINS || 'https://mpvmavaks.in')
  .split(',')
  .map(o => o.trim().replace(/^["']|["']$/g, ''))
  .filter(Boolean);

const allowedOriginsSet = new Set([...defaultOrigins, ...envOrigins]);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow same-origin, curl, server-to-server, mobile apps
  if (allowedOriginsSet.has(origin)) return true;
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname;
    // Explicitly allow mpvmavaks.in and all subdomains (e.g. www.mpvmavaks.in, api.mpvmavaks.in)
    if (host === 'mpvmavaks.in' || host.endsWith('.mpvmavaks.in')) return true;
    // Allow local development and LAN IP testing
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
    if (/^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) || host.endsWith('.local')) return true;
    if (host.endsWith('.vercel.app') || host.endsWith('.onrender.com')) return true;
  } catch (_) {}
  return true; // Fallback permit in development
};

// Enable CORS with full support for mpvmavaks.in, localhost, LAN, Vercel, and Chrome Private Network Access
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  const reqHeaders = req.headers['access-control-request-headers'];
  res.header('Access-Control-Allow-Headers', reqHeaders || 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, Access-Control-Request-Private-Network, *');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  if (req.headers['access-control-request-private-network']) {
    res.header('Access-Control-Allow-Private-Network', 'true');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', 'Access-Control-Request-Private-Network', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  maxAge: 86400
}));
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
mountRoute('/chat', chatRoutes);
mountRoute('/board', boardRoutes);

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

// Keep process resilient against transient unhandled database rejections or connection drops
process.on('unhandledRejection', (reason) => {
  console.warn('⚠️ Handled rejection (server kept alive):', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught exception (server kept alive):', err?.message || err);
});

// Listen on dual-stack IPv6 (::) and IPv4 (0.0.0.0/127.0.0.1)
const server = app.listen(PORT, () => {
  console.log(`⚡ MPVMAVAKS Union API Server running on port ${PORT}`);
  console.log(`🌐 Health check available at: http://localhost:${PORT}/api/health and http://127.0.0.1:${PORT}/api/health`);
});

server.on('error', (err) => {
  console.error(`❌ Server failed to bind to port ${PORT}:`, err.message);
});
