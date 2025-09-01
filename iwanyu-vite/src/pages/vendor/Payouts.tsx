import React, { useState } from 'react';
import { DashboardLayout } from '../../components/shared/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  DollarSign, 
  CreditCard, 
  Download, 
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock data
const mockPayoutData = {
  availableBalance: 12750.50,
  pendingPayouts: 2500.00,
  totalEarnings: 45250.75,
  lastPayout: {
    amount: 5000.00,
    date: '2024-01-10',
    method: 'Bank Transfer',
  },
};

const mockPayoutHistory = [
  {
    id: 'PAY-001',
    amount: 5000.00,
    status: 'paid',
    requestDate: '2024-01-10',
    processedDate: '2024-01-12',
    method: 'Bank Transfer',
    reference: 'TXN123456789',
  },
  {
    id: 'PAY-002',
    amount: 2500.00,
    status: 'pending',
    requestDate: '2024-01-15',
    processedDate: null,
    method: 'Bank Transfer',
    reference: null,
  },
  {
    id: 'PAY-003',
    amount: 3200.00,
    status: 'approved',
    requestDate: '2024-01-08',
    processedDate: '2024-01-09',
    method: 'PayPal',
    reference: 'PP987654321',
  },
];

export const VendorPayouts: React.FC = () => {
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'info' | 'error'> = {
      pending: 'warning',
      approved: 'info',
      paid: 'success',
      rejected: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handlePayoutRequest = () => {
    // TODO: Implement payout request API call
    console.log(`Requesting payout of $${payoutAmount} via ${selectedMethod}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
            <p className="text-gray-600">Manage your earnings and payout requests</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Available Balance</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${mockPayoutData.availableBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Ready for payout</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Pending Payouts</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${mockPayoutData.pendingPayouts.toLocaleString()}
                  </div>
                  <div className="text-sm text-yellow-600">Processing</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Earnings</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${mockPayoutData.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">All time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Input
                  label="Payout Amount"
                  type="number"
                  placeholder="0.00"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  helperText={`Maximum: $${mockPayoutData.availableBalance.toLocaleString()}`}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                  </select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handlePayoutRequest}
                  disabled={!payoutAmount || parseFloat(payoutAmount) > mockPayoutData.availableBalance}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              </div>

              <div className="md:col-span-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Payout Information</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Payouts are processed within 2-3 business days</li>
                    <li>• Minimum payout amount is $50</li>
                    <li>• Bank transfers may take 3-5 business days to reflect</li>
                    <li>• PayPal payouts are usually instant</li>
                    <li>• A 2.5% processing fee applies to all payouts</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockPayoutHistory.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(payout.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{payout.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${payout.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          {payout.method.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payout.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.reference || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CreditCard className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="font-medium">Bank Transfer</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Direct deposit to your bank account
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Configure
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-blue-600 rounded mr-2" />
                  <span className="font-medium">PayPal</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Instant payouts to your PayPal account
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Connect
                </Button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-purple-600 rounded mr-2" />
                  <span className="font-medium">Stripe</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Fast and secure payments via Stripe
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};