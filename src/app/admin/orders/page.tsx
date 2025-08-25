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
  ShoppingCart,
  User,
  Package,
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Activity,
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  TrendingUp,
  Download
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  user_id: string
  vendor_id: string
  status: string
  payment_status: string
  total_amount: number
  shipping_amount: number
  tax_amount: number
  discount_amount: number
  created_at: string
  updated_at: string
  shipping_address: any
  billing_address: any
  notes: string | null
  vendor?: {
    full_name: string
    business_name: string
  }
  user?: {
    full_name: string
    email: string
    phone: string
  }
  order_items?: {
    id: string
    product_id: string
    quantity: number
    price: number
    product: {
      name: string
      sku: string
    }
  }[]
}

interface OrderStats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
  total_revenue: number
  pending_revenue: number
  today_orders: number
  today_revenue: number
  avg_order_value: number
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [createOrderForm, setCreateOrderForm] = useState({
    vendor_id: '',
    customer_email: '',
    customer_name: '',
    customer_phone: '',
    shipping_address: {
      street: '',
      city: '',
      district: '',
      country: 'Rwanda',
      postal_code: ''
    },
    items: [{ product_id: '', quantity: 1, price: 0 }],
    notes: ''
  })
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
    total_revenue: 0,
    pending_revenue: 0,
    today_orders: 0,
    today_revenue: 0,
    avg_order_value: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
    fetchVendorsAndProducts()
    
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchOrders()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchVendorsAndProducts = async () => {
    try {
      // Fetch vendors - use correct status filter
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('id, full_name, business_name, status')
        .eq('status', 'approved')
      
      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, price, vendor_id, is_active')
        .eq('is_active', true)
      
      setVendors(vendorsData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching vendors and products:', error)
    }
  }

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ORD-${timestamp}${random}`
  }

  const createOrder = async () => {
    try {
      console.log('Creating order with form data:', createOrderForm)
      
      if (!createOrderForm.vendor_id || !createOrderForm.customer_email || !createOrderForm.customer_name) {
        alert('Please fill in all required fields')
        return
      }

      // Validate shipping address
      if (!createOrderForm.shipping_address.street || 
          !createOrderForm.shipping_address.city || 
          !createOrderForm.shipping_address.district) {
        alert('Please fill in complete shipping address (street, city, district)')
        return
      }

      if (createOrderForm.items.some(item => !item.product_id || item.quantity <= 0)) {
        alert('Please add valid products to the order')
        return
      }

      const orderNumber = generateOrderNumber()
      const subtotal = createOrderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const taxAmount = subtotal * 0.18 // 18% VAT
      const shippingAmount = 5000 // Fixed shipping: 5000 RWF
      const totalAmount = subtotal + taxAmount + shippingAmount

      // Prepare order data that matches the database schema exactly
      const orderData = {
        order_number: orderNumber,
        vendor_id: createOrderForm.vendor_id,
        customer_email: createOrderForm.customer_email,
        customer_name: createOrderForm.customer_name,
        customer_phone: createOrderForm.customer_phone || null,
        shipping_address: createOrderForm.shipping_address,
        // billing_address: createOrderForm.shipping_address, // Removed - column may not exist
        subtotal: Number(subtotal.toFixed(2)),
        tax_amount: Number(taxAmount.toFixed(2)),
        shipping_amount: Number(shippingAmount.toFixed(2)),
        total_amount: Number(totalAmount.toFixed(2)),
        commission_amount: Number((totalAmount * 0.1).toFixed(2)), // 10% commission
        vendor_payout: Number((totalAmount * 0.9).toFixed(2)),
        status: 'pending',
        payment_status: 'pending',
        notes: createOrderForm.notes || null
      }

      console.log('Prepared order data for insertion:', orderData)

      // Create order - try with and without billing_address
      let createdOrder: any = null
      let orderError: any = null

      // First attempt: try with billing_address
      try {
        const orderDataWithBilling = {
          ...orderData,
          billing_address: createOrderForm.shipping_address
        }
        
        const result = await supabase
          .from('orders')
          .insert(orderDataWithBilling)
          .select()
          .single()
          
        createdOrder = result.data
        orderError = result.error
      } catch (e) {
        console.log('First attempt failed, trying without billing_address...')
      }

      // Second attempt: if first failed due to billing_address, try without it
      if (!createdOrder || (orderError && orderError.message.includes('billing_address'))) {
        console.log('Retrying order creation without billing_address column...')
        
        const result = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single()
          
        createdOrder = result.data
        orderError = result.error
      }

      if (orderError) {
        console.error('Order creation error:', orderError)
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      if (!createdOrder) {
        throw new Error('Failed to create order: No data returned')
      }

      console.log('Order created successfully:', createdOrder)

      // Create order items
      const orderItems = createOrderForm.items.map(item => ({
        order_id: createdOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: Number(item.price.toFixed(2)),
        total: Number((item.price * item.quantity).toFixed(2))
      }))

      console.log('Creating order items:', orderItems)

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Order items creation error:', itemsError)
        throw new Error(`Failed to create order items: ${itemsError.message}`)
      }

      console.log('Order items created successfully')
      
      // Reset form and close modal
      setCreateOrderForm({
        vendor_id: '',
        customer_email: '',
        customer_name: '',
        customer_phone: '',
        shipping_address: {
          street: '',
          city: '',
          district: '',
          country: 'Rwanda',
          postal_code: ''
        },
        items: [{ product_id: '', quantity: 1, price: 0 }],
        notes: ''
      })
      setShowCreateOrder(false)
      
      // Refresh orders
      fetchOrders()
      
      alert('Order created successfully!')
    } catch (error) {
      console.error('Error creating order:', error)
      alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('Fetching orders with basic data...')
      
      // Use simple query without complex joins to avoid 400 errors
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Orders query result:', { ordersData, ordersError })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        setOrders([])
        return
      }

      const orders = ordersData || []
      // Add empty arrays for related data since we're not fetching them in joins
      const ordersWithDefaults = orders.map((order: any) => ({
        ...order,
        vendor: null,
        order_items: []
      }))
      
      setOrders(ordersWithDefaults)
      
      // Calculate simplified stats
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = ordersWithDefaults.filter(o => o.created_at?.startsWith(today))
      
      const orderStats = {
        total: ordersWithDefaults.length,
        pending: ordersWithDefaults.filter(o => o.status === 'pending').length,
        processing: ordersWithDefaults.filter(o => o.status === 'processing').length,
        shipped: ordersWithDefaults.filter(o => o.status === 'shipped').length,
        delivered: ordersWithDefaults.filter(o => o.status === 'delivered').length,
        cancelled: ordersWithDefaults.filter(o => o.status === 'cancelled').length,
        refunded: ordersWithDefaults.filter(o => o.status === 'refunded').length,
        total_revenue: ordersWithDefaults.filter(o => ['delivered', 'completed'].includes(o.status)).reduce((sum, o) => sum + o.total_amount, 0),
        pending_revenue: ordersWithDefaults.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).reduce((sum, o) => sum + o.total_amount, 0),
        today_orders: todayOrders.length,
        today_revenue: todayOrders.reduce((sum, o) => sum + o.total_amount, 0),
        avg_order_value: ordersWithDefaults.length > 0 ? ordersWithDefaults.reduce((sum, o) => sum + o.total_amount, 0) / ordersWithDefaults.length : 0
      }
      
      setStats(orderStats)
      console.log('Orders loaded:', { count: ordersWithDefaults.length, stats: orderStats })
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={statusColors[paymentStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </Badge>
    )
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || order.status === statusFilter
    const matchesPayment = !paymentFilter || order.payment_status === paymentFilter
    
    let matchesDate = true
    if (dateFilter) {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0]
      matchesDate = orderDate === dateFilter
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600">Monitor and manage all marketplace orders</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Button 
              onClick={() => setShowCreateOrder(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Order
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={fetchOrders} disabled={loading}>
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              {stats.today_orders > 0 && (
                <p className="text-xs text-green-600">+{stats.today_orders} today</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Order Status</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-xs text-gray-500">
                {stats.pending} pending • {stats.processing} processing • {stats.shipped} shipped
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_revenue.toLocaleString()} RWF</div>
              <p className="text-xs text-yellow-600">{stats.pending_revenue.toLocaleString()} RWF pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today_revenue.toLocaleString()} RWF</div>
              <p className="text-xs text-gray-500">
                Avg: {stats.avg_order_value.toLocaleString()} RWF per order
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by order number, vendor, customer, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Payments</option>
                    <option value="pending">Payment Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Results ({filteredOrders.length})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Comprehensive order management and tracking ({filteredOrders.length} orders found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Activity className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {orders.length === 0 
                    ? 'Customer orders will appear here when purchases are made'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const itemsCount = order.order_items?.length || 0
                  const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0

                  return (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">Order #{order.order_number || order.id.slice(0, 8)}</h3>
                              <div className="flex gap-2 mt-1">
                                {getStatusBadge(order.status)}
                                {getPaymentStatusBadge(order.payment_status)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {order.total_amount.toLocaleString()} RWF
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Vendor</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              <span>{order.vendor?.business_name || order.vendor?.full_name || 'Unknown Vendor'}</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Customer</h4>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                <span>{order.user?.full_name || 'Customer'}</span>
                              </div>
                              {order.user?.email && (
                                <div className="flex items-center mt-1">
                                  <Mail className="h-4 w-4 mr-2" />
                                  <span className="truncate">{order.user.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <Package className="h-4 w-4 mr-2" />
                              <span>{totalItems} items ({itemsCount} products)</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="space-y-2">
                                {order.order_items.slice(0, 3).map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span>{item.product?.name || 'Unknown Product'}</span>
                                    <span>{item.quantity}x {item.price.toLocaleString()} RWF</span>
                                  </div>
                                ))}
                                {order.order_items.length > 3 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{order.order_items.length - 3} more items
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg mb-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">Subtotal</div>
                            <div className="text-sm text-gray-600">
                              {(order.total_amount - order.shipping_amount - order.tax_amount + order.discount_amount).toLocaleString()} RWF
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">Shipping</div>
                            <div className="text-sm text-gray-600">{order.shipping_amount?.toLocaleString() || 0} RWF</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">Tax</div>
                            <div className="text-sm text-gray-600">{order.tax_amount?.toLocaleString() || 0} RWF</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">Total</div>
                            <div className="text-sm font-bold text-green-600">{order.total_amount.toLocaleString()} RWF</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'processing')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Start Processing
                            </Button>
                          )}
                          
                          {order.status === 'processing' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'shipped')}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Mark Shipped
                            </Button>
                          )}
                          
                          {order.status === 'shipped' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Delivered
                            </Button>
                          )}
                          
                          {['pending', 'processing'].includes(order.status) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Order Modal */}
        {showCreateOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Create New Order</h2>
                <Button variant="outline" onClick={() => setShowCreateOrder(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Vendor Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Vendor *</label>
                  <select
                    value={createOrderForm.vendor_id}
                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, vendor_id: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.business_name || vendor.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name *</label>
                    <Input
                      value={createOrderForm.customer_name}
                      onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Email *</label>
                    <Input
                      type="email"
                      value={createOrderForm.customer_email}
                      onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Customer Phone</label>
                  <Input
                    value={createOrderForm.customer_phone}
                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="+250 7XX XXX XXX"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Address</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={createOrderForm.shipping_address.street}
                      onChange={(e) => setCreateOrderForm(prev => ({ 
                        ...prev, 
                        shipping_address: { ...prev.shipping_address, street: e.target.value }
                      }))}
                      placeholder="Street address"
                    />
                    <Input
                      value={createOrderForm.shipping_address.city}
                      onChange={(e) => setCreateOrderForm(prev => ({ 
                        ...prev, 
                        shipping_address: { ...prev.shipping_address, city: e.target.value }
                      }))}
                      placeholder="City"
                    />
                    <Input
                      value={createOrderForm.shipping_address.district}
                      onChange={(e) => setCreateOrderForm(prev => ({ 
                        ...prev, 
                        shipping_address: { ...prev.shipping_address, district: e.target.value }
                      }))}
                      placeholder="District"
                    />
                    <Input
                      value={createOrderForm.shipping_address.country}
                      onChange={(e) => setCreateOrderForm(prev => ({ 
                        ...prev, 
                        shipping_address: { ...prev.shipping_address, country: e.target.value }
                      }))}
                      placeholder="Country"
                      defaultValue="Rwanda"
                    />
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <label className="block text-sm font-medium mb-2">Order Items</label>
                  {createOrderForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                      <select
                        value={item.product_id}
                        onChange={(e) => {
                          const selectedProduct = products.find(p => p.id === e.target.value)
                          const newItems = [...createOrderForm.items]
                          newItems[index] = { 
                            ...item, 
                            product_id: e.target.value,
                            price: selectedProduct?.price || 0
                          }
                          setCreateOrderForm(prev => ({ ...prev, items: newItems }))
                        }}
                        className="p-2 border border-gray-300 rounded-md col-span-2"
                      >
                        <option value="">Select Product</option>
                        {products.filter(p => p.vendor_id === createOrderForm.vendor_id).map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.price.toLocaleString()} RWF
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...createOrderForm.items]
                          newItems[index] = { ...item, quantity: parseInt(e.target.value) || 1 }
                          setCreateOrderForm(prev => ({ ...prev, items: newItems }))
                        }}
                        placeholder="Qty"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newItems = createOrderForm.items.filter((_, i) => i !== index)
                          setCreateOrderForm(prev => ({ ...prev, items: newItems }))
                        }}
                        disabled={createOrderForm.items.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreateOrderForm(prev => ({
                        ...prev,
                        items: [...prev.items, { product_id: '', quantity: 1, price: 0 }]
                      }))
                    }}
                    className="mt-2"
                  >
                    Add Item
                  </Button>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">Order Notes</label>
                  <textarea
                    value={createOrderForm.notes}
                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Special instructions or notes..."
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{createOrderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%):</span>
                      <span>{(createOrderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.18).toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>5,000 RWF</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{(createOrderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.18 + 5000).toLocaleString()} RWF</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button onClick={() => setShowCreateOrder(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={createOrder} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Create Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
