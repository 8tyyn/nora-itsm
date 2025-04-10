'use client';

import type React from 'react';

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Background */}
      <div
        className='fixed inset-0 z-0'
        style={{
          background: 'radial-gradient(circle at center, #1E40AF, #000000)'
        }}
      />

      {/* Grid pattern */}
      <div className='bg-grid-pattern fixed inset-0 z-0 opacity-20' />

      {/* Animated shapes */}

      {/* Content */}
      <div className='relative z-10 flex min-h-screen flex-col items-center justify-center p-4'>
        {children}
      </div>
    </div>
  );
}
