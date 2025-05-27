'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { UserService } from '@/services/UserService';
import { UserModel } from '@/models/UserModel';
import { toast } from 'sonner';

export default function RegistrationsPage() {
  const [selectedUser, setSelectedUser] = useState<UserModel | undefined>(
    undefined
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pending, setPending] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const viewUserDetails = (user: UserModel) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const getUsers = async (token: string) => {
    try {
      setIsLoading(true);
      const data = await UserService.getAllPending(token);
      setPending(data);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      if (typeof toast !== 'undefined') {
        toast({
          title: 'Error',
          description: 'Failed to load pending registrations',
          variant: 'destructive'
        });
      } else {
        alert('Failed to load pending registrations');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUsers(token);
    } else {
      if (typeof toast !== 'undefined') {
        toast({
          title: 'Authentication Error',
          description: 'You need to be logged in to view this page',
          variant: 'destructive'
        });
      } else {
        alert('You need to be logged in to view this page');
      }
    }
  }, []);

  const updateUserStatus = async (
    userId: string,
    status: 'Active' | 'Blocked'
  ) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        if (typeof toast !== 'undefined') {
          toast({
            title: 'Authentication Error',
            description: 'You need to be logged in to perform this action',
            variant: 'destructive'
          });
        } else {
          alert('You need to be logged in to perform this action');
        }
        return;
      }

      await UserService.updateUserStatus(userId, status, token);

      // Update the local state by removing the approved/declined user
      setPending((prev) => prev.filter((user) => user._id !== userId));

      // If the dialog is open and it's the selected user, close it
      if (selectedUser && selectedUser._id === userId) {
        setIsDialogOpen(false);
      }

      // Show success message
      if (typeof toast !== 'undefined') {
        toast({
          title: 'Success',
          description: `User ${status === 'Active' ? 'approved' : 'declined'} successfully`,
          variant: 'default'
        });
      } else {
        alert(
          `User ${status === 'Active' ? 'approved' : 'declined'} successfully`
        );
      }
    } catch (error) {
      console.error(
        `Error ${status === 'Active' ? 'approving' : 'declining'} user:`,
        error
      );
      if (typeof toast !== 'undefined') {
        toast({
          title: 'Error',
          description: `Failed to ${status === 'Active' ? 'approve' : 'decline'} user`,
          variant: 'destructive'
        });
      } else {
        alert(`Failed to ${status === 'Active' ? 'approve' : 'decline'} user`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const approveUser = (userId: string) => {
    updateUserStatus(userId, 'Active');
  };

  const declineUser = (userId: string) => {
    updateUserStatus(userId, 'Blocked');
  };

  const approveAll = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        if (typeof toast !== 'undefined') {
          toast({
            title: 'Authentication Error',
            description: 'You need to be logged in to perform this action',
            variant: 'destructive'
          });
        } else {
          alert('You need to be logged in to perform this action');
        }
        return;
      }

      // Process all pending users
      const promises = pending.map((user) =>
        UserService.updateUserStatus(user._id, 'Active', token)
      );

      await Promise.all(promises);

      // Update the local state by clearing all pending users
      setPending([]);

      // Close dialog if open
      if (isDialogOpen) {
        setIsDialogOpen(false);
      }

      // Show success message
      if (typeof toast !== 'undefined') {
        toast({
          title: 'Success',
          description: 'All users approved successfully',
          variant: 'default'
        });
      } else {
        alert('All users approved successfully');
      }
    } catch (error) {
      console.error('Error approving all users:', error);
      if (typeof toast !== 'undefined') {
        toast({
          title: 'Error',
          description: 'Failed to approve all users',
          variant: 'destructive'
        });
      } else {
        alert('Failed to approve all users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = pending.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>
          Pending Registrations
        </h1>
        <div className='flex items-center gap-2'>
          <Badge className='bg-blue-600'>{pending.length} Pending</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
            <div className='flex w-full flex-col gap-4 sm:flex-row md:w-auto'>
              <Input
                placeholder='Search registrations...'
                className='max-w-sm'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className='w-[180px] border-blue-200'>
                  <SelectValue placeholder='Filter by role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Roles</SelectItem>
                  <SelectItem value='patient'>Patient</SelectItem>
                  <SelectItem value='staff'>Staff</SelectItem>
                  <SelectItem value='doctor'>Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex w-full gap-2 md:w-auto'>
              <Button
                variant='outline'
                className='border-blue-200 text-blue-700 hover:bg-blue-50'
                onClick={approveAll}
                disabled={isLoading || pending.length === 0}
              >
                {isLoading ? 'Processing...' : 'Approve All'}
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-muted-foreground py-6 text-center'
                  >
                    {isLoading
                      ? 'Loading...'
                      : 'No pending registrations found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((registration) => (
                  <TableRow key={registration._id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32`}
                            alt={registration.fullName}
                          />
                          <AvatarFallback className='bg-blue-100 text-blue-700'>
                            {registration.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {registration.fullName}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {registration.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{registration.role}</TableCell>
                    <TableCell>{registration.createdAt}</TableCell>
                    <TableCell>
                      <Badge className='bg-amber-500'>
                        {registration.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                          onClick={() => viewUserDetails(registration)}
                          disabled={isLoading}
                        >
                          <Eye className='h-4 w-4' />
                          <span className='sr-only'>View Details</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-green-600 hover:bg-green-50 hover:text-green-700'
                          onClick={() => approveUser(registration._id)}
                          disabled={isLoading}
                        >
                          <CheckCircle className='h-4 w-4' />
                          <span className='sr-only'>Approve</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-red-600 hover:bg-red-50 hover:text-red-700'
                          onClick={() => declineUser(registration._id)}
                          disabled={isLoading}
                        >
                          <XCircle className='h-4 w-4' />
                          <span className='sr-only'>Decline</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Registration Details</DialogTitle>
              <DialogDescription>
                Review the registration information before making a decision.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='flex items-center gap-4'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64`}
                    alt={selectedUser.fullName}
                  />
                  <AvatarFallback className='bg-blue-100 text-xl text-blue-700'>
                    {selectedUser.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='text-lg font-medium'>
                    {selectedUser.fullName}
                  </h3>
                  <p className='text-muted-foreground text-sm'>
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium'>Role</p>
                  <p className='text-muted-foreground text-sm'>
                    {selectedUser.role}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Registered On</p>
                  <p className='text-muted-foreground text-sm'>
                    {selectedUser.createdAt}
                  </p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className='text-sm font-medium'>Phone</p>
                    <p className='text-muted-foreground text-sm'>
                      {selectedUser.phone}
                    </p>
                  </div>
                )}
                {selectedUser.address && (
                  <div>
                    <p className='text-sm font-medium'>Address</p>
                    <p className='text-muted-foreground text-sm'>
                      {selectedUser.address}
                    </p>
                  </div>
                )}
                {selectedUser.department && (
                  <div>
                    <p className='text-sm font-medium'>Department</p>
                    <p className='text-muted-foreground text-sm'>
                      {selectedUser.department}
                    </p>
                  </div>
                )}
                {selectedUser.position && (
                  <div>
                    <p className='text-sm font-medium'>Position</p>
                    <p className='text-muted-foreground text-sm'>
                      {selectedUser.position}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className='flex justify-between sm:justify-between'>
              <Button
                variant='outline'
                className='border-red-200 text-red-700 hover:bg-red-50'
                onClick={() => declineUser(selectedUser._id)}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Decline Registration'}
              </Button>
              <Button
                className='bg-blue-600 hover:bg-blue-700'
                onClick={() => approveUser(selectedUser._id)}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Approve Registration'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
