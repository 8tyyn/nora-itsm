'use client';

import type React from 'react';
import { useState } from 'react';
import { DashboardNavbar } from '@/components/custom/dashboard-navbar';
import { DynamicSidebar } from '@/components/custom/dynamic-sidebar';
import { useAuth } from '@/services/AuthService';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className='flex h-screen overflow-hidden'>
      <DynamicSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className='flex-1 overflow-auto p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
