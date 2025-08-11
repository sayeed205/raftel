import * as React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from '@tanstack/react-router';

import useAuthCheck from '@/hooks/use-auth.ts';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuthCheck();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give some time for auth check to complete
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/') return children;

  if (isAuthenticated && pathname === '/login') {
    return <Navigate to="/dashboard" />;
  }

  if (!isAuthenticated && pathname === '/login') return children;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
