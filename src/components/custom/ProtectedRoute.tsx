'use client';

import { useAuth } from '@/services/AuthService';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  allowedRoles?: Array<'user' | 'admin' | 'client'>;
}

export function ProtectedRoute({ children, adminOnly = false, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const isAuthorized = isAuthenticated
    && (!adminOnly || user?.role === 'admin')
    && (!allowedRoles || Boolean(user && allowedRoles.includes(user.role)));

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace(isAuthenticated && user?.role === 'client' ? '/request-assistant' : isAuthenticated ? '/chat' : '/login');
    }
  }, [isLoading, isAuthorized, isAuthenticated, router]);

  if (isLoading) {
    return <div className='flex h-screen items-center justify-center'></div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
