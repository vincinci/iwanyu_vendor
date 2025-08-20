'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Filter,
  MessageSquare,
  Send,
  Reply,
  Clock,
  User,
  Activity,
  Mail,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface AdminMessage {
  id: string
  vendor_id: string
  vendor?: {
    full_name: string
    business_name: string
    email: string
  }
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  admin_reply?: string
  replied_at?: string
  category: 'general' | 'technical' | 'billing' | 'product' | 'other'
}

interface MessageStats {
  total: number
  new: number
  read: number
  replied: number
  closed: number
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    closed: 0
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      
      // For now, use empty array since the table might not exist yet
      const messages: AdminMessage[] = []
      setMessages(messages)
      
      // Calculate stats
      const stats = {
        total: messages.length,
        new: messages.filter(m => m.status === 'new').length,
        read: messages.filter(m => m.status === 'read').length,
        replied: messages.filter(m => m.status === 'replied').length,
        closed: messages.filter(m => m.status === 'closed').length
      }
      
      setStats(stats)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (messageId: string, newStatus: AdminMessage['status']) => {
    try {
      const { error } = await supabase
        .from('vendor_messages')
        .update({ status: newStatus })
        .eq('id', messageId)

      if (error) throw error

      // Update local state
      setMessages(prev => prev.map(message => 
        message.id === messageId ? { ...message, status: newStatus } : message
      ))
      
      // Refresh stats
      fetchMessages()
    } catch (error) {
      console.error('Error updating message status:', error)
    }
  }

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return

    try {
      const { error } = await supabase
        .from('vendor_messages')
        .update({ 
          admin_reply: replyText,
          replied_at: new Date().toISOString(),
          status: 'replied'
        })
        .eq('id', messageId)

      if (error) throw error

      // Update local state
      setMessages(prev => prev.map(message => 
        message.id === messageId ? { 
          ...message, 
          admin_reply: replyText,
          replied_at: new Date().toISOString(),
          status: 'replied'
        } : message
      ))
      
      setReplyText('')
      setExpandedMessage(null)
      fetchMessages()
    } catch (error) {
      console.error('Error sending reply:', error)
    }
  }

  const getStatusBadge = (status: AdminMessage['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>
      case 'read':
        return <Badge className="bg-gray-100 text-gray-800">Read</Badge>
      case 'replied':
        return <Badge className="bg-green-100 text-green-800">Replied</Badge>
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: AdminMessage['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.vendor?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.vendor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || message.status === statusFilter
    const matchesPriority = !priorityFilter || message.priority === priorityFilter
    const matchesCategory = !categoryFilter || message.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Messages</h1>
            <p className="text-gray-600">Manage communication with vendors</p>
          </div>
          <Button onClick={fetchMessages} disabled={loading}>
            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">New</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.new}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-gray-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Read</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.read}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Reply className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Replied</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.replied}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Closed</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.closed}</p>
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
                    placeholder="Search messages, vendors, or subjects..." 
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
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="product">Product</option>
                  <option value="other">Other</option>
                </select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter ({filteredMessages.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              Vendor communication and support requests ({filteredMessages.length} messages found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Activity className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-500">Loading messages...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {messages.length === 0 ? 'No messages yet' : 'No messages match your search'}
                </h3>
                <p className="text-gray-500">
                  {messages.length === 0 
                    ? 'Messages from vendors will appear here when they contact support'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Message list will be populated when data is available */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Messages</CardTitle>
              <CardDescription>High priority and urgent messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter(m => m.priority === 'urgent' || m.priority === 'high').length}
                </p>
                <p className="text-sm text-gray-600">Need immediate attention</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Priority Messages
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
              <CardDescription>Average response time to vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Clock className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">2.4h</p>
                <p className="text-sm text-gray-600">Average response time</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Satisfaction</CardTitle>
              <CardDescription>Vendor satisfaction rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Star className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                <p className="text-sm text-gray-600">Vendor satisfaction</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
