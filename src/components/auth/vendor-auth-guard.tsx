'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface VendorAuthGuardProps {
  children: React.ReactNode
}

export function VendorAuthGuard({ children }: VendorAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkVendorAuth = () => {
      const vendorSession = localStorage.getItem('iwanyu_vendor_session')
      const adminSession = localStorage.getItem('iwanyu_admin_session')
      
      if (vendorSession === 'true' || adminSession === 'true') {
        setIsAuthenticated(true)
      } else {
        // Redirect to login if not authenticated
        router.push('/auth/vendor')
        return
      }
      
      setIsLoading(false)
    }

    checkVendorAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-black font-bold text-2xl">I</span>
          </div>
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect, so don't render anything
  }

  return <>{children}</>
}
