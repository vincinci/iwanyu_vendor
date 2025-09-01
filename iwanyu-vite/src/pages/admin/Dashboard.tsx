import React from 'react';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Clock,
  Eye,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const mockKPIs = {
  totalVendors: 156,
  activeVendors: 142,
  pendingVendors: 8,
  totalProducts: 2847,
  approvedProducts: 2654,
  pendingProducts: 125,
  totalOrders: 1256,
  pendingOrders: 23,
  totalRevenue: 458750.25,
  monthlyGrowth: 18.5,
};

const mockRecentActivity = [
  {
    id: 1,
    type: 'vendor_registration',
    description: 'New vendor "TechGear Solutions" registered',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'pending',
  },
  {
    id: 2,
    type: 'product_approval',
    description: 'Product "Wireless Headphones" approved',
    timestamp: '2024-01-15T09:15:00Z',
    status: 'completed',
  },
  {
    id: 3,
    type: 'payout_request',
    description: 'Payout request $5,000 from vendor "ElectroWorld"',
    timestamp: '2024-01-15T08:45:00Z',
    status: 'pending',
  },
  {
    id: 4,
    type: 'order_placed',
    description: 'New order #12345 placed - $299.99',
    timestamp: '2024-01-15T08:20:00Z',
    status: 'completed',
  },
];

const mockTopVendors = [
  { name: 'ElectroWorld', revenue: 45250.75, orders: 156, growth: 22.1, status: 'approved' },
  { name: 'TechGear Solutions', revenue: 38900.50, orders: 134, growth: 15.8, status: 'approved' },
  { name: 'HomeDecor Plus', revenue: 32100.25, orders: 98, growth: -2.3, status: 'approved' },
  { name: 'Fashion Forward', revenue: 28750.00, orders: 87, growth: 8.9, status: 'approved' },
];

export const AdminDashboard: React.FC = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vendor_registration':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'product_approval':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'payout_request':
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case 'order_placed':
        return <ShoppingCart className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'info' | 'default'> = {
      pending: 'warning',
      completed: 'success',
      approved: 'success',
      rejected: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Platform overview and key performance indicators</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/vendors">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Vendors
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Vendors</div>
                  <div className="text-2xl font-bold text-gray-900">{mockKPIs.totalVendors}</div>
                  <div className="text-sm text-gray-600">
                    {mockKPIs.activeVendors} active, {mockKPIs.pendingVendors} pending
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Products</div>
                  <div className="text-2xl font-bold text-gray-900">{mockKPIs.totalProducts}</div>
                  <div className="text-sm text-yellow-600">
                    {mockKPIs.pendingProducts} awaiting approval
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Orders</div>
                  <div className="text-2xl font-bold text-gray-900">{mockKPIs.totalOrders}</div>
                  <div className="text-sm text-gray-600">
                    {mockKPIs.pendingOrders} pending
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${mockKPIs.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{mockKPIs.monthlyGrowth}% this month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Vendors */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Top Performing Vendors</CardTitle>
                <Link to="/admin/vendors">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopVendors.map((vendor, index) => (
                  <div key={vendor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-sm text-gray-500">{vendor.orders} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${vendor.revenue.toLocaleString()}</div>
                      <div className={`text-sm flex items-center ${
                        vendor.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {vendor.growth > 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(vendor.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vendor Applications</span>
                  <Link to="/admin/vendors" className="text-yellow-600 hover:text-yellow-500 font-medium">
                    {mockKPIs.pendingVendors}
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Product Reviews</span>
                  <Link to="/admin/products" className="text-yellow-600 hover:text-yellow-500 font-medium">
                    {mockKPIs.pendingProducts}
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payout Requests</span>
                  <Link to="/admin/payouts" className="text-yellow-600 hover:text-yellow-500 font-medium">
                    12
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Alerts & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Failed Payments</span>
                  <span className="text-red-600 font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Stock Products</span>
                  <span className="text-yellow-600 font-medium">15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Disputed Orders</span>
                  <span className="text-red-600 font-medium">2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 text-green-500 mr-2" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Platform Uptime</span>
                  <span className="text-green-600 font-medium">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-green-600 font-medium">1.2s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <span className="text-green-600 font-medium">4.8/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Revenue chart will be displayed here</p>
                  <p className="text-sm text-gray-400">Monthly revenue trends and projections</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Vendor growth chart will be displayed here</p>
                  <p className="text-sm text-gray-400">New vendor registrations over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/admin/vendors">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  Review Vendors
                </Button>
              </Link>
              <Link to="/admin/products">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Package className="w-6 h-6 mb-2" />
                  Approve Products
                </Button>
              </Link>
              <Link to="/admin/payouts">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <DollarSign className="w-6 h-6 mb-2" />
                  Process Payouts
                </Button>
              </Link>
              <Link to="/admin/messages">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <MessageSquare className="w-6 h-6 mb-2" />
                  Send Announcement
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};