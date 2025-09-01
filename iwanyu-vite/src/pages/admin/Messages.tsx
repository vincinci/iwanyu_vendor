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
  Users,
  Building,
  Megaphone,
  Mail,
  Clock,
  CheckCircle
} from 'lucide-react';

// Mock data
const mockMessages = [
  {
    id: 'MSG-001',
    subject: 'Product approval question',
    sender: 'TechGear Solutions',
    senderType: 'vendor',
    content: 'Hi, I have a question about the approval process for my wireless headphones product.',
    isRead: false,
    priority: 'medium',
    createdAt: '2024-01-15T10:30:00Z',
    replies: 0,
  },
  {
    id: 'MSG-002',
    subject: 'Payout processing issue',
    sender: 'ElectroWorld',
    senderType: 'vendor',
    content: 'My payout request has been pending for 5 days. Could you please check the status?',
    isRead: true,
    priority: 'high',
    createdAt: '2024-01-14T14:20:00Z',
    replies: 2,
  },
];

export const AdminMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState('medium');

  const sendAnnouncement = () => {
    console.log('Sending announcement:', { 
      title: announcementTitle, 
      content: announcementContent, 
      priority: announcementPriority 
    });
    setAnnouncementTitle('');
    setAnnouncementContent('');
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      low: 'default',
      medium: 'warning',
      high: 'error',
    };
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages & Communication</h1>
            <p className="text-gray-600">Manage vendor communications and send announcements</p>
          </div>
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
                <CardTitle>Vendor Messages ({mockMessages.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {mockMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !message.isRead ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                      }`}
                      onClick={() => setSelectedMessage(message.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Building className="w-5 h-5 text-blue-500 mt-0.5" />
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
            {/* Send Announcement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Megaphone className="w-5 h-5 mr-2" />
                  Send Announcement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Title"
                    placeholder="Announcement title..."
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      value={announcementPriority}
                      onChange={(e) => setAnnouncementPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={4}
                      placeholder="Type your announcement..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={sendAnnouncement}
                    disabled={!announcementTitle || !announcementContent}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to All Vendors
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Message Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Message Statistics</CardTitle>
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
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-medium text-green-600">2.1 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Resolution Rate</span>
                    <span className="font-medium text-green-600">98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Email All Vendors
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Message by Category
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Megaphone className="w-4 h-4 mr-2" />
                    System Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};