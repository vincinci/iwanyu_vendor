import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  User,
  Calendar,
  CreditCard,
  Banknote,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'

interface Payout {
  id: string
  vendor_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  payment_method: string
  account_details: string
  notes?: string
  processed_at?: string
  created_at: string
  updated_at: string
  vendor?: {
    full_name: string
    company_name?: string
    email: string
  }
}

interface PayoutStats {
  total: number
  pending: number
  approved: number
  rejected: number
  paid: number
  totalAmount: number
  pendingAmount: number
}

export function AdminPayouts() {
  const { user } = useAuth()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [filteredPayouts, setFilteredPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PayoutStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    paid: 0,
    totalAmount: 0,
    pendingAmount: 0
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'paid'>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Selected payout for actions
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'markPaid'>('approve')
  const [actionNotes, setActionNotes] = useState('')

  useEffect(() => {
    if (user) {
      fetchPayouts()
    }
  }, [user])

  useEffect(() => {
    filterAndSortPayouts()
  }, [payouts, searchTerm, statusFilter, paymentMethodFilter, dateFilter, sortBy, sortOrder])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          vendor:profiles(full_name, company_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPayouts(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching payouts:', error)
      toast.error('Failed to load payouts')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (payoutList: Payout[]) => {
    const total = payoutList.length
    const pending = payoutList.filter(p => p.status === 'pending').length
    const approved = payoutList.filter(p => p.status === 'approved').length
    const rejected = payoutList.filter(p => p.status === 'rejected').length
    const paid = payoutList.filter(p => p.status === 'paid').length
    
    const totalAmount = payoutList.reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payoutList
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0)

    setStats({ 
      total, 
      pending, 
      approved, 
      rejected, 
      paid, 
      totalAmount, 
      pendingAmount 
    })
  }

  const filterAndSortPayouts = () => {
    let filtered = payouts.filter(payout => {
      const matchesSearch = 
        payout.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payout.vendor?.full_name && payout.vendor.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payout.vendor?.email && payout.vendor.email.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = 
        statusFilter === 'all' || payout.status === statusFilter

      const matchesPaymentMethod = 
        paymentMethodFilter === 'all' || payout.payment_method === paymentMethodFilter

      const matchesDate = (() => {
        if (dateFilter === 'all') return true
        const payoutDate = new Date(payout.created_at)
        const now = new Date()
        
        switch (dateFilter) {
          case 'today':
            return payoutDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return payoutDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return payoutDate >= monthAgo
          default:
            return true
        }
      })()

      return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDate
    })

    // Sort payouts
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'status':
          const statusOrder = { 'pending': 1, 'approved': 2, 'rejected': 3, 'paid': 4 }
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

    setFilteredPayouts(filtered)
    setCurrentPage(1)
  }

  const handlePayoutAction = async () => {
    if (!selectedPayout) return

    try {
      let updateData: any = {
        updated_at: new Date().toISOString()
      }

      switch (actionType) {
        case 'approve':
          updateData.status = 'approved'
          break
        case 'reject':
          updateData.status = 'rejected'
          updateData.notes = actionNotes
          break
        case 'markPaid':
          updateData.status = 'paid'
          updateData.processed_at = new Date().toISOString()
          updateData.notes = actionNotes
          break
      }

      const { error } = await supabase
        .from('payouts')
        .update(updateData)
        .eq('id', selectedPayout.id)

      if (error) throw error

      const actionText = actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'marked as paid'
      toast.success(`Payout ${actionText} successfully`)
      
      setShowActionModal(false)
      setSelectedPayout(null)
      setActionNotes('')
      fetchPayouts()
    } catch (error) {
      console.error('Error updating payout:', error)
      toast.error('Failed to update payout')
    }
  }

  const exportPayouts = () => {
    const csvContent = [
      ['Payout ID', 'Vendor', 'Amount', 'Status', 'Payment Method', 'Account Details', 'Created Date', 'Processed Date'],
      ...filteredPayouts.map(payout => [
        payout.id,
        payout.vendor?.company_name || payout.vendor?.full_name || 'Unknown',
        formatCurrency(payout.amount),
        payout.status,
        payout.payment_method,
        payout.account_details,
        formatDate(payout.created_at),
        payout.processed_at ? formatDate(payout.processed_at) : ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payouts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Payouts exported successfully')
  }

  const getStatusBadge = (status: Payout['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank transfer':
      case 'bank':
        return <Banknote className="w-4 h-4" />
      case 'credit card':
      case 'card':
        return <CreditCard className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage)

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
              <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
              <p className="text-gray-600">
                Review and process vendor payout requests
              </p>
            </div>
            <button 
              onClick={exportPayouts}
              className="iwanyu-button-secondary inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Payouts
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
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="iwanyu-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Status Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{stats.approved}</div>
              <div className="text-sm text-blue-600">Approved</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{stats.paid}</div>
              <div className="text-sm text-green-600">Paid</div>
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
                placeholder="Search payouts..."
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>

            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="iwanyu-input"
            >
              <option value="all">All Methods</option>
              <option value="bank transfer">Bank Transfer</option>
              <option value="credit card">Credit Card</option>
              <option value="paypal">PayPal</option>
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

        {/* Payouts Table */}
        <div className="iwanyu-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payout Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{payout.id.slice(-8)}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(payout.amount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDateTime(payout.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {payout.vendor?.company_name || payout.vendor?.full_name}
                        </div>
                        <div className="text-gray-500">
                          {payout.vendor?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          {getPaymentMethodIcon(payout.payment_method)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payout.payment_method}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payout.account_details}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {payout.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPayout(payout)
                                setActionType('approve')
                                setShowActionModal(true)
                              }}
                              className="text-green-600 hover:text-green-900 inline-flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayout(payout)
                                setActionType('reject')
                                setShowActionModal(true)
                              }}
                              className="text-red-600 hover:text-red-900 inline-flex items-center"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {payout.status === 'approved' && (
                          <button
                            onClick={() => {
                              setSelectedPayout(payout)
                              setActionType('markPaid')
                              setShowActionModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Mark Paid
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedPayout(payout)
                            setActionType('approve')
                            setShowActionModal(true)
                          }}
                          className="text-gray-600 hover:text-gray-900 inline-flex items-center"
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
                      {Math.min(currentPage * itemsPerPage, filteredPayouts.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{filteredPayouts.length}</span>
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

        {filteredPayouts.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payouts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedPayout && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Mark as Paid'} Payout
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Vendor:</strong> {selectedPayout.vendor?.company_name || selectedPayout.vendor?.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> {formatCurrency(selectedPayout.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Payment Method:</strong> {selectedPayout.payment_method}
                </p>
              </div>

              {(actionType === 'reject' || actionType === 'markPaid') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="iwanyu-input"
                    rows={3}
                    placeholder={`Add notes for ${actionType === 'reject' ? 'rejection' : 'payment'}`}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowActionModal(false)
                    setSelectedPayout(null)
                    setActionNotes('')
                  }}
                  className="iwanyu-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayoutAction}
                  className={`iwanyu-button-primary ${
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''
                  }`}
                >
                  {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Mark as Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}