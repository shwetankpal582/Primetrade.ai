import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterCredentials } from '@/lib/auth';

interface RegisterFormData extends RegisterCredentials {
  confirmPassword: string;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, user, loading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, text: 'Very Weak', color: 'text-red-500' },
      { score: 1, text: 'Weak', color: 'text-red-400' },
      { score: 2, text: 'Fair', color: 'text-yellow-500' },
      { score: 3, text: 'Good', color: 'text-yellow-400' },
      { score: 4, text: 'Strong', color: 'text-green-500' },
      { score: 5, text: 'Very Strong', color: 'text-green-600' },
    ];

    return levels[score];
  };

  const passwordStrength = getPasswordStrength(password);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Sign Up - Primetrade</title>
        <meta name="description" content="Create your Primetrade account" />
      </Head>

      <div className="min-h-screen flex">
        {/* Left side - Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <h2 className="text-3xl font-bold text-gray-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                        maxLength: {
                          value: 50,
                          message: 'Name must be less than 50 characters',
                        },
                      })}
                      type="text"
                      autoComplete="name"
                      className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Please enter a valid email address',
                        },
                      })}
                      type="email"
                      autoComplete="email"
                      className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1">
                      <p className={`text-sm ${passwordStrength.color}`}>
                        Password strength: {passwordStrength.text}
                      </p>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full flex justify-center items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="hidden lg:block relative w-0 flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <h1 className="text-4xl font-bold mb-4">Join Primetrade</h1>
              <p className="text-xl text-primary-100 mb-8">
                Start managing your tasks with our powerful dashboard.
              </p>
              <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Secure & Private</h3>
                    <p className="text-sm text-primary-100">
                      Your data is encrypted and secure
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Easy to Use</h3>
                    <p className="text-sm text-primary-100">
                      Intuitive interface designed for productivity
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Always Available</h3>
                    <p className="text-sm text-primary-100">
                      Access your tasks from anywhere, anytime
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

