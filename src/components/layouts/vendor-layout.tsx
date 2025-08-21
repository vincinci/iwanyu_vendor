'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { VendorAuthGuard } from '@/components/auth/vendor-auth-guard'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Smartphone, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VendorLayoutProps {
  children: React.ReactNode
  vendorName?: string
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/vendor',
    icon: LayoutDashboard
  },
  {
    title: 'Products',
    href: '/vendor/products',
    icon: Package
  },
  {
    title: 'Orders',
    href: '/vendor/orders',
    icon: ShoppingCart
  },
  {
    title: 'Mobile Money',
    href: '/vendor/payouts',
    icon: Smartphone
  },
  {
    title: 'Messages',
    href: '/vendor/messages',
    icon: MessageSquare
  },
  {
    title: 'Settings',
    href: '/vendor/settings',
    icon: Settings
  }
]

export function VendorLayout({ children, vendorName = 'Vendor' }: VendorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Sign out from Supabase if authenticated
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.log('Supabase signout error (expected if not authenticated):', error)
    }
    
    // Clear local session data
    localStorage.removeItem('iwanyu_vendor_session')
    localStorage.removeItem('iwanyu_admin_session')
    
    // Redirect to login page
    router.push('/auth/vendor')
  }

  return (
    <VendorAuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center px-6 border-b border-gray-200">
            <Link href="/vendor" className="flex items-center">
              <div className="w-12 h-12 relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden absolute right-4"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {vendorName}
                </p>
                <p className="text-xs text-gray-500">Vendor Account</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              {/* Add notifications, user menu, etc. here */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
      </div>
    </VendorAuthGuard>
  )
}
