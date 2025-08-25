'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  Crown,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Activity,
  RefreshCw,
  Banknote,
  Package,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface VendorSubscription {
  id: string
  vendor_id: string
  vendor_name: string
  business_name: string
  plan_name: string
  display_name: string
  price: number
  max_products: number | null
  max_orders: number | null
  features: string[]
  is_active: boolean
  started_at: string
  expires_at: string | null
  created_at: string
}

interface SubscriptionStats {
  total: number
  free: number
  basic: number
  standard: number
  premium: number
  active: number
  expired: number
  total_revenue: number
  monthly_revenue: number
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<VendorSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('active') // Default to active
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    free: 0,
    basic: 0,
    standard: 0,
    premium: 0,
    active: 0,
    expired: 0,
    total_revenue: 0,
    monthly_revenue: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSubscriptions()
    
    const interval = setInterval(() => {
      fetchSubscriptions()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      console.log('Fetching subscriptions...')
      
      // For demo purposes, create mock subscriptions based on vendors
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('id, full_name, business_name, email, status, subscription_plan, subscription_expires_at, created_at')

      if (vendorsData) {
        const mockSubscriptions: VendorSubscription[] = vendorsData.map(vendor => ({
          id: `sub-${vendor.id}`,
          vendor_id: vendor.id,
          plan_name: vendor.subscription_plan || 'free',
          display_name: vendor.subscription_plan === 'free' ? 'Free Plan' :
                       vendor.subscription_plan === 'basic' ? 'Basic Plan' :
                       vendor.subscription_plan === 'standard' ? 'Standard Plan' :
                       vendor.subscription_plan === 'premium' ? 'Premium Plan' : 'Free Plan',
          price: vendor.subscription_plan === 'free' ? 0 :
                 vendor.subscription_plan === 'basic' ? 29.99 :
                 vendor.subscription_plan === 'standard' ? 59.99 :
                 vendor.subscription_plan === 'premium' ? 99.99 : 0,
          max_products: vendor.subscription_plan === 'free' ? 10 :
                       vendor.subscription_plan === 'basic' ? 100 :
                       vendor.subscription_plan === 'standard' ? 500 : null,
          max_orders: vendor.subscription_plan === 'free' ? 50 :
                     vendor.subscription_plan === 'basic' ? 500 :
                     vendor.subscription_plan === 'standard' ? 2000 : null,
          features: vendor.subscription_plan === 'free' ? ['Basic support', 'Limited analytics'] :
                   vendor.subscription_plan === 'basic' ? ['Email support', 'Basic analytics', 'Product variants'] :
                   vendor.subscription_plan === 'standard' ? ['Priority support', 'Advanced analytics', 'Bulk operations', 'Marketing tools'] :
                   vendor.subscription_plan === 'premium' ? ['24/7 support', 'Full analytics', 'Custom branding', 'API access', 'Priority listing'] :
                   ['Basic support', 'Limited analytics'],
          is_active: vendor.status === 'approved' && (!vendor.subscription_expires_at || new Date(vendor.subscription_expires_at) > new Date()),
          started_at: vendor.created_at,
          expires_at: vendor.subscription_expires_at,
          created_at: vendor.created_at,
          vendor_name: vendor.full_name,
          business_name: vendor.business_name
        }))

        setSubscriptions(mockSubscriptions)

        // Calculate stats
        const stats = {
          total: mockSubscriptions.length,
          free: mockSubscriptions.filter(s => s.plan_name === 'free').length,
          basic: mockSubscriptions.filter(s => s.plan_name === 'basic').length,
          standard: mockSubscriptions.filter(s => s.plan_name === 'standard').length,
          premium: mockSubscriptions.filter(s => s.plan_name === 'premium').length,
          active: mockSubscriptions.filter(s => s.is_active).length,
          expired: mockSubscriptions.filter(s => !s.is_active).length,
          total_revenue: mockSubscriptions.filter(s => s.plan_name !== 'free').reduce((sum, s) => sum + s.price, 0),
          monthly_revenue: mockSubscriptions.filter(s => s.plan_name !== 'free' && s.is_active).reduce((sum, s) => sum + s.price, 0)
        }
        
        setStats(stats)
        console.log('Subscriptions loaded:', { count: mockSubscriptions.length, stats })
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const getPlanBadge = (planName: string) => {
    const badges = {
      free: <Badge className="bg-gray-100 text-gray-800">Free</Badge>,
      basic: <Badge className="bg-blue-100 text-blue-800">Basic</Badge>,
      standard: <Badge className="bg-purple-100 text-purple-800">Standard</Badge>,
      premium: <Badge className="bg-yellow-100 text-yellow-800"><Crown className="h-3 w-3 mr-1" />Premium</Badge>
    }
    return badges[planName as keyof typeof badges] || <Badge variant="outline">{planName}</Badge>
  }

  const getStatusBadge = (isActive: boolean, expiresAt: string | null) => {
    if (!isActive) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>
    }
    if (expiresAt && new Date(expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = !searchTerm || 
      subscription.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPlan = !planFilter || subscription.plan_name === planFilter
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && subscription.is_active) ||
      (statusFilter === 'expired' && !subscription.is_active)
    
    return matchesSearch && matchesPlan && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600">Monitor vendor subscription plans and billing</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Button onClick={fetchSubscriptions} disabled={loading}>
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Crown className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500">{stats.active} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthly_revenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500">Recurring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Plans</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premium + stats.standard}</div>
              <p className="text-xs text-gray-500">{stats.premium} premium, {stats.standard} standard</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Users</CardTitle>
              <User className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.free}</div>
              <p className="text-xs text-gray-500">Conversion opportunity</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by vendor name, business, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Plans</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter ({filteredSubscriptions.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Subscriptions</CardTitle>
            <CardDescription>
              Manage vendor subscription plans and billing ({filteredSubscriptions.length} subscriptions found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Activity className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading subscriptions...</span>
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Crown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-500">Vendor subscriptions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {subscription.business_name || subscription.vendor_name || 'Unknown Vendor'}
                            </h3>
                            {getPlanBadge(subscription.plan_name)}
                            {getStatusBadge(subscription.is_active, subscription.expires_at)}
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">Plan:</span> {subscription.display_name}
                            </div>
                            <div>
                              <span className="font-medium">Price:</span> ${subscription.price}/month
                            </div>
                            <div>
                              <span className="font-medium">Products:</span> {subscription.max_products || 'Unlimited'}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {subscription.features.map((feature: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">Started:</span> {new Date(subscription.started_at).toLocaleDateString()}
                            </div>
                            {subscription.expires_at && (
                              <div>
                                <span className="font-medium">Expires:</span> {new Date(subscription.expires_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calendar className="h-4 w-4 mr-1" />
                              Billing History
                            </Button>
                            {subscription.plan_name === 'free' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Crown className="h-4 w-4 mr-1" />
                                Upgrade
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
