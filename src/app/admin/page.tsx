'use client'

import VendorApprovalDashboard from '@/components/admin/VendorApprovalDashboard'
import { Users } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage vendor applications</p>
        </div>

        <VendorApprovalDashboard />
      </div>
    </div>
  )
}
