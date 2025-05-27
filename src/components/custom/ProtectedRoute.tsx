'use client';

import { useAuth } from '@/services/AuthService';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className='flex h-screen items-center justify-center'></div>;
  }

  if (!isAuthenticated) {
    // The useAuth hook will handle redirection to login
    return null;
  }

  return <>{children}</>;
}
