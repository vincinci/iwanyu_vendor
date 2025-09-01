import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowLeft, Mail } from 'lucide-react';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [emailSent, setEmailSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setEmailSent(true);
    } catch (error) {
      // Error is handled by the AuthContext
      console.error('Reset password error:', error);
    }
  };

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
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Card>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check your email
                </h3>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to your email address. 
                  Please check your inbox and follow the instructions.
                </p>
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>
              </div>
            )}

            {/* Back to Sign In */}
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};