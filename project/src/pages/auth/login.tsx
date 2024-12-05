import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyUser } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isAdmin: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      isAdmin: false,
    },
  });

  const isAdmin = watch('isAdmin');

  const onSubmit = async (data: LoginFormData) => {
    try {
      // If admin login is selected, use admin credentials
      const loginEmail = data.isAdmin ? 'admin' : data.email;
      
      if (!loginEmail) {
        setError('email', {
          message: 'Email is required',
        });
        return;
      }

      const user = await verifyUser(loginEmail, data.password);
      
      if (!user) {
        setError('root', {
          message: 'Invalid credentials',
        });
        return;
      }

      // For admin login, verify that the user has admin role
      if (data.isAdmin && user.role !== 'admin') {
        setError('root', {
          message: 'Invalid admin credentials',
        });
        return;
      }

      localStorage.setItem('userId', user.id);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('root', {
        message: 'Failed to login. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md text-sm">
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isAdmin')}
                  className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  Login as Admin
                </span>
              </label>
            </div>

            {!isAdmin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    error={errors.email?.message}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  error={errors.password?.message}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {errors.root && (
              <div className="text-red-500 dark:text-red-400 text-sm text-center">{errors.root.message}</div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          {!isAdmin && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                      Sign up
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}