'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { formatCurrency } from '@/lib/utils'

export default function VendorRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    shopName: '',
    shopAddress: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    mobileMoneyProvider: '',
    mobileMoneyNumber: '',
    governmentId: null as File | null,
    shopLogo: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState(1)
  
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  
  // Use the auth redirect hook for smart routing
  useAuthRedirect()

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  const validateStep1 = () => {
    return formData.fullName && formData.shopName && formData.shopAddress && formData.phone
  }

  const validateStep2 = () => {
    return formData.bankName && formData.accountNumber && formData.accountName
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Upload government ID
      let governmentIdUrl = ''
      if (formData.governmentId) {
        const { data: govIdData, error: govIdError } = await supabase.storage
          .from('government-ids')
          .upload(`${user.id}/${formData.governmentId.name}`, formData.governmentId)
        
        if (govIdError) throw govIdError
        governmentIdUrl = govIdData.path
      }

      // Upload shop logo if provided
      let shopLogoUrl = ''
      if (formData.shopLogo) {
        const { data: logoData, error: logoError } = await supabase.storage
          .from('shop-logos')
          .upload(`${user.id}/${formData.shopLogo.name}`, formData.shopLogo)
        
        if (logoError) throw logoError
        shopLogoUrl = logoData.path
      }

      // Create vendor profile
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          full_name: formData.fullName,
          shop_name: formData.shopName,
          shop_address: formData.shopAddress,
          shop_logo_url: shopLogoUrl || null,
          government_id_url: governmentIdUrl,
          bank_info: {
            bank_name: formData.bankName,
            account_number: formData.accountNumber,
            account_name: formData.accountName,
          },
          mobile_money_info: formData.mobileMoneyProvider ? {
            provider: formData.mobileMoneyProvider,
            number: formData.mobileMoneyNumber,
          } : null,
          user_id: user.id,
          status: 'pending',
        })

      if (vendorError) throw vendorError

      setMessage('Vendor application submitted successfully! You will be notified once approved.')
      setTimeout(() => {
        router.push('/vendor/dashboard')
      }, 2000)

    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-yellow-600">
              Become a Vendor
            </CardTitle>
            <CardDescription className="text-lg">
              Join Iwanyu marketplace and start selling your products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+250780123456"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="shopName">Shop Name *</Label>
                <Input
                  id="shopName"
                  value={formData.shopName}
                  onChange={(e) => handleInputChange('shopName', e.target.value)}
                  placeholder="Enter your shop name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="shopAddress">Shop Address *</Label>
                <Textarea
                  id="shopAddress"
                  value={formData.shopAddress}
                  onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                  placeholder="Enter your complete shop address"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-between">
                <Link href="/auth">
                  <Button variant="outline">
                    Back to Login
                  </Button>
                </Link>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!validateStep1()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Next Step
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-yellow-600">
            Payment Information
          </CardTitle>
          <CardDescription className="text-lg">
            Set up your payment details to receive payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bank Information *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="e.g., Bank of Kigali"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="Enter account number"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="accountName">Account Holder Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => handleInputChange('accountName', e.target.value)}
                  placeholder="Enter account holder name"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mobile Money (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobileMoneyProvider">Provider</Label>
                  <Select
                    value={formData.mobileMoneyProvider}
                    onValueChange={(value) => handleInputChange('mobileMoneyProvider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                      <SelectItem value="Airtel">Airtel Money</SelectItem>
                      <SelectItem value="MobiCash">MobiCash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mobileMoneyNumber">Phone Number</Label>
                  <Input
                    id="mobileMoneyNumber"
                    value={formData.mobileMoneyNumber}
                    onChange={(e) => handleInputChange('mobileMoneyNumber', e.target.value)}
                    placeholder="+250780123456"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="governmentId">Government ID *</Label>
                  <Input
                    id="governmentId"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('governmentId', e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a valid government-issued ID
                  </p>
                </div>
                <div>
                  <Label htmlFor="shopLogo">Shop Logo (Optional)</Label>
                  <Input
                    id="shopLogo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('shopLogo', e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload your shop logo for branding
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Previous Step
              </Button>
              <Button
                type="submit"
                disabled={loading || !validateStep2()}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
