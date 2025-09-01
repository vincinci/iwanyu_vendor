import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Download,
  AlertTriangle,
  CreditCard,
  Banknote
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Payout {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  payment_method: string
  account_details: string
  notes?: string
  processed_at?: string
  created_at: string
  updated_at: string
}

interface PayoutStats {
  totalEarnings: number
  pendingPayouts: number
  completedPayouts: number
  availableBalance: number
}

export function VendorPayouts() {
  const { user } = useAuth()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [stats, setStats] = useState<PayoutStats>({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    availableBalance: 0
  })
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestAmount, setRequestAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [accountDetails, setAccountDetails] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (user) {
      fetchPayouts()
      fetchPayoutStats()
    }
  }, [user])

  const fetchPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('vendor_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayouts(data || [])
    } catch (error) {
      console.error('Error fetching payouts:', error)
      toast.error('Failed to load payouts')
    }
  }

  const fetchPayoutStats = async () => {
    try {
      // Calculate total earnings from completed orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', user?.id)
        .eq('payment_status', 'paid')

      const totalEarnings = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      // Calculate pending payouts
      const { data: pendingPayouts } = await supabase
        .from('payouts')
        .select('amount')
        .eq('vendor_id', user?.id)
        .eq('status', 'pending')

      const pendingAmount = pendingPayouts?.reduce((sum, payout) => sum + payout.amount, 0) || 0

      // Calculate completed payouts
      const { data: completedPayouts } = await supabase
        .from('payouts')
        .select('amount')
        .eq('vendor_id', user?.id)
        .in('status', ['paid', 'approved'])

      const completedAmount = completedPayouts?.reduce((sum, payout) => sum + payout.amount, 0) || 0

      setStats({
        totalEarnings,
        pendingPayouts: pendingAmount,
        completedPayouts: completedAmount,
        availableBalance: totalEarnings - pendingAmount - completedAmount
      })
    } catch (error) {
      console.error('Error fetching payout stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    if (!requestAmount || !accountDetails) {
      toast.error('Please fill in all required fields')
      return
    }

    const amount = parseFloat(requestAmount)
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    if (amount > stats.availableBalance) {
      toast.error('Amount exceeds available balance')
      return
    }

    try {
      const { error } = await supabase
        .from('payouts')
        .insert({
          vendor_id: user?.id,
          amount,
          status: 'pending',
          payment_method: paymentMethod,
          account_details: accountDetails,
          notes: notes || undefined
        })

      if (error) throw error

      toast.success('Payout request submitted successfully')
      setShowRequestModal(false)
      setRequestAmount('')
      setPaymentMethod('bank_transfer')
      setAccountDetails('')
      setNotes('')
      fetchPayouts()
      fetchPayoutStats()
    } catch (error) {
      console.error('Error requesting payout:', error)
      toast.error('Failed to submit payout request')
    }
  }

  const getStatusBadge = (status: Payout['status']) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Banknote className="w-5 h-5" />
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
              <p className="text-gray-600">
                Manage your earnings and payout requests
              </p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="iwanyu-button-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Request Payout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalEarnings)}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.availableBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.pendingPayouts)}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.completedPayouts)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Request Alert */}
        {stats.availableBalance > 0 && (
          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Payout Available
                  </p>
                  <p className="text-sm text-yellow-700">
                    You have {formatCurrency(stats.availableBalance)} available for payout.
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="ml-auto text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Request Payout →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payouts Table */}
        <div className="iwanyu-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payout History</h3>
            <button className="iwanyu-button-secondary inline-flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export History
            </button>
          </div>
          
          {payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payout ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{payout.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            {getPaymentMethodIcon(payout.payment_method)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payout.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payout.account_details}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payout.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.processed_at ? formatDate(payout.processed_at) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payouts yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start earning by selling products and request payouts when you're ready.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Request Payout Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Payout</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Balance
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(stats.availableBalance)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Amount *
                  </label>
                  <input
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    className="iwanyu-input"
                    placeholder="Enter amount"
                    min="0"
                    max={stats.availableBalance}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="iwanyu-input"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Details *
                  </label>
                  <input
                    type="text"
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    className="iwanyu-input"
                    placeholder="Enter account number, email, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="iwanyu-input"
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRequestModal(false)
                    setRequestAmount('')
                    setPaymentMethod('bank_transfer')
                    setAccountDetails('')
                    setNotes('')
                  }}
                  className="iwanyu-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  disabled={!requestAmount || !accountDetails}
                  className="iwanyu-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}