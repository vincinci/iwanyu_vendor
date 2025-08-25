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
  Banknote,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Activity,
  RefreshCw,
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react'

interface PayoutRequest {
  id: string
  vendor_id: string
  amount: number
  status: 'pending' | 'approved' | 'declined' | 'completed'
  payment_method: string
  payment_details: any
  admin_notes: string | null
  processed_at: string | null
  created_at: string
  vendor?: {
    full_name: string
    business_name: string
    email: string
  }
}

interface PayoutStats {
  total_requests: number
  pending: number
  approved: number
  completed: number
  declined: number
  total_amount: number
  pending_amount: number
  completed_amount: number
  today_requests: number
}

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stats, setStats] = useState<PayoutStats>({
    total_requests: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    declined: 0,
    total_amount: 0,
    pending_amount: 0,
    completed_amount: 0,
    today_requests: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchPayouts()
    
    const interval = setInterval(() => {
      fetchPayouts()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      console.log('Fetching payout requests...')
      
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payout_requests')
        .select(`
          *,
          vendor:vendors (
            full_name,
            business_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (payoutsError) {
        console.error('Error fetching payouts:', payoutsError)
        setPayouts([])
        return
      }

      const payouts = payoutsData || []
      setPayouts(payouts)

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const stats = {
        total_requests: payouts.length,
        pending: payouts.filter(p => p.status === 'pending').length,
        approved: payouts.filter(p => p.status === 'approved').length,
        completed: payouts.filter(p => p.status === 'completed').length,
        declined: payouts.filter(p => p.status === 'declined').length,
        total_amount: payouts.reduce((sum, p) => sum + p.amount, 0),
        pending_amount: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        completed_amount: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        today_requests: payouts.filter(p => p.created_at?.startsWith(today)).length
      }
      
      setStats(stats)
      console.log('Payouts loaded:', { count: payouts.length, stats })
    } catch (error) {
      console.error('Error fetching payouts:', error)
      setPayouts([])
    } finally {
      setLoading(false)
    }
  }

  const handlePayoutAction = async (payoutId: string, action: 'approve' | 'decline' | 'complete', notes?: string) => {
    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : action === 'decline' ? 'declined' : 'completed',
        updated_at: new Date().toISOString()
      }

      if (notes) {
        updateData.admin_notes = notes
      }

      if (action === 'complete') {
        updateData.processed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('payout_requests')
        .update(updateData)
        .eq('id', payoutId)

      if (error) throw error

      // Update local state
      setPayouts(prev => prev.map(payout => 
        payout.id === payoutId ? { 
          ...payout, 
          status: updateData.status,
          admin_notes: updateData.admin_notes || payout.admin_notes,
          processed_at: updateData.processed_at || payout.processed_at
        } : payout
      ))
      
      fetchPayouts()
      console.log(`Payout ${payoutId} ${action}ed successfully`)
    } catch (error) {
      console.error(`Error ${action}ing payout:`, error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
      approved: <Badge className="bg-blue-100 text-blue-800">Approved</Badge>,
      completed: <Badge className="bg-green-100 text-green-800">Completed</Badge>,
      declined: <Badge className="bg-red-100 text-red-800">Declined</Badge>
    }
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
  }

  // Filter payouts
  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = !searchTerm || 
      payout.vendor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.vendor?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.vendor?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || payout.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
            <p className="text-gray-600">Process vendor payout requests and manage payments</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={fetchPayouts} disabled={loading}>
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Banknote className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests}</div>
              <p className="text-xs text-gray-500">{stats.today_requests} today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_amount.toLocaleString()} RWF</div>
              <p className="text-xs text-gray-500">{stats.pending} requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_amount.toLocaleString()} RWF</div>
              <p className="text-xs text-gray-500">{stats.completed} payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <Banknote className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_amount.toLocaleString()} RWF</div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by vendor name, business, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter ({filteredPayouts.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts List */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
            <CardDescription>
              Manage vendor payout requests ({filteredPayouts.length} requests found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Activity className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading payouts...</span>
              </div>
            ) : filteredPayouts.length === 0 ? (
              <div className="text-center py-8">
                <Banknote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payout requests found</h3>
                <p className="text-gray-500">Payout requests will appear here when vendors submit them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayouts.map((payout) => (
                  <Card key={payout.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {payout.vendor?.business_name || payout.vendor?.full_name || 'Unknown Vendor'}
                            </h3>
                            {getStatusBadge(payout.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">Amount:</span> {payout.amount.toLocaleString()} RWF
                            </div>
                            <div>
                              <span className="font-medium">Method:</span> {payout.payment_method}
                            </div>
                            <div>
                              <span className="font-medium">Requested:</span> {new Date(payout.created_at).toLocaleDateString()}
                            </div>
                            {payout.processed_at && (
                              <div>
                                <span className="font-medium">Processed:</span> {new Date(payout.processed_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {payout.admin_notes && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <span className="font-medium text-sm">Admin Notes:</span>
                              <p className="text-sm text-gray-600 mt-1">{payout.admin_notes}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            
                            {payout.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handlePayoutAction(payout.id, 'approve')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handlePayoutAction(payout.id, 'decline', 'Declined by admin')}
                                  className="text-red-600 hover:text-red-700 border-red-300"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </>
                            )}
                            
                            {payout.status === 'approved' && (
                              <Button 
                                size="sm" 
                                onClick={() => handlePayoutAction(payout.id, 'complete')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark as Paid
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
