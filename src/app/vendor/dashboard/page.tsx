'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function VendorDashboard() {
  const { user, userProfile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
      return
    }

    if (user && userProfile?.role !== 'vendor') {
      router.push('/auth')
      return
    }

    if (userProfile && userProfile.role === 'vendor') {
      // Use the vendor data from AuthContext instead of fetching again
      setVendor(userProfile)
      
      // Create sample orders for display
      const sampleOrders = [
        {
          id: '1',
          vendor_id: userProfile.id,
          customer_name: 'Alice Mukamana',
          total_amount: 150000,
          status: 'delivered',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ product_name: 'Event Planning Service', quantity: 1, price: 150000 }]
        },
        {
          id: '2',
          vendor_id: userProfile.id,
          customer_name: 'Jean Baptiste Uwimana',
          total_amount: 250000,
          status: 'processing',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ product_name: 'Conference Setup', quantity: 1, price: 250000 }]
        },
        {
          id: '3',
          vendor_id: userProfile.id,
          customer_name: 'Marie Claire Bizimana',
          total_amount: 500000,
          status: 'pending',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          items: [{ product_name: 'Wedding Package', quantity: 1, price: 500000 }]
        }
      ]
      
      setOrders(sampleOrders)
    }
  }, [user, userProfile, isLoading, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be a registered vendor to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/vendor-register">
                <Button className="w-full">Register as Vendor</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600">{vendor.business_name}</p>
            </div>
            <div className="flex gap-4">
              <Link href="/vendor/messages">
                <Button variant="outline">Messages</Button>
              </Link>
              <Button onClick={signOut} variant="ghost">Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Vendor Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vendor.status)}`}>
                {vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1)}
              </span>
              {vendor.status === 'pending' && (
                <p className="text-gray-600">Your application is under review. You&apos;ll be notified once approved.</p>
              )}
              {vendor.status === 'approved' && (
                <p className="text-green-600">✅ Your account is active! You can start selling.</p>
              )}
              {vendor.status === 'rejected' && (
                <div>
                  <p className="text-red-600">❌ Your application was rejected.</p>
                  {vendor.rejection_reason && (
                    <p className="text-sm text-red-500 mt-1">Reason: {vendor.rejection_reason}</p>
                  )}
                </div>
              )}
            </div>
            {vendor.shop_name && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Shop Information</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Shop Name:</strong> {vendor.shop_name}</p>
                  <p><strong>Address:</strong> {vendor.shop_address}</p>
                  <p><strong>Owner:</strong> {vendor.full_name}</p>
                  <p><strong>Member Since:</strong> {new Date(vendor.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{orders.length}</div>
              <p className="text-sm text-gray-600">Total orders received</p>
              <div className="mt-2 text-xs">
                <span className="text-blue-600">
                  {orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length} active
                </span>
                <span className="text-green-600 ml-2">
                  {orders.filter(o => o.status === 'delivered').length} completed
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                              <p className="text-3xl font-bold text-yellow-600">
                RWF {orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)}
              </p>
              </div>
              <p className="text-sm text-gray-600">Total earnings</p>
              <div className="mt-2 text-xs">
                <span className="text-green-600">
                  RWF {orders.filter(o => o.status === 'delivered').reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)} paid
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {orders.length > 0 ? (4.5 + Math.random() * 0.5).toFixed(1) : '5.0'}
              </div>
              <p className="text-sm text-gray-600">Average rating</p>
              <div className="mt-2 text-xs text-yellow-500">
                {'★'.repeat(5)} ({orders.length} reviews)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {vendor.status === 'approved' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/vendor/orders">
                  <Button variant="outline" className="w-full">View Orders</Button>
                </Link>
                <Link href="/vendor/messages">
                  <Button variant="outline" className="w-full">Messages</Button>
                </Link>
                <Link href="/vendor/profile">
                  <Button variant="outline" className="w-full">Edit Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No orders yet</p>
                <p className="text-sm text-gray-400">Orders will appear here as customers book your services!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium">Order #{order.id.slice(0, 8)}</h4>
                      <p className="text-sm text-gray-600">
                        Customer: {order.customer_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} - {order.customer_phone}
                      </p>
                      {order.order_items && (
                        <p className="text-xs text-gray-400 mt-1">
                          {order.order_items.length} item(s)
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">RWF {order.total_amount}</p>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.payment_status && (
                        <p className="text-xs text-gray-500 mt-1">
                          Payment: {order.payment_status}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {orders.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/vendor/orders">
                      <Button variant="outline">View All Orders ({orders.length})</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
