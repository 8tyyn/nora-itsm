'use client';

import Link from 'next/link';
import {
  Menu,
  LogOut,
  Shield,
  ShieldCheck,
  User,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/services/AuthService';
import { useEffect, useState } from 'react';

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const { logout, user } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    type: '',
    role: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.fullName || '',
        type: user.role || '',
        role: user.role ? user.role.toLowerCase().replace(' ', '_') : '', // Convert "Super Admin" to "super_admin"
        avatar: ''
      });
    }
  }, [user]);

  // Function to get the appropriate icon based on user role
  const getRoleIcon = () => {
    if (userData.role === 'super_admin')
      return <ShieldCheck className='mr-2 h-4 w-4 text-red-600' />;
    if (userData.role === 'admin')
      return <Shield className='mr-2 h-4 w-4 text-blue-600' />;
    return null;
  };

  // Function to get the appropriate background color for the role badge
  const getRoleBadgeClass = () => {
    if (userData.role === 'super_admin') return 'bg-red-100 text-red-700';
    if (userData.role === 'admin') return 'bg-blue-100 text-blue-700';
    return 'bg-blue-100 text-blue-700';
  };

  // Handle logout using AuthService
  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return null; // Don't render navbar if user isn't loaded yet
  }

  return (
    <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px]'>
      <Button
        variant='ghost'
        size='icon'
        className='lg:hidden'
        onClick={onMenuClick}
      >
        <Menu className='h-5 w-5' />
        <span className='sr-only'>Toggle menu</span>
      </Button>
      <div className='ml-auto flex items-center gap-4'>
        <div className='hidden text-sm font-medium md:block'>
          <span className='mr-2'>{userData.name}</span>
          <span
            className={`rounded-full px-2 py-1 text-xs ${getRoleBadgeClass()}`}
          >
            {userData.type}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <Avatar className='h-8 w-8'>
                <AvatarImage
                  src={userData.avatar || '/placeholder.svg'}
                  alt={userData.name}
                />
                <AvatarFallback className='bg-blue-100 text-blue-700'>
                  {userData.name ? userData.name.charAt(0) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='md:hidden'>
              <span>{userData.name}</span>
              <span className='ml-auto'>{userData.type}</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/profile'>
                <User className='mr-2 h-4 w-4' />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings'>
                <Settings className='mr-2 h-4 w-4' />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
