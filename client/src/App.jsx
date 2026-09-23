import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AnnouncementPopup from './components/AnnouncementPopup';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Contact from './pages/Contact';
import JoinNow from './pages/JoinNow';
import Login from './pages/Login';

// User & Admin Dashboards
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-slate-500 font-mono text-xs">Verifying administrator privileges...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

// Protected Member Route Component
const ProtectedMemberRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-slate-500 font-mono text-xs">Loading member account...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-slate-950 font-sans">
      <Navbar />
      
      {/* Top Announcement Popup Banner */}
      <AnnouncementPopup />

      <main className="flex-grow">
        <Routes>
          {/* Public Union Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/join" element={<JoinNow />} />
          <Route path="/login" element={<Login />} />

          {/* Member Protected Dashboard Route */}
          <Route path="/dashboard/*" element={<ProtectedMemberRoute><UserDashboard /></ProtectedMemberRoute>} />

          {/* Admin Protected Dashboard Route */}
          <Route path="/admin/*" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
