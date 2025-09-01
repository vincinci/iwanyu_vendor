import React, { useState } from 'react';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Calendar,
  FileText
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const exportReport = (type: string, format: 'csv' | 'pdf') => {
    console.log(`Exporting ${type} report as ${format}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Platform-wide analytics and performance insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('comprehensive', 'pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF Report
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Report Period:</span>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Custom Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Platform Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">$458,750</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +18.5%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Active Vendors</div>
                  <div className="text-2xl font-bold text-gray-900">142</div>
                  <div className="text-sm text-blue-600">+12 this month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Orders</div>
                  <div className="text-2xl font-bold text-gray-900">1,256</div>
                  <div className="text-sm text-purple-600">+156 this month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Products Listed</div>
                  <div className="text-2xl font-bold text-gray-900">2,847</div>
                  <div className="text-sm text-orange-600">+89 this month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Revenue chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Vendor comparison chart</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col" onClick={() => exportReport('sales', 'csv')}>
                <BarChart3 className="w-6 h-6 mb-2" />
                <span className="font-medium">Sales Report</span>
                <span className="text-xs text-gray-500">CSV Export</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" onClick={() => exportReport('vendors', 'csv')}>
                <Users className="w-6 h-6 mb-2" />
                <span className="font-medium">Vendor Report</span>
                <span className="text-xs text-gray-500">CSV Export</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" onClick={() => exportReport('products', 'csv')}>
                <Package className="w-6 h-6 mb-2" />
                <span className="font-medium">Product Report</span>
                <span className="text-xs text-gray-500">CSV Export</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" onClick={() => exportReport('financial', 'pdf')}>
                <DollarSign className="w-6 h-6 mb-2" />
                <span className="font-medium">Financial Report</span>
                <span className="text-xs text-gray-500">PDF Export</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};