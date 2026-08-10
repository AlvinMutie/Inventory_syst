import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './services/api';

// Storefront components & pages
import CustomerSidebar from './components/storefront/CustomerSidebar';
import CustomerMobileTopbar from './components/storefront/CustomerMobileTopbar';
import Footer from './components/storefront/Footer';
import Home from './pages/storefront/Home';
import Catalog from './pages/storefront/Catalog';
import ProductDetail from './pages/storefront/ProductDetail';

// Admin layout & pages
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSales from './pages/admin/AdminSales';
import AdminReports from './pages/admin/AdminReports';

// Public Layout Wrapper with Side Navigation Panel
function PublicLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState({ whatsapp_phone: '254700000000' });

  useEffect(() => {
    api.get('/public/store-info').then(res => setStoreInfo(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Side Navigation Panel */}
      <CustomerSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Area Offset on Desktop */}
      <div className="md:ml-72 flex-1 flex flex-col justify-between min-h-screen">
        <div>
          {/* Mobile Top Header */}
          <CustomerMobileTopbar onOpenMenu={() => setMobileOpen(true)} storeInfo={storeInfo} />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// Protected Route Guard for Admin
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xs font-bold animate-pulse">Loading Admin Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  // Secret Keyboard Shortcut: Ctrl + Shift + M (or Cmd + Shift + M) to open Admin Portal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        alert("🔒 Secret shortcut activated! Opening Admin Portal...");
        window.location.href = '/admin';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/products" element={<PublicLayout><Catalog /></PublicLayout>} />
          <Route path="/products/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />

          {/* Admin Auth Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
