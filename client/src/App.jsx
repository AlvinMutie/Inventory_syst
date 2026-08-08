import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Storefront components & pages
import Navbar from './components/storefront/Navbar';
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

// Public Layout Wrapper
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <Footer />
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
