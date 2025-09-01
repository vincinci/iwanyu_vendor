import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Camera,
  Save,
  Edit,
  Lock,
  Shield,
  CheckCircle
} from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// Mock vendor data
const mockVendorData = {
  fullName: 'John Doe',
  email: 'john.doe@email.com',
  phone: '+1 (555) 123-4567',
  businessName: 'TechGear Solutions',
  businessType: 'Electronics Retailer',
  description: 'We specialize in high-quality consumer electronics and accessories.',
  website: 'https://techgearsolutions.com',
  address: '123 Business Ave',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'United States',
  status: 'approved',
  joinDate: '2024-01-01',
  totalSales: 45250.75,
  rating: 4.8,
};

export const VendorProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: mockVendorData,
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      // TODO: Implement profile update API call
      console.log('Updating profile:', data);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      // TODO: Implement password update API call
      console.log('Updating password');
      resetPasswordForm();
    } catch (error) {
      console.error('Password update error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      suspended: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account and business information</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{mockVendorData.businessName}</h2>
                <p className="text-gray-600">{mockVendorData.fullName}</p>
                <div className="flex items-center space-x-4 mt-2">
                  {getStatusBadge(mockVendorData.status)}
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Verified Vendor
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>★ {mockVendorData.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Member since</div>
                <div className="font-medium">{new Date(mockVendorData.joinDate).toLocaleDateString()}</div>
                <div className="text-sm text-gray-500 mt-1">Total Sales</div>
                <div className="font-bold text-green-600">${mockVendorData.totalSales.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 mr-2 inline" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="w-4 h-4 mr-2 inline" />
              Business Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Lock className="w-4 h-4 mr-2 inline" />
              Security
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  {isEditing && (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={isSubmittingProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    disabled={!isEditing}
                    error={profileErrors.fullName?.message}
                    {...registerProfile('fullName')}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    disabled={!isEditing}
                    error={profileErrors.email?.message}
                    {...registerProfile('email')}
                  />
                  <Input
                    label="Phone Number"
                    disabled={!isEditing}
                    error={profileErrors.phone?.message}
                    {...registerProfile('phone')}
                  />
                  <Input
                    label="Website"
                    disabled={!isEditing}
                    error={profileErrors.website?.message}
                    {...registerProfile('website')}
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {activeTab === 'business' && (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Business Information</CardTitle>
                  {isEditing && (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={isSubmittingProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Business Name"
                      disabled={!isEditing}
                      error={profileErrors.businessName?.message}
                      {...registerProfile('businessName')}
                    />
                    <Input
                      label="Business Type"
                      disabled={!isEditing}
                      error={profileErrors.businessType?.message}
                      {...registerProfile('businessType')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={4}
                      disabled={!isEditing}
                      {...registerProfile('description')}
                    />
                    {profileErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Address"
                      disabled={!isEditing}
                      error={profileErrors.address?.message}
                      {...registerProfile('address')}
                    />
                    <Input
                      label="City"
                      disabled={!isEditing}
                      error={profileErrors.city?.message}
                      {...registerProfile('city')}
                    />
                    <Input
                      label="State/Province"
                      disabled={!isEditing}
                      error={profileErrors.state?.message}
                      {...registerProfile('state')}
                    />
                    <Input
                      label="Postal Code"
                      disabled={!isEditing}
                      error={profileErrors.postalCode?.message}
                      {...registerProfile('postalCode')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    error={passwordErrors.currentPassword?.message}
                    {...registerPassword('currentPassword')}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword('newPassword')}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    error={passwordErrors.confirmPassword?.message}
                    {...registerPassword('confirmPassword')}
                  />
                  <Button type="submit" loading={isSubmittingPassword}>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <div>
                        <div className="font-medium text-green-900">Email Verified</div>
                        <div className="text-sm text-green-700">Your email address has been verified</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-yellow-500 mr-3" />
                      <div>
                        <div className="font-medium text-yellow-900">Two-Factor Authentication</div>
                        <div className="text-sm text-yellow-700">Add an extra layer of security</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Login Sessions</div>
                        <div className="text-sm text-gray-700">Manage your active sessions</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium text-green-900">Approved Vendor</div>
                    <div className="text-sm text-green-700">Account verified and active</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-medium text-blue-900">Compliance Status</div>
                    <div className="text-sm text-blue-700">All requirements met</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <User className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="font-medium text-yellow-900">Profile Completion</div>
                    <div className="text-sm text-yellow-700">100% complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};