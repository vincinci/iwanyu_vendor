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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-yellow-200/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 relative mx-auto mb-6 bg-white rounded-full p-3 shadow-lg ring-1 ring-orange-100">
            <Image
              src="/logo.png"
              alt="iWanyu Logo"
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Vendor Portal
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            {isSignUp ? 'Create your vendor account' : 'Sign in to your dashboard'}
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl ring-1 ring-orange-100/50">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isSignUp 
                ? 'Join our marketplace and start selling today' 
                : 'Enter your credentials to access your dashboard'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                    {error.includes('Service temporarily unavailable') && (
                      <p className="text-red-600 text-xs mt-1">
                        🔄 Our servers are busy. Please wait a moment and try again.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="h-12 pr-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-gray-100 rounded-r-lg"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-200"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Help Center</a>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            © 2025 iWanyu Marketplace. Empowering vendors across Rwanda.
          </p>
        </div>
      </div>
    </div>
  )
}
