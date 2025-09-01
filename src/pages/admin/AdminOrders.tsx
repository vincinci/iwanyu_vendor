import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Package,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'

interface Order {
  id: string
  customer_id: string
  vendor_id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  total_amount: number
  shipping_address: string
  billing_address: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  shipping_method: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  vendor?: {
    full_name: string
    company_name?: string
  }
  customer?: {
    full_name: string
    email: string
  }
}

interface OrderStats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  totalRevenue: number
  averageOrderValue: number
}

export function AdminOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid' | 'failed' | 'refunded'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Selected order for editing
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  useEffect(() => {
    filterAndSortOrders()
  }, [orders, searchTerm, statusFilter, paymentFilter, dateFilter, sortBy, sortOrder])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:profiles!orders_vendor_id_fkey(full_name, company_name),
          customer:profiles!orders_customer_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (orderList: Order[]) => {
    const total = orderList.length
    const pending = orderList.filter(o => o.status === 'pending').length
    const processing = orderList.filter(o => o.status === 'processing').length
    const shipped = orderList.filter(o => o.status === 'shipped').length
    const delivered = orderList.filter(o => o.status === 'delivered').length
    const cancelled = orderList.filter(o => o.status === 'cancelled').length
    
    const totalRevenue = orderList
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0)
    
    const averageOrderValue = total > 0 ? totalRevenue / total : 0

    setStats({ 
      total, 
      pending, 
      processing, 
      shipped, 
      delivered, 
      cancelled, 
      totalRevenue, 
      averageOrderValue 
    })
  }

  const filterAndSortOrders = () => {
    let filtered = orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.full_name && order.customer.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer?.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.vendor?.full_name && order.vendor.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = 
        statusFilter === 'all' || order.status === statusFilter

      const matchesPayment = 
        paymentFilter === 'all' || order.payment_status === paymentFilter

      const matchesDate = (() => {
        if (dateFilter === 'all') return true
        const orderDate = new Date(order.created_at)
        const now = new Date()
        
        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return orderDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return orderDate >= monthAgo
          default:
            return true
        }
      })()

      return matchesSearch && matchesStatus && matchesPayment && matchesDate
    })

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'amount':
          aValue = a.total_amount
          bValue = b.total_amount
          break
        case 'status':
          const statusOrder = { 'pending': 1, 'processing': 2, 'shipped': 3, 'delivered': 4, 'cancelled': 5, 'refunded': 6 }
          aValue = statusOrder[a.status] || 0
          bValue = statusOrder[b.status] || 0
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: Order['payment_status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      toast.success(`Payment status updated to ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Failed to update payment status')
    }
  }

  const handleUpdateTracking = async (orderId: string, trackingNumber: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      toast.success('Tracking number updated successfully')
      fetchOrders()
    } catch (error) {
      console.error('Error updating tracking number:', error)
      toast.error('Failed to update tracking number')
    }
  }

  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer', 'Vendor', 'Status', 'Payment Status', 'Total Amount', 'Shipping Address', 'Created Date'],
      ...filteredOrders.map(order => [
        order.id,
        order.customer?.full_name || 'Unknown',
        order.vendor?.company_name || order.vendor?.full_name || 'Unknown',
        order.status,
        order.payment_status,
        formatCurrency(order.total_amount),
        order.shipping_address,
        formatDate(order.created_at)
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Orders exported successfully')
  }

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: Order['payment_status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800' },
      paid: { color: 'bg-green-100 text-green-800' },
      failed: { color: 'bg-red-100 text-red-800' },
      refunded: { color: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[status]

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">
                Monitor and manage all orders across the platform
              </p>
            </div>
            <button 
              onClick={exportOrders}
              className="iwanyu-button-secondary inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Orders
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="iwanyu-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{stats.processing}</div>
              <div className="text-sm text-blue-600">Processing</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{stats.shipped}</div>
              <div className="text-sm text-purple-600">Shipped</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{stats.delivered}</div>
              <div className="text-sm text-green-600">Delivered</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">{stats.cancelled}</div>
              <div className="text-sm text-red-600">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="iwanyu-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="iwanyu-input pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="iwanyu-button-secondary"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="iwanyu-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(order.total_amount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDateTime(order.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <User className="w-3 h-3 mr-2 text-gray-400" />
                          {order.customer?.full_name || 'Unknown'}
                        </div>
                        <div className="flex items-center">
                          <Package className="w-3 h-3 mr-2 text-gray-400" />
                          {order.vendor?.company_name || order.vendor?.full_name || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowEditModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowEditModal(true)
                          }}
                          className="text-green-600 hover:text-green-900 inline-flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((currentPage - 1) * itemsPerPage) + 1}
                    </span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{filteredOrders.length}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Order #{selectedOrder.id.slice(-8)}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value as Order['status']})}
                    className="iwanyu-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) => setSelectedOrder({...selectedOrder, payment_status: e.target.value as Order['payment_status']})}
                    className="iwanyu-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={selectedOrder.tracking_number || ''}
                    onChange={(e) => setSelectedOrder({...selectedOrder, tracking_number: e.target.value})}
                    className="iwanyu-input"
                    placeholder="Enter tracking number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={selectedOrder.notes || ''}
                    onChange={(e) => setSelectedOrder({...selectedOrder, notes: e.target.value})}
                    className="iwanyu-input"
                    rows={3}
                    placeholder="Add order notes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="iwanyu-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('orders')
                        .update({
                          status: selectedOrder.status,
                          payment_status: selectedOrder.payment_status,
                          tracking_number: selectedOrder.tracking_number,
                          notes: selectedOrder.notes,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', selectedOrder.id)

                      if (error) throw error

                      toast.success('Order updated successfully')
                      setShowEditModal(false)
                      fetchOrders()
                    } catch (error) {
                      console.error('Error updating order:', error)
                      toast.error('Failed to update order')
                    }
                  }}
                  className="iwanyu-button-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}