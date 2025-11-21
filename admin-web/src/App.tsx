// admin-web/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // ✅ OLD Dashboard (nếu có)
import DashboardAnalytics from './pages/Dashboard/Dashboard'; // ✅ NEW Dashboard Analytics
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Customers from './pages/Customers';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import WishlistManagement from './pages/Wishlist/WishlistManagement';
import AdminLayout from './components/layouts/AdminLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  const token = localStorage.getItem('adminToken');
  const userStr = localStorage.getItem('adminUser');
  
  console.log('🔐 ProtectedRoute Check:', {
    path: location.pathname,
    isAuthenticated,
    hasToken: !!token,
    hasUser: !!userStr,
  });
  
  const hasAccess = isAuthenticated || (token && userStr);
  
  if (!hasAccess) {
    console.log('❌ No auth, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  console.log('✅ Auth OK, rendering children');
  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    console.log('🚀 App mounted, checking auth...');
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          {/* ✅ FIX: Use DashboardAnalytics component */}
          <Route index element={<DashboardAnalytics />} />
          
          {/* Products */}
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          
          {/* Orders */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          
          {/* Categories & Brands */}
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          
          {/* Customers */}
          <Route path="customers" element={<Customers />} />
          
          {/* Reviews */}
          <Route path="reviews" element={<Reviews />} />
          
          {/* Wishlists */}
          <Route path="wishlists" element={<WishlistManagement />} />
          
          {/* Coupons */}
          <Route path="coupons" element={<Coupons />} />
          
          {/* Analytics */}
          <Route path="analytics" element={<Analytics />} />
          
          {/* Settings */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;