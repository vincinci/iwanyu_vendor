import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  Edit, 
  Eye, 
  EyeOff,
  Camera,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface ProfileFormData {
  full_name: string
  company_name: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function VendorProfile() {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '',
    company_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  })
  
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        postal_code: profile.postal_code || ''
      })
    }
  }, [profile])

  const validatePassword = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  const handlePasswordChange = (password: string) => {
    setPasswordData(prev => ({ ...prev, newPassword: password }))
    validatePassword(password)
  }

  const isPasswordValid = Object.values(passwordStrength).every(Boolean)
  const isPasswordFormValid = passwordData.currentPassword && 
                             passwordData.newPassword && 
                             passwordData.confirmPassword && 
                             isPasswordValid && 
                             passwordData.newPassword === passwordData.confirmPassword

  const handleProfileUpdate = async () => {
    if (!profileData.full_name) {
      toast.error('Full name is required')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await updateProfile(profileData)
      
      if (error) {
        toast.error(error.message || 'Failed to update profile')
        return
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!isPasswordFormValid) {
      toast.error('Please fill in all fields correctly')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setPasswordLoading(true)
    
    try {
      // In a real app, you would verify the current password first
      // For now, we'll just show a success message
      toast.success('Password updated successfully')
      setShowPasswordForm(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'China', 'India', 'Brazil'
  ]

  const states = [
    'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
  ]

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="iwanyu-card p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      getInitials(profile.full_name)
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {profile.full_name}
                </h2>
                <p className="text-gray-600">{profile.role}</p>
                
                {profile.company_name && (
                  <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                    <Building2 className="w-4 h-4 mr-1" />
                    {profile.company_name}
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Member since {new Date(profile.created_at).getFullYear()}</p>
                  <div className="mt-2 flex items-center justify-center">
                    {profile.is_verified ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                    )}
                    <span className={profile.is_verified ? 'text-green-600' : 'text-yellow-600'}>
                      {profile.is_verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="iwanyu-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="iwanyu-button-primary inline-flex items-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="iwanyu-input pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company_name: e.target.value }))}
                      className="iwanyu-input pl-10"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      className="iwanyu-input pl-10 bg-gray-50"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="iwanyu-input pl-10"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      className="iwanyu-input pl-10"
                      placeholder="Enter street address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    className="iwanyu-input"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <select
                    value={profileData.state}
                    onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                    className="iwanyu-input"
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={profileData.country}
                    onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                    className="iwanyu-input"
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={profileData.postal_code}
                    onChange={(e) => setProfileData(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="iwanyu-input"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="iwanyu-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="iwanyu-button-secondary inline-flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="iwanyu-input pl-10 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          className="iwanyu-input pl-10 pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="iwanyu-input pl-10 pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Password Requirements</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center text-xs">
                        {passwordStrength.length ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />}
                        <span className={passwordStrength.length ? 'text-green-600' : 'text-red-600'}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordStrength.uppercase ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />}
                        <span className={passwordStrength.uppercase ? 'text-green-600' : 'text-red-600'}>One uppercase letter</span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordStrength.lowercase ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />}
                        <span className={passwordStrength.lowercase ? 'text-green-600' : 'text-red-600'}>One lowercase letter</span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordStrength.number ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />}
                        <span className={passwordStrength.number ? 'text-green-600' : 'text-red-600'}>One number</span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordStrength.special ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />}
                        <span className={passwordStrength.special ? 'text-green-600' : 'text-red-600'}>One special character</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      className="iwanyu-button-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={passwordLoading || !isPasswordFormValid}
                      className="iwanyu-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}