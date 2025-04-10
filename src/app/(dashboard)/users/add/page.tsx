import Link from 'next/link';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function AddUserPage() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          asChild
          className='hover:bg-blue-50'
        >
          <Link href='/users'>
            <ArrowLeft className='h-4 w-4 text-blue-600' />
            <span className='sr-only'>Back to users</span>
          </Link>
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>Add New User</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Enter the details for the new user</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='first-name'>First Name</Label>
              <Input id='first-name' placeholder='Enter first name' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='last-name'>Last Name</Label>
              <Input id='last-name' placeholder='Enter last name' />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' placeholder='Enter email address' />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input id='phone' placeholder='Enter phone number' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select>
                <SelectTrigger
                  id='role'
                  className='border-blue-200 focus:ring-blue-500'
                >
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='patient'>Patient</SelectItem>
                  <SelectItem value='staff'>Staff</SelectItem>
                  <SelectItem value='administrator'>Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='address'>Address</Label>
            <Input id='address' placeholder='Enter address' />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='city'>City</Label>
              <Input id='city' placeholder='Enter city' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='state'>State</Label>
              <Input id='state' placeholder='Enter state' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='zip'>Zip Code</Label>
              <Input id='zip' placeholder='Enter zip code' />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <Select defaultValue='active'>
              <SelectTrigger
                id='status'
                className='border-blue-200 focus:ring-blue-500'
              >
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button variant='outline' asChild>
            <Link href='/users'>Cancel</Link>
          </Button>
          <Button className='bg-blue-600 hover:bg-blue-700'>Create User</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
