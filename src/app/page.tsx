'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to auth page as the landing page
    router.replace('/auth')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to authentication...</p>
      </div>
    </div>
  )
}
