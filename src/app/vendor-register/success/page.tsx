import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Registration Submitted!</CardTitle>
          <CardDescription className="mt-2">
            Your vendor application has been successfully submitted for review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Admin review (1-3 business days)</li>
              <li>• Document verification</li>
              <li>• Email notification of approval status</li>
              <li>• Access to vendor dashboard upon approval</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Link href="/auth">
              <Button className="w-full">
                Create Your Account
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to Homepage
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
