'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthSuccessPage() {
  const router = useRouter()
  const { user, userProfile, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      setTimeout(() => {
        if (userProfile?.role === 'vendor') {
          router.push('/vendor/dashboard')
        } else if (userProfile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }, 2000)
    }
  }, [user, userProfile, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Authentication Successful!
          </CardTitle>
          <CardDescription>
            Welcome to Iwanyu! Redirecting you to your dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ Email verified</p>
            <p>✅ Account activated</p>
            <p>✅ Setting up your dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
