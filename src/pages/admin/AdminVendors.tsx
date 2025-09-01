import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { formatDate, formatCurrency, getInitials } from '@/lib/utils'

interface Vendor {
  id: string
  email: string
  full_name: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  is_verified: boolean
  is_suspended: boolean
  created_at: string
  updated_at: string
}

interface VendorStats {
  total: number
  verified: number
  pending: number
  suspended: number
}

export function AdminVendors() {
  const { user } = useAuth()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<VendorStats>({
    total: 0,
    verified: 0,
    pending: 0,
    suspended: 0
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    if (user) {
      fetchVendors()
    }
  }, [user])

  useEffect(() => {
    filterAndSortVendors()
  }, [vendors, searchTerm, statusFilter, sortBy, sortOrder])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'vendor')
        .order('created_at', { ascending: false })

      if (error) throw error

      setVendors(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (vendorList: Vendor[]) => {
    const total = vendorList.length
    const verified = vendorList.filter(v => v.is_verified && !v.is_suspended).length
    const pending = vendorList.filter(v => !v.is_verified && !v.is_suspended).length
    const suspended = vendorList.filter(v => v.is_suspended).length

    setStats({ total, verified, pending, suspended })
  }

  const filterAndSortVendors = () => {
    let filtered = vendors.filter(vendor => {
      const matchesSearch = 
        vendor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.company_name && vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'verified' && vendor.is_verified && !vendor.is_suspended) ||
        (statusFilter === 'pending' && !vendor.is_verified && !vendor.is_suspended) ||
        (statusFilter === 'suspended' && vendor.is_suspended)

      return matchesSearch && matchesStatus
    })

    // Sort vendors
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.full_name.toLowerCase()
          bValue = b.full_name.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'status':
          aValue = a.is_verified ? 2 : a.is_suspended ? 0 : 1
          bValue = b.is_verified ? 2 : b.is_suspended ? 0 : 1
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

    setFilteredVendors(filtered)
    setCurrentPage(1)
  }

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

      if (error) throw error

      toast.success('Vendor verified successfully')
      fetchVendors()
    } catch (error) {
      console.error('Error verifying vendor:', error)
      toast.error('Failed to verify vendor')
    }
  }

  const handleSuspendVendor = async (vendorId: string, suspend: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: suspend,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

      if (error) throw error

      toast.success(`Vendor ${suspend ? 'suspended' : 'activated'} successfully`)
      fetchVendors()
    } catch (error) {
      console.error('Error updating vendor status:', error)
      toast.error('Failed to update vendor status')
    }
  }

  const exportVendors = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Phone', 'Address', 'Status', 'Joined Date'],
      ...filteredVendors.map(vendor => [
        vendor.full_name,
        vendor.email,
        vendor.company_name || '',
        vendor.phone || '',
        `${vendor.address || ''}, ${vendor.city || ''}, ${vendor.state || ''}`.trim(),
        vendor.is_suspended ? 'Suspended' : vendor.is_verified ? 'Verified' : 'Pending',
        formatDate(vendor.created_at)
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Vendor list exported successfully')
  }

  const getStatusBadge = (vendor: Vendor) => {
    if (vendor.is_suspended) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Pause className="w-3 h-3 mr-1" />
          Suspended
        </span>
      )
    }
    
    if (vendor.is_verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Pending
      </span>
    )
  }

  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage)

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
              <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
              <p className="text-gray-600">
                Manage vendor applications, approvals, and statuses
              </p>
            </div>
            <button 
              onClick={exportVendors}
              className="iwanyu-button-secondary inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export List
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
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Pause className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="iwanyu-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
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
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
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

        {/* Vendors Table */}
        <div className="iwanyu-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-yellow-800">
                              {getInitials(vendor.full_name)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.full_name}
                          </div>
                          {vendor.company_name && (
                            <div className="text-sm text-gray-500">
                              <Building className="inline w-3 h-3 mr-1" />
                              {vendor.company_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Mail className="w-3 h-3 mr-2 text-gray-400" />
                          {vendor.email}
                        </div>
                        {vendor.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            {vendor.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(vendor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                        {formatDate(vendor.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {!vendor.is_verified && !vendor.is_suspended && (
                          <button
                            onClick={() => handleVerifyVendor(vendor.id)}
                            className="text-green-600 hover:text-green-900 inline-flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </button>
                        )}
                        
                        {vendor.is_suspended ? (
                          <button
                            onClick={() => handleSuspendVendor(vendor.id, false)}
                            className="text-green-600 hover:text-green-900 inline-flex items-center"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendVendor(vendor.id, true)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Suspend
                          </button>
                        )}
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
                      {Math.min(currentPage * itemsPerPage, filteredVendors.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{filteredVendors.length}</span>
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

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}