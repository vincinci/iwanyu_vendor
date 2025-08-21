'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { RegistrationConfirmation } from '@/components/auth/registration-confirmation'
import { Loader2 } from 'lucide-react'

export default function VendorConfirmationPage() {
  const [loading, setLoading] = useState(true)
  const [vendorData, setVendorData] = useState<any>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkVendorData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // No user logged in, redirect to login
          router.replace('/auth/vendor')
          return
        }

        // Get vendor data
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (vendorError || !vendor) {
          // No vendor profile found, redirect to onboarding
          router.replace('/vendor/onboarding')
          return
        }

        // Check if vendor is already approved
        if (vendor.status === 'approved') {
          // Already approved, redirect to dashboard
          router.replace('/vendor')
          return
        }

        // Set vendor data for confirmation display
        setVendorData({
          businessName: vendor.business_name,
          fullName: vendor.full_name,
          email: user.email,
          status: vendor.status
        })

      } catch (error) {
        console.error('Error checking vendor data:', error)
        setError('Failed to load confirmation details')
      } finally {
        setLoading(false)
      }
    }

    checkVendorData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/auth/vendor')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return <RegistrationConfirmation vendorData={vendorData} />
}
