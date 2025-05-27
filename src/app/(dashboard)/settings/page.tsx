'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { UserService } from '@/services/UserService';
import { useAuth } from '@/services/AuthService';
import { UserModel } from '@/models/UserModel';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState<Partial<UserModel>>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  // Set initial data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        department: user.department || '',
        position: user.position || ''
      });
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('error', {
          description: 'You need to be logged in to update your profile'
        });
        return;
      }

      // Only send non-empty fields
      const dataToUpdate = Object.entries(profileData).reduce(
        (acc: any, [key, value]) => {
          if (value !== undefined && value !== '') {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const updatedUser = await UserService.updateUserProfile(
        dataToUpdate,
        token
      );

      toast.error('error', {
        description: 'Your profile has been successfully updated'
      });
    } catch (error: any) {
      toast.error('error', {
        description: error.message || 'Failed to update profile'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('error', {
        description: 'New password and confirmation do not match'
      });
      return;
    }

    setIsPasswordSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('error', {
          description: 'You need to be logged in to update your password'
        });
        return;
      }

      await UserService.updateUserProfile(
        {
          currentPassword: passwordData.currentPassword,
          password: passwordData.password
        },
        token
      );

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });

      toast.success('success', {
        description: 'Your password has been successfully updated'
      });
    } catch (error: any) {
      toast.error('error', {
        description: error.message || 'Failed to update password'
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-[70vh] items-center justify-center'>
        <Loader2 className='h-10 w-10 animate-spin text-gray-500' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold tracking-tight'>Account Settings</h1>

      <form onSubmit={handleProfileUpdate}>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                value={profileData.phone || ''}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Input
                id='address'
                value={profileData.address || ''}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <form onSubmit={handlePasswordUpdate}>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='current-password'>Current Password</Label>
              <Input
                id='current-password'
                type='password'
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })
                }
                required
              />
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='new-password'>New Password</Label>
                <Input
                  id='new-password'
                  type='password'
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value
                    })
                  }
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirm-password'>Confirm Password</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700'
              disabled={isPasswordSubmitting}
            >
              {isPasswordSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
