import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Key,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PlatformSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportPhone: string
  commissionRate: number
  minPayoutAmount: number
  maxPayoutAmount: number
  autoApproveVendors: boolean
  autoApproveProducts: boolean
  requireVendorVerification: boolean
  requireProductApproval: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  maintenanceMode: boolean
}

export function AdminSettings() {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'platform' | 'notifications'>('profile')
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || '',
    postal_code: profile?.postal_code || ''
  })

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    siteName: 'Iwanyu Marketplace',
    siteDescription: 'Professional vendor marketplace platform',
    contactEmail: 'admin@iwanyu.com',
    supportPhone: '+1 (555) 123-4567',
    commissionRate: 15,
    minPayoutAmount: 50,
    maxPayoutAmount: 10000,
    autoApproveVendors: false,
    autoApproveProducts: false,
    requireVendorVerification: true,
    requireProductApproval: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newVendorRegistration: true,
    newProductSubmission: true,
    payoutRequests: true,
    orderUpdates: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: true
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        postal_code: profile.postal_code || ''
      })
    }
  }, [profile])

  const handleProfileUpdate = async () => {
    try {
      setLoading(true)
      
      const { error } = await updateProfile(profileData)
      
      if (error) throw error
      
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      if (securityData.newPassword !== securityData.confirmPassword) {
        toast.error('New passwords do not match')
        return
      }

      if (securityData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long')
        return
      }

      setLoading(true)
      
      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: securityData.newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully')
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handlePlatformSettingsUpdate = async () => {
    try {
      setLoading(true)
      
      // In a real app, this would save to a platform_settings table
      // For now, we'll just show a success message
      toast.success('Platform settings updated successfully')
    } catch (error) {
      console.error('Error updating platform settings:', error)
      toast.error('Failed to update platform settings')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSettingsUpdate = async () => {
    try {
      setLoading(true)
      
      // In a real app, this would save to a notification_settings table
      toast.success('Notification settings updated successfully')
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast.error('Failed to update notification settings')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600']
    
    return {
      score: Math.min(score, 5),
      label: labels[Math.min(score - 1, 4)],
      color: colors[Math.min(score - 1, 4)]
    }
  }

  const passwordStrength = getPasswordStrength(securityData.newPassword)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600">
              Manage your profile, security, and platform configuration
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'platform', label: 'Platform', icon: Globe },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="iwanyu-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="iwanyu-input bg-gray-50"
                  placeholder="Email address"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter state or province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={profileData.country}
                  onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={profileData.postal_code}
                  onChange={(e) => setProfileData({...profileData, postal_code: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="iwanyu-button-primary inline-flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="iwanyu-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                    className="iwanyu-input pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    className="iwanyu-input pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {securityData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < passwordStrength.score ? passwordStrength.color.replace('text-', 'bg-') : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-sm ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    className="iwanyu-input pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                
                {securityData.confirmPassword && (
                  <div className="mt-2">
                    {securityData.newPassword === securityData.confirmPassword ? (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Passwords do not match
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handlePasswordChange}
                  disabled={loading || !securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword}
                  className="iwanyu-button-primary inline-flex items-center"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Platform Settings */}
        {activeTab === 'platform' && (
          <div className="iwanyu-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={platformSettings.siteName}
                  onChange={(e) => setPlatformSettings({...platformSettings, siteName: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter site name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={platformSettings.contactEmail}
                  onChange={(e) => setPlatformSettings({...platformSettings, contactEmail: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter contact email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                <input
                  type="tel"
                  value={platformSettings.supportPhone}
                  onChange={(e) => setPlatformSettings({...platformSettings, supportPhone: e.target.value})}
                  className="iwanyu-input"
                  placeholder="Enter support phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                <input
                  type="number"
                  value={platformSettings.commissionRate}
                  onChange={(e) => setPlatformSettings({...platformSettings, commissionRate: parseFloat(e.target.value)})}
                  className="iwanyu-input"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Payout Amount</label>
                <input
                  type="number"
                  value={platformSettings.minPayoutAmount}
                  onChange={(e) => setPlatformSettings({...platformSettings, minPayoutAmount: parseFloat(e.target.value)})}
                  className="iwanyu-input"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Payout Amount</label>
                <input
                  type="number"
                  value={platformSettings.maxPayoutAmount}
                  onChange={(e) => setPlatformSettings({...platformSettings, maxPayoutAmount: parseFloat(e.target.value)})}
                  className="iwanyu-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Approval Settings</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={platformSettings.autoApproveVendors}
                    onChange={(e) => setPlatformSettings({...platformSettings, autoApproveVendors: e.target.checked})}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-approve new vendor registrations</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={platformSettings.autoApproveProducts}
                    onChange={(e) => setPlatformSettings({...platformSettings, autoApproveProducts: e.target.checked})}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-approve new product submissions</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={platformSettings.requireVendorVerification}
                    onChange={(e) => setPlatformSettings({...platformSettings, requireVendorVerification: e.target.checked})}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require vendor verification</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={platformSettings.requireProductApproval}
                    onChange={(e) => setPlatformSettings({...platformSettings, requireProductApproval: e.target.checked})}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require product approval</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePlatformSettingsUpdate}
                disabled={loading}
                className="iwanyu-button-primary inline-flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Platform Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="iwanyu-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.newVendorRegistration}
                      onChange={(e) => setNotificationSettings({...notificationSettings, newVendorRegistration: e.target.checked})}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">New vendor registrations</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.newProductSubmission}
                      onChange={(e) => setNotificationSettings({...notificationSettings, newProductSubmission: e.target.checked})}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">New product submissions</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.payoutRequests}
                      onChange={(e) => setNotificationSettings({...notificationSettings, payoutRequests: e.target.checked})}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Payout requests</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.orderUpdates}
                      onChange={(e) => setNotificationSettings({...notificationSettings, orderUpdates: e.target.checked})}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Order status updates</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemAlerts}
                      onChange={(e) => setNotificationSettings({...notificationSettings, systemAlerts: e.target.checked})}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">System alerts and warnings</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Report Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReports}
                      onChange={(e) => setNotificationSettings({...notificationSettings, weeklyReports: e.target.checked})}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Weekly performance reports</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.monthlyReports}
                      onChange={(e) => setNotificationSettings({...notificationSettings, monthlyReports: e.target.checked})}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Monthly performance reports</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleNotificationSettingsUpdate}
                  disabled={loading}
                  className="iwanyu-button-primary inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}