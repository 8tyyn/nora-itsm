import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserService } from './UserService';

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push('/login');
          return;
        }

        // Verify token by getting user profile
        const userProfile = await UserService.getUserProfile(token);

        if (userProfile) {
          setUser(userProfile);
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          router.push('/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const logout = async () => {
    await UserService.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return { isAuthenticated, isLoading, user, logout };
};
