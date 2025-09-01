import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Eye, 
  Reply, 
  Bell,
  User,
  Calendar,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Trash2
} from 'lucide-react'
import { formatDate, formatDateTime, getInitials } from '@/lib/utils'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  content: string
  is_read: boolean
  is_announcement: boolean
  created_at: string
  sender?: {
    full_name: string
    company_name?: string
    email: string
  }
  receiver?: {
    full_name: string
    company_name?: string
    email: string
  }
}

interface MessageStats {
  total: number
  unread: number
  announcements: number
  responses: number
}

export function AdminMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    announcements: 0,
    responses: 0
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'announcements' | 'inbox' | 'sent'>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'sender'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Modal states
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [composeData, setComposeData] = useState({
    type: 'individual' as 'individual' | 'announcement',
    recipient: '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user])

  useEffect(() => {
    filterAndSortMessages()
  }, [messages, searchTerm, typeFilter, readFilter, sortBy, sortOrder])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      
      // Fetch messages where admin is sender or receiver
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, company_name, email),
          receiver:profiles!messages_receiver_id_fkey(full_name, company_name, email)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      setMessages(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (messageList: Message[]) => {
    const total = messageList.length
    const unread = messageList.filter(m => !m.is_read && m.receiver_id === user?.id).length
    const announcements = messageList.filter(m => m.is_announcement).length
    const responses = messageList.filter(m => !m.is_announcement).length

    setStats({ total, unread, announcements, responses })
  }

  const filterAndSortMessages = () => {
    const filtered = messages.filter(message => {
      const matchesSearch = 
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (message.sender?.full_name && message.sender.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (message.receiver?.full_name && message.receiver.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = (() => {
        if (typeFilter === 'all') return true
        if (typeFilter === 'announcements') return message.is_announcement
        if (typeFilter === 'inbox') return message.receiver_id === user?.id
        if (typeFilter === 'sent') return message.sender_id === user?.id
        return true
      })()

      const matchesRead = 
        readFilter === 'all' ||
        (readFilter === 'read' && message.is_read) ||
        (readFilter === 'unread' && !message.is_read)

      return matchesSearch && matchesType && matchesRead
    })

    // Sort messages
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'subject':
          aValue = a.subject.toLowerCase()
          bValue = b.subject.toLowerCase()
          break
        case 'sender':
          aValue = a.sender?.full_name?.toLowerCase() || ''
          bValue = b.sender?.full_name?.toLowerCase() || ''
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

    setFilteredMessages(filtered)
    setCurrentPage(1)
  }

  const sendMessage = async () => {
    try {
      if (!composeData.subject.trim() || !composeData.content.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      if (composeData.type === 'individual' && !composeData.recipient.trim()) {
        toast.error('Please select a recipient')
        return
      }

      const messageData: any = {
        sender_id: user?.id,
        subject: composeData.subject,
        content: composeData.content,
        is_announcement: composeData.type === 'announcement',
        is_read: false
      }

      if (composeData.type === 'individual') {
        // Find vendor by email or name
        const { data: vendors } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'vendor')
          .or(`email.eq.${composeData.recipient},full_name.ilike.%${composeData.recipient}%`)
          .limit(1)

        if (!vendors || vendors.length === 0) {
          toast.error('Recipient not found')
          return
        }

        messageData.receiver_id = vendors[0].id
      } else {
        // Announcement - send to all vendors
        const { data: vendors } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'vendor')

        if (vendors && vendors.length > 0) {
          // Create multiple messages for each vendor
          const messagePromises = vendors.map(vendor => 
            supabase.from('messages').insert({
              ...messageData,
              receiver_id: vendor.id
            })
          )

          await Promise.all(messagePromises)
          toast.success('Announcement sent to all vendors')
          setShowComposeModal(false)
          resetComposeForm()
          fetchMessages()
          return
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData)

      if (error) throw error

      toast.success('Message sent successfully')
      setShowComposeModal(false)
      resetComposeForm()
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) throw error

      fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      toast.success('Message deleted successfully')
      fetchMessages()
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  const resetComposeForm = () => {
    setComposeData({
      type: 'individual',
      recipient: '',
      subject: '',
      content: ''
    })
  }

  const getMessageTypeIcon = (message: Message) => {
    if (message.is_announcement) {
      return <Bell className="w-4 h-4 text-yellow-600" />
    }
    return <MessageSquare className="w-4 h-4 text-blue-600" />
  }

  const getMessageTypeBadge = (message: Message) => {
    if (message.is_announcement) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Bell className="w-3 h-3 mr-1" />
          Announcement
        </span>
      )
    }
    
    if (message.sender_id === user?.id) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Send className="w-3 h-3 mr-1" />
          Sent
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Mail className="w-3 h-3 mr-1" />
        Received
      </span>
    )
  }

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage)

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
              <h1 className="text-3xl font-bold text-gray-900">Message Center</h1>
              <p className="text-gray-600">
                Communicate with vendors and send platform announcements
              </p>
            </div>
            <button 
              onClick={() => setShowComposeModal(true)}
              className="iwanyu-button-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose Message
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
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.announcements}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Reply className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Responses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="iwanyu-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="iwanyu-input pl-10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="all">All Types</option>
              <option value="announcements">Announcements</option>
              <option value="inbox">Inbox</option>
              <option value="sent">Sent</option>
            </select>

            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="all">All Messages</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="date">Sort by Date</option>
              <option value="subject">Sort by Subject</option>
              <option value="sender">Sort by Sender</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="iwanyu-button-secondary"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="iwanyu-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From/To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMessages.map((message) => (
                  <tr key={message.id} className={`hover:bg-gray-50 ${!message.is_read && message.receiver_id === user?.id ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMessageTypeIcon(message)}
                        <div className="ml-2">
                          {getMessageTypeBadge(message)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {!message.is_read && message.receiver_id === user?.id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {message.subject}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {message.sender_id === user?.id ? (
                          <div>
                            <span className="text-gray-500">To: </span>
                            {message.receiver?.company_name || message.receiver?.full_name || 'Unknown'}
                          </div>
                        ) : (
                          <div>
                            <span className="text-gray-500">From: </span>
                            {message.sender?.company_name || message.sender?.full_name || 'Unknown'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                        {formatDateTime(message.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(message)
                            setShowViewModal(true)
                            if (!message.is_read && message.receiver_id === user?.id) {
                              markAsRead(message.id)
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        
                        {message.sender_id !== user?.id && (
                          <button
                            onClick={() => {
                              setComposeData({
                                type: 'individual',
                                recipient: message.sender?.email || '',
                                subject: `Re: ${message.subject}`,
                                content: ''
                              })
                              setShowComposeModal(true)
                            }}
                            className="text-green-600 hover:text-green-900 inline-flex items-center"
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            Reply
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
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
                      {Math.min(currentPage * itemsPerPage, filteredMessages.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{filteredMessages.length}</span>
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

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compose Message</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                  <select
                    value={composeData.type}
                    onChange={(e) => setComposeData({...composeData, type: e.target.value as any})}
                    className="iwanyu-input"
                  >
                    <option value="individual">Individual Message</option>
                    <option value="announcement">Announcement (All Vendors)</option>
                  </select>
                </div>

                {composeData.type === 'individual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient (Email or Name)</label>
                    <input
                      type="text"
                      value={composeData.recipient}
                      onChange={(e) => setComposeData({...composeData, recipient: e.target.value})}
                      className="iwanyu-input"
                      placeholder="Enter vendor email or name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                    className="iwanyu-input"
                    placeholder="Enter message subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                    className="iwanyu-input"
                    rows={6}
                    placeholder="Enter your message content"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowComposeModal(false)
                    resetComposeForm()
                  }}
                  className="iwanyu-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="iwanyu-button-primary"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {showViewModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">View Message</h3>
                {getMessageTypeBadge(selectedMessage)}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedMessage.sender_id === user?.id ? 'To:' : 'From:'}
                  </label>
                  <p className="text-gray-900">
                    {selectedMessage.sender_id === user?.id 
                      ? (selectedMessage.receiver?.company_name || selectedMessage.receiver?.full_name || 'Unknown')
                      : (selectedMessage.sender?.company_name || selectedMessage.sender?.full_name || 'Unknown')
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{formatDateTime(selectedMessage.created_at)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="iwanyu-button-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}