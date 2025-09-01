import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface AdminStats {
  totalVendors: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingVendors: number
  pendingProducts: number
  pendingPayouts: number
  recentOrders: any[]
  revenueData: any[]
  vendorStats: any[]
  categoryBreakdown: any[]
}

export function AdminDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    pendingProducts: 0,
    pendingPayouts: 0,
    recentOrders: [],
    revenueData: [],
    vendorStats: [],
    categoryBreakdown: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    if (user) {
      fetchAdminData()
    }
  }, [user, dateRange])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch vendors count
      const { count: vendorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendor')

      // Fetch pending vendors
      const { count: pendingVendorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendor')
        .eq('is_verified', false)

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch pending products
      const { count: pendingProductsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)

      // Fetch orders count and recent orders
      const { data: orders, count: ordersCount } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch total revenue
      const { data: salesData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid')

      const totalRevenue = salesData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      // Fetch pending payouts
      const { count: payoutsCount } = await supabase
        .from('payouts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Generate sample data for charts
      const revenueData = generateRevenueData(parseInt(dateRange))
      const vendorStats = generateVendorStats()
      const categoryBreakdown = generateCategoryBreakdown()

      setStats({
        totalVendors: vendorsCount || 0,
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        pendingVendors: pendingVendorsCount || 0,
        pendingProducts: pendingProductsCount || 0,
        pendingPayouts: payoutsCount || 0,
        recentOrders: orders || [],
        revenueData,
        vendorStats,
        categoryBreakdown
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const generateRevenueData = (days: number) => {
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: formatDate(date).split(' ').slice(0, 2).join(' '),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 100) + 20
      })
    }
    return data
  }

  const generateVendorStats = () => {
    return [
      { name: 'Active Vendors', value: Math.floor(stats.totalVendors * 0.8), color: '#10B981' },
      { name: 'Pending Approval', value: stats.pendingVendors, color: '#F59E0B' },
      { name: 'Suspended', value: Math.floor(stats.totalVendors * 0.05), color: '#EF4444' }
    ]
  }

  const generateCategoryBreakdown = () => {
    return [
      { name: 'Electronics', value: 35, color: '#3B82F6' },
      { name: 'Clothing', value: 25, color: '#10B981' },
      { name: 'Home & Garden', value: 20, color: '#F59E0B' },
      { name: 'Sports', value: 15, color: '#8B5CF6' },
      { name: 'Other', value: 5, color: '#6B7280' }
    ]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.full_name}!
              </h1>
              <p className="text-gray-600">
                Here's what's happening across the Iwanyu platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="iwanyu-input"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
              <button className="iwanyu-button-secondary inline-flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalVendors}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.pendingVendors} pending approval
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.pendingProducts} pending approval
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
                <p className="text-xs text-gray-500">
                  Across all vendors
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.pendingPayouts} pending payouts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(stats.pendingVendors > 0 || stats.pendingProducts > 0 || stats.pendingPayouts > 0) && (
          <div className="mb-8">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Action Required
                  </p>
                  <p className="text-sm text-orange-700">
                    {stats.pendingVendors > 0 && `${stats.pendingVendors} vendors need approval, `}
                    {stats.pendingProducts > 0 && `${stats.pendingProducts} products need approval, `}
                    {stats.pendingPayouts > 0 && `${stats.pendingPayouts} payouts need processing`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Platform Revenue</h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm rounded-md bg-yellow-100 text-yellow-800">
                  Revenue
                </button>
                <button className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-600">
                  Orders
                </button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vendor Status Chart */}
          <div className="iwanyu-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Vendor Status Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={stats.vendorStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.vendorStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Breakdown and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown */}
          <div className="iwanyu-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Categories</h3>
            <div className="space-y-4">
              {stats.categoryBreakdown.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-3" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{category.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                View All →
              </button>
            </div>
            
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.id.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(order.total_amount)} • {order.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                      <div className="flex items-center mt-1">
                        {order.status === 'delivered' ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : order.status === 'processing' ? (
                          <Clock className="w-3 h-3 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-xs text-gray-500 ml-1 capitalize">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="iwanyu-card p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Vendors</h3>
              <p className="text-sm text-gray-600">
                Review and approve vendor applications
              </p>
            </div>
          </div>

          <div className="iwanyu-card p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Review Products</h3>
              <p className="text-sm text-gray-600">
                Approve or reject product listings
              </p>
            </div>
          </div>

          <div className="iwanyu-card p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Process Payouts</h3>
              <p className="text-sm text-gray-600">
                Review and approve vendor payouts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}