'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, Stethoscope, Settings, Home, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardSidebar({
  open,
  onOpenChange
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const routes = [
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
      label: 'Users',
      icon: Users,
      href: '/users',
      active: pathname === '/users' || pathname.startsWith('/users/')
    },
    {
      label: 'Doctors',
      icon: Stethoscope,
      href: '/doctors',
      active: pathname === '/doctors'
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings'
    }
  ];

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
              {route.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
