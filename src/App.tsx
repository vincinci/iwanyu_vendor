import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SupabaseErrorBoundary } from '@/components/SupabaseErrorBoundary'

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'

// Vendor pages
import { VendorDashboard } from '@/pages/vendor/VendorDashboard'
import { VendorProducts } from '@/pages/vendor/VendorProducts'
import { VendorOrders } from '@/pages/vendor/VendorOrders'
import { VendorPayouts } from '@/pages/vendor/VendorPayouts'
import { VendorReports } from '@/pages/vendor/VendorReports'
import { VendorMessages } from '@/pages/vendor/VendorMessages'
import { VendorProfile } from '@/pages/vendor/VendorProfile'

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminVendors } from '@/pages/admin/AdminVendors'
import { AdminProducts } from '@/pages/admin/AdminProducts'
import { AdminOrders } from '@/pages/admin/AdminOrders'
import { AdminPayouts } from '@/pages/admin/AdminPayouts'
import { AdminReports } from '@/pages/admin/AdminReports'
import { AdminMessages } from '@/pages/admin/AdminMessages'
import { AdminSettings } from '@/pages/admin/AdminSettings'



function AppRoutes() {
  const { user, loading, userRole } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Vendor routes
  if (userRole === 'vendor') {
    return (
      <Routes>
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/payouts" element={<VendorPayouts />} />
        <Route path="/vendor/reports" element={<VendorReports />} />
        <Route path="/vendor/messages" element={<VendorMessages />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
        <Route path="*" element={<Navigate to="/vendor" replace />} />
      </Routes>
    )
  }

  // Admin routes
  if (userRole === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/payouts" element={<AdminPayouts />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    )
  }

  // Default redirect
  return <Navigate to="/login" replace />
}

function App() {
  return (
    <ErrorBoundary>
      <SupabaseErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SupabaseErrorBoundary>
    </ErrorBoundary>
  )
}

export default App