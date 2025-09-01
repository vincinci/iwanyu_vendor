'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface VendorProfile {
  id: string
  user_id: string | null
  business_name: string | null
  business_description: string | null
  business_address: string | null
  phone_number: string | null
  business_category: string | null
  business_logo_url: string | null
  verification_status: 'pending' | 'verified' | 'rejected'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface VendorStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function VendorApprovalDashboard() {
  const [vendors, setVendors] = useState<VendorProfile[]>([])
  const [stats, setStats] = useState<VendorStats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)


  useEffect(() => {
    fetchVendors()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVendors = async () => {
    try {
      const { data: vendorData, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setVendors(vendorData || [])
      
      // Calculate stats
      const statsData = (vendorData || []).reduce(
        (acc: any, vendor: VendorProfile) => {
          acc.total++
          if (vendor.verification_status === 'pending') acc.pending++
          else if (vendor.verification_status === 'verified') acc.approved++
          else if (vendor.verification_status === 'rejected') acc.rejected++
          return acc
        },
        { total: 0, pending: 0, approved: 0, rejected: 0 }
      )
      
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateVendorStatus = async (vendorId: string, status: 'approved' | 'rejected') => {
    setUpdating(vendorId)
    try {
      const { error } = await supabase
        .from('vendor_profiles')
        .update({ status })
        .eq('id', vendorId)

      if (error) throw error

      // Refresh the vendors list
      await fetchVendors()
    } catch (error) {
      console.error('Error updating vendor status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusStats = () => {
    return vendors.reduce(
      (acc: { pending: number; verified: number; rejected: number }, vendor: VendorProfile) => {
        if (vendor.verification_status === 'pending') acc.pending++
        if (vendor.verification_status === 'verified') acc.verified++
        if (vendor.verification_status === 'rejected') acc.rejected++
        return acc
      },
      { pending: 0, verified: 0, rejected: 0 }
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        <span className="ml-2">Loading vendors...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-gray-600">All registered vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-600">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-gray-600">Active vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-gray-600">Declined applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Applications</CardTitle>
          <CardDescription>Review and manage vendor registration requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No vendor applications found</p>
            ) : (
              vendors.map((vendor) => (
                <Card key={vendor.id} className="border-l-4 border-l-yellow-400">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{vendor.business_name || 'Unnamed Business'}</h3>
                        <p className="text-gray-600">{vendor.business_category || 'Category not provided'}</p>
                        <p className="text-sm text-gray-500">
                          Applied: {new Date(vendor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(vendor.verification_status)}>
                        {vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Contact Information</h4>
                        <p className="text-sm text-gray-600">Address: {vendor.business_address || 'Not provided'}</p>
                        <p className="text-sm text-gray-600">Phone: {vendor.phone_number || 'Not provided'}</p>
                        <p className="text-sm text-gray-600">Description: {vendor.business_description || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Documents</h4>
                        {vendor.business_logo_url && (
                          <p className="text-sm text-green-600">✓ Business Logo: Uploaded</p>
                        )}
                        {vendor.business_logo_url && (
                          <p className="text-sm text-green-600">✓ Business Logo: Uploaded</p>
                        )}
                        {!vendor.business_logo_url && (
                          <p className="text-sm text-red-600">✗ Business Logo: Missing</p>
                        )}
                      </div>
                    </div>

                    {vendor.verification_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateVendorStatus(vendor.id, 'approved')}
                          disabled={updating === vendor.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating === vendor.id ? 'Updating...' : 'Approve'}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                          disabled={updating === vendor.id}
                        >
                          {updating === vendor.id ? 'Updating...' : 'Reject'}
                        </Button>
                      </div>
                    )}

                    {vendor.verification_status === 'verified' && (
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-green-600">✓ This vendor is approved and can offer services</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                          disabled={updating === vendor.id}
                        >
                          Suspend
                        </Button>
                      </div>
                    )}

                    {vendor.verification_status === 'rejected' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => updateVendorStatus(vendor.id, 'approved')}
                          disabled={updating === vendor.id}
                        >
                          Reconsider Application
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
