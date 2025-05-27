'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  Stethoscope,
  Settings,
  Home,
  X,
  UserPlus,
  ShieldCheck,
  Ban,
  Calendar,
  FileText,
  MessageSquare,
  User,
  Activity
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/services/AuthService';
import { UserModel } from '@/models/UserModel';
import { UserService } from '@/services/UserService';
import { DoctorService } from '@/services/DoctorService';
import { AdminService } from '@/services/AdminService';
import { MessageService } from '@/services/MessageService';

interface DynamicSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DynamicSidebar({ open, onOpenChange }: DynamicSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // State for counts that will be displayed in badges
  const [counts, setCounts] = useState({
    pending: 0,
    active: 0,
    blocked: 0,
    doctors: 0,
    admins: 0,
    blockadmins: 0,
    unreadMessages: 0
  });

  // Determine user role from auth context
  const userRole = user?.role?.toLowerCase().replace(' ', '_') || 'user';

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch unread messages count for all users
        const unreadCount = await MessageService.getUnreadCount(token);
        setCounts((prev) => ({
          ...prev,
          unreadMessages: unreadCount
        }));

        // Only fetch counts if user is admin or super_admin
        if (userRole === 'admin' || userRole === 'super_admin') {
          const pendingUsers = await UserService.getAllPending(token);
          const activeUsers = await UserService.getAllActive(token);
          const blockedUsers = await UserService.getAllBlocked(token);
          const doctorUsers = await DoctorService.getAll(token);

          setCounts((prev) => ({
            ...prev,
            pending: pendingUsers.length,
            active: activeUsers.length,
            blocked: blockedUsers.length,
            doctors: doctorUsers.length
          }));

          // Only fetch admin count for super_admin
          if (userRole === 'super_admin') {
            const adminUsers = await AdminService.getAll(token);
            const blockedAdmins = await UserService.getBlockedAdmins(token);
            setCounts((prev) => ({
              ...prev,
              admins: adminUsers.length,
              blockadmins: blockedAdmins.length
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, [user, userRole]);

  // Base routes available to all roles
  const baseRoutes = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      active: pathname === '/analytics'
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      href: '/messages',
      active: pathname === '/messages' || pathname.startsWith('/messages/'),
      badge: counts.unreadMessages
    },
    {
      label: 'Profile',
      icon: User,
      href: '/profile',
      active: pathname === '/profile'
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings'
    }
  ];

  // Admin-only routes
  const adminRoutes = [
    {
      label: 'Users',
      icon: Users,
      href: '/users',
      active: pathname === '/users' || pathname.startsWith('/users/'),
      badge: counts.active
    },
    {
      label: 'Doctors',
      icon: Stethoscope,
      href: '/doctors',
      active: pathname === '/doctors',
      badge: counts.doctors
    },
    {
      label: 'Registrations',
      icon: UserPlus,
      href: '/registrations',
      active: pathname === '/registrations',
      badge: counts.pending
    },
    {
      label: 'Blocked Users',
      icon: Ban,
      href: '/blocked-users',
      active: pathname === '/blocked-users',
      badge: counts.blocked
    },
    {
      label: 'Activity Logs',
      icon: Activity,
      href: '/activity-logs',
      active: pathname === '/activity-logs'
    }
  ];

  // Super admin-only routes
  const superAdminRoutes = [
    {
      label: 'Admins',
      icon: ShieldCheck,
      href: '/admins',
      active: pathname === '/admins' || pathname.startsWith('/admins/'),
      badge: counts.admins
    },
    {
      label: 'Blocked Admins',
      icon: Ban,
      href: '/blocked-admins',
      active: pathname === '/blocked-admins',
      badge: counts.blockadmins
    }
  ];

  // Doctor-only routes

  // Determine which routes to show based on user role
  let routes = [...baseRoutes];

  if (userRole === 'admin' || userRole === 'super_admin') {
    routes = [...routes, ...adminRoutes];
  }

  if (userRole === 'super_admin') {
    routes = [...routes, ...superAdminRoutes];
  }

  // Get role badge color
  const getRoleBadgeClass = () => {
    if (userRole === 'super_admin') return 'bg-red-600';
    if (userRole === 'admin') return 'bg-blue-600';
    if (userRole === 'doctor') return 'bg-green-600';
    return 'bg-gray-600';
  };

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className='flex h-14 items-center border-b px-4 lg:h-[60px]'>
        <Link
          href='/dashboard'
          className='flex items-center gap-2 font-semibold'
        >
          <BarChart3 className='h-6 w-6 text-blue-600' />
          <span>Healthcare Admin</span>
        </Link>
        {user?.role && (
          <Badge className={`ml-2 ${getRoleBadgeClass()} text-white`}>
            {user.role}
          </Badge>
        )}
        <Button
          variant='ghost'
          size='icon'
          className='ml-auto lg:hidden'
          onClick={() => onOpenChange(false)}
        >
          <X className='h-4 w-4' />
          <span className='sr-only'>Close sidebar</span>
        </Button>
      </div>
      <ScrollArea className='flex-1 py-2'>
        <nav className='grid gap-1 px-2'>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  onOpenChange(false);
                }
              }}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-50',
                route.active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              )}
            >
              <route.icon
                className={cn(
                  'h-4 w-4',
                  route.active ? 'text-blue-600' : 'text-gray-500'
                )}
              />
              <span className='flex-1'>{route.label}</span>
              {route.badge !== undefined && route.badge > 0 && (
                <Badge className='bg-blue-600 text-white'>{route.badge}</Badge>
              )}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
