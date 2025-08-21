'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2 } from 'lucide-react'
import { ALL_CATEGORIES } from '@/lib/categories'

export default function VendorOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    businessName: '',
    businessAddress: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phoneNumber: '',
    alternatePhone: '',
    businessCategory: '',
    businessDescription: '',
    taxId: '',
    businessLicense: '',
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
      website: ''
    },
    identificationDocument: null as File | null,
    businessLogo: null as File | null
  })
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('social_')) {
      const platform = name.replace('social_', '')
      setFormData(prev => ({
        ...prev,
        socialMediaLinks: {
          ...prev.socialMediaLinks,
          [platform]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'identificationDocument' | 'businessLogo') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.fullName.trim()) {
        throw new Error('Full name is required')
      }
      if (!formData.businessName.trim()) {
        throw new Error('Business name is required')
      }
      if (!formData.businessAddress.trim()) {
        throw new Error('Business address is required')
      }
      if (!formData.phoneNumber.trim()) {
        throw new Error('Phone number is required')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let documentUrl = null

      // Upload identification document if provided
      if (formData.identificationDocument) {
        try {
          const fileExt = formData.identificationDocument.name.split('.').pop()
          const fileName = `${user.id}/id-document.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('vendor-documents')
            .upload(fileName, formData.identificationDocument, {
              upsert: true
            })

          if (uploadError) {
            console.warn('Document upload failed:', uploadError.message)
            // Continue without document for now
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('vendor-documents')
              .getPublicUrl(fileName)
            
            documentUrl = publicUrl
          }
        } catch (uploadError) {
          console.warn('Document upload error:', uploadError)
          // Continue without document for now
        }
      }

      // Create vendor profile
      const { error: insertError } = await supabase
        .from('vendors')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          business_name: formData.businessName,
          business_address: formData.businessAddress,
          phone_number: formData.phoneNumber,
          social_media_links: formData.socialMediaLinks,
          identification_document_url: documentUrl,
          status: 'pending'
        })

      if (insertError) throw insertError

      // Redirect to vendor dashboard
      router.push('/vendor')
    } catch (error: unknown) {
      console.error('Full onboarding error:', error)
      let errorMessage = 'An error occurred during onboarding'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message)
      }
      
      console.error('Onboarding error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600">Let&apos;s set up your vendor account</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-12 h-0.5 ${
                  step < currentStep ? 'bg-yellow-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Business Details'}
              {currentStep === 3 && 'Address & Contact'}
              {currentStep === 4 && 'Social Media & Online Presence'}
              {currentStep === 5 && 'Documents & Verification'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Tell us about yourself'}
              {currentStep === 2 && 'Provide your business information'}
              {currentStep === 3 && 'Your business location and contact details'}
              {currentStep === 4 && 'Connect your social media and website'}
              {currentStep === 5 && 'Upload required documents for verification'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Business Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
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
                  <div>
                    <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Category *
                    </label>
                    <select
                      id="businessCategory"
                      name="businessCategory"
                      required
                      value={formData.businessCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessCategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">Select a category</option>
                      {ALL_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.emoji} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Description *
                    </label>
                    <textarea
                      id="businessDescription"
                      name="businessDescription"
                      required
                      rows={4}
                      value={formData.businessDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                      placeholder="Describe your business and what you sell..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                        Tax ID / TIN (Optional)
                      </label>
                      <Input
                        id="taxId"
                        name="taxId"
                        type="text"
                        value={formData.taxId}
                        onChange={handleInputChange}
                        placeholder="Tax Identification Number"
                      />
                    </div>
                    <div>
                      <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-1">
                        Business License # (Optional)
                      </label>
                      <Input
                        id="businessLicense"
                        name="businessLicense"
                        type="text"
                        value={formData.businessLicense}
                        onChange={handleInputChange}
                        placeholder="Business License Number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Address & Contact */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address *
                    </label>
                    <Input
                      id="businessAddress"
                      name="businessAddress"
                      type="text"
                      required
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province *
                      </label>
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State or Province"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select Country</option>
                        <option value="rwanda">🇷🇼 Rwanda</option>
                        <option value="kenya">🇰🇪 Kenya</option>
                        <option value="uganda">🇺🇬 Uganda</option>
                        <option value="tanzania">🇹🇿 Tanzania</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="Postal/ZIP code"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Phone Number *
                      </label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone (Optional)
                      </label>
                      <Input
                        id="alternatePhone"
                        name="alternatePhone"
                        type="tel"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Social Media & Online Presence */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">Connect your social media accounts to help customers find you</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="social_website" className="block text-sm font-medium text-gray-700 mb-1">
                        🌐 Website
                      </label>
                      <Input
                        id="social_website"
                        name="social_website"
                        type="url"
                        value={formData.socialMediaLinks.website}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_facebook" className="block text-sm font-medium text-gray-700 mb-1">
                        📘 Facebook
                      </label>
                      <Input
                        id="social_facebook"
                        name="social_facebook"
                        type="url"
                        value={formData.socialMediaLinks.facebook}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_instagram" className="block text-sm font-medium text-gray-700 mb-1">
                        📷 Instagram
                      </label>
                      <Input
                        id="social_instagram"
                        name="social_instagram"
                        type="url"
                        value={formData.socialMediaLinks.instagram}
                        onChange={handleInputChange}
                        placeholder="https://instagram.com/youraccount"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_twitter" className="block text-sm font-medium text-gray-700 mb-1">
                        🐦 Twitter/X
                      </label>
                      <Input
                        id="social_twitter"
                        name="social_twitter"
                        type="url"
                        value={formData.socialMediaLinks.twitter}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/youraccount"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                        💼 LinkedIn
                      </label>
                      <Input
                        id="social_linkedin"
                        name="social_linkedin"
                        type="url"
                        value={formData.socialMediaLinks.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_youtube" className="block text-sm font-medium text-gray-700 mb-1">
                        📺 YouTube
                      </label>
                      <Input
                        id="social_youtube"
                        name="social_youtube"
                        type="url"
                        value={formData.socialMediaLinks.youtube}
                        onChange={handleInputChange}
                        placeholder="https://youtube.com/yourchannel"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                        🎵 TikTok
                      </label>
                      <Input
                        id="social_tiktok"
                        name="social_tiktok"
                        type="url"
                        value={formData.socialMediaLinks.tiktok}
                        onChange={handleInputChange}
                        placeholder="https://tiktok.com/@youraccount"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Documents & Verification */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {/* Business Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Logo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload your business logo (PNG, JPG - Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFormData(prev => ({ ...prev, businessLogo: file }))
                          }
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button type="button" variant="outline" asChild>
                          <span>Choose Logo</span>
                        </Button>
                      </label>
                      {formData.businessLogo && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {formData.businessLogo.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ID Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identification Document (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload your ID, passport, or driver&apos;s license (PDF, JPG, PNG - Max 10MB)
                      </p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFormData(prev => ({ ...prev, identificationDocument: file }))
                          }
                        }}
                        className="hidden"
                        id="document-upload"
                      />
                      <label htmlFor="document-upload">
                        <Button type="button" variant="outline" asChild>
                          <span>Choose Document</span>
                        </Button>
                      </label>
                      {formData.identificationDocument && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {formData.identificationDocument.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">📋 What happens next?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Your application will be reviewed within 24-48 hours</li>
                      <li>• You&apos;ll receive an email confirmation once approved</li>
                      <li>• You can start adding products immediately after approval</li>
                      <li>• Our team may contact you for additional verification</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < 5 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="ml-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Registration
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
