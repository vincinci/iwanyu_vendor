'use client'

import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Smartphone,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'

export default function AdminPayouts() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mobile Money Payouts</h1>
            <p className="text-gray-600">Manage vendor MTN & Airtel Mobile Money payouts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Smartphone className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">0 RWF</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">0 RWF</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">0 RWF</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Vendors Paid</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mobile Money Payout Requests</CardTitle>
            <CardDescription>Review and process vendor MTN & Airtel Money payout requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Smartphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payout requests</h3>
              <p className="text-gray-500">
                Vendor Mobile Money payout requests will appear here when vendors request withdrawals
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
