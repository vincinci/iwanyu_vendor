import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts'

interface PlatformStats {
  totalRevenue: number
  totalOrders: number
  totalVendors: number
  totalProducts: number
  revenueGrowth: number
  orderGrowth: number
  vendorGrowth: number
  productGrowth: number
}

interface VendorPerformance {
  id: string
  name: string
  revenue: number
  orders: number
  products: number
  rating: number
  growth: number
}

interface CategoryData {
  name: string
  revenue: number
  orders: number
  products: number
  color: string
}

export function AdminReports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'vendors'>('revenue')
  
  // Data states
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalVendors: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    vendorGrowth: 0,
    productGrowth: 0
  })
  
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [user, dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // Fetch platform statistics
      await fetchPlatformStats()
      
      // Generate sample data for charts
      generateChartData()
      
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatformStats = async () => {
    try {
      // Fetch total revenue
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, payment_status')
        .eq('payment_status', 'paid')

      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      // Fetch total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Fetch total vendors
      const { count: totalVendors } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vendor')

      // Fetch total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Calculate growth percentages (sample data for now)
      const revenueGrowth = Math.floor(Math.random() * 40) - 10 // -10% to +30%
      const orderGrowth = Math.floor(Math.random() * 30) - 5
      const vendorGrowth = Math.floor(Math.random() * 20) - 5
      const productGrowth = Math.floor(Math.random() * 25) - 5

      setPlatformStats({
        totalRevenue,
        totalOrders: totalOrders || 0,
        totalVendors: totalVendors || 0,
        totalProducts: totalProducts || 0,
        revenueGrowth,
        orderGrowth,
        vendorGrowth,
        productGrowth
      })
    } catch (error) {
      console.error('Error fetching platform stats:', error)
    }
  }

  const generateChartData = () => {
    // Generate revenue data
    const days = parseInt(dateRange)
    const revenueData = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      revenueData.push({
        date: formatDate(date).split(' ').slice(0, 2).join(' '),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 100) + 20,
        vendors: Math.floor(Math.random() * 10) + 5
      })
    }
    setRevenueData(revenueData)

    // Generate vendor performance data
    const vendorData = [
      { id: '1', name: 'TechCorp Solutions', revenue: 45000, orders: 156, products: 89, rating: 4.8, growth: 12 },
      { id: '2', name: 'Fashion Forward', revenue: 38000, orders: 134, products: 67, rating: 4.6, growth: 8 },
      { id: '3', name: 'Home & Garden Pro', revenue: 32000, orders: 98, products: 45, rating: 4.7, growth: 15 },
      { id: '4', name: 'Sports Elite', revenue: 28000, orders: 87, products: 34, rating: 4.5, growth: 6 },
      { id: '5', name: 'Electronics Plus', revenue: 25000, orders: 76, products: 28, rating: 4.4, growth: 9 }
    ]
    setVendorPerformance(vendorData)

    // Generate category data
    const categories = [
      { name: 'Electronics', revenue: 45000, orders: 156, products: 89, color: '#3B82F6' },
      { name: 'Clothing', revenue: 38000, orders: 134, products: 67, color: '#10B981' },
      { name: 'Home & Garden', revenue: 32000, orders: 98, products: 45, color: '#F59E0B' },
      { name: 'Sports', revenue: 28000, orders: 87, products: 34, color: '#8B5CF6' },
      { name: 'Books', revenue: 18000, orders: 65, products: 23, color: '#EF4444' }
    ]
    setCategoryData(categories)

    // Generate top products
    const products = [
      { name: 'Wireless Headphones', revenue: 8500, orders: 45, vendor: 'TechCorp Solutions' },
      { name: 'Smart Watch', revenue: 7200, orders: 38, vendor: 'TechCorp Solutions' },
      { name: 'Designer T-Shirt', revenue: 6800, orders: 52, vendor: 'Fashion Forward' },
      { name: 'Garden Tool Set', revenue: 5900, orders: 31, vendor: 'Home & Garden Pro' },
      { name: 'Running Shoes', revenue: 5200, orders: 28, vendor: 'Sports Elite' }
    ]
    setTopProducts(products)
  }

  const exportReport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      const csvContent = [
        ['Metric', 'Value', 'Growth'],
        ['Total Revenue', formatCurrency(platformStats.totalRevenue), `${platformStats.revenueGrowth > 0 ? '+' : ''}${platformStats.revenueGrowth}%`],
        ['Total Orders', platformStats.totalOrders.toString(), `${platformStats.orderGrowth > 0 ? '+' : ''}${platformStats.orderGrowth}%`],
        ['Total Vendors', platformStats.totalVendors.toString(), `${platformStats.vendorGrowth > 0 ? '+' : ''}${platformStats.vendorGrowth}%`],
        ['Total Products', platformStats.totalProducts.toString(), `${platformStats.productGrowth > 0 ? '+' : ''}${platformStats.productGrowth}%`]
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `platform-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Report exported as CSV')
    } else {
      // PDF export would be implemented here
      toast.info('PDF export coming soon')
    }
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUp className="w-4 h-4 text-green-500" />
    } else if (growth < 0) {
      return <ArrowDown className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
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
              <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="text-gray-600">
                Comprehensive insights and performance metrics
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
              <div className="flex space-x-2">
                <button 
                  onClick={() => exportReport('csv')}
                  className="iwanyu-button-secondary inline-flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
                <button 
                  onClick={() => exportReport('pdf')}
                  className="iwanyu-button-secondary inline-flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(platformStats.totalRevenue)}
                </p>
                <div className={`flex items-center text-sm ${getGrowthColor(platformStats.revenueGrowth)}`}>
                  {getGrowthIcon(platformStats.revenueGrowth)}
                  <span className="ml-1">
                    {platformStats.revenueGrowth > 0 ? '+' : ''}{platformStats.revenueGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats.totalOrders.toLocaleString()}
                </p>
                <div className={`flex items-center text-sm ${getGrowthColor(platformStats.orderGrowth)}`}>
                  {getGrowthIcon(platformStats.orderGrowth)}
                  <span className="ml-1">
                    {platformStats.orderGrowth > 0 ? '+' : ''}{platformStats.orderGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats.totalVendors.toLocaleString()}
                </p>
                <div className={`flex items-center text-sm ${getGrowthColor(platformStats.vendorGrowth)}`}>
                  {getGrowthIcon(platformStats.vendorGrowth)}
                  <span className="ml-1">
                    {platformStats.vendorGrowth > 0 ? '+' : ''}{platformStats.vendorGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats.totalProducts.toLocaleString()}
                </p>
                <div className={`flex items-center text-sm ${getGrowthColor(platformStats.productGrowth)}`}>
                  {getGrowthIcon(platformStats.productGrowth)}
                  <span className="ml-1">
                    {platformStats.productGrowth > 0 ? '+' : ''}{platformStats.productGrowth}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue/Orders Chart */}
          <div className="iwanyu-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
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
                <button
                  onClick={() => setSelectedMetric('vendors')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedMetric === 'vendors' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Vendors
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric === 'revenue' ? 'revenue' : selectedMetric === 'orders' ? 'orders' : 'vendors'} 
                    stroke="#f59e0b" 
                    fill="#fef3c7" 
                    strokeWidth={2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="iwanyu-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, revenue }) => `${name}: ${formatCurrency(revenue)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Vendor Performance */}
        <div className="iwanyu-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Vendors</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendorPerformance.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(vendor.revenue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.orders}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.products}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{vendor.rating}</span>
                        <div className="ml-2 flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${getGrowthColor(vendor.growth)}`}>
                        {getGrowthIcon(vendor.growth)}
                        <span className="ml-1">
                          {vendor.growth > 0 ? '+' : ''}{vendor.growth}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="iwanyu-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProducts.map((product, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">{formatCurrency(product.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orders:</span>
                    <span className="font-medium">{product.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendor:</span>
                    <span className="font-medium">{product.vendor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="iwanyu-card p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Conversion Rate</h3>
              <p className="text-3xl font-bold text-blue-600">3.2%</p>
              <p className="text-sm text-gray-500 mt-1">+0.8% from last month</p>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Retention</h3>
              <p className="text-3xl font-bold text-green-600">78%</p>
              <p className="text-sm text-gray-500 mt-1">+5% from last month</p>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Avg Order Value</h3>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(platformStats.totalRevenue / Math.max(platformStats.totalOrders, 1))}</p>
              <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}