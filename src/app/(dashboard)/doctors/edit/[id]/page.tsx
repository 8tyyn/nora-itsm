'use client';

import type React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UserService } from '@/services/UserService';
import type { UserModel } from '@/models/UserModel';
import { toast } from 'sonner';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserModel | null>(null);
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    role: 'User'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Get the user being edited
        const userData = await UserService.getUserById(params.id, token);
        setUser(userData);

        // Get the current logged-in user's info
        const currentUserData = await UserService.getUserProfile(token);
        setCurrentUser(currentUserData);

        setFormData((state) => ({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          role: userData.role || 'User'
        }));
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('error', {
          description: 'Failed to load user data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token || !user?._id) {
        router.push('/login');
        return;
      }

      // Update user data
      await UserService.updateUser(
        user._id,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          role: formData.role
        },
        token
      );

      toast.success('success', {
        description: 'User information updated successfully'
      });

      // Redirect back to user profile
      router.push(`/users/${user._id}`);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('error', {
        description: 'Failed to update user information. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to get available roles based on current user's role
  const getAvailableRoles = () => {
    if (!currentUser) return ['User', 'Doctor'];

    // Super Admin can assign any role
    if (currentUser.role === 'Super Admin') {
      return ['User', 'Doctor', 'Admin', 'Super Admin'];
    }

    // Admin can only assign User or Doctor roles
    if (currentUser.role === 'Admin') {
      return ['User', 'Doctor'];
    }

    // Default (shouldn't happen if proper auth is in place)
    return ['User'];
  };

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

  const availableRoles = getAvailableRoles();

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          asChild
          className='hover:bg-blue-50'
        >
          <Link href={`/doctors/${user._id}`}>
            <ArrowLeft className='h-4 w-4 text-blue-600' />
            <span className='sr-only'>Back to Doctor profile</span>
          </Link>
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>Edit Doctor</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
            <CardDescription>Update the doctor's information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Full Name</Label>
              <Input
                id='fullName'
                name='fullName'
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder='Enter full name'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email (Cannot be changed)</Label>
              <Input
                id='email'
                name='email'
                value={formData.email}
                readOnly
                disabled
                className='bg-slate-50'
              />
              <p className='text-muted-foreground text-xs'>
                Email addresses cannot be modified for security reasons.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                placeholder='Enter phone number'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Input
                id='address'
                name='address'
                value={formData.address}
                onChange={handleInputChange}
                placeholder='Enter address'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger
                  id='role'
                  className='border-blue-200 focus:ring-blue-500'
                >
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentUser?.role === 'Admin' && (
                <p className='text-muted-foreground text-xs'>
                  As an Admin, you can only assign User or Doctor roles.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button variant='outline' type='button' asChild>
              <Link href={`/users/${user._id}`}>Cancel</Link>
            </Button>
            <Button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700'
              disabled={saving}
            >
              {saving ? (
                <span className='flex items-center gap-2'>
                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Saving...
                </span>
              ) : (
                <span className='flex items-center gap-2'>
                  <Save className='h-4 w-4' />
                  Save Changes
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
