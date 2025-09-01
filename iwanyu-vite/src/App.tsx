
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Pages
import { LandingPage } from './pages/auth/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Vendor Pages
import { VendorDashboard } from './pages/vendor/Dashboard';
import { VendorProducts } from './pages/vendor/Products';
import { VendorOrders } from './pages/vendor/Orders';
import { VendorPayouts } from './pages/vendor/Payouts';
import { VendorReports } from './pages/vendor/Reports';
import { VendorMessages } from './pages/vendor/Messages';
import { VendorProfile } from './pages/vendor/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminVendors } from './pages/admin/Vendors';
import { AdminProducts } from './pages/admin/Products';
import { AdminOrders } from './pages/admin/Orders';
import { AdminPayouts } from './pages/admin/Payouts';
import { AdminReports } from './pages/admin/Reports';
import { AdminMessages } from './pages/admin/Messages';
import { AdminSettings } from './pages/admin/Settings';

// Error Pages
import { NotFoundPage } from './pages/error/NotFoundPage';
import { UnauthorizedPage } from './pages/error/UnauthorizedPage';
import { ForbiddenPage } from './pages/error/ForbiddenPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Vendor Routes */}
              <Route path="/vendor" element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <Navigate to="/vendor/dashboard" replace />
                </ProtectedRoute>
              } />
              <Route path="/vendor/dashboard" element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/vendor/products" element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorProducts />
                </ProtectedRoute>
              } />
              <Route path="/vendor/orders" element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorOrders />
                </ProtectedRoute>
              } />
              <Route path="/vendor/payouts" element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorPayouts />
                </ProtectedRoute>
              } />
              <Route path="/vendor/reports" element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorReports />
                </ProtectedRoute>
              } />
              <Route path="/vendor/messages" element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorMessages />
                </ProtectedRoute>
              } />
              <Route path="/vendor/profile" element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorProfile />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/vendors" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVendors />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProducts />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/payouts" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPayouts />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              } />
              <Route path="/admin/messages" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMessages />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />

              {/* Error Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/forbidden" element={<ForbiddenPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;