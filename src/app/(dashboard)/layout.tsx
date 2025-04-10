'use client';

import type React from 'react';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/custom/dashboard-sidebar';
import { DashboardNavbar } from '@/components/custom/dashboard-navbar';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Mock user data - in a real app, this would come from authentication
  const user = {
    name: 'John Doe',
    type: 'Administrator',
    avatar: '/placeholder.svg?height=32&width=32'
  };

  return (
    <div className='flex h-screen overflow-hidden'>
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <DashboardNavbar
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className='flex-1 overflow-auto p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
