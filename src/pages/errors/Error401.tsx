import React from 'react'
import { Link } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'

export function Error401() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <Lock className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          401
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Unauthorized Access
        </h2>
        
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. Please sign in with appropriate credentials.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/login"
            className="iwanyu-button-primary w-full block"
          >
            Sign In
          </Link>
          
          <Link
            to="/"
            className="iwanyu-button-secondary w-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  )
}