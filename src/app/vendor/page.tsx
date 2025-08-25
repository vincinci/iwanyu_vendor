'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Package, TrendingUp, Users, Plus, BarChart, Star, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface VendorStats {
  totalProducts: number
  ordersToday: number
  totalSales: string
  revenueThisMonth: string
}

interface Vendor {
  id: string
  business_name: string
  full_name: string
  status: string
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    ordersToday: 0,
    totalSales: '0 RWF',
    revenueThisMonth: '0 RWF'
  })
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true)
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error('Authentication error:', authError)
          router.push('/auth/vendor')
          return
        }

        // Check email verification
        if (!user.email_confirmed_at) {
          console.log('Email not verified, redirecting to verification page')
          router.push('/auth/verify-email')
          return
        }

        // Get vendor profile
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (vendorError || !vendorData) {
          console.error('No vendor record found:', vendorError)
          // If no vendor record exists, redirect to onboarding
          router.push('/vendor/onboarding')
          return
        }

        // Check vendor status
        if (vendorData.status === 'rejected') {
          console.log('Vendor application was rejected, redirecting to confirmation')
          router.push('/vendor/confirmation')
          return
        } else if (vendorData.status !== 'approved' && vendorData.status !== 'pending') {
          console.log('Vendor status unknown, redirecting to onboarding')
          router.push('/vendor/onboarding')
          return
        }

        setVendor(vendorData)
        await fetchVendorStats(vendorData.id)

      } catch (error) {
        console.error('Error loading vendor data:', error)
        router.push('/auth/vendor')
      } finally {
        setLoading(false)
      }
    }

    const fetchVendorStats = async (vendorId: string) => {
      try {
        // Fetch products count for this vendor
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, price, inventory_quantity')
          .eq('vendor_id', vendorId)

        if (productsError) {
          console.error('Error fetching vendor products:', productsError)
          return
        }

        // Fetch orders for this vendor
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, created_at')
          .eq('vendor_id', vendorId)

        if (ordersError) {
          console.error('Error fetching vendor orders:', ordersError)
        }

        const totalProducts = products?.length || 0
        const todayOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at).toDateString()
          const today = new Date().toDateString()
          return orderDate === today
        }).length || 0

        const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        const thisMonth = new Date()
        const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
        const monthlyRevenue = orders?.filter(order => 
          new Date(order.created_at) >= monthStart
        ).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        setStats({
          totalProducts,
          ordersToday: todayOrders,
          totalSales: `${totalSales.toLocaleString()} RWF`,
          revenueThisMonth: `${monthlyRevenue.toLocaleString()} RWF`
        })

      } catch (error) {
        console.error('Error fetching vendor stats:', error)
      }
    }

    fetchVendorData()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/vendor')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {vendor?.business_name || vendor?.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={vendor?.status === 'approved' ? 'default' : 'secondary'}>
                {vendor?.status || 'pending'}
              </Badge>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Status Alert */}
        {vendor?.status === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">Account Pending Approval</p>
              <p className="text-yellow-700 text-sm">Your vendor account is currently under review. You can explore the dashboard and add products, but they won&apos;t be visible to customers until your account is approved. We&apos;ll review your application within 24-48 hours.</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Active products in your store
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersToday}</div>
              <p className="text-xs text-muted-foreground">
                New orders received today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                All-time sales revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.revenueThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Revenue for current month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Product
              </CardTitle>
              <CardDescription>
                Create a new product listing for your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vendor/products/new">
                <Button className="w-full">
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Products
              </CardTitle>
              <CardDescription>
                View and edit your existing products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vendor/products">
                <Button variant="outline" className="w-full">
                  View Products
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                View Orders
              </CardTitle>
              <CardDescription>
                Check your recent orders and sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vendor/orders">
                <Button variant="outline" className="w-full">
                  View Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.ordersToday === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No orders yet</p>
                  <p className="text-sm">Orders will appear here when customers make purchases</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">You have {stats.ordersToday} new orders today</p>
                  <Link href="/vendor/orders">
                    <Button variant="outline" size="sm">View All Orders</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>Manage your vendor profile and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Business Information</span>
                  <Link href="/vendor/settings">
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Settings</span>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Store Preferences</span>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
