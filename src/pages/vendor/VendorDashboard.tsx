import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  Plus,
  Eye,
  Download,
  MessageSquare,
  Bell
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  pendingPayouts: number
  lowStockProducts: number
  recentOrders: any[]
  salesData: any[]
  topProducts: any[]
}

export function VendorDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingPayouts: 0,
    lowStockProducts: 0,
    recentOrders: [],
    salesData: [],
    topProducts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user?.id)

      // Fetch orders count and recent orders
      const { data: orders, count: ordersCount } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch total sales
      const { data: salesData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', user?.id)
        .eq('payment_status', 'paid')

      const totalSales = salesData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      // Fetch pending payouts
      const { count: payoutsCount } = await supabase
        .from('payouts')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user?.id)
        .eq('status', 'pending')

      // Fetch low stock products
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user?.id)
        .lte('stock_quantity', 'low_stock_threshold')

      // Generate sample sales data for charts
      const salesData = generateSampleSalesData()
      const topProducts = generateSampleTopProducts()

      setStats({
        totalSales,
        totalOrders: ordersCount || 0,
        totalProducts: productsCount || 0,
        pendingPayouts: payoutsCount || 0,
        lowStockProducts: lowStockProducts?.length || 0,
        recentOrders: orders || [],
        salesData,
        topProducts
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const generateSampleSalesData = () => {
    const days = 7
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: formatDate(date).split(' ').slice(0, 2).join(' '),
        sales: Math.floor(Math.random() * 1000) + 100
      })
    }
    return data
  }

  const generateSampleTopProducts = () => {
    return [
      { name: 'Product A', sales: 150, revenue: 1500 },
      { name: 'Product B', sales: 120, revenue: 1200 },
      { name: 'Product C', sales: 100, revenue: 1000 },
      { name: 'Product D', sales: 80, revenue: 800 },
      { name: 'Product E', sales: 60, revenue: 600 }
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
                Here's what's happening with your business today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <Link
                to="/vendor/messages"
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <MessageSquare className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalSales)}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.pendingPayouts)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stats.lowStockProducts > 0 && (
          <div className="mb-8">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Low Stock Alert
                  </p>
                  <p className="text-sm text-orange-700">
                    You have {stats.lowStockProducts} products with low stock levels.
                  </p>
                </div>
                <Link
                  to="/vendor/products"
                  className="ml-auto text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  View Products →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
              <select className="text-sm border border-gray-300 rounded px-3 py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
              <Link
                to="/vendor/products"
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="iwanyu-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link
              to="/vendor/orders"
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              View All Orders →
            </Link>
          </div>
          
          {stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Customer {order.customer_id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/vendor/orders/${order.id}`}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding products to your catalog.
              </p>
              <div className="mt-6">
                <Link
                  to="/vendor/products"
                  className="iwanyu-button-primary inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            to="/vendor/products/new"
            className="iwanyu-card p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add Product</h3>
              <p className="text-sm text-gray-600">
                Create a new product listing
              </p>
            </div>
          </Link>

          <Link
            to="/vendor/orders"
            className="iwanyu-card p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Orders</h3>
              <p className="text-sm text-gray-600">
                View and update order statuses
              </p>
            </div>
          </Link>

          <Link
            to="/vendor/reports"
            className="iwanyu-card p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Reports</h3>
              <p className="text-sm text-gray-600">
                Export sales and analytics data
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}