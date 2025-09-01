import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react'

export function Error403() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
          <Shield className="w-12 h-12 text-orange-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          403
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Access Forbidden
        </h2>
        
        <p className="text-gray-600 mb-8">
          You don't have the required permissions to access this page. Please contact your administrator if you need access.
        </p>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-orange-800 font-medium">
                Permission Required
              </p>
              <p className="text-xs text-orange-700 mt-1">
                This resource requires elevated privileges or specific role assignments.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="iwanyu-button-primary w-full block"
          >
            Go to Dashboard
          </Link>
          
          <Link
            to="/login"
            className="iwanyu-button-secondary w-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Sign In with Different Account
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  )
}