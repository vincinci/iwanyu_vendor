import React from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowLeft, Home, Building2 } from 'lucide-react'

export function Error404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-blue-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. Please check the URL or navigate to one of the available pages.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="iwanyu-button-primary w-full flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
          
          <Link
            to="/login"
            className="iwanyu-button-secondary w-full flex items-center justify-center"
          >
            <Building2 className="w-5 h-5 mr-2" />
            Sign In
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Common pages you might be looking for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              to="/login"
              className="text-xs text-yellow-600 hover:text-yellow-700 underline"
            >
              Login
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/register?vendor"
              className="text-xs text-yellow-600 hover:text-yellow-700 underline"
            >
              Vendor Registration
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/register?admin"
              className="text-xs text-yellow-600 hover:text-yellow-700 underline"
            >
              Admin Registration
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Still can't find what you're looking for? Contact support.</p>
        </div>
      </div>
    </div>
  )
}