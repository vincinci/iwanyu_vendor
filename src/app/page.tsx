'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  Package,
  CreditCard,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'vendor') {
        router.push('/vendor/dashboard')
      } else if (profile.role === 'admin') {
        router.push('/admin')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Iwanyu</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/vendor-register">
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Rwanda's Premier
            <span className="text-yellow-600 block">Multi-Vendor Marketplace</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with local vendors, discover unique products, and support Rwandan businesses. 
            Join our growing community of entrepreneurs and customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendor-register">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-lg px-8 py-3">
                Start Selling Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Iwanyu?
            </h2>
            <p className="text-xl text-gray-600">
              Built for Rwandan businesses and customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Local Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with verified local businesses and artisans across Rwanda
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Quality Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Curated selection of high-quality products from trusted vendors
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Safe and secure payment processing with multiple options
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Round-the-clock customer support and vendor assistance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Vendors Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Ready to Grow Your Business?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of successful vendors on Iwanyu. Our platform provides everything 
                you need to reach more customers, manage your business efficiently, and grow your revenue.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Easy product management and inventory control</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Secure payment processing and timely payouts</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Marketing tools and customer insights</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>24/7 platform support and training</span>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/vendor-register">
                  <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                    Start Your Vendor Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Revenue Growth</h3>
                      <p className="text-sm text-gray-600">Average 40% increase in sales</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Customer Reach</h3>
                      <p className="text-sm text-gray-600">Access to 50,000+ customers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Secure Platform</h3>
                      <p className="text-sm text-gray-600">Enterprise-grade security</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-yellow-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join the Iwanyu Community Today
          </h2>
          <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
            Whether you're a customer looking for quality products or a vendor wanting to grow your business, 
            Iwanyu is the perfect platform for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendor-register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Become a Vendor
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-yellow-600">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Iwanyu</span>
              </div>
              <p className="text-gray-400">
                Rwanda's premier multi-vendor marketplace connecting local businesses with customers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Vendors</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/vendor-register" className="hover:text-white">Become a Vendor</Link></li>
                <li><Link href="/auth" className="hover:text-white">Vendor Login</Link></li>
                <li><Link href="/vendor/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth" className="hover:text-white">Customer Login</Link></li>
                <li><Link href="/" className="hover:text-white">Browse Products</Link></li>
                <li><Link href="/" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">About Us</Link></li>
                <li><Link href="/" className="hover:text-white">Contact</Link></li>
                <li><Link href="/" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Iwanyu. All rights reserved. Built for Rwanda.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)
