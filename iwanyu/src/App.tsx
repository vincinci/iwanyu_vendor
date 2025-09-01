import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import './App.css'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => ({
      Component: (await import('./pages/Auth')).AuthPage,
    }),
  },
  {
    path: '/vendor',
    lazy: async () => ({
      Component: (await import('./pages/vendor/VendorLayout')).VendorLayout,
    }),
    children: [
      { index: true, lazy: async () => ({ Component: (await import('./pages/vendor/Home')).VendorHome }) },
      { path: 'products', lazy: async () => ({ Component: (await import('./pages/vendor/Products')).VendorProducts }) },
      { path: 'orders', lazy: async () => ({ Component: (await import('./pages/vendor/Orders')).VendorOrders }) },
      { path: 'payouts', lazy: async () => ({ Component: (await import('./pages/vendor/Payouts')).VendorPayouts }) },
      { path: 'reports', lazy: async () => ({ Component: (await import('./pages/vendor/Reports')).VendorReports }) },
      { path: 'messages', lazy: async () => ({ Component: (await import('./pages/vendor/Messages')).VendorMessages }) },
      { path: 'profile', lazy: async () => ({ Component: (await import('./pages/vendor/Profile')).VendorProfile }) },
    ],
  },
  {
    path: '/admin',
    lazy: async () => ({
      Component: (await import('./pages/admin/AdminLayout')).AdminLayout,
    }),
    children: [
      { index: true, lazy: async () => ({ Component: (await import('./pages/admin/Home')).AdminHome }) },
      { path: 'vendors', lazy: async () => ({ Component: (await import('./pages/admin/Vendors')).AdminVendors }) },
      { path: 'products', lazy: async () => ({ Component: (await import('./pages/admin/Products')).AdminProducts }) },
      { path: 'orders', lazy: async () => ({ Component: (await import('./pages/admin/Orders')).AdminOrders }) },
      { path: 'payouts', lazy: async () => ({ Component: (await import('./pages/admin/Payouts')).AdminPayouts }) },
      { path: 'reports', lazy: async () => ({ Component: (await import('./pages/admin/Reports')).AdminReports }) },
      { path: 'messages', lazy: async () => ({ Component: (await import('./pages/admin/Messages')).AdminMessages }) },
      { path: 'settings', lazy: async () => ({ Component: (await import('./pages/admin/Settings')).AdminSettings }) },
      { path: 'profile', lazy: async () => ({ Component: (await import('./pages/admin/Profile')).AdminProfile }) },
    ],
  },
  { path: '/401', lazy: async () => ({ Component: (await import('./pages/status/401')).Status401 }) },
  { path: '/403', lazy: async () => ({ Component: (await import('./pages/status/403')).Status403 }) },
  { path: '/404', lazy: async () => ({ Component: (await import('./pages/status/404')).Status404 }) },
  { path: '*', lazy: async () => ({ Component: (await import('./pages/status/404')).Status404 }) },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
