'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  User,
  Shield,
  Database,
  Mail,
  Bell,
  CreditCard,
  Globe,
  Activity,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle
} from 'lucide-react'

interface AdminSettings {
  site_name: string
  site_description: string
  site_url: string
  admin_email: string
  support_email: string
  default_commission_rate: number
  default_tax_rate: number
  default_shipping_rate: number
  maintenance_mode: boolean
  allow_registrations: boolean
  auto_approve_vendors: boolean
  auto_approve_products: boolean
  email_notifications: boolean
  sms_notifications: boolean
  backup_frequency: string
  max_file_size: number
  allowed_file_types: string[]
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState<AdminSettings>({
    site_name: 'Iwanyu Marketplace',
    site_description: 'Rwanda\'s Premier Multi-Vendor Marketplace',
    site_url: 'https://iwanyu.store',
    admin_email: 'admin@iwanyu.store',
    support_email: 'support@iwanyu.store',
    default_commission_rate: 10,
    default_tax_rate: 18,
    default_shipping_rate: 5000,
    maintenance_mode: false,
    allow_registrations: true,
    auto_approve_vendors: false,
    auto_approve_products: false,
    email_notifications: true,
    sms_notifications: false,
    backup_frequency: 'daily',
    max_file_size: 10,
    allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
  })

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // In a real app, you'd load settings from database
      // For now, we'll use default values
      console.log('Settings loaded')
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      // In a real app, you'd save to database
      console.log('Saving settings:', settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof AdminSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'business', label: 'Business', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600">Configure platform settings and preferences</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Button onClick={loadSettings} disabled={loading}>
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            <Button onClick={saveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? <Activity className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-t-lg ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">General Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Site Name</label>
                          <Input
                            value={settings.site_name}
                            onChange={(e) => updateSetting('site_name', e.target.value)}
                            placeholder="Marketplace Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Site URL</label>
                          <Input
                            value={settings.site_url}
                            onChange={(e) => updateSetting('site_url', e.target.value)}
                            placeholder="https://yoursite.com"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Site Description</label>
                          <textarea
                            value={settings.site_description}
                            onChange={(e) => updateSetting('site_description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="Brief description of your marketplace"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Admin Email</label>
                          <Input
                            type="email"
                            value={settings.admin_email}
                            onChange={(e) => updateSetting('admin_email', e.target.value)}
                            placeholder="admin@yoursite.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Support Email</label>
                          <Input
                            type="email"
                            value={settings.support_email}
                            onChange={(e) => updateSetting('support_email', e.target.value)}
                            placeholder="support@yoursite.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'business' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Business Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Default Commission Rate (%)</label>
                          <Input
                            type="number"
                            value={settings.default_commission_rate}
                            onChange={(e) => updateSetting('default_commission_rate', parseFloat(e.target.value))}
                            placeholder="10"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Default Tax Rate (%)</label>
                          <Input
                            type="number"
                            value={settings.default_tax_rate}
                            onChange={(e) => updateSetting('default_tax_rate', parseFloat(e.target.value))}
                            placeholder="18"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Default Shipping Rate (RWF)</label>
                          <Input
                            type="number"
                            value={settings.default_shipping_rate}
                            onChange={(e) => updateSetting('default_shipping_rate', parseFloat(e.target.value))}
                            placeholder="5000"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Security & Access</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Allow New Registrations</label>
                            <p className="text-xs text-gray-500">Allow new vendors to register</p>
                          </div>
                          <button
                            onClick={() => updateSetting('allow_registrations', !settings.allow_registrations)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.allow_registrations ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.allow_registrations ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Auto-Approve Vendors</label>
                            <p className="text-xs text-gray-500">Automatically approve new vendor registrations</p>
                          </div>
                          <button
                            onClick={() => updateSetting('auto_approve_vendors', !settings.auto_approve_vendors)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.auto_approve_vendors ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.auto_approve_vendors ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Auto-Approve Products</label>
                            <p className="text-xs text-gray-500">Automatically approve new product listings</p>
                          </div>
                          <button
                            onClick={() => updateSetting('auto_approve_products', !settings.auto_approve_products)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.auto_approve_products ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.auto_approve_products ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Maintenance Mode</label>
                            <p className="text-xs text-gray-500">Temporarily disable site access for maintenance</p>
                          </div>
                          <button
                            onClick={() => updateSetting('maintenance_mode', !settings.maintenance_mode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.maintenance_mode ? 'bg-red-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Email Notifications</label>
                            <p className="text-xs text-gray-500">Send email notifications for important events</p>
                          </div>
                          <button
                            onClick={() => updateSetting('email_notifications', !settings.email_notifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">SMS Notifications</label>
                            <p className="text-xs text-gray-500">Send SMS notifications for urgent events</p>
                          </div>
                          <button
                            onClick={() => updateSetting('sms_notifications', !settings.sms_notifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.sms_notifications ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.sms_notifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">System Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Backup Frequency</label>
                          <select
                            value={settings.backup_frequency}
                            onChange={(e) => updateSetting('backup_frequency', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Max File Size (MB)</label>
                          <Input
                            type="number"
                            value={settings.max_file_size}
                            onChange={(e) => updateSetting('max_file_size', parseInt(e.target.value))}
                            placeholder="10"
                            min="1"
                            max="100"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Allowed File Types</label>
                          <Input
                            value={settings.allowed_file_types.join(', ')}
                            onChange={(e) => updateSetting('allowed_file_types', e.target.value.split(', '))}
                            placeholder="jpg, jpeg, png, gif, pdf"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separate file extensions with commas</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">System Information</h4>
                          <div className="mt-2 text-sm text-yellow-700 space-y-1">
                            <p>Database Status: <Badge className="bg-green-100 text-green-800">Connected</Badge></p>
                            <p>Last Backup: Today at 3:00 AM</p>
                            <p>System Version: v1.0.0</p>
                            <p>Environment: Production</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
