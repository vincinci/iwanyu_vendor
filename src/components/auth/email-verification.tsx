'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react'

export function EmailVerification() {
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const checkEmailFromAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
        setIsVerified(user.email_confirmed_at !== null)
        
        // If already verified, redirect to onboarding
        if (user.email_confirmed_at) {
          router.push('/vendor/onboarding')
        }
      }
    }

    checkEmailFromAuth()

    // Check if this is a confirmation callback
    const confirmationToken = searchParams.get('token')
    const type = searchParams.get('type')
    
    if (type === 'signup' && confirmationToken) {
      handleEmailConfirmation()
    }
  }, [searchParams, router, supabase])

  const handleEmailConfirmation = async () => {
    setLoading(true)
    setError('')
    
    try {
      // The email confirmation is automatically handled by Supabase
      // We just need to check the user's verification status
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email_confirmed_at) {
        setIsVerified(true)
        setSuccess('Email verified successfully! Redirecting to onboarding...')
        
        // Redirect to onboarding after a short delay
        setTimeout(() => {
          router.push('/vendor/onboarding')
        }, 2000)
      } else {
        setError('Email verification failed. Please try again.')
      }
    } catch (error) {
      console.error('Email confirmation error:', error)
      setError('Failed to verify email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmationEmail = async () => {
    if (!email) {
      setError('No email address found. Please try registering again.')
      return
    }

    setResendLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/verify-email`
        }
      })

      if (error) throw error

      setSuccess('Confirmation email sent! Please check your inbox.')
    } catch (error: any) {
      console.error('Resend email error:', error)
      setError('Failed to resend confirmation email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const goBackToSignup = () => {
    router.push('/auth/vendor')
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-32 h-32 relative mx-auto mb-6">
              <Image
                src="/logo.png"
                alt="Logo"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
            <p className="text-gray-600">Your email has been successfully confirmed</p>
          </div>

          <Card className="border-green-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Verification Complete</CardTitle>
              <CardDescription>
                Redirecting you to complete your vendor profile...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600">Please wait...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 relative mx-auto mb-6">
            <Image
              src="/logo.png"
              alt="Logo"
              width={128}
              height={128}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600">We've sent a confirmation link to your email</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">📧 What to do next:</h4>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox for our verification message</li>
                  <li>Click the "Verify Email" link in the email</li>
                  <li>You'll be redirected back here automatically</li>
                  <li>Complete your vendor profile setup</li>
                </ol>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or request a new one.
                </p>
                
                <Button 
                  onClick={resendConfirmationEmail}
                  variant="outline"
                  disabled={resendLoading}
                  className="w-full"
                >
                  {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <Button 
                  onClick={goBackToSignup}
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign Up
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@iwanyu.rw" className="text-blue-600 hover:text-blue-700">
                    support@iwanyu.rw
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
