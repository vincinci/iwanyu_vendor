'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Store,
  Calendar,
  Activity,
  Shield,
  FileText
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface AdminVendor {
  id: string
  full_name: string
  business_name: string
  phone_number: string
  business_address: string
  status: string
  created_at: string
  social_media_links?: Record<string, string>
  user_id?: string
  email?: string // Optional since we'll fetch it from auth.users
}

interface VendorStats {
  total: number
  approved: number
  pending: number
  rejected: number
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [stats, setStats] = useState<VendorStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const supabase = createClient()

  useEffect(() => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const filterParam = urlParams.get('filter')
    if (filterParam === 'pending') {
      setStatusFilter('pending')
    }
    
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      console.log('Fetching vendors...')

      // Test connection first
      const { data: testData, error: testError } = await supabase
        .from('vendors')
        .select('count')
        .limit(1)
      
      console.log('Connection test:', { testData, testError })

      // Fetch all vendors
      const { data: vendorsData, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Vendors query result:', { vendorsData, error })

      if (error) {
        console.error('Error fetching vendors:', error)
        // Set empty data but don't return early, let user see the error
        setVendors([])
        setStats({ total: 0, approved: 0, pending: 0, rejected: 0 })
        return
      }

      // Map data without email for now
      const mappedData = vendorsData?.map(vendor => ({
        ...vendor,
        email: `${vendor.full_name}@vendor.com` // Placeholder email
      })) || []

      console.log('Mapped vendors data:', mappedData)

      setVendors(mappedData)

      // Calculate stats
      const vendorStats = {
        total: vendorsData?.length || 0,
        approved: vendorsData?.filter(v => v.status === 'approved').length || 0,
        pending: vendorsData?.filter(v => v.status === 'pending').length || 0,
        rejected: vendorsData?.filter(v => v.status === 'rejected').length || 0
      }
      setStats(vendorStats)

    } catch (error) {
      console.error('Error fetching vendors:', error)
      setVendors([])
      setStats({ total: 0, approved: 0, pending: 0, rejected: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (vendorId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status: newStatus })
        .eq('id', vendorId)

      if (!error) {
        // Refresh vendors list
        fetchVendors()
      } else {
        console.error('Error updating vendor status:', error)
      }
    } catch (error) {
      console.error('Error updating vendor status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>
      default:
      return <Badge variant="secondary">{status}</Badge>
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchTerm || 
      vendor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || vendor.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600">Manage and monitor vendor accounts</p>
          </div>
          <Button onClick={fetchVendors} disabled={loading}>
            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.rejected}</p>
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
                    placeholder="Search vendors..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Clear all filters
                    setSearchTerm('')
                    setStatusFilter('')
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters ({filteredVendors.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Loading:</strong> {loading.toString()}</p>
                <p><strong>Total Vendors:</strong> {vendors.length}</p>
                <p><strong>Filtered Vendors:</strong> {filteredVendors.length}</p>
                <p><strong>Search Term:</strong> "{searchTerm}"</p>
                <p><strong>Status Filter:</strong> "{statusFilter}"</p>
              </div>
              <div>
                <p><strong>Stats Total:</strong> {stats.total}</p>
                <p><strong>Stats Approved:</strong> {stats.approved}</p>
                <p><strong>Stats Pending:</strong> {stats.pending}</p>
                <p><strong>Stats Rejected:</strong> {stats.rejected}</p>
              </div>
            </div>
            {vendors.length > 0 && (
              <div className="mt-4">
                <p><strong>First Vendor:</strong></p>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(vendors[0], null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendors List */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Accounts</CardTitle>
            <CardDescription>
              Manage vendor registrations and accounts ({filteredVendors.length} vendors found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Activity className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-500">Loading vendors...</span>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {vendors.length === 0 ? 'No vendors registered' : 'No vendors match your search'}
                </h3>
                <p className="text-gray-500">
                  {vendors.length === 0 
                    ? 'Vendor applications will appear here when users register as vendors'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVendors.map((vendor) => (
                  <div key={vendor.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {vendor.full_name || 'Name not provided'}
                          </h3>
                          {getStatusBadge(vendor.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            <span>{vendor.business_name || 'Business name pending'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{vendor.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{vendor.phone_number || 'Phone not provided'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-500">
                              Registered {new Date(vendor.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {vendor.business_address && (
                            <div className="text-gray-600">
                              <span className="font-medium">Address:</span> {vendor.business_address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                        {vendor.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusUpdate(vendor.id, 'rejected')}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                        {vendor.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleStatusUpdate(vendor.id, 'rejected')}
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            Suspend
                          </Button>
                        )}
                        {vendor.status === 'rejected' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>Vendor applications awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Clock className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Applications pending</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Review Applications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>Documents waiting for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <FileText className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Documents to review</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Review Documents
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Vendor support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Mail className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Open tickets</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Tickets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
}
