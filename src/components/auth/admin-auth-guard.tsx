'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const adminSession = localStorage.getItem('iwanyu_admin_session')
        
        if (adminSession === 'true') {
          // Try to verify the session with Supabase if possible
          try {
            const supabase = createClient()
            const { data: { user }, error } = await supabase.auth.getUser()
            
            if (user && !error) {
              // Check if user is still an admin in database
              const { data: adminUser } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', user.id)
                .single()
              
              if (adminUser) {
                setIsAuthenticated(true)
                setIsLoading(false)
                return
              }
            }
          } catch (supabaseError) {
            console.log('Supabase verification failed, using session fallback')
          }
          
          // Fallback to session-based auth if Supabase check fails
          setIsAuthenticated(true)
        } else {
          // Redirect to vendor login if not authenticated as admin
          router.push('/auth/vendor')
          return
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Admin auth check error:', error)
        setIsLoading(false)
        router.push('/auth/vendor')
      }
    }

    checkAdminAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-black font-bold text-2xl">I</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect, so don't render anything
  }

  return <>{children}</>
}
