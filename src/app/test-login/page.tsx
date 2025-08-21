'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@iwanyu.rw');
  const [password, setPassword] = useState('Admin123!');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const supabase = createClient();
      console.log('Testing login with:', { email, password });
      
      // Test Supabase connection first
      const { data: healthCheck } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      console.log('Supabase connection:', healthCheck);
      
      // Try to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Auth result:', { authData, authError });
      
      if (authError) {
        setResult({ 
          success: false, 
          error: authError.message,
          type: 'auth_error'
        });
        return;
      }
      
      if (authData.user) {
        // Check if user is admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();
          
        console.log('Admin check:', { adminUser, adminError });
        
        setResult({
          success: true,
          user: authData.user,
          adminUser,
          session: authData.session
        });
      } else {
        setResult({
          success: false,
          error: 'No user returned',
          type: 'no_user'
        });
      }
    } catch (error: any) {
      console.error('Test error:', error);
      setResult({
        success: false,
        error: error.message || 'Unknown error',
        type: 'catch_error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Login Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
          </div>
        </div>
        
        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            
            <div className={`p-4 rounded mb-4 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {result.success ? 'LOGIN SUCCESSFUL! ✅' : 'LOGIN FAILED ❌'}
            </div>
            
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
