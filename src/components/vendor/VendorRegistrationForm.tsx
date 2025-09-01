'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

// Strict 5-step validation schema
const stepSchemas = {
  1: z.object({
    business_name: z.string().min(3, 'Business name must be at least 3 characters'),
    business_address: z.string().min(10, 'Please provide complete business address'),
    contact_person: z.string().min(2, 'Contact person name required'),
  }),
  2: z.object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Valid phone number required'),
    email: z.string().email('Valid email address required'),
    business_type: z.string().min(1, 'Business type is required'),
  }),
  3: z.object({
    shop_logo: z.instanceof(File).optional(),
    business_description: z.string().min(50, 'Business description must be at least 50 characters'),
  }),
  4: z.object({
    government_id: z.instanceof(File, { message: 'Government ID document is required' }),
    tax_id: z.string().min(5, 'Tax ID is required'),
  }),
  5: z.object({
    bank_account: z.string().min(10, 'Bank account number required'),
    bank_name: z.string().min(2, 'Bank name is required'),
    account_holder: z.string().min(2, 'Account holder name required'),
  })
}

interface VendorFormData {
  business_name: string
  business_address: string
  contact_person: string
  phone: string
  email: string
  business_type: string
  business_description: string
  shop_logo?: File
  government_id?: File
  tax_id: string
  bank_account: string
  bank_name: string
  account_holder: string
}

export default function VendorRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<VendorFormData>>({})
  const [isLoading, setIsLoading] = useState(false)


  const currentSchema = stepSchemas[currentStep as keyof typeof stepSchemas]
  
  const form = useForm({
    resolver: zodResolver(currentSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: Partial<VendorFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1)
      form.reset()
    } else {
      // Final submission
      setIsLoading(true)
      try {
        // Upload files to Supabase Storage
        const finalData: VendorFormData = { ...formData, ...data } as VendorFormData
        
        let shop_logo_url = null
        let government_id_url = null

        if (finalData.shop_logo) {
          const logoResult = await supabase.storage
            .from('vendor-documents')
            .upload(`shop-logos/${Date.now()}-${finalData.shop_logo.name}`, finalData.shop_logo)
          if (logoResult.data) shop_logo_url = logoResult.data.path
        }

        if (finalData.government_id) {
          const idResult = await supabase.storage
            .from('vendor-documents')
            .upload(`government-ids/${Date.now()}-${finalData.government_id.name}`, finalData.government_id)
          if (idResult.data) government_id_url = idResult.data.path
        }

        // Insert vendor record
        const { error } = await supabase
          .from('vendors')
          .insert({
            business_name: finalData.business_name,
            business_address: finalData.business_address,
            contact_person: finalData.contact_person,
            phone: finalData.phone,
            email: finalData.email,
            business_type: finalData.business_type,
            business_description: finalData.business_description,
            shop_logo_url,
            government_id_url,
            tax_id: finalData.tax_id,
            bank_account: finalData.bank_account,
            bank_name: finalData.bank_name,
            account_holder: finalData.account_holder,
            status: 'pending'
          })

        if (error) throw error

        // Suggest user to create account
        localStorage.setItem('vendor_registration_email', finalData.email)
        
        // Success - redirect to confirmation
        window.location.href = '/vendor-register/success'
        
      } catch (error) {
        console.error('Registration error:', error)
        alert('Registration failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const stepTitles = {
    1: 'Business Information',
    2: 'Contact Details',
    3: 'Business Profile',
    4: 'Legal Documents',
    5: 'Payment Information'
  }

  const stepDescriptions = {
    1: 'Enter your business basic information',
    2: 'Provide contact details for verification',
    3: 'Upload logo and describe your business',
    4: 'Upload required legal documents',
    5: 'Setup payment and banking details'
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">Vendor Registration</h1>
        <div className="flex justify-between items-center mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                step <= currentStep
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {currentStep}: {stepTitles[currentStep as keyof typeof stepTitles]}</CardTitle>
          <CardDescription>{stepDescriptions[currentStep as keyof typeof stepDescriptions]}</CardDescription>
        </CardHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {currentStep === 1 && (
              <>
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input {...form.register('business_name')} placeholder="Enter your business name" />
                  {form.formState.errors.business_name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.business_name.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="business_address">Business Address *</Label>
                  <Input {...form.register('business_address')} placeholder="Complete business address" />
                  {form.formState.errors.business_address && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.business_address.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input {...form.register('contact_person')} placeholder="Primary contact person name" />
                  {form.formState.errors.contact_person && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.contact_person.message as string}</p>
                  )}
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input {...form.register('phone')} placeholder="+1234567890" />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input {...form.register('email')} type="email" placeholder="business@example.com" />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <select {...form.register('business_type')} className="w-full p-2 border rounded-md">
                    <option value="">Select business type</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="services">Services</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                  {form.formState.errors.business_type && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.business_type.message as string}</p>
                  )}
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div>
                  <Label htmlFor="shop_logo">Shop Logo (Optional)</Label>
                  <Input {...form.register('shop_logo')} type="file" accept="image/*" />
                </div>
                <div>
                  <Label htmlFor="business_description">Business Description *</Label>
                  <textarea 
                    {...form.register('business_description')} 
                    className="w-full p-2 border rounded-md h-32"
                    placeholder="Describe your business and services (minimum 50 characters)"
                  />
                  {form.formState.errors.business_description && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.business_description.message as string}</p>
                  )}
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <div>
                  <Label htmlFor="government_id">Government ID Document *</Label>
                  <Input {...form.register('government_id')} type="file" accept=".pdf,.jpg,.jpeg,.png" />
                  <p className="text-sm text-gray-500 mt-1">Upload business license, tax certificate, or registration document</p>
                  {form.formState.errors.government_id && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.government_id.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tax_id">Tax ID / Business Registration Number *</Label>
                  <Input {...form.register('tax_id')} placeholder="Enter your tax ID or business registration number" />
                  {form.formState.errors.tax_id && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.tax_id.message as string}</p>
                  )}
                </div>
              </>
            )}

            {currentStep === 5 && (
              <>
                <div>
                  <Label htmlFor="bank_account">Bank Account Number *</Label>
                  <Input {...form.register('bank_account')} placeholder="Enter bank account number" />
                  {form.formState.errors.bank_account && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.bank_account.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input {...form.register('bank_name')} placeholder="Enter bank name" />
                  {form.formState.errors.bank_name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.bank_name.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="account_holder">Account Holder Name *</Label>
                  <Input {...form.register('account_holder')} placeholder="Enter account holder name" />
                  {form.formState.errors.account_holder && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.account_holder.message as string}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="ml-auto"
            >
              {isLoading ? 'Submitting...' : currentStep === 5 ? 'Submit Application' : 'Next Step'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
