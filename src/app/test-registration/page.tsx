'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ALL_CATEGORIES } from '@/lib/categories'

export default function TestRegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    businessName: '',
    businessCategory: '',
    businessDescription: '',
    businessAddress: '',
    city: '',
    state: '',
    country: 'Rwanda',
    postalCode: '',
    phoneNumber: '',
    alternatePhone: '',
    taxId: '',
    businessLicense: '',
    socialMediaLinks: {
      website: '',
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      tiktok: '',
      youtube: ''
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Test Form Data:', formData)
    alert('Form data logged to console - check developer tools!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registration Form Test</h1>
          <p className="text-gray-600 mt-2">Test all registration fields</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Vendor Registration Form</CardTitle>
            <CardDescription>Fill out all fields to test the form structure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTestSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                    <Input
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="ABC Company Ltd"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Category *</label>
                    <select
                      name="businessCategory"
                      value={formData.businessCategory}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {ALL_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.emoji} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                  <Textarea
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleChange}
                    placeholder="Describe your business, products, and services..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID/TIN</label>
                    <Input
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business License Number</label>
                    <Input
                      name="businessLicense"
                      value={formData.businessLicense}
                      onChange={handleChange}
                      placeholder="BL123456"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Address *</label>
                  <Input
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    placeholder="Street address, building, floor"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Kigali"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Kigali City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <Input
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="00000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Rwanda"
                    disabled
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone Number *</label>
                    <Input
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+250 123 456 789"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone Number</label>
                    <Input
                      name="alternatePhone"
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={handleChange}
                      placeholder="+250 987 654 321"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Social Media & Online Presence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <Input
                      name="social_website"
                      type="url"
                      value={formData.socialMediaLinks.website}
                      onChange={handleChange}
                      placeholder="https://www.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <Input
                      name="social_facebook"
                      type="url"
                      value={formData.socialMediaLinks.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <Input
                      name="social_instagram"
                      type="url"
                      value={formData.socialMediaLinks.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <Input
                      name="social_twitter"
                      type="url"
                      value={formData.socialMediaLinks.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <Input
                      name="social_linkedin"
                      type="url"
                      value={formData.socialMediaLinks.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                    <Input
                      name="social_tiktok"
                      type="url"
                      value={formData.socialMediaLinks.tiktok}
                      onChange={handleChange}
                      placeholder="https://tiktok.com/@yourhandle"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-2"
                >
                  Test Form Submission
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Current Form Data:</h3>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-64">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
