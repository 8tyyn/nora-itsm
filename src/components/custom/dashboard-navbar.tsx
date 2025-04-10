'use client';

import Link from 'next/link';
import { Menu, LogOut } from 'lucide-react';
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

interface DashboardNavbarProps {
  user: {
    name: string;
    type: string;
    avatar: string;
  };
  onMenuClick: () => void;
}

export function DashboardNavbar({ user, onMenuClick }: DashboardNavbarProps) {
  return (
    <header className='bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px]'>
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
          <span className='mr-2'>{user.name}</span>
          <span className='bg-primary/10 text-primary rounded-full px-2 py-1 text-xs'>
            {user.type}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='bg-primary/10 text-primary'>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='md:hidden'>
              <span>{user.name}</span>
              <span className='ml-auto'>{user.type}</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings'>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
