import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConnectionProvider } from './context/ConnectionContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import NetworkVisualization from './pages/NetworkVisualization';
import Members from './pages/Members';
import Opportunities from './pages/Opportunities';
import Events from './pages/Events';
import Contact from './pages/Contact';

// User Portal Pages
import Dashboard from './pages/Dashboard';
import ProfileEdit from './pages/ProfileEdit';
import Connections from './pages/Connections';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminOpportunities from './pages/AdminOpportunities';
import AdminEvents from './pages/AdminEvents';

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-slate-400">Verifying administrator rights...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Protected User Route Component
const ProtectedUserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-slate-400">Verifying session...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-navy-950 text-slate-100">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/network" element={<NetworkVisualization />} />
          <Route path="/members" element={<Members />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />

          {/* Member Portal Routes */}
          <Route path="/dashboard" element={<ProtectedUserRoute><Dashboard /></ProtectedUserRoute>} />
          <Route path="/profile/edit" element={<ProtectedUserRoute><ProfileEdit /></ProtectedUserRoute>} />
          <Route path="/connections" element={<ProtectedUserRoute><Connections /></ProtectedUserRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/admin/members" element={<ProtectedAdminRoute><AdminMembers /></ProtectedAdminRoute>} />
          <Route path="/admin/opportunities" element={<ProtectedAdminRoute><AdminOpportunities /></ProtectedAdminRoute>} />
          <Route path="/admin/events" element={<ProtectedAdminRoute><AdminEvents /></ProtectedAdminRoute>} />

          {/* Catch all fallback to home */}
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
        <ConnectionProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ConnectionProvider>
      </AuthProvider>
    </Router>
  );
}
