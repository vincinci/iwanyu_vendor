import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Send, 
  MessageSquare, 
  Bell, 
  Search, 
  Filter,
  Eye,
  Reply,
  Archive,
  Trash2,
  Plus,
  User,
  Building2,
  Clock,
  CheckCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  content: string
  is_read: boolean
  is_announcement: boolean
  created_at: string
  sender_name?: string
  sender_role?: string
}

export function VendorMessages() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [composeData, setComposeData] = useState({
    subject: '',
    content: ''
  })
  const [replyData, setReplyData] = useState({
    content: ''
  })

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      
      // Fetch messages where vendor is receiver or sender
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, role),
          receiver:profiles!messages_receiver_id_fkey(full_name, role)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process messages to add sender/receiver names
      const processedMessages = data?.map(msg => ({
        ...msg,
        sender_name: msg.sender?.full_name || 'Unknown',
        sender_role: msg.sender?.role || 'Unknown'
      })) || []

      setMessages(processedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!composeData.subject || !composeData.content) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      // Find admin user to send message to
      const { data: adminUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .single()

      if (!adminUser) {
        toast.error('No admin user found')
        return
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: adminUser.id,
          subject: composeData.subject,
          content: composeData.content,
          is_read: false,
          is_announcement: false
        })

      if (error) throw error

      toast.success('Message sent successfully')
      setShowComposeModal(false)
      setComposeData({ subject: '', content: '' })
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyData.content) {
      toast.error('Please enter a reply message')
      return
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: selectedMessage.sender_id,
          subject: `Re: ${selectedMessage.subject}`,
          content: replyData.content,
          is_read: false,
          is_announcement: false
        })

      if (error) throw error

      toast.success('Reply sent successfully')
      setSelectedMessage(null)
      setReplyData({ content: '' })
      fetchMessages()
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
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

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && !message.is_read) ||
                         (selectedFilter === 'announcements' && message.is_announcement) ||
                         (selectedFilter === 'sent' && message.sender_id === user?.id) ||
                         (selectedFilter === 'received' && message.receiver_id === user?.id)

    return matchesSearch && matchesFilter
  })

  const unreadCount = messages.filter(msg => !msg.is_read && msg.receiver_id === user?.id).length
  const announcementsCount = messages.filter(msg => msg.is_announcement && msg.receiver_id === user?.id).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">
                Communicate with admin and view announcements
              </p>
            </div>
            <button
              onClick={() => setShowComposeModal(true)}
              className="iwanyu-button-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Message
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.length}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Announcements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {announcementsCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="iwanyu-input pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="iwanyu-input"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="announcements">Announcements</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedFilter('all')
                }}
                className="iwanyu-button-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredMessages.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !message.is_read && message.receiver_id === user?.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.is_read && message.receiver_id === user?.id) {
                      markAsRead(message.id)
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {message.is_announcement ? (
                            <Bell className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {message.subject}
                          </span>
                        </div>
                        {!message.is_read && message.receiver_id === user?.id && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        {message.is_announcement && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Announcement
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {message.sender_id === user?.id ? 'You' : message.sender_name}
                          {message.sender_role && (
                            <span className="ml-1 text-xs bg-gray-100 px-2 py-1 rounded">
                              {message.sender_role}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMessage(message)
                          if (!message.is_read && message.receiver_id === user?.id) {
                            markAsRead(message.id)
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {message.receiver_id === user?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedMessage(message)
                            setReplyData({ content: '' })
                          }}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Start a conversation by sending a message to admin.'
                }
              </p>
              {!searchTerm && selectedFilter === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowComposeModal(true)}
                    className="iwanyu-button-primary inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Send Message
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Message to Admin</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    className="iwanyu-input"
                    placeholder="Enter message subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                    className="iwanyu-input"
                    rows={6}
                    placeholder="Type your message here..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowComposeModal(false)
                    setComposeData({ subject: '', content: '' })
                  }}
                  className="iwanyu-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!composeData.subject || !composeData.content}
                  className="iwanyu-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedMessage.subject}
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    From: {selectedMessage.sender_id === user?.id ? 'You' : selectedMessage.sender_name}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(selectedMessage.created_at)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>

                {selectedMessage.receiver_id === user?.id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply
                    </label>
                    <textarea
                      value={replyData.content}
                      onChange={(e) => setReplyData({ content: e.target.value })}
                      className="iwanyu-input"
                      rows={4}
                      placeholder="Type your reply..."
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedMessage(null)
                    setReplyData({ content: '' })
                  }}
                  className="iwanyu-button-secondary"
                >
                  Close
                </button>
                
                {selectedMessage.receiver_id === user?.id && (
                  <button
                    onClick={handleReply}
                    disabled={!replyData.content}
                    className="iwanyu-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Reply
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}