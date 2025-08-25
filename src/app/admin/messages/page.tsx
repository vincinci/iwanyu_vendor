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
  MessageSquare,
  User,
  Eye,
  Reply,
  Archive,
  Activity,
  RefreshCw,
  Mail,
  Clock,
  CheckCircle,
  Send
} from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied'
  created_at: string
  updated_at: string
  sender?: {
    full_name: string
    email: string
  }
  receiver?: {
    full_name: string
    email: string
  }
}

interface MessageStats {
  total: number
  unread: number
  read: number
  replied: number
  today: number
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('unread') // Default to unread
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    today: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchMessages()
    
    const interval = setInterval(() => {
      fetchMessages()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      console.log('Fetching messages...')
      
      // For demo purposes, we'll create a mock structure since messages table might not exist
      // In a real app, you'd have a proper messages table
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: 'vendor1',
          receiver_id: 'admin',
          subject: 'Product Approval Request',
          message: 'I need help getting my new product approved. It has been pending for 3 days.',
          status: 'unread',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: {
            full_name: 'John Vendor',
            email: 'john@vendor.com'
          }
        },
        {
          id: '2',
          sender_id: 'vendor2',
          receiver_id: 'admin',
          subject: 'Payout Issue',
          message: 'My payout request was declined. Can you please explain why?',
          status: 'read',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          sender: {
            full_name: 'Jane Business',
            email: 'jane@business.com'
          }
        }
      ]

      setMessages(mockMessages)

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const stats = {
        total: mockMessages.length,
        unread: mockMessages.filter(m => m.status === 'unread').length,
        read: mockMessages.filter(m => m.status === 'read').length,
        replied: mockMessages.filter(m => m.status === 'replied').length,
        today: mockMessages.filter(m => m.created_at?.startsWith(today)).length
      }
      
      setStats(stats)
      console.log('Messages loaded:', { count: mockMessages.length, stats })
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleMessageAction = async (messageId: string, action: 'read' | 'reply' | 'archive') => {
    try {
      const newStatus = action === 'read' ? 'read' : action === 'reply' ? 'replied' : 'read'
      
      // Update local state (in a real app, you'd update the database)
      setMessages(prev => prev.map(message => 
        message.id === messageId ? { 
          ...message, 
          status: newStatus,
          updated_at: new Date().toISOString()
        } : message
      ))
      
      console.log(`Message ${messageId} marked as ${newStatus}`)
    } catch (error) {
      console.error(`Error ${action}ing message:`, error)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      unread: <Badge className="bg-red-100 text-red-800">Unread</Badge>,
      read: <Badge className="bg-blue-100 text-blue-800">Read</Badge>,
      replied: <Badge className="bg-green-100 text-green-800">Replied</Badge>
    }
    return badges[status as keyof typeof badges] || <Badge variant="outline">{status}</Badge>
  }

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || message.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Center</h1>
            <p className="text-gray-600">Manage vendor communications and support requests</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Button onClick={fetchMessages} disabled={loading}>
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500">{stats.today} today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Mail className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unread}</div>
              <p className="text-xs text-gray-500">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Replied</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.replied}</div>
              <p className="text-xs text-gray-500">Resolved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.replied / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500">Messages replied</p>
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
                    placeholder="Search messages by subject, sender name, or email..."
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
                  <option value="">All Messages</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
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
              Vendor communications and support requests ({filteredMessages.length} messages found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Activity className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading messages...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-500">Messages from vendors will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <Card key={message.id} className={`overflow-hidden ${message.status === 'unread' ? 'border-l-4 border-l-red-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{message.subject}</h3>
                            {getStatusBadge(message.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {message.sender?.full_name || 'Unknown Sender'}
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {message.sender?.email || 'No email'}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(message.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 line-clamp-3">{message.message}</p>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Full
                            </Button>
                            
                            {message.status === 'unread' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleMessageAction(message.id, 'read')}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              onClick={() => handleMessageAction(message.id, 'reply')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Reply className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMessageAction(message.id, 'archive')}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Archive
                            </Button>
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
