'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Stethoscope,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Edit,
  X,
  Plus,
  Eye,
  Loader2
} from 'lucide-react';
import { UserService } from '@/services/UserService';
import { AdminService } from '@/services/AdminService';
import { DoctorService } from '@/services/DoctorService';
import { ActivityService } from '@/services/ActivityService';
import { UserModel } from '@/models/UserModel';
import { PopulatedActivityModel } from '@/models/ActivityModel';
import Link from 'next/link';

interface DashboardCounts {
  activeUsers: number;
  activeDoctors: number;
  activeAdmins: number;
  activeSuperAdmins: number;
  pendingUsers: number;
  blockedUsers: number;
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({
    activeUsers: 0,
    activeDoctors: 0,
    activeAdmins: 0,
    activeSuperAdmins: 0,
    pendingUsers: 0,
    blockedUsers: 0
  });
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [recentActivities, setRecentActivities] = useState<
    PopulatedActivityModel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // First, get current user profile
        const userProfile = await UserService.getUserProfile(token);
        setCurrentUser(userProfile);

        // Fetch all data in parallel
        const [activeUsers, pendingUsers, blockedUsers, allAdmins, allDoctors] =
          await Promise.all([
            UserService.getAllActive(token),
            UserService.getAllPending(token),
            UserService.getAllBlocked(token),
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

        setCounts({
          activeUsers: regularUsers.length,
          activeDoctors: activeDoctors.length,
          activeAdmins: activeAdmins.length,
          activeSuperAdmins: activeSuperAdmins.length,
          pendingUsers: pendingUsers.length,
          blockedUsers: blockedUsers.length
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // Get current user's recent activities (limit to 8)
        const activities = await ActivityService.getRecentActivity(token);
        setRecentActivities(activities.slice(0, 8));
      } catch (err) {
        console.error('Error fetching recent activities:', err);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchDashboardData();
    fetchRecentActivities();
  }, []);

  const LoadingCard = ({
    title,
    icon: Icon,
    color
  }: {
    title: string;
    icon: any;
    color: string;
  }) => (
    <Card
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border-${color}-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center'>
          <Loader2 className={`h-6 w-6 text-${color}-600 animate-spin`} />
        </div>
        <p className={`text-${color}-700 mt-2 text-xs`}>Loading...</p>
      </CardContent>
    </Card>
  );

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return Users;
      case 'create':
      case 'add':
        return Plus;
      case 'update':
      case 'edit':
      case 'modify':
        return Edit;
      case 'delete':
      case 'remove':
        return X;
      case 'view':
      case 'access':
        return Eye;
      case 'schedule':
        return Calendar;
      default:
        return Activity;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'green';
      case 'logout':
        return 'gray';
      case 'create':
      case 'add':
        return 'blue';
      case 'update':
      case 'edit':
      case 'modify':
        return 'purple';
      case 'delete':
      case 'remove':
        return 'red';
      case 'view':
      case 'access':
        return 'indigo';
      case 'schedule':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Check if user can see admin-only cards
  const canSeeAdminCards =
    currentUser &&
    (currentUser.role === 'Admin' || currentUser.role === 'Super Admin');

  return (
    <div className='flex flex-col gap-4'>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from {
            transform: scale(0.8);
          }
          to {
            transform: scale(1);
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
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-delay-1 {
          animation: fadeIn 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-3 {
          animation: fadeIn 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-slide-in-left {
          animation: slideInLeft 1s ease-out;
        }

        .animate-slide-in-right {
          animation: slideInRight 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-count-up {
          animation: countUp 0.8s ease-out;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        .animate-ping {
          animation: ping 2s infinite;
        }

        .animate-pulse-slow {
          animation: pulseSlow 3s infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Healthcare Dashboard
          </h1>
          {currentUser && (
            <p className='text-muted-foreground mt-1 text-sm'>
              Welcome back, {currentUser.fullName} ({currentUser.role})
            </p>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button className='animate-pulse bg-blue-600 hover:bg-blue-700'>
            <Eye className='mr-2 h-4 w-4' />
            <Link href='/analytics'>View Full Analytics</Link>
          </Button>
        </div>
      </div>

      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 text-red-800'>
              <AlertCircle className='h-4 w-4' />
              <span className='text-sm font-medium'>
                Error loading dashboard data: {error}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='bg-blue-100'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='programmations'>Programmations</TabsTrigger>
          <TabsTrigger value='analytics-preview'>Analytics Preview</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {/* Key Metrics Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {loading ? (
              <>
                <LoadingCard title='Active Users' icon={Users} color='blue' />
                <LoadingCard
                  title='Active Doctors'
                  icon={Stethoscope}
                  color='green'
                />
                <LoadingCard
                  title='Active Admins'
                  icon={Users}
                  color='purple'
                />
                <LoadingCard
                  title='Active Super Admins'
                  icon={Activity}
                  color='orange'
                />
              </>
            ) : (
              <>
                <Card className='animate-fade-in border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='animate-pulse text-sm font-medium'>
                      Active Users
                    </CardTitle>
                    <Users className='h-4 w-4 animate-bounce text-blue-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='animate-count-up text-2xl font-bold text-blue-900'>
                      {counts.activeUsers.toLocaleString()}
                    </div>
                    <p className='text-xs text-blue-700'>
                      Regular system users
                    </p>
                  </CardContent>
                </Card>

                <Card className='animate-fade-in-delay-1 border-green-200 bg-gradient-to-br from-green-50 to-green-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='animate-pulse text-sm font-medium'>
                      Active Doctors
                    </CardTitle>
                    <Stethoscope className='h-4 w-4 animate-bounce text-green-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='animate-count-up text-2xl font-bold text-green-900'>
                      {counts.activeDoctors.toLocaleString()}
                    </div>
                    <p className='text-xs text-green-700'>
                      Providing medical care
                    </p>
                  </CardContent>
                </Card>

                <Card className='animate-fade-in-delay-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='animate-pulse text-sm font-medium'>
                      Active Admins
                    </CardTitle>
                    <Users className='h-4 w-4 animate-bounce text-purple-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='animate-count-up text-2xl font-bold text-purple-900'>
                      {counts.activeAdmins.toLocaleString()}
                    </div>
                    <p className='text-xs text-purple-700'>
                      Managing operations
                    </p>
                  </CardContent>
                </Card>

                <Card className='animate-fade-in-delay-3 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='animate-pulse text-sm font-medium'>
                      Active Super Admins
                    </CardTitle>
                    <Activity className='h-4 w-4 animate-bounce text-orange-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='animate-count-up text-2xl font-bold text-orange-900'>
                      {counts.activeSuperAdmins.toLocaleString()}
                    </div>
                    <p className='text-xs text-orange-700'>
                      System administrators
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Admin-only Additional Stats Row */}
          {!loading &&
            canSeeAdminCards &&
            (counts.pendingUsers > 0 || counts.blockedUsers > 0) && (
              <div className='grid gap-4 md:grid-cols-2'>
                {counts.pendingUsers > 0 && (
                  <Card className='border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 transition-all duration-300 hover:shadow-lg'>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='animate-pulse text-sm font-medium'>
                        Pending Users
                      </CardTitle>
                      <Clock className='h-4 w-4 animate-bounce text-yellow-600' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold text-yellow-900'>
                        {counts.pendingUsers.toLocaleString()}
                      </div>
                      <p className='text-xs text-yellow-700'>
                        Awaiting approval
                      </p>
                    </CardContent>
                  </Card>
                )}

                {counts.blockedUsers > 0 && (
                  <Card className='border-red-200 bg-gradient-to-br from-red-50 to-red-100 transition-all duration-300 hover:shadow-lg'>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='animate-pulse text-sm font-medium'>
                        Blocked Users
                      </CardTitle>
                      <X className='h-4 w-4 animate-bounce text-red-600' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold text-red-900'>
                        {counts.blockedUsers.toLocaleString()}
                      </div>
                      <p className='text-xs text-red-700'>Access restricted</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

          {/* Main Dashboard Content */}
          <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-7'>
            <Card className='animate-slide-in-left col-span-4 transition-all duration-300 hover:shadow-lg md:col-span-5'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5 animate-bounce text-blue-600' />
                  Healthcare Analytics Overview
                </CardTitle>
                <CardDescription>
                  Real-time programmation and patient metrics
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[550px] w-[1500px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiNmFmNjhhNGQtMmMxNi00MDczLWJiZWUtNGYwZTkxOTc5Y2NjIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Healthcare Analytics Overview'
                />
              </CardContent>
            </Card>

            <Card className='animate-slide-in-right col-span-3 transition-all duration-300 hover:shadow-lg md:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5 animate-bounce text-blue-600' />
                  Your Recent Activities
                </CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className='flex h-[300px] items-center justify-center'>
                    <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className='max-h-[550px] space-y-4 overflow-y-auto'>
                    {recentActivities.map((activity, index) => {
                      const IconComponent = getActivityIcon(activity.action);
                      const color = getActivityColor(activity.action);

                      return (
                        <div
                          key={activity._id}
                          className={`animate-fade-in-up flex items-center gap-4 opacity-0 animation-delay-${(index + 1) * 100}`}
                        >
                          <div
                            className={`rounded-full bg-${color}-100 animate-pulse p-2`}
                          >
                            <IconComponent
                              className={`h-4 w-4 text-${color}-600`}
                            />
                          </div>
                          <div className='flex-1 space-y-1'>
                            <p className='text-sm leading-none font-medium'>
                              {activity.action}
                            </p>
                            {activity.details && (
                              <p className='text-muted-foreground text-xs'>
                                {activity.details}
                              </p>
                            )}
                            <p className='text-muted-foreground text-xs'>
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='flex h-[300px] items-center justify-center text-center'>
                    <div>
                      <Activity className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                      <p className='font-medium text-gray-500'>
                        No recent activities
                      </p>
                      <p className='mt-1 text-sm text-gray-400'>
                        Your activities will appear here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='programmations' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Programmation Status Distribution</CardTitle>
                <CardDescription>
                  Current status of all programmations
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[500px] w-[1400px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiZDk0NDUxYzAtMmJlNi00MDQ1LTlhODMtM2ZhOTQ2M2ExYTY0IiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Programmation Status Distribution'
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accommodation Overview</CardTitle>
                <CardDescription>
                  Programmations by accommodation type
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[500px] w-[1400px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiY2M2YmRhYjYtMzgxMC00ZTg0LWE5OWItZWUzNmM4MGUxYzRjIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Accommodation Overview'
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Programmation Trends</CardTitle>
              <CardDescription>
                Created, modified, and cancelled programmations over time
              </CardDescription>
            </CardHeader>
            <CardContent className='h-[700px] p-0'>
              <iframe
                src='https://app.powerbi.com/view?r=eyJrIjoiOTI1OTIwYzUtNWYzNC00MjY3LWFhY2MtOGFlYjk1OGVmNDg1IiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                className='h-full w-full rounded-b-lg'
                frameBorder='0'
                allowFullScreen={true}
                title='Weekly Programmation Trends'
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics-preview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Patient Analytics</CardTitle>
                  <CardDescription>
                    Patient count by action type
                  </CardDescription>
                </div>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                  <TrendingUp className='mr-2 h-4 w-4' />
                  <Link href='/analytics'>Go to Analytics for better view</Link>
                </Button>
              </CardHeader>
              <CardContent className='h-[300px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiMTBlMDk2N2YtYmUyZi00MzQ0LThlYzUtNmQxNWMwMTBiYjQwIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Analytics'
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Doctor Specialties</CardTitle>
                  <CardDescription>Distribution by specialty</CardDescription>
                </div>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                  <TrendingUp className='mr-2 h-4 w-4' />
                  <Link href='/analytics'>Go to Analytics for better view</Link>
                </Button>
              </CardHeader>
              <CardContent className='h-[300px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiMzI0YzNiOTctNzUzZS00NjY5LTk1OTctMWYwOTU4NWVlNDgxIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Doctor Specialties'
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>Full Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive analytics and reporting tools
                </CardDescription>
              </div>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                <TrendingUp className='mr-2 h-4 w-4' />
                <Link href='/analytics'>View Full Analytics</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className='flex h-[200px] items-center justify-center rounded-md border-2 border-dashed border-blue-300 bg-blue-50'>
                <div className='text-center'>
                  <BarChart3 className='mx-auto mb-4 h-12 w-12 text-blue-400' />
                  <p className='font-medium text-blue-600'>
                    Access the full analytics dashboard for detailed insights
                  </p>
                  <p className='mt-2 text-sm text-blue-500'>
                    View programmations, patient data, and doctor performance
                    metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
