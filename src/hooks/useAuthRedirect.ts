'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthRedirect() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // If user is not authenticated and trying to access protected routes
    if (!user) {
      if (pathname.startsWith('/vendor') || pathname.startsWith('/admin')) {
        router.push('/auth')
        return
      }
      return
    }

    // If user is authenticated but no profile (shouldn't happen, but safety check)
    if (!profile) {
      router.push('/auth')
      return
    }

    // Role-based routing
    if (profile.role === 'vendor') {
      // If vendor tries to access admin routes
      if (pathname.startsWith('/admin')) {
        router.push('/vendor/dashboard')
        return
      }
      
      // If vendor is on auth page, redirect to vendor dashboard
      if (pathname === '/auth') {
        router.push('/vendor/dashboard')
        return
      }
    } else if (profile.role === 'admin') {
      // If admin tries to access vendor routes
      if (pathname.startsWith('/vendor')) {
        router.push('/admin')
        return
      }
      
      // If admin is on auth page, redirect to admin dashboard
      if (pathname === '/auth') {
        router.push('/admin')
        return
      }
    }

    // If user is on home page and authenticated, redirect based on role
    if (pathname === '/') {
      if (profile.role === 'vendor') {
        router.push('/vendor/dashboard')
      } else if (profile.role === 'admin') {
        router.push('/admin')
      }
    }
  }, [user, profile, loading, router, pathname])
}
