'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Camera,
  Shield,
  ShieldCheck,
  Clock,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { UserService } from '@/services/UserService';
import { ActivityService } from '@/services/ActivityService';
import { UserModel } from '@/models/UserModel';
import type {
  PopulatedActivityModel,
  ActivityLogResponse
} from '@/models/ActivityModel';

export default function ProfilePage() {
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Activity log states
  const [userActivityLogs, setUserActivityLogs] = useState<
    PopulatedActivityModel[]
  >([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [totalActivityPages, setTotalActivityPages] = useState(1);
  const [totalActivityLogs, setTotalActivityLogs] = useState(0);
  const activityLogsPerPage = 10;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const userProfile = await UserService.getUserProfile(token);
        setUser(userProfile);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch user activity logs
  const fetchUserActivityLogs = async () => {
    try {
      setActivityLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !user?._id) return;

      const response: ActivityLogResponse =
        await ActivityService.getUserActivityLogs(user._id, token, {
          page: activityPage,
          pageSize: activityLogsPerPage
        });

      setUserActivityLogs(response.activityLogs);
      setTotalActivityPages(response.pages);
      setTotalActivityLogs(response.total);
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setActivityLoading(false);
    }
  };

  // Fetch activity logs when user is loaded or page changes
  useEffect(() => {
    if (user?._id) {
      fetchUserActivityLogs();
    }
  }, [user?._id, activityPage]);

  // Navigate to settings page instead of enabling editing
  const handleEditProfile = () => {
    window.location.href = '/settings';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-red-600'>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => (window.location.href = '/login')}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold tracking-tight'>My Profile</h1>

      <div className='grid gap-4 md:grid-cols-7'>
        <Card className='md:col-span-2'>
          <CardHeader>
            <div className='flex flex-col items-center gap-2'>
              <div className='relative'>
                <Avatar className='h-24 w-24'>
                  <AvatarImage
                    src={user.avatar || '/placeholder.svg'}
                    alt={user.fullName}
                  />
                  <AvatarFallback className='bg-blue-100 text-2xl text-blue-700'>
                    {user.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size='icon'
                  className='absolute right-0 bottom-0 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700'
                  title='Change profile picture'
                  onClick={() => (window.location.href = '/settings#avatar')}
                >
                  <Camera className='h-4 w-4' />
                  <span className='sr-only'>Change profile picture</span>
                </Button>
              </div>
              <div className='flex flex-col items-center'>
                <h2 className='text-xl font-bold'>{user.fullName}</h2>
                <div className='mt-1 flex items-center gap-2'>
                  {user.role === 'Super Admin' ? (
                    <>
                      <ShieldCheck className='h-4 w-4 text-red-600' />
                      <Badge className='bg-red-600'>Super Admin</Badge>
                    </>
                  ) : (
                    <>
                      <Shield className='h-4 w-4 text-blue-600' />
                      <Badge className='bg-blue-600'>{user.role}</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-blue-600' />
                <span>{user.email}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4 text-blue-600' />
                <span>{user.phone || 'Not provided'}</span>
              </div>
              <div className='flex items-start gap-2'>
                <MapPin className='mt-0.5 h-4 w-4 text-blue-600' />
                <span>{user.address || 'Not provided'}</span>
              </div>
              {user.dateJoined && (
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-blue-600' />
                  <span>
                    Joined {new Date(user.dateJoined).toLocaleDateString()}
                  </span>
                </div>
              )}
              {user.lastActive && (
                <div className='flex items-center gap-2'>
                  <Activity className='h-4 w-4 text-blue-600' />
                  <span>
                    Last active {new Date(user.lastActive).toLocaleDateString()}
                  </span>
                </div>
              )}
              {user.department && (
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>Department:</span>
                  <span>{user.department}</span>
                </div>
              )}
              {user.position && (
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>Position:</span>
                  <span>{user.position}</span>
                </div>
              )}
              {user.status && (
                <div className='mt-4 border-t border-gray-200 pt-4'>
                  <Badge
                    className={`${user.status === 'Active' ? 'bg-green-600' : user.status === 'Pending' ? 'bg-yellow-600' : 'bg-red-600'}`}
                  >
                    {user.status}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className='md:col-span-5'>
          <Tabs defaultValue='account' className='w-full'>
            <TabsList className='w-full justify-start'>
              <TabsTrigger value='account'>Account Information</TabsTrigger>
              <TabsTrigger value='activity'>Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value='account' className='mt-4 space-y-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      View your personal details
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleEditProfile}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    Edit Profile
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Full Name</p>
                      <p className='text-muted-foreground text-sm'>
                        {user.fullName}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Email</p>
                      <p className='text-muted-foreground text-sm'>
                        {user.email}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Phone</p>
                      <p className='text-muted-foreground text-sm'>
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Address</p>
                      <p className='text-muted-foreground text-sm'>
                        {user.address || 'Not provided'}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Role</p>
                      <p className='text-muted-foreground text-sm'>
                        {user.role}
                      </p>
                    </div>
                    {user.status && (
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Status</p>
                        <p className='text-muted-foreground text-sm'>
                          {user.status}
                        </p>
                      </div>
                    )}
                    {user.department && (
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Department</p>
                        <p className='text-muted-foreground text-sm'>
                          {user.department}
                        </p>
                      </div>
                    )}
                    {user.position && (
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Position</p>
                        <p className='text-muted-foreground text-sm'>
                          {user.position}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='activity' className='mt-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Activity className='h-5 w-5 text-blue-600' />
                    My Activity Log
                  </CardTitle>
                  <CardDescription>
                    Your recent activities and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Activity Statistics */}
                  <div className='mb-6 grid gap-4 md:grid-cols-3'>
                    <div className='flex items-center gap-3 rounded-lg bg-blue-50 p-3'>
                      <div className='rounded-full bg-blue-100 p-2'>
                        <Activity className='h-4 w-4 text-blue-600' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-blue-900'>
                          Total Activities
                        </p>
                        <p className='text-lg font-bold text-blue-700'>
                          {totalActivityLogs}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 rounded-lg bg-green-50 p-3'>
                      <div className='rounded-full bg-green-100 p-2'>
                        <Clock className='h-4 w-4 text-green-600' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-green-900'>
                          Last Activity
                        </p>
                        <p className='text-sm font-bold text-green-700'>
                          {userActivityLogs.length > 0
                            ? formatTimestamp(userActivityLogs[0].timestamp)
                            : 'No activity'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 rounded-lg bg-purple-50 p-3'>
                      <div className='rounded-full bg-purple-100 p-2'>
                        <User className='h-4 w-4 text-purple-600' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-purple-900'>
                          Account Status
                        </p>
                        <Badge
                          className={
                            user.status === 'Active'
                              ? 'bg-green-600'
                              : user.status === 'Blocked'
                                ? 'bg-red-600'
                                : 'bg-yellow-600'
                          }
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Activity Logs Table */}
                  {activityLoading ? (
                    <div className='py-8 text-center text-blue-600'>
                      Loading activity logs...
                    </div>
                  ) : userActivityLogs.length === 0 ? (
                    <div className='text-muted-foreground py-8 text-center'>
                      <Activity className='mx-auto mb-4 h-12 w-12 text-gray-300' />
                      <p className='text-lg font-medium'>
                        No activity logs found
                      </p>
                      <p className='text-sm'>
                        You haven't performed any recorded activities yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Timestamp</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userActivityLogs.map((log) => (
                            <TableRow key={log._id}>
                              <TableCell>
                                <Badge
                                  variant='outline'
                                  className='border-blue-300 text-blue-700'
                                >
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className='text-muted-foreground text-sm'>
                                  {log.details || '—'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className='text-sm'>
                                  {formatTimestamp(log.timestamp)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination for Activity Logs */}
                      {totalActivityPages > 1 && (
                        <div className='mt-4 flex items-center justify-between'>
                          <p className='text-muted-foreground text-sm'>
                            Showing{' '}
                            {(activityPage - 1) * activityLogsPerPage + 1} to{' '}
                            {Math.min(
                              activityPage * activityLogsPerPage,
                              totalActivityLogs
                            )}{' '}
                            of {totalActivityLogs} activities
                          </p>
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setActivityPage(Math.max(1, activityPage - 1))
                              }
                              disabled={activityPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setActivityPage(
                                  Math.min(totalActivityPages, activityPage + 1)
                                )
                              }
                              disabled={activityPage === totalActivityPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {user.role === 'Administrator' && (
              <TabsContent value='security' className='mt-4 space-y-4'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between'>
                    <div>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your security preferences
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        (window.location.href = '/settings#security')
                      }
                      className='bg-blue-600 hover:bg-blue-700'
                    >
                      Manage Security
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-gray-500'>
                      To update your password and manage other security
                      settings, please visit the settings page.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
