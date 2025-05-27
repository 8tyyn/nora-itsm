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
import { useEffect, useState } from 'react';
import { Eye, Trash2, Unlock } from 'lucide-react';
import { UserService } from '@/services/UserService';
import { UserModel } from '@/models/UserModel';

export default function BlockedAdminsPage() {
  const [selectedUser, setSelectedUser] = useState<UserModel | undefined>(
    undefined
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserModel | null>(null);
  const [blockedadmins, setBlockedAdmin] = useState<UserModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const viewUserDetails = (user: UserModel) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const getUsers = async (token: string) => {
    try {
      const data = await UserService.getBlockedAdmins(token);
      setBlockedAdmin(data);
    } catch (error) {
      console.error('Failed to fetch blocked users', error);
    }
  };

  // Function to handle unlocking a user
  const handleUnlockUser = async (user: UserModel) => {
    try {
      const token = localStorage.getItem('token')!;

      // Make sure user._id exists before proceeding
      if (!user._id) {
        console.error('User ID is undefined');
        return;
      }

      await UserService.updateUserStatus(user._id, 'Active', token);

      // Refresh the list after unlocking
      getUsers(token);

      // If user was being viewed in the dialog, close it
      if (selectedUser && selectedUser._id === user._id) {
        setIsDialogOpen(false);
      }

      alert(`${user.fullName} has been unblocked successfully.`);
    } catch (error) {
      console.error('Failed to unblock user:', error);
      alert('Failed to unblock user. Please try again.');
    }
  };

  // Function to open delete confirmation dialog
  const openDeleteDialog = (user: UserModel) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Function to handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete._id) return;

    try {
      const token = localStorage.getItem('token')!;

      // Make a DELETE request to the backend
      const response = await fetch(
        `http://localhost:5000/api/users/${userToDelete._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Close any open dialogs
      setIsDeleteDialogOpen(false);
      if (selectedUser && selectedUser._id === userToDelete._id) {
        setIsDialogOpen(false);
      }

      // Refresh the list
      getUsers(token);

      alert(
        `${userToDelete.fullName}'s account has been deleted successfully.`
      );
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token')!;
    getUsers(token);
  }, []);

  // Filter users based on search term and role
  const filteredUsers = blockedadmins.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === 'all' ||
      user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Blocked Users</h1>
        <div className='flex items-center gap-2'>
          <Badge className='bg-red-600'>{blockedadmins.length} Blocked</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blocked User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
            <div className='flex w-full flex-col gap-4 sm:flex-row md:w-auto'>
              <Input
                placeholder='Search blocked users...'
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
                  <SelectItem value='user'>User</SelectItem>
                  <SelectItem value='doctor'>Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32`}
                            alt={user.fullName}
                          />
                          <AvatarFallback className='bg-red-100 text-red-700'>
                            {user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{user.fullName}</span>
                          <span className='text-muted-foreground text-xs'>
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                          onClick={() => viewUserDetails(user)}
                        >
                          <Eye className='h-4 w-4' />
                          <span className='sr-only'>View Details</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-green-600 hover:bg-green-50 hover:text-green-700'
                          onClick={() => handleUnlockUser(user)}
                        >
                          <Unlock className='h-4 w-4' />
                          <span className='sr-only'>Unblock</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-red-600 hover:bg-red-50 hover:text-red-700'
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Trash2 className='h-4 w-4' />
                          <span className='sr-only'>Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className='text-muted-foreground py-8 text-center'
                  >
                    No blocked users found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User details dialog */}
      {selectedUser && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Blocked User Details</DialogTitle>
              <DialogDescription>
                Review information about this blocked user.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='flex items-center gap-4'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64`}
                    alt={selectedUser.fullName}
                  />
                  <AvatarFallback className='bg-red-100 text-xl text-red-700'>
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
                  <p className='text-sm font-medium'>Status</p>
                  <p className='text-muted-foreground text-sm'>Blocked</p>
                </div>
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
                onClick={() => {
                  setIsDialogOpen(false);
                  openDeleteDialog(selectedUser);
                }}
              >
                Delete Account
              </Button>
              <Button
                className='bg-blue-600 hover:bg-blue-700'
                onClick={() => {
                  setIsDialogOpen(false);
                  handleUnlockUser(selectedUser);
                }}
              >
                Unblock User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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
