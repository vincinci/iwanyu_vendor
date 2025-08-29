'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']

export default function MessagingInterface() {
  const { user, userProfile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient<Database>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchMessages()
    subscribeToMessages()
  }, [userProfile]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!userProfile?.id) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userProfile.id},receiver_id.eq.${userProfile.id}`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToMessages = () => {
    if (!userProfile?.id) return

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userProfile.id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userProfile?.id) return

    try {
      // For vendor messaging, determine appropriate receiver
      let receiverId: string
      let vendorId: string | null = null

      if (userProfile.role === 'vendor') {
        // Vendor sending to admin - use system admin ID
        receiverId = '00000000-0000-0000-0000-000000000001' // System admin UUID
        vendorId = userProfile.id
      } else {
        // Admin sending to vendor
        receiverId = userProfile.id
        vendorId = userProfile.id
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userProfile.id,
          receiver_id: receiverId,
          message: newMessage.trim(),
          sender_type: userProfile.role as 'vendor' | 'admin',
          receiver_type: userProfile.role === 'vendor' ? 'admin' : 'vendor',
          vendor_id: vendorId
        })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = formatDate(message.created_at)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">
                {userProfile?.role === 'vendor' ? 'Chat with Admin Support' : 'Vendor Communications'}
              </p>
            </div>
            <Button onClick={() => window.history.back()} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              Live Chat
            </CardTitle>
            <CardDescription>
              Real-time messaging with {userProfile?.role === 'vendor' ? 'admin support' : 'vendors'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96">
              {Object.keys(messageGroups).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                Object.entries(messageGroups).map(([date, dayMessages]) => (
                  <div key={date}>
                    <div className="text-center text-sm text-gray-500 my-4">
                      {date}
                    </div>
                    {dayMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === userProfile?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === userProfile?.id
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === userProfile?.id
                              ? 'text-yellow-100'
                              : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
