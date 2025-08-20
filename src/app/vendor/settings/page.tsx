'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, ArrowLeft, User, Building2, MapPin, Phone, Globe, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface VendorData {
  id: string
  full_name: string
  business_name: string
  business_address: string
  phone_number: string
  social_media_links: any
  status: string
}

interface FormData {
  fullName: string
  businessName: string
  businessAddress: string
  phoneNumber: string
  website: string
  facebook: string
  instagram: string
  whatsapp: string
}

const RWANDA_DISTRICTS = [
  'Kigali', 'Nyarugenge', 'Gasabo', 'Kicukiro', 'Nyanza', 'Gisagara', 'Nyamagabe',
  'Nyaruguru', 'Huye', 'Nyagatare', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma',
  'Bugesera', 'Rwamagana', 'Musanze', 'Burera', 'Gakenke', 'Gicumbi', 'Rulindo',
  'Karongi', 'Rutsiro', 'Rubavu', 'Nyabihu', 'Ngororero', 'Rusizi', 'Nyamasheke',
  'Kamonyi', 'Muhanga', 'Ruhango'
]

export default function VendorSettings() {
  const [vendorData, setVendorData] = useState<VendorData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    businessName: '',
    businessAddress: '',
    phoneNumber: '',
    website: '',
    facebook: '',
    instagram: '',
    whatsapp: ''
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true)
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error('Authentication error:', authError)
          router.push('/auth/vendor')
          return
        }

        // Get vendor profile
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (vendorError || !vendor) {
          console.error('No vendor record found:', vendorError)
          router.push('/vendor/onboarding')
          return
        }

        setVendorData(vendor)
        setFormData({
          fullName: vendor.full_name || '',
          businessName: vendor.business_name || '',
          businessAddress: vendor.business_address || '',
          phoneNumber: vendor.phone_number || '',
          website: vendor.social_media_links?.website || '',
          facebook: vendor.social_media_links?.facebook || '',
          instagram: vendor.social_media_links?.instagram || '',
          whatsapp: vendor.social_media_links?.whatsapp || ''
        })

      } catch (error) {
        console.error('Error loading vendor data:', error)
        router.push('/auth/vendor')
      } finally {
        setLoading(false)
      }
    }

    fetchVendorData()
  }, [router, supabase])

  const handleSave = async () => {
    if (!vendorData) return

    try {
      setSaving(true)
      
      const socialMediaLinks = {
        website: formData.website,
        facebook: formData.facebook,
        instagram: formData.instagram,
        whatsapp: formData.whatsapp
      }

      const { error } = await supabase
        .from('vendors')
        .update({
          full_name: formData.fullName,
          business_name: formData.businessName,
          business_address: formData.businessAddress,
          phone_number: formData.phoneNumber,
          social_media_links: socialMediaLinks
        })
        .eq('id', vendorData.id)

      if (error) {
        console.error('Error updating vendor:', error)
        alert('Failed to save changes. Please try again.')
        return
      }

      alert('Settings saved successfully!')
      
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Please complete your vendor registration first.</p>
          <Link href="/vendor/onboarding">
            <Button>Complete Registration</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/vendor">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Settings</h1>
                <p className="text-gray-600">Manage your business profile and preferences</p>
              </div>
            </div>
            <Badge variant={vendorData.status === 'approved' ? 'default' : 'secondary'}>
              {vendorData.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Status Alert */}
        {vendorData.status === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">Account Pending Approval</p>
              <p className="text-yellow-700 text-sm">Your profile changes will be saved but your store won't be visible to customers until approved.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName">Full Name</label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+250 788 123 456"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/vendor/products">
                <Button variant="outline" className="w-full justify-start">
                  Manage Products
                </Button>
              </Link>
              <Link href="/vendor/orders">
                <Button variant="outline" className="w-full justify-start">
                  View Orders
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                Payment Settings
                <span className="ml-auto text-xs text-gray-500">Soon</span>
              </Button>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Manage your business details and location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessName">Business Name</label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <label htmlFor="businessAddress">Business Address</label>
                  <Input
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="Street address, District, Rwanda"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media & Online Presence */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Online Presence
              </CardTitle>
              <CardDescription>
                Add your website and social media links to help customers find you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website">Website</label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourbusiness.rw"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp">WhatsApp Business</label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+250 788 123 456"
                  />
                </div>
                <div>
                  <label htmlFor="facebook">Facebook Page</label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                    placeholder="@yourbusiness"
                  />
                </div>
                <div>
                  <label htmlFor="instagram">Instagram</label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    placeholder="@yourbusiness"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="min-w-32"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
