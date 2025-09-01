import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function useAuthRedirect() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Don't redirect while loading or if no user
    if (loading || !user) return

    // If user is authenticated but no profile yet, wait
    if (!profile) return

    // Get current path to avoid unnecessary redirects
    const currentPath = window.location.pathname

    // Smart routing based on user role
    if (profile.role === 'vendor') {
      if (currentPath === '/auth' || currentPath === '/') {
        navigate('/vendor/dashboard', { replace: true })
      }
    } else if (profile.role === 'admin') {
      if (currentPath === '/auth' || currentPath === '/') {
        navigate('/admin', { replace: true })
      }
    } else {
      // Regular user
      if (currentPath === '/auth') {
        navigate('/', { replace: true })
      }
    }
  }, [user, profile, loading, navigate])

  return { user, profile, loading }
}
