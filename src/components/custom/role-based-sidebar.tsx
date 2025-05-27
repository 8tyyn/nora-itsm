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
  User
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AdminService } from '@/services/AdminService';
import { useEffect, useState } from 'react';
import { UserModel } from '@/models/UserModel';
import { UserService } from '@/services/UserService';
import { block } from 'sharp';
import { DoctorService } from '@/services/DoctorService';

interface RoleBasedSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: 'super_admin' | 'admin' | 'doctor' | 'user';
}

export function RoleBasedSidebar({
  open,
  onOpenChange,
  userRole
}: RoleBasedSidebarProps) {
  const pathname = usePathname();

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
  const getUsers = async (token: string) => {
    const pendingdata = await UserService.getAllPending(token);
    const blockeddata = await UserService.getAllBlocked(token);
    const activedata = await UserService.getAllActive(token);
    const doctordata = await DoctorService.getAll(token);
    const admindata = await AdminService.getAll(token);
    setPending(pendingdata);
    setBlocked(blockeddata);
    setActive(activedata);
    setDoctor(doctordata);
    setAdmin(admindata);
  };

  useEffect(() => {
    const token = localStorage.getItem('token')!;
    getUsers(token);
  }, []);
  const [pending, setPending] = useState<UserModel[]>([]);
  const [blocked, setBlocked] = useState<UserModel[]>([]);
  const [active, setActive] = useState<UserModel[]>([]);
  const [doctor, setDoctor] = useState<UserModel[]>([]);
  const [admin, setAdmin] = useState<UserModel[]>([]);

  // Admin-only routes
  const adminRoutes = [
    {
      label: 'Users',
      icon: Users,
      href: '/users',
      active: pathname === '/users' || pathname.startsWith('/users/'),
      badge: active.length
    },
    {
      label: 'Doctors',
      icon: Stethoscope,
      href: '/doctors',
      active: pathname === '/doctors',
      badge: doctor.length
    },
    {
      label: 'Registrations',
      icon: UserPlus,
      href: '/registrations',
      active: pathname === '/registrations',
      badge: pending.length
    },
    {
      label: 'Blocked Users',
      icon: Ban,
      href: '/blocked-users',
      active: pathname === '/blocked-users',
      badge: blocked.length
    }
  ];

  // Super admin-only routes
  const superAdminRoutes = [
    {
      label: 'Admins',
      icon: ShieldCheck,
      href: '/admins',
      active: pathname === '/admins' || pathname.startsWith('/admins/'),
      badge: admin.length
    }
  ];

  // Determine which routes to show based on user role
  let routes = [...baseRoutes];

  if (userRole === 'admin' || userRole === 'super_admin') {
    routes = [...routes, ...adminRoutes];
  }

  if (userRole === 'super_admin') {
    routes = [...routes, ...superAdminRoutes];
  }

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
        {userRole === 'super_admin' && (
          <Badge className='ml-2 bg-red-600'>Super Admin</Badge>
        )}
        {userRole === 'admin' && (
          <Badge className='ml-2 bg-red-600'>Admin</Badge>
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
              {route.badge && (
                <Badge className='bg-blue-600 text-white'>{route.badge}</Badge>
              )}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
