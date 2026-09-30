import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AnnouncementPopup from './components/AnnouncementPopup';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import BoardOfUnion from './pages/BoardOfUnion';
import Orders from './pages/Orders';
import Events from './pages/Events';
import Notices from './pages/Notices';
import Contact from './pages/Contact';
import EnergyDepartment from './pages/EnergyDepartment';
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
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white font-sans overflow-x-hidden w-full max-w-full">
      <Navbar />
      
      {/* Top Announcement Popup Banner */}
      <AnnouncementPopup />

      <main className="flex-grow">
        <Routes>
          {/* Public Union Routes with Unique Webpages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/board-of-union" element={<BoardOfUnion />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/events" element={<Events />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/energy-department" element={<EnergyDepartment />} />
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
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
