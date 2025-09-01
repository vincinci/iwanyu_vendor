import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, User, Building2, CheckCircle, XCircle } from 'lucide-react'
import { isValidEmail } from '@/lib/utils'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signUp } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    role: 'vendor' as 'vendor' | 'admin'
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  // Set role from URL params
  useEffect(() => {
    const role = searchParams.get('role')
    if (role === 'admin' || role === 'vendor') {
      setFormData(prev => ({ ...prev, role }))
    }
  }, [searchParams])

  const validatePassword = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }))
    validatePassword(password)
  }

  const isPasswordValid = Object.values(passwordStrength).every(Boolean)
  const isFormValid = formData.email && formData.password && formData.confirmPassword && 
                     formData.fullName && isPasswordValid && 
                     formData.password === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      toast.error('Please fill in all fields correctly')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role
      )
      
      if (error) {
        toast.error(error.message || 'Registration failed')
        return
      }

      toast.success('Registration successful! Please check your email to verify your account.')
      navigate('/login')
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-50 p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Iwanyu
          </h1>
          <p className="text-gray-600">
            Create your {formData.role} account
          </p>
        </div>

        {/* Registration Form */}
        <div className="iwanyu-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="iwanyu-input pl-10"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Company Name Field (for vendors) */}
            {formData.role === 'vendor' && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="iwanyu-input pl-10"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="iwanyu-input pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="iwanyu-input pl-10 pr-10"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs">
                  {passwordStrength.length ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <XCircle className="w-3 h-3 text-red-500 mr-1" />}
                  <span className={passwordStrength.length ? 'text-green-600' : 'text-red-600'}>At least 8 characters</span>
                </div>
                <div className="flex items-center text-xs">
                  {passwordStrength.uppercase ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <XCircle className="w-3 h-3 text-red-500 mr-1" />}
                  <span className={passwordStrength.uppercase ? 'text-green-600' : 'text-red-600'}>One uppercase letter</span>
                </div>
                <div className="flex items-center text-xs">
                  {passwordStrength.lowercase ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <XCircle className="w-3 h-3 text-red-500 mr-1" />}
                  <span className={passwordStrength.lowercase ? 'text-green-600' : 'text-red-600'}>One lowercase letter</span>
                </div>
                <div className="flex items-center text-xs">
                  {passwordStrength.number ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <XCircle className="w-3 h-3 text-red-500 mr-1" />}
                  <span className={passwordStrength.number ? 'text-green-600' : 'text-red-600'}>One number</span>
                </div>
                <div className="flex items-center text-xs">
                  {passwordStrength.special ? <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> : <XCircle className="w-3 h-3 text-red-500 mr-1" />}
                  <span className={passwordStrength.special ? 'text-green-600' : 'text-red-600'}>One special character</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="iwanyu-input pl-10 pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="iwanyu-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating account...
                </div>
              ) : (
                `Create ${formData.role} account`
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="iwanyu-button-secondary w-full flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 Iwanyu. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}