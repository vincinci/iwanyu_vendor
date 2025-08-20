'use client'

import { useState } from 'react'
import { VendorLayout } from '@/components/layouts/vendor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Smartphone, 
  Calendar, 
  TrendingUp, 
  Download,
  Phone,
  Clock,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react'

interface VendorPayout {
  id: string
  amount: number
  status: string
  date: string
  method: string
  reference: string
}

const payouts: VendorPayout[] = []

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
    case 'processing':
      return <Badge variant="default" className="bg-blue-100 text-blue-800"><Phone className="mr-1 h-3 w-3" />Processing</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function VendorPayouts() {
  const [isEditingMobile, setIsEditingMobile] = useState(false)
  const [mobileNumber, setMobileNumber] = useState('0788-888-5678')
  const [mobileProvider, setMobileProvider] = useState('MTN')
  const [tempMobileNumber, setTempMobileNumber] = useState('')
  const [tempMobileProvider, setTempMobileProvider] = useState('')

  const handleEditMobile = () => {
    setTempMobileNumber(mobileNumber)
    setTempMobileProvider(mobileProvider)
    setIsEditingMobile(true)
  }

  const handleSaveMobile = () => {
    // Validate mobile number format
    if (tempMobileNumber.length < 10) {
      alert('Please enter a valid mobile number')
      return
    }
    
    setMobileNumber(tempMobileNumber)
    setMobileProvider(tempMobileProvider)
    setIsEditingMobile(false)
    
    // Here you would typically save to database
    console.log('Mobile Money updated:', tempMobileProvider, tempMobileNumber)
    alert(`Mobile Money updated successfully!\n${tempMobileProvider}: ${tempMobileNumber}`)
  }

  const handleCancelEdit = () => {
    setTempMobileNumber('')
    setTempMobileProvider('')
    setIsEditingMobile(false)
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mobile Money Payouts</h1>
            <p className="text-gray-600">Track your earnings and MTN/Airtel Mobile Money payments</p>
          </div>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Download className="mr-2 h-4 w-4" />
            Request Mobile Money Payout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Smartphone className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">0 RWF</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">0 RWF</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Last Payout</p>
                  <p className="text-xl font-bold text-gray-900">None</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">0 RWF</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Your recent payout transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{payout.id}</h3>
                            {getStatusBadge(payout.status)}
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{payout.amount.toFixed(0)} RWF</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{payout.date}</span>
                            <span>•</span>
                            <span>{payout.method}</span>
                            <span>•</span>
                            <span>{payout.reference}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-3 w-3" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Payment Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure your payout preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center justify-between">
                    Default Payment Method
                    {!isEditingMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditMobile}
                        className="text-yellow-700 hover:text-yellow-800"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </h4>
                  
                  {isEditingMobile ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-yellow-800 mb-1 block">
                          Mobile Money Provider
                        </label>
                        <select
                          value={tempMobileProvider}
                          onChange={(e) => setTempMobileProvider(e.target.value)}
                          className="w-full p-2 text-sm border border-yellow-300 rounded-md bg-white text-yellow-800"
                        >
                          <option value="MTN">MTN Mobile Money</option>
                          <option value="Airtel">Airtel Money</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-yellow-800 mb-1 block">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={tempMobileNumber}
                          onChange={(e) => setTempMobileNumber(e.target.value)}
                          placeholder="0788-888-5678"
                          className="w-full p-2 text-sm border border-yellow-300 rounded-md text-yellow-800"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveMobile}
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-yellow-700">{mobileProvider} Mobile Money</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {mobileNumber.replace(/(\d{4})-(\d{3})/, '****-***')}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payout Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Schedule</CardTitle>
                <CardDescription>Automatic payout frequency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Current Schedule</h4>
                  <p className="text-sm text-blue-700">Weekly on Fridays</p>
                  <p className="text-xs text-blue-600 mt-1">Minimum balance: 100 RWF</p>
                </div>
                <Button variant="outline" className="w-full">
                  Change Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </VendorLayout>
  )
}
