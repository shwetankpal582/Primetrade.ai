import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Store the current path to redirect back after login
        const currentPath = router.asPath;
        const redirectPath = currentPath !== '/' ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}` : redirectTo;
        router.push(redirectPath);
      } else if (!requireAuth && user) {
        // User is logged in but accessing a page that doesn't require auth (like login/register)
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, requireAuth, redirectTo]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If auth is not required and user is authenticated, don't render children (will redirect)
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

