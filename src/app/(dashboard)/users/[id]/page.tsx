import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity
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

// Mock user data - in a real app, this would come from a database
const users: any = {
  '1': {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, CA 12345',
    role: 'Patient',
    status: 'Active',
    dateJoined: 'Jan 15, 2023',
    lastActive: '2 hours ago',
    appointments: [
      {
        id: 'a1',
        date: 'Mar 15, 2023',
        doctor: 'Dr. Smith',
        status: 'Completed'
      },
      {
        id: 'a2',
        date: 'Apr 20, 2023',
        doctor: 'Dr. Williams',
        status: 'Completed'
      },
      {
        id: 'a3',
        date: 'May 10, 2023',
        doctor: 'Dr. Johnson',
        status: 'Cancelled'
      },
      {
        id: 'a4',
        date: 'Jun 05, 2023',
        doctor: 'Dr. Smith',
        status: 'Completed'
      }
    ],
    medicalRecords: [
      {
        id: 'm1',
        date: 'Mar 15, 2023',
        type: 'Checkup',
        notes: 'Regular checkup, all normal'
      },
      {
        id: 'm2',
        date: 'Apr 20, 2023',
        type: 'Blood Test',
        notes: 'Blood work completed, results pending'
      },
      {
        id: 'm3',
        date: 'Jun 05, 2023',
        type: 'Followup',
        notes: 'Patient recovering well'
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Ave, Somewhere, NY 54321',
    role: 'Staff',
    status: 'Active',
    dateJoined: 'Feb 10, 2023',
    lastActive: '1 day ago',
    department: 'Administration',
    position: 'Office Manager',
    permissions: ['User Management', 'Appointment Scheduling', 'Billing Access']
  }
};

export default function UserPage({ params }: { params: { id: string } }) {
  const user = users[params.id];

  if (!user) {
    notFound();
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/users'>
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back to users</span>
          </Link>
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>User Profile</h1>
      </div>

      <div className='grid gap-4 md:grid-cols-7'>
        <Card className='md:col-span-2'>
          <CardHeader>
            <div className='flex flex-col items-center gap-2'>
              <Avatar className='h-24 w-24'>
                <AvatarImage
                  src={`/placeholder.svg?height=96&width=96`}
                  alt={user.name}
                />
                <AvatarFallback className='bg-primary/10 text-primary text-2xl'>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col items-center'>
                <h2 className='text-xl font-bold'>{user.name}</h2>
                <Badge className='mt-1'>{user.role}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Mail className='text-primary h-4 w-4' />
                <span>{user.email}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='text-primary h-4 w-4' />
                <span>{user.phone}</span>
              </div>
              <div className='flex items-start gap-2'>
                <MapPin className='text-primary mt-0.5 h-4 w-4' />
                <span>{user.address}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='text-primary h-4 w-4' />
                <span>Joined {user.dateJoined}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Activity className='text-primary h-4 w-4' />
                <span>Last active {user.lastActive}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='md:col-span-5'>
          <Tabs defaultValue='overview' className='w-full'>
            <TabsList className='w-full justify-start'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              {user.role === 'Patient' && (
                <>
                  <TabsTrigger value='appointments'>Appointments</TabsTrigger>
                  <TabsTrigger value='medical-records'>
                    Medical Records
                  </TabsTrigger>
                </>
              )}
              {user.role === 'Staff' && (
                <>
                  <TabsTrigger value='permissions'>Permissions</TabsTrigger>
                  <TabsTrigger value='activity'>Activity Log</TabsTrigger>
                </>
              )}
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
                        {user.name}
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
                        {user.phone}
                      </p>
                    </div>
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
                        {user.dateJoined}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user.role === 'Staff' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Information</CardTitle>
                    <CardDescription>Employment details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid gap-4 md:grid-cols-2'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Department</p>
                        <p className='text-muted-foreground text-sm'>
                          {user.department}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Position</p>
                        <p className='text-muted-foreground text-sm'>
                          {user.position}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {user.role === 'Patient' && (
              <TabsContent value='appointments' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment History</CardTitle>
                    <CardDescription>
                      Past and upcoming appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {user.appointments?.map((appointment: any) => (
                        <div
                          key={appointment.id}
                          className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
                        >
                          <div>
                            <p className='font-medium'>{appointment.date}</p>
                            <p className='text-muted-foreground text-sm'>
                              {appointment.doctor}
                            </p>
                          </div>
                          <Badge
                            variant={
                              appointment.status === 'Completed'
                                ? 'outline'
                                : 'secondary'
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {user.role === 'Patient' && (
              <TabsContent value='medical-records' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Records</CardTitle>
                    <CardDescription>Patient medical history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {user.medicalRecords?.map((record: any) => (
                        <div
                          key={record.id}
                          className='border-b pb-4 last:border-0 last:pb-0'
                        >
                          <div className='mb-2 flex items-center justify-between'>
                            <p className='font-medium'>
                              {record.date} - {record.type}
                            </p>
                            <Button variant='outline' size='sm'>
                              View Details
                            </Button>
                          </div>
                          <p className='text-muted-foreground text-sm'>
                            {record.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {user.role === 'Staff' && (
              <TabsContent value='permissions' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                    <CardDescription>Access control settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {user.permissions?.map(
                        (permission: any, index: number) => (
                          <div
                            key={index}
                            className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
                          >
                            <p className='text-sm'>{permission}</p>
                            <Badge variant='outline'>Granted</Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {user.role === 'Staff' && (
              <TabsContent value='activity' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>Recent user activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 rounded-full p-2'>
                          <div className='bg-primary h-2 w-2 rounded-full' />
                        </div>
                        <div className='flex-1 space-y-1'>
                          <p className='text-sm leading-none font-medium'>
                            Logged into the system
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            Today, 9:42 AM
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 rounded-full p-2'>
                          <div className='bg-primary h-2 w-2 rounded-full' />
                        </div>
                        <div className='flex-1 space-y-1'>
                          <p className='text-sm leading-none font-medium'>
                            Updated patient records
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            Yesterday, 3:15 PM
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 rounded-full p-2'>
                          <div className='bg-primary h-2 w-2 rounded-full' />
                        </div>
                        <div className='flex-1 space-y-1'>
                          <p className='text-sm leading-none font-medium'>
                            Scheduled new appointment
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            Yesterday, 11:30 AM
                          </p>
                        </div>
                      </div>
                    </div>
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
