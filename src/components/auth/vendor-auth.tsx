'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function VendorAuth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    businessName: ''
  })
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Starting authentication for:', formData.email)

    try {
      if (isSignUp) {
        console.log('Attempting sign up...')
        // Sign up new vendor with email confirmation required
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              business_name: formData.businessName,
              user_type: 'vendor'
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/verify-email`
          }
        })

        if (error) {
          console.error('Sign up error:', error)
          throw error
        }

        if (data.user) {
          console.log('Sign up successful, redirecting to email verification')
          // Redirect to email verification page
          router.replace('/auth/verify-email')
        }
      } else {
        console.log('Attempting sign in...')
        // Try Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) {
          console.log('Supabase auth error:', error.message)
          throw error
        }

        if (data.user) {
          console.log('User authenticated successfully:', data.user.email)
          
          // Check if email is verified
          if (!data.user.email_confirmed_at) {
            console.log('Email not verified, redirecting to verification page')
            router.replace('/auth/verify-email')
            return
          }
          
          // Check if this is an admin user
          const { data: adminUser, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', data.user.id)
            .single()

          if (!adminError && adminUser) {
            // Admin login
            console.log('Admin user detected, redirecting to admin panel')
            localStorage.setItem('iwanyu_admin_session', 'true')
            localStorage.setItem('iwanyu_vendor_session', 'true') // For compatibility
            router.replace('/admin')
            return
          }

          // Check if vendor profile exists
          const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .select('*')
            .eq('user_id', data.user.id)
            .single()

          if (!vendorError && vendor) {
            console.log('Vendor profile found, checking status...')
            
            // Check vendor status
            if (vendor.status === 'pending') {
              console.log('Vendor status is pending, redirecting to dashboard')
              // Set vendor session
              localStorage.setItem('iwanyu_vendor_session', 'true')
              router.replace('/vendor')
            } else if (vendor.status === 'approved') {
              console.log('Vendor approved, redirecting to dashboard')
              // Set vendor session
              localStorage.setItem('iwanyu_vendor_session', 'true')
              router.replace('/vendor')
            } else if (vendor.status === 'rejected') {
              console.log('Vendor application was rejected')
              router.replace('/vendor/confirmation')
            } else {
              console.log('Unknown vendor status, redirecting to onboarding')
              localStorage.setItem('iwanyu_vendor_session', 'true')
              router.replace('/vendor/onboarding')
            }
          } else {
            console.log('No vendor profile found, redirecting to onboarding')
            localStorage.setItem('iwanyu_vendor_session', 'true')
            router.replace('/vendor/onboarding')
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      console.error('Auth error:', errorMessage)
      
      // Show user-friendly error messages
      let userFriendlyMessage = 'Unable to sign in. Please check your credentials and try again.'
      
      if (errorMessage.toLowerCase().includes('database')) {
        userFriendlyMessage = 'Service temporarily unavailable. Please try again in a moment.'
      } else if (errorMessage.toLowerCase().includes('invalid')) {
        userFriendlyMessage = 'Invalid email or password. Please check your credentials.'
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        userFriendlyMessage = 'Connection problem. Please check your internet and try again.'
      } else if (errorMessage.toLowerCase().includes('email')) {
        userFriendlyMessage = 'Account not found. Please check your email address or sign up for a new account.'
      } else if (errorMessage.toLowerCase().includes('password')) {
        userFriendlyMessage = 'Incorrect password. Please try again or reset your password.'
      }
      
      setError(userFriendlyMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
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
          <h1 className="text-2xl font-bold text-gray-900">Vendor Portal</h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your vendor account' : 'Sign in to your dashboard'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Start selling today' 
                : 'Enter your credentials to access your dashboard'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm font-medium">{error}</p>
                {error.includes('Service temporarily unavailable') && (
                  <p className="text-red-500 text-xs mt-1">
                    🔄 Our servers are busy. Please wait a moment and try again.
                  </p>
                )}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Enter your business name"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-yellow-600 hover:text-yellow-700"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
