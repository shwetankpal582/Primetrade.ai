import React, { useState } from 'react';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Mail, Calendar, Shield, Key, Save, Camera } from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateProfileData, ChangePasswordData } from '@/lib/auth';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<UpdateProfileData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordData & { confirmPassword: string }>();

  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data: UpdateProfileData) => {
    try {
      await updateProfile(data);
    } catch (error) {
      // Error handled by auth context
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordData & { confirmPassword: string }) => {
    try {
      const { confirmPassword, ...passwordData } = data;
      await changePassword(passwordData);
      resetPasswordForm();
    } catch (error) {
      // Error handled by auth context
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  return (
    <ProtectedRoute>
      <Head>
        <title>Profile - Primetrade</title>
      </Head>

      <DashboardLayout title="Profile">
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="mt-2 text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture */}
                <div className="lg:col-span-1">
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center mb-4">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-medium text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <button className="btn btn-outline">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </button>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="card mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-600">Joined</span>
                        <span className="ml-auto font-medium">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Shield className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-600">Role</span>
                        <span className="ml-auto">
                          <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                            {user?.role}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-600">Status</span>
                        <span className="ml-auto">
                          <span className="badge badge-success">Active</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
                    <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...registerProfile('name', {
                              required: 'Name is required',
                              minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters',
                              },
                            })}
                            type="text"
                            className={`input pl-10 ${profileErrors.name ? 'input-error' : ''}`}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {profileErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...registerProfile('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Please enter a valid email address',
                              },
                            })}
                            type="email"
                            className={`input pl-10 ${profileErrors.email ? 'input-error' : ''}`}
                            placeholder="Enter your email address"
                          />
                        </div>
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avatar URL (Optional)
                        </label>
                        <input
                          {...registerProfile('avatar')}
                          type="url"
                          className="input"
                          placeholder="https://example.com/avatar.jpg"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Enter a URL to your profile picture
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isProfileSubmitting}
                          className="btn btn-primary"
                        >
                          {isProfileSubmitting ? (
                            <>
                              <div className="loading-spinner mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="max-w-2xl">
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerPassword('currentPassword', {
                            required: 'Current password is required',
                          })}
                          type="password"
                          className={`input pl-10 ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                          placeholder="Enter your current password"
                        />
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerPassword('newPassword', {
                            required: 'New password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                            },
                          })}
                          type="password"
                          className={`input pl-10 ${passwordErrors.newPassword ? 'input-error' : ''}`}
                          placeholder="Enter your new password"
                        />
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerPassword('confirmPassword', {
                            required: 'Please confirm your new password',
                            validate: (value) =>
                              value === newPassword || 'Passwords do not match',
                          })}
                          type="password"
                          className={`input pl-10 ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• At least 6 characters long</li>
                        <li>• Contains at least one uppercase letter</li>
                        <li>• Contains at least one lowercase letter</li>
                        <li>• Contains at least one number</li>
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isPasswordSubmitting}
                        className="btn btn-primary"
                      >
                        {isPasswordSubmitting ? (
                          <>
                            <div className="loading-spinner mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Security Settings */}
                <div className="card mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <button className="btn btn-outline btn-sm">
                        Enable 2FA
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Login Notifications</h4>
                        <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Active Sessions</h4>
                        <p className="text-sm text-gray-600">Manage your active login sessions</p>
                      </div>
                      <button className="btn btn-outline btn-sm">
                        View Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProfilePage;

