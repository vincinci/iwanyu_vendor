import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Lock, Home, LogIn } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">401</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Unauthorized Access</h2>
          <p className="text-gray-600 mt-2">
            You need to sign in to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/login">
            <Button className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};