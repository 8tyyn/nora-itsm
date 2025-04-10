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
import { Textarea } from '@/components/ui/textarea';

export default function AddDoctorPage() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'
          asChild
          className='hover:bg-blue-50'
        >
          <Link href='/doctors'>
            <ArrowLeft className='h-4 w-4 text-blue-600' />
            <span className='sr-only'>Back to doctors</span>
          </Link>
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>Add New Doctor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
          <CardDescription>
            Enter the details for the new doctor
          </CardDescription>
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
              <Label htmlFor='specialty'>Specialty</Label>
              <Select>
                <SelectTrigger
                  id='specialty'
                  className='border-blue-200 focus:ring-blue-500'
                >
                  <SelectValue placeholder='Select specialty' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='cardiology'>Cardiology</SelectItem>
                  <SelectItem value='neurology'>Neurology</SelectItem>
                  <SelectItem value='pediatrics'>Pediatrics</SelectItem>
                  <SelectItem value='orthopedics'>Orthopedics</SelectItem>
                  <SelectItem value='dermatology'>Dermatology</SelectItem>
                  <SelectItem value='general'>General Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='qualifications'>Qualifications</Label>
            <Input
              id='qualifications'
              placeholder='Enter qualifications (e.g., MD, PhD)'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='bio'>Biography</Label>
            <Textarea
              id='bio'
              placeholder="Enter doctor's biography and experience"
              className='min-h-[100px] border-blue-200 focus:ring-blue-500'
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select defaultValue='available'>
                <SelectTrigger
                  id='status'
                  className='border-blue-200 focus:ring-blue-500'
                >
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='available'>Available</SelectItem>
                  <SelectItem value='on-leave'>On Leave</SelectItem>
                  <SelectItem value='in-appointment'>In Appointment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='start-date'>Start Date</Label>
              <Input id='start-date' type='date' />
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button variant='outline' asChild>
            <Link href='/doctors'>Cancel</Link>
          </Button>
          <Button className='bg-blue-600 hover:bg-blue-700'>
            Create Doctor
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
