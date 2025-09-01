import React from 'react'

interface SupabaseErrorBoundaryProps {
  children: React.ReactNode
}

interface SupabaseErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class SupabaseErrorBoundary extends React.Component<
  SupabaseErrorBoundaryProps,
  SupabaseErrorBoundaryState
> {
  constructor(props: SupabaseErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): SupabaseErrorBoundaryState {
    if (error.message.includes('Supabase') || error.message.includes('URL')) {
      return { hasError: true, error }
    }
    return { hasError: false }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Supabase Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-red-600 mb-4">🔧 Setup Required</h1>
              <p className="text-lg text-gray-700 mb-6">
                Your Supabase configuration needs to be set up before the app can run.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 Setup Instructions</h2>
              
              <div className="text-left space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700">1. Create a Supabase Project</h3>
                  <p className="text-gray-600">Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> and create a new project</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">2. Get Your Credentials</h3>
                  <p className="text-gray-600">In your project dashboard, go to Settings → API to find your URL and anon key</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">3. Update Environment Variables</h3>
                  <p className="text-gray-600">Edit the <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file in your project root</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-gray-800">
                  VITE_SUPABASE_URL=https://your-project-id.supabase.co<br/>
                  VITE_SUPABASE_ANON_KEY=your-anon-key-here
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Reload After Setup
                </button>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>Error: {this.state.error?.message}</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
