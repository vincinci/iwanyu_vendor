import React, { useState } from 'react';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Filter
} from 'lucide-react';

// Mock data for charts and reports
const mockSalesData = {
  thisMonth: 12750.50,
  lastMonth: 11200.30,
  growth: 13.8,
  totalOrders: 45,
  avgOrderValue: 283.34,
};

const mockTopProducts = [
  { name: 'Wireless Headphones', sales: 1250.00, orders: 25, growth: 15.2 },
  { name: 'Smartphone Case', sales: 890.50, orders: 18, growth: -5.3 },
  { name: 'USB Cable', sales: 567.25, orders: 12, growth: 8.7 },
  { name: 'Bluetooth Speaker', sales: 445.75, orders: 8, growth: 22.1 },
];

const mockMonthlyData = [
  { month: 'Jan', revenue: 8500, orders: 32 },
  { month: 'Feb', revenue: 9200, orders: 38 },
  { month: 'Mar', revenue: 10100, orders: 42 },
  { month: 'Apr', revenue: 11200, orders: 45 },
  { month: 'May', revenue: 12750, orders: 52 },
];

export const VendorReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [reportType, setReportType] = useState('sales');

  const exportReport = (format: 'csv' | 'pdf') => {
    // TODO: Implement report export functionality
    console.log(`Exporting ${reportType} report as ${format}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Analyze your sales performance and business insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => exportReport('pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="sales">Sales Report</option>
                <option value="products">Product Performance</option>
                <option value="customers">Customer Analytics</option>
                <option value="inventory">Inventory Report</option>
              </select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Custom Date Range
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">This Month</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${mockSalesData.thisMonth.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+{mockSalesData.growth}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Orders</div>
                  <div className="text-2xl font-bold text-gray-900">{mockSalesData.totalOrders}</div>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Avg Order Value</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${mockSalesData.avgOrderValue.toFixed(2)}
                  </div>
                </div>
                <PieChart className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Growth Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{mockSalesData.growth}%</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Revenue chart will be displayed here</p>
                  <p className="text-sm text-gray-400">Integration with Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.orders} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${product.sales.toFixed(2)}</div>
                      <div className={`text-sm flex items-center ${
                        product.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.growth > 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(product.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockMonthlyData.map((month, index) => {
                    const prevMonth = mockMonthlyData[index - 1];
                    const growth = prevMonth 
                      ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue * 100)
                      : 0;
                    
                    return (
                      <tr key={month.month} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {month.month} 2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${month.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {month.orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(month.revenue / month.orders).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {index > 0 && (
                            <div className={`flex items-center ${
                              growth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {growth > 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              <span className="text-sm font-medium">{Math.abs(growth).toFixed(1)}%</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4 flex-col">
                <FileText className="w-6 h-6 mb-2" />
                <span className="font-medium">Sales Report</span>
                <span className="text-xs text-gray-500">Detailed sales analytics</span>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4 flex-col">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="font-medium">Product Performance</span>
                <span className="text-xs text-gray-500">Top performing products</span>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4 flex-col">
                <PieChart className="w-6 h-6 mb-2" />
                <span className="font-medium">Customer Analytics</span>
                <span className="text-xs text-gray-500">Customer behavior data</span>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4 flex-col">
                <Download className="w-6 h-6 mb-2" />
                <span className="font-medium">Inventory Report</span>
                <span className="text-xs text-gray-500">Stock levels and alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};