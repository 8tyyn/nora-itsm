'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { UserService } from '@/services/UserService';
import { ActivityService } from '@/services/ActivityService';
import { UserModel } from '@/models/UserModel';
import type {
  PopulatedActivityModel,
  ActivityLogResponse
} from '@/models/ActivityModel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function UserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Get the current user's role
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(currentUser.role);

        // Fetch the user data
        const userData = await UserService.getUserById(params.id, token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id, router]);

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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?._id) return;

      await UserService.deleteUser(user._id, token);
      router.push('/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
      setDeleteError('Failed to delete user. Please try again.');
    }
  };

  const handleBlockUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?._id) return;

      const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';

      // Use the dedicated updateUserStatus method instead of updateUser
      await UserService.updateUserStatus(user._id, newStatus, token);

      // Update the local user state to reflect the change
      setUser({
        ...user,
        status: newStatus
      });

      // Show a toast notification for better user feedback
      toast.success('success', {
        description: `User ${newStatus === 'Blocked' ? 'blocked' : 'unblocked'} successfully`
      });
    } catch (error) {
      console.error('Failed to block/unblock user:', error);
      toast.error('error', {
        description: 'Failed to update user status. Please try again.'
      });
    }
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

  const canModifyUser = userRole === 'Admin' || userRole === 'Super Admin';

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        Loading user data...
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex h-64 items-center justify-center'>
        User not found
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            asChild
            className='hover:bg-blue-50'
          >
            <Link href='/blocked-users'>
              <ArrowLeft className='h-4 w-4 text-blue-600' />
              <span className='sr-only'>Back to blocked users</span>
            </Link>
          </Button>
          <h1 className='text-2xl font-bold tracking-tight'>User Profile</h1>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-7'>
        <Card className='md:col-span-2'>
          <CardHeader>
            <div className='flex flex-col items-center gap-2'>
              <Avatar className='h-24 w-24'>
                <AvatarImage
                  src={`/placeholder.svg?height=96&width=96`}
                  alt={user.fullName}
                />
                <AvatarFallback className='bg-blue-100 text-2xl text-blue-700'>
                  {user.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col items-center'>
                <h2 className='text-xl font-bold'>{user.fullName}</h2>
                <Badge className='mt-1 bg-blue-600'>{user.role}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-blue-600' />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-blue-600' />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className='flex items-start gap-2'>
                  <MapPin className='mt-0.5 h-4 w-4 text-blue-600' />
                  <span>{user.address}</span>
                </div>
              )}
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-blue-600' />
                <span>
                  Joined{' '}
                  {new Date(
                    user.dateJoined || user.createdAt || ''
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Activity className='h-4 w-4 text-blue-600' />
                <span>
                  Last active{' '}
                  {new Date(
                    user.lastActive || user.updatedAt || ''
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className='mt-4 border-t border-gray-200 pt-4'>
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
          </CardContent>
        </Card>

        <div className='md:col-span-5'>
          <Tabs defaultValue='overview' className='w-full'>
            <TabsList className='w-full justify-start'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='activity'>Activity Log</TabsTrigger>
              {user.role === 'User' && <></>}
              {(user.role === 'Admin' ||
                user.role === 'Super Admin' ||
                user.role === 'Doctor') && <></>}
            </TabsList>

            <TabsContent value='overview' className='mt-4 space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>
                    Basic information about the user
                  </CardDescription>
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
                    {user.phone && (
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Phone</p>
                        <p className='text-muted-foreground text-sm'>
                          {user.phone}
                        </p>
                      </div>
                    )}
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Role</p>
                      <p className='text-muted-foreground text-sm'>
                        {user.role}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Status</p>
                      <p className='text-muted-foreground text-sm'>
                        {user.status}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>Date Joined</p>
                      <p className='text-muted-foreground text-sm'>
                        {new Date(
                          user.dateJoined || user.createdAt || ''
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(user.role === 'Admin' ||
                user.role === 'Super Admin' ||
                user.role === 'Doctor') &&
                user.department && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Staff Information</CardTitle>
                      <CardDescription>Employment details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='grid gap-4 md:grid-cols-2'>
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
                )}
            </TabsContent>

            <TabsContent value='activity' className='mt-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Activity className='h-5 w-5 text-blue-600' />
                    User Activity Log
                  </CardTitle>
                  <CardDescription>
                    Recent activities and actions performed by {user.fullName}
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
                          User Status
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
                        This user hasn't performed any recorded activities yet.
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

            {(user.role === 'Admin' ||
              user.role === 'Super Admin' ||
              user.role === 'Doctor') && (
              <TabsContent value='permissions' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                    <CardDescription>Access control settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {user.permissions && user.permissions.length > 0 ? (
                        user.permissions.map((permission, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
                          >
                            <p className='text-sm'>{permission}</p>
                            <Badge
                              variant='outline'
                              className='border-blue-300 text-blue-700'
                            >
                              Granted
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className='text-muted-foreground text-sm'>
                          No specific permissions defined.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className='mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3 text-red-800'>
              <AlertTriangle className='h-4 w-4' />
              <span>{deleteError}</span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
