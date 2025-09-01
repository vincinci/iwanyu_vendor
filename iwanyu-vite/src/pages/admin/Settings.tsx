import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Save, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Mail,
  DollarSign,
  Database,
  Lock,
  User,
  CheckCircle
} from 'lucide-react';

// Mock settings data
const mockSettings = {
  platformName: 'Iwanyu Marketplace',
  platformDescription: 'Premier multi-vendor marketplace platform',
  supportEmail: 'support@iwanyu.com',
  adminEmail: 'admin@iwanyu.com',
  commissionRate: 5.0,
  minPayoutAmount: 50.0,
  payoutProcessingDays: 3,
  emailNotifications: true,
  smsNotifications: false,
  autoApproveProducts: false,
  requireVendorApproval: true,
  maintenanceMode: false,
};

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: mockSettings,
  });

  const onSubmit = async (data: any) => {
    try {
      console.log('Updating settings:', data);
      setIsEditing(false);
    } catch (error) {
      console.error('Settings update error:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-gray-600">Configure platform settings and preferences</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'General', icon: SettingsIcon },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'profile', label: 'Admin Profile', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>General Settings</CardTitle>
                  {isEditing && (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={isSubmitting}>
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
                      label="Platform Name"
                      disabled={!isEditing}
                      {...register('platformName')}
                    />
                    <Input
                      label="Support Email"
                      type="email"
                      disabled={!isEditing}
                      {...register('supportEmail')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={3}
                      disabled={!isEditing}
                      {...register('platformDescription')}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        disabled={!isEditing}
                        {...register('maintenanceMode')}
                      />
                      <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                        Maintenance Mode
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireVendorApproval"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        disabled={!isEditing}
                        {...register('requireVendorApproval')}
                      />
                      <label htmlFor="requireVendorApproval" className="text-sm font-medium text-gray-700">
                        Require Vendor Approval
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Settings */}
          {activeTab === 'financial' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Financial Settings</CardTitle>
                  {isEditing && (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={isSubmitting}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Commission Rate (%)"
                      type="number"
                      step="0.1"
                      disabled={!isEditing}
                      {...register('commissionRate')}
                    />
                    <Input
                      label="Minimum Payout Amount ($)"
                      type="number"
                      step="0.01"
                      disabled={!isEditing}
                      {...register('minPayoutAmount')}
                    />
                    <Input
                      label="Payout Processing Days"
                      type="number"
                      disabled={!isEditing}
                      {...register('payoutProcessingDays')}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoApproveProducts"
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      disabled={!isEditing}
                      {...register('autoApproveProducts')}
                    />
                    <label htmlFor="autoApproveProducts" className="text-sm font-medium text-gray-700">
                      Auto-approve products from verified vendors
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Notification Settings</CardTitle>
                  {isEditing && (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={isSubmitting}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">Email Notifications</div>
                          <div className="text-sm text-gray-600">Receive email alerts for important events</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        disabled={!isEditing}
                        {...register('emailNotifications')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium text-gray-900">SMS Notifications</div>
                          <div className="text-sm text-gray-600">Receive SMS alerts for critical events</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        disabled={!isEditing}
                        {...register('smsNotifications')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="font-medium text-green-900">Two-Factor Authentication</span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">2FA is enabled for your admin account</p>
                      <Button variant="outline" size="sm">
                        Manage 2FA
                      </Button>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-3">
                        <Lock className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="font-medium text-blue-900">Session Management</span>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">Manage active admin sessions</p>
                      <Button variant="outline" size="sm">
                        View Sessions
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-3">
                      <Database className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="font-medium text-yellow-900">Audit Logs</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">Track all admin actions and system changes</p>
                    <Button variant="outline" size="sm">
                      View Audit Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Profile */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Admin Profile</CardTitle>
                  {isEditing && (
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={isSubmitting}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Admin Account</h3>
                      <p className="text-gray-600">Platform Administrator</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="error">Admin</Badge>
                        <Badge variant="success">Verified</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      disabled={!isEditing}
                      defaultValue="Platform Administrator"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      disabled={!isEditing}
                      {...register('adminEmail')}
                    />
                    <Input
                      label="Phone Number"
                      disabled={!isEditing}
                      defaultValue="+1 (555) 000-0000"
                    />
                    <Input
                      label="Department"
                      disabled={!isEditing}
                      defaultValue="Platform Operations"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-medium text-green-900">Database</div>
                <div className="text-sm text-green-700">Operational</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-medium text-green-900">Authentication</div>
                <div className="text-sm text-green-700">Operational</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-medium text-green-900">Storage</div>
                <div className="text-sm text-green-700">Operational</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};