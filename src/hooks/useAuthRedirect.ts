import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthRedirect() {
  const { user, userProfile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while loading or if no user
    if (isLoading || !user) return

    // If user is authenticated but no profile yet, wait
    if (!userProfile) return

    // Get current path to avoid unnecessary redirects
    const currentPath = window.location.pathname

    // Smart routing based on user role
    if (userProfile.role === 'vendor') {
      if (currentPath === '/auth' || currentPath === '/') {
        router.replace('/vendor/dashboard')
      }
    } else if (userProfile.role === 'admin') {
      if (currentPath === '/auth' || currentPath === '/') {
        router.replace('/admin')
      }
    } else {
      // Regular user
      if (currentPath === '/auth') {
        router.replace('/') 
      }
    }
  }, [user, userProfile, isLoading, router])

  return { user, userProfile, isLoading }
}
