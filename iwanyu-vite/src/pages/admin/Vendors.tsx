import React, { useState } from 'react';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Check, 
  X, 
  Ban, 
  RotateCcw,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  BarChart3
} from 'lucide-react';

// Mock vendor data
const mockVendors = [
  {
    id: 'VEN-001',
    businessName: 'TechGear Solutions',
    ownerName: 'John Doe',
    email: 'john@techgear.com',
    phone: '+1 (555) 123-4567',
    businessType: 'Electronics',
    address: '123 Business Ave, New York, NY',
    status: 'pending',
    joinDate: '2024-01-15',
    totalSales: 0,
    totalProducts: 0,
    rating: 0,
  },
  {
    id: 'VEN-002',
    businessName: 'ElectroWorld',
    ownerName: 'Jane Smith',
    email: 'jane@electroworld.com',
    phone: '+1 (555) 234-5678',
    businessType: 'Electronics',
    address: '456 Commerce St, Los Angeles, CA',
    status: 'approved',
    joinDate: '2024-01-10',
    totalSales: 45250.75,
    totalProducts: 23,
    rating: 4.8,
  },
  {
    id: 'VEN-003',
    businessName: 'HomeDecor Plus',
    ownerName: 'Bob Johnson',
    email: 'bob@homedecor.com',
    phone: '+1 (555) 345-6789',
    businessType: 'Home & Garden',
    address: '789 Design Blvd, Chicago, IL',
    status: 'approved',
    joinDate: '2024-01-05',
    totalSales: 32100.25,
    totalProducts: 18,
    rating: 4.6,
  },
  {
    id: 'VEN-004',
    businessName: 'Fashion Forward',
    ownerName: 'Alice Brown',
    email: 'alice@fashionforward.com',
    phone: '+1 (555) 456-7890',
    businessType: 'Clothing',
    address: '321 Style Ave, Miami, FL',
    status: 'suspended',
    joinDate: '2024-01-01',
    totalSales: 28750.00,
    totalProducts: 15,
    rating: 4.2,
  },
];

export const AdminVendors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredVendors = mockVendors.filter(vendor => {
    return (
      (vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vendor.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vendor.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === '' || vendor.status === selectedStatus) &&
      (selectedType === '' || vendor.businessType === selectedType)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      suspended: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleVendorAction = (vendorId: string, action: string) => {
    // TODO: Implement vendor action API calls
    console.log(`Performing action ${action} on vendor ${vendorId}`);
  };

  const exportVendorList = () => {
    // TODO: Implement vendor list export
    console.log('Exporting vendor list');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600">Manage vendor applications, approvals, and performance</p>
          </div>
          <Button variant="outline" onClick={exportVendorList}>
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Vendors</div>
                  <div className="text-2xl font-bold text-gray-900">{mockVendors.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Approved</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockVendors.filter(v => v.status === 'approved').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Pending</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockVendors.filter(v => v.status === 'pending').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Suspended</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockVendors.filter(v => v.status === 'suspended').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Books">Books</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Directory ({filteredVendors.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                              <Building className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{vendor.businessName}</div>
                            <div className="text-sm text-gray-500">{vendor.ownerName}</div>
                            <div className="text-xs text-gray-400">ID: {vendor.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center mb-1">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {vendor.phone}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            {vendor.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.businessType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(vendor.status)}
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(vendor.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${vendor.totalSales.toLocaleString()}
                          </div>
                          <div className="text-gray-500">{vendor.totalProducts} products</div>
                          {vendor.rating > 0 && (
                            <div className="text-yellow-600">★ {vendor.rating}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {vendor.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleVendorAction(vendor.id, 'approve')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleVendorAction(vendor.id, 'reject')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {vendor.status === 'approved' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVendorAction(vendor.id, 'suspend')}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {vendor.status === 'suspended' && (
                            <Button 
                              size="sm"
                              onClick={() => handleVendorAction(vendor.id, 'reactivate')}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start">
                <Check className="w-4 h-4 mr-2" />
                Approve Selected
              </Button>
              <Button variant="outline" className="justify-start">
                <X className="w-4 h-4 mr-2" />
                Reject Selected
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Vendor Data
              </Button>
              <Button variant="outline" className="justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Registration Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Registration trends chart</p>
                  <p className="text-sm text-gray-400">Monthly vendor registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Performers (&gt;$10k)</span>
                  <span className="font-medium text-green-600">
                    {mockVendors.filter(v => v.totalSales > 10000).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medium Performers ($1k-$10k)</span>
                  <span className="font-medium text-yellow-600">
                    {mockVendors.filter(v => v.totalSales >= 1000 && v.totalSales <= 10000).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Vendors (&lt;$1k)</span>
                  <span className="font-medium text-blue-600">
                    {mockVendors.filter(v => v.totalSales < 1000).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="font-medium text-yellow-600">
                    {(mockVendors.reduce((sum, v) => sum + v.rating, 0) / mockVendors.filter(v => v.rating > 0).length || 0).toFixed(1)} ★
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};