'use client'

import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Mail,
  Shield,
  Smartphone,
  Globe,
  Save,
  Upload,
  Lock
} from 'lucide-react'

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure platform settings and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>General platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="platformName" className="block text-sm font-medium text-gray-700 mb-1">
                  Platform Name
                </label>
                <Input 
                  id="platformName"
                  defaultValue="Iwanyu Marketplace"
                  placeholder="Platform name"
                />
              </div>
              <div>
                <label htmlFor="platformUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Platform URL
                </label>
                <Input 
                  id="platformUrl"
                  defaultValue="https://iwanyu.com"
                  placeholder="Platform URL"
                />
              </div>
              <div>
                <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Support Email
                </label>
                <Input 
                  id="supportEmail"
                  type="email"
                  defaultValue="support@iwanyu.com"
                  placeholder="Support email"
                />
              </div>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Save className="mr-2 h-4 w-4" />
                Save Platform Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Commission Settings
              </CardTitle>
              <CardDescription>Configure platform commission rates for Mobile Money</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="defaultCommission" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Commission Rate (%)
                </label>
                <Input 
                  id="defaultCommission"
                  type="number"
                  defaultValue="5"
                  placeholder="Commission percentage"
                />
              </div>
              <div>
                <label htmlFor="premiumCommission" className="block text-sm font-medium text-gray-700 mb-1">
                  Premium Vendor Rate (%)
                </label>
                <Input 
                  id="premiumCommission"
                  type="number"
                  defaultValue="3"
                  placeholder="Premium commission percentage"
                />
              </div>
              <div>
                <label htmlFor="payoutSchedule" className="block text-sm font-medium text-gray-700 mb-1">
                  Payout Schedule
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <Button variant="outline" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Update Commission Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
              <CardDescription>Configure email notifications and templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <Input 
                  id="smtpHost"
                  defaultValue="smtp.brevo.com"
                  placeholder="SMTP host"
                />
              </div>
              <div>
                <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <Input 
                  id="fromEmail"
                  type="email"
                  defaultValue="noreply@iwanyu.com"
                  placeholder="From email address"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                {[
                  'New vendor registration',
                  'Order confirmations',
                  'Payout notifications',
                  'System alerts'
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{notification}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Platform security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mb-3">Require 2FA for admin accounts</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enforce 2FA</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Session Management</h4>
                <p className="text-sm text-gray-600 mb-3">Configure session timeouts</p>
                <Input 
                  placeholder="Session timeout (minutes)"
                  defaultValue="30"
                  type="number"
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">API Access</h4>
                <p className="text-sm text-gray-600 mb-3">Manage API keys and permissions</p>
                <Button size="sm" variant="outline">
                  <Lock className="mr-1 h-3 w-3" />
                  Manage API Keys
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload Settings
            </CardTitle>
            <CardDescription>Configure file upload limits and allowed types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Max File Size (MB)
                </label>
                <Input 
                  id="maxFileSize"
                  type="number"
                  defaultValue="10"
                  placeholder="Maximum file size"
                />
              </div>
              <div>
                <label htmlFor="allowedTypes" className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed File Types
                </label>
                <Input 
                  id="allowedTypes"
                  defaultValue="jpg,png,pdf,doc"
                  placeholder="Comma-separated file types"
                />
              </div>
              <div>
                <label htmlFor="storageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Limit per Vendor (GB)
                </label>
                <Input 
                  id="storageLimit"
                  type="number"
                  defaultValue="5"
                  placeholder="Storage limit"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Save className="mr-2 h-4 w-4" />
                Save Upload Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
