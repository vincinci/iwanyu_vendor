import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

interface ReportData {
  salesData: any[]
  topProducts: any[]
  categoryBreakdown: any[]
  customerMetrics: any[]
  revenueMetrics: {
    totalRevenue: number
    monthlyRevenue: number
    weeklyRevenue: number
    dailyRevenue: number
    revenueGrowth: number
  }
  orderMetrics: {
    totalOrders: number
    monthlyOrders: number
    weeklyOrders: number
    dailyOrders: number
    orderGrowth: number
  }
}

export function VendorReports() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData>({
    salesData: [],
    topProducts: [],
    categoryBreakdown: [],
    customerMetrics: [],
    revenueMetrics: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      weeklyRevenue: 0,
      dailyRevenue: 0,
      revenueGrowth: 0
    },
    orderMetrics: {
      totalOrders: 0,
      monthlyOrders: 0,
      weeklyOrders: 0,
      orderGrowth: 0,
      dailyOrders: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [user, dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // Fetch orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user?.id)
        .eq('payment_status', 'paid')
        .gte('created_at', getDateFromRange(dateRange))

      if (!orders) return

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const totalOrders = orders.length

      // Calculate time-based metrics
      const now = new Date()
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const monthlyRevenue = orders
        .filter(order => new Date(order.created_at) >= monthAgo)
        .reduce((sum, order) => sum + order.total_amount, 0)

      const weeklyRevenue = orders
        .filter(order => new Date(order.created_at) >= weekAgo)
        .reduce((sum, order) => sum + order.total_amount, 0)

      const dailyRevenue = orders
        .filter(order => new Date(order.created_at) >= dayAgo)
        .reduce((sum, order) => sum + order.total_amount, 0)

      const monthlyOrders = orders.filter(order => new Date(order.created_at) >= monthAgo).length
      const weeklyOrders = orders.filter(order => new Date(order.created_at) >= weekAgo).length
      const dailyOrders = orders.filter(order => new Date(order.created_at) >= dayAgo).length

      // Calculate growth rates (simplified)
      const revenueGrowth = monthlyRevenue > 0 ? ((monthlyRevenue - (monthlyRevenue * 0.9)) / (monthlyRevenue * 0.9)) * 100 : 0
      const orderGrowth = monthlyOrders > 0 ? ((monthlyOrders - (monthlyOrders * 0.9)) / (monthlyOrders * 0.9)) * 100 : 0

      // Generate sample sales data
      const salesData = generateSalesData(parseInt(dateRange))
      const topProducts = generateTopProducts()
      const categoryBreakdown = generateCategoryBreakdown()
      const customerMetrics = generateCustomerMetrics()

      setReportData({
        salesData,
        topProducts,
        categoryBreakdown,
        customerMetrics,
        revenueMetrics: {
          totalRevenue,
          monthlyRevenue,
          weeklyRevenue,
          dailyRevenue,
          revenueGrowth
        },
        orderMetrics: {
          totalOrders,
          monthlyOrders,
          weeklyOrders,
          dailyOrders,
          orderGrowth
        }
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const getDateFromRange = (range: string) => {
    const now = new Date()
    const days = parseInt(range)
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  }

  const generateSalesData = (days: number) => {
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: formatDate(date).split(' ').slice(0, 2).join(' '),
        sales: Math.floor(Math.random() * 1000) + 100,
        orders: Math.floor(Math.random() * 20) + 5
      })
    }
    return data
  }

  const generateTopProducts = () => {
    return [
      { name: 'Product A', sales: 150, revenue: 1500 },
      { name: 'Product B', sales: 120, revenue: 1200 },
      { name: 'Product C', sales: 100, revenue: 1000 },
      { name: 'Product D', sales: 80, revenue: 800 },
      { name: 'Product E', sales: 60, revenue: 600 }
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

  const generateCustomerMetrics = () => {
    return [
      { metric: 'New Customers', value: 45, change: 12, positive: true },
      { metric: 'Returning Customers', value: 78, change: 8, positive: true },
      { metric: 'Customer Satisfaction', value: 4.2, change: -0.3, positive: false },
      { metric: 'Average Order Value', value: 89, change: 15, positive: true }
    ]
  }

  const handleExport = (type: 'csv' | 'pdf') => {
    toast.success(`${type.toUpperCase()} export started`)
    // Implement actual export logic here
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">
                Track your performance and business insights
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
              <button
                onClick={() => handleExport('csv')}
                className="iwanyu-button-secondary inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="iwanyu-button-secondary inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.revenueMetrics.totalRevenue)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${reportData.revenueMetrics.revenueGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {reportData.revenueMetrics.revenueGrowth >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-sm ${reportData.revenueMetrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.revenueMetrics.revenueGrowth >= 0 ? '+' : ''}{reportData.revenueMetrics.revenueGrowth.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.orderMetrics.totalOrders}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${reportData.orderMetrics.orderGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {reportData.orderMetrics.orderGrowth >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-sm ${reportData.orderMetrics.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.orderMetrics.orderGrowth >= 0 ? '+' : ''}{reportData.orderMetrics.orderGrowth.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.revenueMetrics.monthlyRevenue)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">This month</span>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.revenueMetrics.weeklyRevenue)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">This week</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Trend Chart */}
          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedMetric === 'revenue' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setSelectedMetric('orders')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedMetric === 'orders' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric === 'revenue' ? 'sales' : 'orders'} 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="iwanyu-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={reportData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products and Customer Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="iwanyu-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Products</h3>
            <div className="space-y-4">
              {reportData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-yellow-800">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Metrics */}
          <div className="iwanyu-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Metrics</h3>
            <div className="space-y-4">
              {reportData.customerMetrics.map((metric) => (
                <div key={metric.metric} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{metric.metric}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900 mr-2">
                      {typeof metric.value === 'number' && metric.value > 1000 
                        ? formatCurrency(metric.value)
                        : metric.value
                      }
                    </span>
                    <span className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.positive ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="iwanyu-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Metrics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weekly
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Revenue
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(reportData.revenueMetrics.dailyRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(reportData.revenueMetrics.weeklyRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(reportData.revenueMetrics.monthlyRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(reportData.revenueMetrics.totalRevenue)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Orders
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reportData.orderMetrics.dailyOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reportData.orderMetrics.weeklyOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reportData.orderMetrics.monthlyOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {reportData.orderMetrics.totalOrders}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}