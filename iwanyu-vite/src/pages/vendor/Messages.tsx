import React, { useState } from 'react';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Send, 
  Search, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  User,
  Shield,
  Paperclip,
  Star
} from 'lucide-react';

// Mock data
const mockMessages = [
  {
    id: 'MSG-001',
    subject: 'Welcome to Iwanyu Platform',
    content: 'Welcome to the Iwanyu vendor platform! We\'re excited to have you on board.',
    sender: 'Admin Team',
    senderRole: 'admin',
    isRead: true,
    priority: 'high',
    type: 'announcement',
    createdAt: '2024-01-15T10:30:00Z',
    replies: 0,
  },
  {
    id: 'MSG-002',
    subject: 'Product Approval Update',
    content: 'Your product "Wireless Headphones" has been approved and is now live on the marketplace.',
    sender: 'Product Review Team',
    senderRole: 'admin',
    isRead: false,
    priority: 'medium',
    type: 'direct',
    createdAt: '2024-01-14T14:20:00Z',
    replies: 1,
  },
  {
    id: 'MSG-003',
    subject: 'Payout Processing Complete',
    content: 'Your payout request of $5,000 has been processed and will be transferred to your account within 2-3 business days.',
    sender: 'Finance Team',
    senderRole: 'admin',
    isRead: true,
    priority: 'high',
    type: 'direct',
    createdAt: '2024-01-12T09:15:00Z',
    replies: 0,
  },
];

const mockAnnouncements = [
  {
    id: 'ANN-001',
    title: 'Platform Maintenance Scheduled',
    content: 'We will be performing scheduled maintenance on January 20th from 2:00 AM to 4:00 AM EST.',
    date: '2024-01-16T12:00:00Z',
    priority: 'high',
  },
  {
    id: 'ANN-002',
    title: 'New Features Released',
    content: 'Check out our new bulk product import feature and enhanced analytics dashboard!',
    date: '2024-01-10T10:00:00Z',
    priority: 'medium',
  },
];

export const VendorMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');

  const filteredMessages = mockMessages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      low: 'default',
      medium: 'warning',
      high: 'error',
    };
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'direct':
        return <User className="w-4 h-4 text-green-500" />;
      case 'system':
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const sendMessage = () => {
    // TODO: Implement send message functionality
    console.log('Sending message:', { subject: messageSubject, content: newMessage });
    setNewMessage('');
    setMessageSubject('');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Communicate with the admin team and view announcements</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Inbox ({filteredMessages.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !message.isRead ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                      }`}
                      onClick={() => setSelectedMessage(message.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getTypeIcon(message.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`text-sm font-medium ${
                                !message.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {message.subject}
                              </h4>
                              {!message.isRead && (
                                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {message.content}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">From: {message.sender}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </span>
                              {message.replies > 0 && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-blue-600">{message.replies} replies</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(message.priority)}
                          {message.priority === 'high' && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compose Message */}
            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Subject"
                    placeholder="Enter subject..."
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={4}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach
                    </Button>
                    <Button onClick={sendMessage} disabled={!messageSubject || !newMessage}>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-blue-900">{announcement.title}</h4>
                        {getPriorityBadge(announcement.priority)}
                      </div>
                      <p className="text-sm text-blue-700 mb-2">{announcement.content}</p>
                      <span className="text-xs text-blue-600">
                        {new Date(announcement.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Message Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unread Messages</span>
                    <span className="font-medium text-yellow-600">
                      {mockMessages.filter(m => !m.isRead).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Messages</span>
                    <span className="font-medium">{mockMessages.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="font-medium text-green-600">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-medium">2.5 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};