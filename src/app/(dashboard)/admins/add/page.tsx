'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AdminService } from '@/services/AdminService';
import { UserModel } from '@/models/UserModel';

export default function AddAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserModel | null>(null);
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'Admin' as 'Admin' | 'Super Admin'
  });

  // Get current user info on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Fetch current user profile to check if Super Admin
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(
            'http://localhost:5000/api/users/profile',
            {
              headers: {
                Authorization: `Bearer ${storedToken}`
              }
            }
          );

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      };

      fetchUserProfile();
    }
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle role selection change
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value === 'super_admin' ? 'Super Admin' : 'Admin'
    }));
  };

  // Check if user is Super Admin
  const isSuperAdmin = user?.role === 'Super Admin';

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSuperAdmin) {
      setError('Only Super Admins can add new administrators');
      return;
    }

    // Validate form
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await AdminService.addAdmin(token, formData);
      router.push('/admins');
    } catch (error: any) {
      setError(error.message || 'Failed to add administrator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          asChild
          className='hover:bg-blue-50'
        >
          <Link href='/admins'>
            <ArrowLeft className='h-4 w-4 text-blue-600' />
            <span className='sr-only'>Back to administrators</span>
          </Link>
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>
          Add New Administrator
        </h1>
      </div>

      {!isSuperAdmin && (
        <div className='mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800'>
          Note: Only Super Admins can add new administrators
        </div>
      )}

      {error && (
        <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Administrator Information</CardTitle>
            <CardDescription>
              Enter the details for the new administrator
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='fullName'>Full Name</Label>
                <Input
                  id='fullName'
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder='Enter full name'
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Enter email address'
                required
              />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder='Enter phone number'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='address'>Address</Label>
                <Input
                  id='address'
                  value={formData.address}
                  onChange={handleChange}
                  placeholder='Enter address'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Administrator Role</Label>
              <RadioGroup
                value={
                  formData.role === 'Super Admin' ? 'super_admin' : 'admin'
                }
                onValueChange={handleRoleChange}
                className='flex flex-col space-y-2'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='admin' id='admin' />
                  <Label htmlFor='admin' className='font-normal'>
                    Admin
                  </Label>
                  <span className='text-muted-foreground ml-2 text-xs'>
                    (Can manage users and doctors, but not other admins)
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='super_admin' id='super_admin' />
                  <Label htmlFor='super_admin' className='font-normal'>
                    Super Admin
                  </Label>
                  <span className='text-muted-foreground ml-2 text-xs'>
                    (Full access to all system features and administrators)
                  </span>
                </div>
              </RadioGroup>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Temporary Password</Label>
              <Input
                id='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
                placeholder='Enter temporary password'
                required
              />
              <p className='text-muted-foreground text-xs'>
                The administrator will be prompted to change this password on
                first login.
              </p>
            </div>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button variant='outline' asChild>
              <Link href='/admins'>Cancel</Link>
            </Button>
            <Button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700'
              disabled={loading || !isSuperAdmin}
            >
              {loading ? 'Creating...' : 'Create Administrator'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
