'use client'

import { VendorLayout } from '@/components/layouts/vendor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  Truck
} from 'lucide-react'

interface VendorOrder {
  id: string
  customer: string
  products: string
  product: string
  total: number
  quantity: number
  status: string
  date: string
  address: string
  items: number
}

const orders: VendorOrder[] = []

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
    case 'processing':
      return <Badge variant="default" className="bg-blue-100 text-blue-800"><Package className="mr-1 h-3 w-3" />Processing</Badge>
    case 'shipped':
      return <Badge variant="default" className="bg-purple-100 text-purple-800"><Truck className="mr-1 h-3 w-3" />Shipped</Badge>
    case 'delivered':
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Delivered</Badge>
    case 'cancelled':
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function VendorOrders() {
  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Processing</p>
                  <p className="text-xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Shipped</p>
                  <p className="text-xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Delivered</p>
                  <p className="text-xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><span className="font-medium">Customer:</span> {order.customer}</p>
                        <p><span className="font-medium">Product:</span> {order.product}</p>
                        <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                        <p><span className="font-medium">Total:</span> {order.total.toFixed(0)} RWF</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Delivery Address:</span> {order.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        View Details
                      </Button>
                      {order.status === 'pending' && (
                        <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                          Process Order
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Mark as Shipped
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  )
}
