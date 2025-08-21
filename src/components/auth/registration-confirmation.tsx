'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, Mail, ArrowRight, LogOut, AlertCircle } from 'lucide-react'

interface RegistrationConfirmationProps {
  vendorData?: {
    businessName: string
    email: string
    fullName: string
    status: 'pending' | 'approved' | 'rejected'
  }
}

export function RegistrationConfirmation({ vendorData }: RegistrationConfirmationProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleContinueToLogin = () => {
    router.push('/auth/vendor')
  }

  const handleGoToDashboard = () => {
    router.push('/vendor')
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('iwanyu_vendor_session')
      localStorage.removeItem('iwanyu_admin_session')
      router.push('/auth/vendor')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      vendorData?.status === 'approved' ? 'from-green-50 to-white' : 
      vendorData?.status === 'rejected' ? 'from-red-50 to-white' : 
      'from-yellow-50 to-white'
    } flex items-center justify-center p-4`}>
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
          <h1 className="text-2xl font-bold text-gray-900">
            {vendorData?.status === 'approved' ? 'Welcome to Your Dashboard!' : 
             vendorData?.status === 'rejected' ? 'Application Update' : 
             'Registration Complete!'}
          </h1>
          <p className="text-gray-600">
            {vendorData?.status === 'approved' ? 'Your vendor account is now active' : 
             vendorData?.status === 'rejected' ? 'Please review your application status' : 
             'Thank you for joining our vendor community'}
          </p>
        </div>

        <Card className={`${
          vendorData?.status === 'approved' ? 'border-green-200' : 
          vendorData?.status === 'rejected' ? 'border-red-200' : 
          'border-yellow-200'
        }`}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 ${
              vendorData?.status === 'approved' ? 'bg-green-100' : 
              vendorData?.status === 'rejected' ? 'bg-red-100' : 
              'bg-yellow-100'
            } rounded-full flex items-center justify-center mx-auto mb-4`}>
              {vendorData?.status === 'approved' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : vendorData?.status === 'rejected' ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <Clock className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <CardTitle className={`${
              vendorData?.status === 'approved' ? 'text-green-800' : 
              vendorData?.status === 'rejected' ? 'text-red-800' : 
              'text-yellow-800'
            }`}>
              {vendorData?.status === 'approved' ? 'Account Approved!' : 
               vendorData?.status === 'rejected' ? 'Application Declined' : 
               'Application Submitted Successfully'}
            </CardTitle>
            <CardDescription>
              {vendorData?.status === 'approved' ? 'You can now start selling on our platform' : 
               vendorData?.status === 'rejected' ? 'Your application needs attention' : 
               'Your vendor registration has been received and is under review'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vendor Details */}
            {vendorData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Registration Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Business:</span> {vendorData.businessName}</p>
                  <p><span className="font-medium">Contact:</span> {vendorData.fullName}</p>
                  <p><span className="font-medium">Email:</span> {vendorData.email}</p>
                </div>
              </div>
            )}

            {/* What's Next */}
            {vendorData?.status === 'approved' ? (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  You're all set!
                </h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    🎉 Congratulations! Your vendor account has been approved. You can now:
                  </p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Add and manage your products</li>
                    <li>• Process customer orders</li>
                    <li>• Access your sales analytics</li>
                    <li>• Update your business profile</li>
                  </ul>
                </div>
              </div>
            ) : vendorData?.status === 'rejected' ? (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  Application Status
                </h3>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-2">
                    Your application was not approved at this time.
                  </p>
                  <p className="text-sm text-red-600">
                    This could be due to incomplete information or documentation issues. 
                    Please contact our support team for more details and reapplication guidance.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    📞 <strong>Need help?</strong> Contact our support team at{' '}
                    <a href="mailto:support@iwanyu.rw" className="text-blue-800 underline">
                      support@iwanyu.rw
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-2" />
                  What happens next?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">Application Review</p>
                      <p>Our team will review your application within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">Email Confirmation</p>
                      <p>You'll receive an approval email with further instructions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">Account Activation</p>
                      <p>Once approved, you can log in and start selling</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Notice */}
            {vendorData?.status === 'pending' && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">Check your email</p>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  We've sent a confirmation email to your inbox. Please check your spam folder if you don't see it.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {vendorData?.status === 'approved' ? (
                <>
                  <Button 
                    onClick={handleGoToDashboard} 
                    className="w-full"
                    variant="default"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                  
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="w-full"
                    disabled={loading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleContinueToLogin} 
                    className="w-full"
                    variant="default"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continue to Login
                  </Button>
                  
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="w-full"
                    disabled={loading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>

            {/* Support Contact */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Questions? Contact us at{' '}
                <a href="mailto:support@iwanyu.rw" className="text-blue-600 hover:text-blue-700">
                  support@iwanyu.rw
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
