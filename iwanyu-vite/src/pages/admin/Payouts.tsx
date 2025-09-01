import React, { useState } from 'react';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Search, 
  Download, 
  Eye, 
  Check, 
  X,
  DollarSign,
  Clock,
  Building,
  CreditCard,
  Calendar
} from 'lucide-react';

// Mock payout data
const mockPayouts = [
  {
    id: 'PAY-001',
    vendor: 'ElectroWorld',
    vendorId: 'VEN-002',
    amount: 5000.00,
    status: 'pending',
    requestDate: '2024-01-15',
    method: 'Bank Transfer',
    accountDetails: '**** 1234',
  },
  {
    id: 'PAY-002',
    vendor: 'HomeDecor Plus',
    vendorId: 'VEN-003',
    amount: 3200.00,
    status: 'approved',
    requestDate: '2024-01-14',
    processedDate: '2024-01-15',
    method: 'PayPal',
    accountDetails: 'bob@homedecor.com',
  },
  {
    id: 'PAY-003',
    vendor: 'TechGear Solutions',
    vendorId: 'VEN-001',
    amount: 2500.00,
    status: 'paid',
    requestDate: '2024-01-10',
    processedDate: '2024-01-12',
    method: 'Bank Transfer',
    accountDetails: '**** 5678',
    reference: 'TXN123456789',
  },
];

export const AdminPayouts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredPayouts = mockPayouts.filter(payout => {
    return (
      (payout.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
       payout.vendorId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === '' || payout.status === selectedStatus)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'info' | 'error'> = {
      pending: 'warning',
      approved: 'info',
      paid: 'success',
      rejected: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handlePayoutAction = (payoutId: string, action: string) => {
    console.log(`Performing action ${action} on payout ${payoutId}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
            <p className="text-gray-600">Review and process vendor payout requests</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Pending Requests</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockPayouts.filter(p => p.status === 'pending').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Pending Amount</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${mockPayouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Processed Today</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockPayouts.filter(p => p.status === 'paid').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Paid Out</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${mockPayouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search payouts..."
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
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests ({filteredPayouts.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payout ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payout.id}</div>
                        {payout.reference && (
                          <div className="text-xs text-gray-500">Ref: {payout.reference}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payout.vendor}</div>
                            <div className="text-xs text-gray-500">{payout.vendorId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${payout.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div>{payout.method}</div>
                            <div className="text-xs text-gray-500">{payout.accountDetails}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payout.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {payout.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handlePayoutAction(payout.id, 'approve')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePayoutAction(payout.id, 'reject')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {payout.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => handlePayoutAction(payout.id, 'mark_paid')}
                            >
                              Mark Paid
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
      </div>
    </DashboardLayout>
  );
};