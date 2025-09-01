import React from 'react';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  Eye,
  Plus,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data - replace with real data from API
const mockStats = {
  totalRevenue: 45250.75,
  totalOrders: 128,
  totalProducts: 45,
  payoutBalance: 12750.50,
  lowStockProducts: 8,
  pendingOrders: 12,
  monthlyGrowth: 15.2,
};

const mockRecentOrders = [
  { id: 'ORD-001', customer: 'John Doe', amount: 125.99, status: 'pending', date: '2024-01-15' },
  { id: 'ORD-002', customer: 'Jane Smith', amount: 89.50, status: 'shipped', date: '2024-01-14' },
  { id: 'ORD-003', customer: 'Bob Johnson', amount: 199.99, status: 'delivered', date: '2024-01-13' },
  { id: 'ORD-004', customer: 'Alice Brown', amount: 67.25, status: 'processing', date: '2024-01-12' },
];

const mockLowStockProducts = [
  { id: 'PRD-001', name: 'Wireless Headphones', stock: 2, minStock: 10 },
  { id: 'PRD-002', name: 'Smartphone Case', stock: 1, minStock: 15 },
  { id: 'PRD-003', name: 'USB Cable', stock: 3, minStock: 20 },
];

export const VendorDashboard: React.FC = () => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'info' | 'default'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
          </div>
          <Link to="/vendor/products">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${mockStats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{mockStats.monthlyGrowth}% from last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Orders</div>
                  <div className="text-2xl font-bold text-gray-900">{mockStats.totalOrders}</div>
                  <div className="text-sm text-gray-600">
                    {mockStats.pendingOrders} pending
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Products</div>
                  <div className="text-2xl font-bold text-gray-900">{mockStats.totalProducts}</div>
                  <div className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {mockStats.lowStockProducts} low stock
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Payout Balance</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${mockStats.payoutBalance.toLocaleString()}
                  </div>
                  <Link to="/vendor/payouts" className="text-sm text-yellow-600 hover:text-yellow-500">
                    Request payout →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Orders</CardTitle>
                <Link to="/vendor/orders">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-600">{order.customer}</div>
                      <div className="text-xs text-gray-500">{order.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${order.amount}</div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Low Stock Alert
                </CardTitle>
                <Link to="/vendor/products">
                  <Button variant="outline" size="sm">
                    Manage Stock
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">ID: {product.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        {product.stock} / {product.minStock}
                      </div>
                      <div className="text-xs text-gray-500">Current / Min</div>
                    </div>
                  </div>
                ))}
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
              <Link to="/vendor/products">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Package className="w-6 h-6 mb-2" />
                  Add Product
                </Button>
              </Link>
              <Link to="/vendor/orders">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <ShoppingCart className="w-6 h-6 mb-2" />
                  View Orders
                </Button>
              </Link>
              <Link to="/vendor/payouts">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <DollarSign className="w-6 h-6 mb-2" />
                  Request Payout
                </Button>
              </Link>
              <Link to="/vendor/reports">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};