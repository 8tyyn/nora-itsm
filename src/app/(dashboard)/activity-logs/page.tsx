'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Search,
  Download,
  Filter,
  CalendarIcon,
  Clock,
  User,
  Activity
} from 'lucide-react';
import { ActivityService } from '@/services/ActivityService';
import { UserService } from '@/services/UserService';
import { useAuth } from '@/services/AuthService';
import type {
  ActivityModel,
  ActivityLogResponse,
  PopulatedActivityModel
} from '@/models/ActivityModel';
import type { UserModel } from '@/models/UserModel';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function ActivityLogsPage() {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState<PopulatedActivityModel[]>([]);
  const [allUsers, setAllUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 20;

  // Fetch activity logs and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch activity logs with pagination and filters using the correct service method
        const response: ActivityLogResponse =
          await ActivityService.getActivityLogs(token, {
            page: currentPage,
            pageSize: logsPerPage,
            userId: userFilter !== 'all' ? userFilter : undefined,
            action: actionFilter !== 'all' ? actionFilter : undefined,
            dateFrom: dateRange.from?.toISOString(),
            dateTo: dateRange.to?.toISOString()
          });

        // The API returns populated activity logs, so we can use them directly
        let filteredLogs = response.activityLogs as PopulatedActivityModel[];

        // Filter logs by search query on the frontend (since the API might not support text search)
        if (searchQuery) {
          filteredLogs = filteredLogs.filter(
            (log) =>
              log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (log.details &&
                log.details
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())) ||
              log.userId.fullName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              log.userId.email.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setLogs(filteredLogs);
        setTotalPages(response.pages);
        setTotalLogs(response.total);

        // Extract unique users from the populated logs for filter dropdown
        const uniqueUsers = filteredLogs.reduce((acc, log) => {
          const existingUser = acc.find((user) => user._id === log.userId._id);
          if (!existingUser) {
            acc.push({
              _id: log.userId._id,
              fullName: log.userId.fullName,
              email: log.userId.email,
              role: log.userId.role
            } as UserModel);
          }
          return acc;
        }, [] as UserModel[]);

        setAllUsers(uniqueUsers);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, actionFilter, userFilter, dateRange]);

  // Separate effect for search query to avoid too many API calls
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when searching
      } else {
        // Trigger the main useEffect by updating a dependency
        const fetchData = async () => {
          try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const response: ActivityLogResponse =
              await ActivityService.getActivityLogs(token, {
                page: 1,
                pageSize: logsPerPage,
                userId: userFilter !== 'all' ? userFilter : undefined,
                action: actionFilter !== 'all' ? actionFilter : undefined,
                dateFrom: dateRange.from?.toISOString(),
                dateTo: dateRange.to?.toISOString()
              });

            let filteredLogs =
              response.activityLogs as PopulatedActivityModel[];
            if (searchQuery) {
              filteredLogs = filteredLogs.filter(
                (log) =>
                  log.action
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  (log.details &&
                    log.details
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())) ||
                  log.userId.fullName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  log.userId.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
              );
            }

            setLogs(filteredLogs);
            setTotalPages(response.pages);
            setTotalLogs(response.total);

            // Extract unique users from the populated logs for filter dropdown
            const uniqueUsers = filteredLogs.reduce((acc, log) => {
              const existingUser = acc.find(
                (user) => user._id === log.userId._id
              );
              if (!existingUser) {
                acc.push({
                  _id: log.userId._id,
                  fullName: log.userId.fullName,
                  email: log.userId.email,
                  role: log.userId.role
                } as UserModel);
              }
              return acc;
            }, [] as UserModel[]);

            setAllUsers(uniqueUsers);
          } catch (error) {
            console.error('Error fetching activity logs:', error);
          } finally {
            setLoading(false);
          }
        };

        fetchData();
      }
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Get unique actions for filter dropdown
  const uniqueActions = [...new Set(logs.map((log) => log.action))].sort();

  // Get unique users for filter dropdown
  const uniqueUsers = allUsers.sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );

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

  // Export logs to CSV
  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Details'].join(','),
      ...logs.map((log) => {
        return [
          formatTimestamp(log.timestamp),
          log.userId.fullName,
          log.action,
          log.details || ''
        ]
          .map((field) => `"${field}"`)
          .join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Check if user has permission to view activity logs
  const canViewLogs =
    currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  if (!canViewLogs) {
    return (
      <div className='flex h-[calc(100vh-8rem)] items-center justify-center'>
        <Card className='w-96'>
          <CardHeader>
            <CardTitle className='text-center'>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-center'>
              You don't have permission to view activity logs. This feature is
              only available to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Activity Logs</h1>
          <p className='text-muted-foreground'>
            Monitor system-wide user activity and actions
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={exportLogs}
            className='border-blue-200 text-blue-700 hover:bg-blue-50'
          >
            <Download className='mr-2 h-4 w-4' />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Activities
            </CardTitle>
            <Activity className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalLogs}</div>
            <p className='text-muted-foreground text-xs'>All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <User className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{allUsers.length}</div>
            <p className='text-muted-foreground text-xs'>Unique users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Today's Activities
            </CardTitle>
            <Clock className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {
                logs.filter((log) => {
                  const logDate = new Date(log.timestamp);
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length
              }
            </div>
            <p className='text-muted-foreground text-xs'>Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Action Types</CardTitle>
            <Filter className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{uniqueActions.length}</div>
            <p className='text-muted-foreground text-xs'>Different actions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Detailed view of all user activities in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className='mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
              <Input
                placeholder='Search activities...'
                className='pl-9'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by action' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by user' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user._id} value={user._id || ''}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn('justify-start text-left font-normal')}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  initialFocus
                  mode='range'
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant='outline'
              onClick={() => {
                setSearchQuery('');
                setActionFilter('all');
                setUserFilter('all');
                setDateRange({});
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Activity Logs Table */}
          {loading ? (
            <div className='py-8 text-center text-blue-600'>
              Loading activity logs...
            </div>
          ) : logs.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>
              No activity logs found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    return (
                      <TableRow key={log._id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32`}
                                alt={log.userId.fullName}
                              />
                              <AvatarFallback className='bg-blue-100 text-blue-700'>
                                {log.userId.fullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                              <span className='font-medium'>
                                {log.userId.fullName}
                              </span>
                              <span className='text-muted-foreground text-xs'>
                                {log.userId.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className='mt-4 flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>
                  Showing {(currentPage - 1) * logsPerPage + 1} to{' '}
                  {Math.min(currentPage * logsPerPage, logs.length)} of{' '}
                  {totalLogs} results
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
