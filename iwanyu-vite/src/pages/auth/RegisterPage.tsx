import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Eye, EyeOff, User, Shield } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['vendor', 'admin']),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'vendor',
    },
  });

  const selectedRole = watch('role');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && !loading) {
      if (user.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUp(data.email, data.password, {
        fullName: data.fullName,
        role: data.role,
      });
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! Please check your email for verification.' 
        }
      });
    } catch (error) {
      // Error is handled by the AuthContext
      console.error('Registration error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img 
              src="/logo.png" 
              alt="Iwanyu" 
              className="h-12 w-auto mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling!.classList.remove('hidden');
              }}
            />
            <div className="hidden">
              <h1 className="text-3xl font-bold text-yellow-600">Iwanyu</h1>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    selectedRole === 'vendor' 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      value="vendor"
                      {...register('role')}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Vendor</div>
                        <div className="text-xs text-gray-500">Sell products</div>
                      </div>
                    </div>
                  </label>

                  <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    selectedRole === 'admin' 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      value="admin"
                      {...register('role')}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Admin</div>
                        <div className="text-xs text-gray-500">Manage platform</div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    {...register('agreeToTerms')}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agree-terms" className="text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-yellow-600 hover:text-yellow-500">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-yellow-600 hover:text-yellow-500">
                      Privacy Policy
                    </a>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-red-600">{errors.agreeToTerms.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Account
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {selectedRole === 'vendor' 
              ? 'Vendor accounts require admin approval before activation.'
              : 'Admin accounts require verification and approval.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};