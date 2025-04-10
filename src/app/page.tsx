'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  FileText,
  HeartPulse,
  LineChart,
  Shield,
  Stethoscope,
  Users
} from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    staff: 0,
    beds: 0
  });

  useEffect(() => {
    // Animate stats counting up
    const interval = setInterval(() => {
      setStats((prev) => {
        const newStats = { ...prev };
        if (newStats.patients < 5842) newStats.patients += 58;
        if (newStats.doctors < 320) newStats.doctors += 3;
        if (newStats.staff < 1250) newStats.staff += 12;
        if (newStats.beds < 480) newStats.beds += 4;

        if (
          newStats.patients >= 5842 &&
          newStats.doctors >= 320 &&
          newStats.staff >= 1250 &&
          newStats.beds >= 480
        ) {
          clearInterval(interval);
          newStats.patients = 5842;
          newStats.doctors = 320;
          newStats.staff = 1250;
          newStats.beds = 480;
        }

        return newStats;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className='relative min-h-screen overflow-hidden'>
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
      <div className='relative z-10 container mx-auto flex min-h-screen flex-col px-4 py-12'>
        {/* Header */}
        <header className='mb-12 flex items-center justify-between'>
          <div className='flex items-center'>
            <HeartPulse className='mr-2 h-6 w-6 text-blue-400' />
            <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent'>
              Healthcare Admin
            </span>
          </div>
          <nav className='hidden space-x-6 md:flex'>
            <a
              href='#features'
              className='text-gray-300 transition-colors hover:text-white'
            >
              Features
            </a>
            <a
              href='#testimonials'
              className='text-gray-300 transition-colors hover:text-white'
            >
              Testimonials
            </a>
            <a
              href='#dashboard'
              className='text-gray-300 transition-colors hover:text-white'
            >
              Dashboard
            </a>
          </nav>
        </header>

        {/* Hero section */}
        <div className='flex flex-1 flex-col items-center justify-center gap-12 py-12 md:flex-row'>
          <div className='text-center md:w-1/2 md:text-left'>
            <div className='mb-6 inline-flex items-center rounded-full border border-blue-800/50 bg-blue-900/30 px-3 py-1 text-sm text-blue-300'>
              <span className='mr-2 h-2 w-2 animate-pulse rounded-full bg-blue-400'></span>
              Hospital Management System
            </div>

            <h1 className='mb-6 text-5xl font-extrabold md:text-6xl lg:text-7xl'>
              <span className='bg-gradient-to-br from-gray-200 to-gray-600 bg-clip-text text-transparent'>
                Streamline Your Hospital Administration
              </span>
            </h1>

            <p className='mb-8 max-w-xl text-xl text-gray-300'>
              Comprehensive hospital management solution designed to optimize
              patient care, streamline workflows, and enhance operational
              efficiency.
            </p>

            <div className='flex flex-col justify-center gap-4 sm:flex-row md:justify-start'>
              <Button className='group flex transform items-center gap-2 rounded-xl bg-black px-8 py-6 text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-800 focus:outline-none'>
                <Link href='/dashboard' className='flex items-center'>
                  Access Dashboard
                  <ArrowRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                </Link>
              </Button>
            </div>
          </div>

          <div className='flex justify-center md:w-1/2'>
            <div className='relative h-80 w-80'>
              <div className='animate-pulse-slow absolute inset-0 rounded-full bg-blue-500/20 backdrop-blur-xl'></div>
              <div className='absolute inset-4 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-black'>
                <div className='text-center'>
                  <h3 className='mb-4 text-xl font-bold text-gray-200'>
                    Hospital Stats
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold text-white'>
                        {stats.patients.toLocaleString()}
                      </span>
                      <span className='text-xs text-gray-400'>Patients</span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold text-white'>
                        {stats.doctors.toLocaleString()}
                      </span>
                      <span className='text-xs text-gray-400'>Doctors</span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold text-white'>
                        {stats.staff.toLocaleString()}
                      </span>
                      <span className='text-xs text-gray-400'>Staff</span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold text-white'>
                        {stats.beds.toLocaleString()}
                      </span>
                      <span className='text-xs text-gray-400'>Beds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 gap-6 border-t border-b border-blue-900/30 py-12 md:grid-cols-3'>
          <div className='text-center'>
            <div className='mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent'>
              98.7%
            </div>
            <p className='text-gray-400'>Patient Satisfaction</p>
          </div>
          <div className='text-center'>
            <div className='mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent'>
              45%
            </div>
            <p className='text-gray-400'>Reduced Admin Time</p>
          </div>
          <div className='text-center'>
            <div className='mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent'>
              24/7
            </div>
            <p className='text-gray-400'>Technical Support</p>
          </div>
        </div>

        {/* Features */}
        <div id='features' className='py-12'>
          <h2 className='mb-12 text-center text-3xl font-bold text-white'>
            Key Features
          </h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {[
              {
                title: 'Patient Management',
                description:
                  'Comprehensive patient records, appointment scheduling, and treatment tracking.',
                icon: Users
              },
              {
                title: 'Medical Records',
                description:
                  'Secure electronic health records with easy search and retrieval functionality.',
                icon: FileText
              },
              {
                title: 'Staff Scheduling',
                description:
                  'Optimize staff allocation with intelligent scheduling and shift management.',
                icon: Calendar
              },
              {
                title: 'Inventory Control',
                description:
                  'Track medical supplies, equipment, and pharmaceuticals with automated alerts.',
                icon: ClipboardList
              },
              {
                title: 'Analytics Dashboard',
                description:
                  'Real-time insights into hospital performance, patient flow, and resource utilization.',
                icon: LineChart
              },
              {
                title: 'Secure Compliance',
                description:
                  'HIPAA-compliant data protection with advanced encryption and access controls.',
                icon: Shield
              }
            ].map((feature, index) => (
              <div
                key={index}
                className='rounded-xl border border-blue-800/20 bg-blue-900/10 p-6 backdrop-blur-sm transition-colors hover:bg-blue-900/20'
              >
                <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                  <feature.icon className='h-6 w-6 text-white' />
                </div>
                <h3 className='mb-2 text-xl font-bold text-white'>
                  {feature.title}
                </h3>
                <p className='text-gray-400'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div id='testimonials' className='py-12'>
          <h2 className='mb-12 text-center text-3xl font-bold text-white'>
            What Healthcare Professionals Say
          </h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            {[
              {
                quote:
                  'This system has revolutionized our hospital operations. Patient wait times are down and staff efficiency is up significantly.',
                author: 'Dr. Sarah Johnson',
                role: 'Chief Medical Officer'
              },
              {
                quote:
                  'The analytics dashboard gives me instant visibility into hospital performance metrics that used to take days to compile.',
                author: 'Michael Chen',
                role: 'Hospital Administrator'
              },
              {
                quote:
                  'Patient records are now seamlessly accessible across departments, improving coordination of care and patient outcomes.',
                author: 'Dr. Emily Rodriguez',
                role: 'Head of Emergency Medicine'
              },
              {
                quote:
                  'The scheduling system has reduced staff overtime by 35% while maintaining optimal coverage across all departments.',
                author: 'Robert Williams',
                role: 'HR Director'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className='rounded-xl border border-blue-800/20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 backdrop-blur-sm'
              >
                <p className='mb-6 text-gray-300 italic'>
                  "{testimonial.quote}"
                </p>
                <div className='flex items-center'>
                  <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500'>
                    <Stethoscope className='h-5 w-5 text-white' />
                  </div>
                  <div>
                    <p className='font-medium text-white'>
                      {testimonial.author}
                    </p>
                    <p className='text-sm text-gray-400'>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div id='dashboard' className='py-12'>
          <h2 className='mb-12 text-center text-3xl font-bold text-white'>
            Powerful Admin Dashboard
          </h2>
          <div className='rounded-xl border border-blue-800/30 bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 backdrop-blur-sm md:p-8'>
            <div className='flex aspect-video items-center justify-center rounded-lg border border-blue-800/30 bg-black/50'>
              <div className='text-center'>
                <HeartPulse className='mx-auto mb-4 h-16 w-16 text-blue-500' />
                <p className='text-lg text-gray-300'>
                  Interactive Dashboard Preview
                </p>
                <Button className='mt-4 bg-blue-600 hover:bg-blue-700'>
                  <Link href='/dashboard'>View Live Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className='py-12 text-center'>
          <h2 className='mb-6 text-3xl font-bold text-white'>
            Ready to Transform Your Hospital Management?
          </h2>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-gray-300'>
            Join hundreds of healthcare facilities already using Healthcare
            Admin to improve patient care and operational efficiency.
          </p>
          <Button className='transform rounded-xl bg-black px-8 py-6 text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-800 focus:outline-none'>
            <Link href='/dashboard'>Access Dashboard</Link>
          </Button>
        </div>

        {/* Footer */}
        <footer className='mt-12 border-t border-blue-900/30 pt-12 text-sm text-gray-400'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
            <div>
              <h4 className='mb-4 font-bold text-white'>Healthcare Admin</h4>
              <p>
                Comprehensive hospital management solution for modern healthcare
                facilities.
              </p>
            </div>
            <div>
              <h4 className='mb-4 font-bold text-white'>Features</h4>
              <ul className='space-y-2'>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Patient Management
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Medical Records
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Staff Scheduling
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Analytics
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='mb-4 font-bold text-white'>Resources</h4>
              <ul className='space-y-2'>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Documentation
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    API Reference
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Training Videos
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='mb-4 font-bold text-white'>Contact</h4>
              <ul className='space-y-2'>
                <li>support@healthcareadmin.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Medical Center Drive</li>
                <li>Healthcare City, HC 12345</li>
              </ul>
            </div>
          </div>
          <div className='mt-8 flex flex-col items-center justify-between border-t border-blue-900/30 pt-8 md:flex-row'>
            <p>© 2023 Healthcare Admin. All rights reserved.</p>
            <div className='mt-4 flex space-x-4 md:mt-0'>
              <a href='#' className='transition-colors hover:text-white'>
                Privacy Policy
              </a>
              <a href='#' className='transition-colors hover:text-white'>
                Terms of Service
              </a>
              <a href='#' className='transition-colors hover:text-white'>
                HIPAA Compliance
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
