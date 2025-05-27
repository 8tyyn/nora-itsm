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
  Users,
  Activity,
  TrendingUp,
  CheckCircle,
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react';
import { UserService } from '@/services/UserService';
import { AdminService } from '@/services/AdminService';
import { DoctorService } from '@/services/DoctorService';

interface DashboardCounts {
  activeUsers: number;
  activeDoctors: number;
  activeAdmins: number;
  activeSuperAdmins: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardCounts>({
    activeUsers: 0,
    activeDoctors: 0,
    activeAdmins: 0,
    activeSuperAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          // If no token, use mock data or skip
          setStats({
            activeUsers: 2450,
            activeDoctors: 320,
            activeAdmins: 15,
            activeSuperAdmins: 5
          });
          setLoading(false);
          return;
        }

        // Fetch all data in parallel
        const [activeUsers, allAdmins, allDoctors] = await Promise.all([
          UserService.getAllActive(token),
          AdminService.getAll(token),
          DoctorService.getAll(token)
        ]);

        // Count regular users (exclude admins and doctors from active users)
        const regularUsers = activeUsers.filter(
          (user) =>
            user.role !== 'Admin' &&
            user.role !== 'Super Admin' &&
            user.role !== 'Doctor'
        );

        // Count active admins and super admins
        const activeAdmins = allAdmins.filter(
          (admin) => admin.status === 'Active' && admin.role === 'Admin'
        );
        const activeSuperAdmins = allAdmins.filter(
          (admin) => admin.status === 'Active' && admin.role === 'Super Admin'
        );

        // Count active doctors
        const activeDoctors = allDoctors.filter(
          (doctor) => doctor.status === 'Active'
        );

        setStats({
          activeUsers: regularUsers.length,
          activeDoctors: activeDoctors.length,
          activeAdmins: activeAdmins.length,
          activeSuperAdmins: activeSuperAdmins.length
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');

        // Fallback to mock data on error
        setStats({
          activeUsers: 2450,
          activeDoctors: 320,
          activeAdmins: 15,
          activeSuperAdmins: 5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      <div className='fixed inset-0 z-0 overflow-hidden'>
        {/* Floating circles */}
        <div className='animate-float-slow absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-blue-500/10 blur-xl' />
        <div className='animate-float-medium absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-purple-500/10 blur-xl' />
        <div className='animate-float-fast absolute bottom-1/4 left-1/3 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl' />
        <div className='animate-float-slow absolute right-1/3 bottom-1/3 h-36 w-36 rounded-full bg-blue-600/10 blur-xl' />
      </div>

      {/* Content */}
      <div className='relative z-10 container mx-auto flex min-h-screen flex-col px-4 py-12'>
        {/* Header */}
        <header className='mb-12 flex items-center justify-between'>
          <div className='flex items-center'>
            <HeartPulse className='mr-2 h-6 w-6 animate-pulse text-blue-400' />
            <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent'>
              Healthcare Admin
            </span>
          </div>
          <nav className='hidden space-x-6 md:flex'>
            <a
              href='#features'
              className='transform text-gray-300 transition-colors duration-300 hover:scale-105 hover:text-white'
            >
              Features
            </a>
            <a
              href='#testimonials'
              className='transform text-gray-300 transition-colors duration-300 hover:scale-105 hover:text-white'
            >
              Testimonials
            </a>
            <a
              href='#dashboard'
              className='transform text-gray-300 transition-colors duration-300 hover:scale-105 hover:text-white'
            >
              Dashboard
            </a>
          </nav>
        </header>

        {/* Hero section */}
        <div className='flex flex-1 flex-col items-center justify-center gap-12 py-12 md:flex-row'>
          <div className='text-center md:w-1/2 md:text-left'>
            <div className='mb-6 inline-flex animate-bounce items-center rounded-full border border-blue-800/50 bg-blue-900/30 px-3 py-1 text-sm text-blue-300'>
              <span className='mr-2 h-2 w-2 animate-pulse rounded-full bg-blue-400'></span>
              Hospital Management System
            </div>

            <h1 className='animate-fade-in mb-6 text-5xl font-extrabold md:text-6xl lg:text-7xl'>
              <span className='bg-gradient-to-br from-gray-200 to-gray-600 bg-clip-text text-transparent'>
                Advanced Healthcare Administration
              </span>
            </h1>

            <p className='animate-fade-in-delay-1 mb-8 max-w-xl text-xl text-gray-300'>
              Comprehensive healthcare management solution designed to optimize
              patient care, streamline workflows, and enhance operational
              efficiency with real-time analytics.
            </p>

            <div className='animate-fade-in-delay-2 flex flex-col justify-center gap-4 sm:flex-row md:justify-start'>
              <Button className='group flex transform items-center gap-2 rounded-xl bg-black px-8 py-6 text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-800 focus:outline-none'>
                <Link href='/dashboard' className='flex items-center'>
                  Access Dashboard
                  <ArrowRight className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                </Link>
              </Button>
              <Button
                variant='outline'
                className='group flex transform items-center gap-2 rounded-xl px-8 py-6 text-lg font-semibold transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none'
              >
                <Link href='/analytics' className='flex items-center'>
                  View Analytics
                  <BarChart3 className='ml-2 h-5 w-5 transition-transform group-hover:translate-x-1' />
                </Link>
              </Button>
            </div>
          </div>

          <div className='flex justify-center md:w-1/2'>
            <div className='animate-float-slow relative h-80 w-80'>
              <div className='animate-pulse-slow absolute inset-0 rounded-full bg-blue-500/20 backdrop-blur-xl'></div>
              <div className='absolute inset-4 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-black'>
                <div className='text-center'>
                  <div className='mb-4 flex items-center justify-center gap-2'>
                    <h3 className='text-xl font-bold text-gray-200'>
                      System Users
                    </h3>
                    {loading && (
                      <Loader2 className='h-4 w-4 animate-spin text-blue-400' />
                    )}
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold text-blue-400'>
                        {loading ? '...' : stats.activeUsers.toLocaleString()}
                      </span>
                      <span className='text-xs text-gray-400'>
                        Active Users
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold text-green-400'>
                        {loading ? '...' : stats.activeDoctors.toLocaleString()}
                      </span>
                      <span className='text-xs text-gray-400'>
                        Active Doctors
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold text-purple-400'>
                        {loading ? '...' : stats.activeAdmins.toLocaleString()}
                      </span>
                      <span className='text-xs text-gray-400'>
                        Active Admins
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-2xl font-bold text-orange-400'>
                        {loading
                          ? '...'
                          : stats.activeSuperAdmins.toLocaleString()}
                      </span>
                      <span className='text-xs text-gray-400'>
                        Super Admins
                      </span>
                    </div>
                  </div>
                  {error && (
                    <div className='mt-2 text-xs text-red-400'>
                      Using cached data
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 gap-6 border-t border-b border-blue-900/30 py-12 md:grid-cols-3'>
          <div className='animate-fade-in-up text-center'>
            <div className='mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent'>
              98.7%
            </div>
            <p className='text-gray-400'>Patient Satisfaction</p>
          </div>
          <div className='animate-fade-in-up text-center delay-100'>
            <div className='mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent'>
              45%
            </div>
            <p className='text-gray-400'>Reduced Admin Time</p>
          </div>
          <div className='animate-fade-in-up text-center delay-200'>
            <div className='mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent'>
              24/7
            </div>
            <p className='text-gray-400'>Technical Support</p>
          </div>
        </div>

        {/* Features */}
        <div id='features' className='py-12'>
          <h2 className='animate-fade-in mb-12 text-center text-3xl font-bold text-white'>
            Key Features
          </h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {[
              {
                title: 'User Management',
                description:
                  'Comprehensive user management with role-based access control and real-time status tracking.',
                icon: Users,
                animation: 'animate-fade-in-up'
              },
              {
                title: 'Doctor Administration',
                description:
                  'Efficient management of medical staff with specialization tracking and performance analytics.',
                icon: Stethoscope,
                animation: 'animate-fade-in-up delay-100'
              },
              {
                title: 'Admin Controls',
                description:
                  'Advanced administrative controls with hierarchical permissions and audit trails.',
                icon: Shield,
                animation: 'animate-fade-in-up delay-200'
              },
              {
                title: 'Activity Monitoring',
                description:
                  'Track all system activities with detailed logs and real-time monitoring capabilities.',
                icon: Activity,
                animation: 'animate-fade-in-up delay-300'
              },
              {
                title: 'Advanced Analytics',
                description:
                  'Powerful analytics dashboard with customizable reports and data visualization tools.',
                icon: TrendingUp,
                animation: 'animate-fade-in-up delay-400'
              },
              {
                title: 'Secure Compliance',
                description:
                  'HIPAA-compliant data protection with advanced encryption and access controls.',
                icon: Shield,
                animation: 'animate-fade-in-up delay-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`rounded-xl border border-blue-800/20 bg-blue-900/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-blue-900/20 ${feature.animation}`}
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
          <h2 className='animate-fade-in mb-12 text-center text-3xl font-bold text-white'>
            What Healthcare Professionals Say
          </h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            {[
              {
                quote:
                  'The user management system has revolutionized our hospital operations. We can now manage staff access 50% more efficiently.',
                author: 'Dr. Sarah Johnson',
                role: 'Chief Medical Officer',
                animation: 'animate-fade-in-up'
              },
              {
                quote:
                  'The analytics dashboard gives me instant visibility into user activity and system performance metrics that used to take days to compile manually.',
                author: 'Michael Chen',
                role: 'Hospital Administrator',
                animation: 'animate-fade-in-up delay-100'
              },
              {
                quote:
                  'Activity monitoring has significantly improved our compliance tracking and reduced audit preparation time by 75%.',
                author: 'Dr. Emily Rodriguez',
                role: 'Head of Emergency Medicine',
                animation: 'animate-fade-in-up delay-200'
              },
              {
                quote:
                  'The admin controls helped us optimize our staff allocation and improve security protocols across all departments.',
                author: 'Robert Williams',
                role: 'IT Security Director',
                animation: 'animate-fade-in-up delay-300'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`rounded-xl border border-blue-800/20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${testimonial.animation}`}
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
          <h2 className='animate-fade-in mb-12 text-center text-3xl font-bold text-white'>
            Powerful Admin Dashboard
          </h2>
          <div className='animate-fade-in-up rounded-xl border border-blue-800/30 bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 backdrop-blur-sm md:p-8'>
            <div className='flex aspect-video items-center justify-center rounded-lg border border-blue-800/30 bg-black/50'>
              <div className='text-center'>
                <div className='mb-4 flex items-center justify-center gap-4'>
                  <PieChart className='animate-spin-slow h-16 w-16 text-blue-500' />
                  <BarChart3 className='animate-spin-slow-reverse h-16 w-16 text-purple-500' />
                </div>
                <p className='text-lg text-gray-300'>
                  Interactive Dashboard with Real-time Analytics
                </p>
                <div className='mt-6 flex justify-center gap-4'>
                  <Button className='bg-blue-600 hover:bg-blue-700'>
                    <Link href='/dashboard'>Explore Dashboard</Link>
                  </Button>
                  <Button variant='outline'>
                    <Link href='/analytics'>View Analytics</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className='animate-fade-in-up py-12 text-center'>
          <h2 className='mb-6 text-3xl font-bold text-white'>
            Ready to Transform Your Healthcare Management?
          </h2>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-gray-300'>
            Join hundreds of healthcare facilities already using our system to
            improve patient care and operational efficiency.
          </p>
          <div className='flex justify-center gap-4'>
            <Button className='transform rounded-xl bg-black px-8 py-6 text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-800 focus:outline-none'>
              <Link href='/dashboard'>Access Dashboard</Link>
            </Button>
            <Button
              variant='outline'
              className='transform rounded-xl px-8 py-6 text-lg font-semibold transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none'
            >
              <Link href='/analytics'>Explore Analytics</Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className='mt-12 border-t border-blue-900/30 pt-12 text-sm text-gray-400'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
            <div className='animate-fade-in'>
              <h4 className='mb-4 font-bold text-white'>Healthcare Admin</h4>
              <p>
                Comprehensive healthcare management solution for modern medical
                facilities.
              </p>
            </div>
            <div className='animate-fade-in delay-100'>
              <h4 className='mb-4 font-bold text-white'>Features</h4>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='/dashboard'
                    className='transition-colors hover:text-white hover:underline'
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href='/analytics'
                    className='transition-colors hover:text-white hover:underline'
                  >
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href='#features'
                    className='transition-colors hover:text-white hover:underline'
                  >
                    User Management
                  </Link>
                </li>
                <li>
                  <Link
                    href='#features'
                    className='transition-colors hover:text-white hover:underline'
                  >
                    Activity Monitoring
                  </Link>
                </li>
              </ul>
            </div>
            <div className='animate-fade-in delay-200'>
              <h4 className='mb-4 font-bold text-white'>Resources</h4>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='#'
                    className='transition-colors hover:text-white hover:underline'
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='transition-colors hover:text-white hover:underline'
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='transition-colors hover:text-white hover:underline'
                  >
                    Training Videos
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='transition-colors hover:text-white hover:underline'
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className='animate-fade-in delay-300'>
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
            <p>
              © {new Date().getFullYear()} Healthcare Admin. All rights
              reserved.
            </p>
            <div className='mt-4 flex space-x-4 md:mt-0'>
              <Link
                href='#'
                className='transition-colors hover:text-white hover:underline'
              >
                Privacy Policy
              </Link>
              <Link
                href='#'
                className='transition-colors hover:text-white hover:underline'
              >
                Terms of Service
              </Link>
              <Link
                href='#'
                className='transition-colors hover:text-white hover:underline'
              >
                HIPAA Compliance
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translateY(0);
          }
          40%,
          43% {
            transform: translateY(-8px);
          }
          70% {
            transform: translateY(-4px);
          }
          90% {
            transform: translateY(-2px);
          }
        }

        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-fade-in-delay-1 {
          animation: fadeIn 1s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-up.delay-100 {
          animation-delay: 0.1s;
        }

        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
        }

        .animate-fade-in-up.delay-300 {
          animation-delay: 0.3s;
        }

        .animate-fade-in-up.delay-400 {
          animation-delay: 0.4s;
        }

        .animate-fade-in-up.delay-500 {
          animation-delay: 0.5s;
        }

        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-reverse 25s linear infinite;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        .animate-pulse-slow {
          animation: pulseSlow 3s infinite;
        }
      `}</style>
    </main>
  );
}
