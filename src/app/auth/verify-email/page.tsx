'use client'

import { Suspense } from 'react'
import { EmailVerification } from '@/components/auth/email-verification'
import { Loader2 } from 'lucide-react'

function EmailVerificationWrapper() {
  return <EmailVerification />
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailVerificationWrapper />
    </Suspense>
  )
}
