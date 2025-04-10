import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

// Mock data for doctors
const doctors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    specialty: 'Cardiology',
    status: 'Available',
    patients: 42
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
    specialty: 'Neurology',
    status: 'In Appointment',
    patients: 38
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    specialty: 'Pediatrics',
    status: 'Available',
    patients: 65
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    specialty: 'Orthopedics',
    status: 'On Leave',
    patients: 27
  },
  {
    id: '5',
    name: 'Dr. Lisa Patel',
    email: 'lisa.patel@example.com',
    specialty: 'Dermatology',
    status: 'Available',
    patients: 51
  }
];

export default function DoctorsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Doctors</h1>
        <Button>Add Doctor</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center gap-4'>
            <Input placeholder='Search doctors...' className='max-w-sm' />
            <Button variant='outline'>Filter</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32`}
                          alt={doctor.name}
                        />
                        <AvatarFallback className='bg-primary/10 text-primary'>
                          {doctor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{doctor.name}</span>
                        <span className='text-muted-foreground text-xs'>
                          {doctor.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        doctor.status === 'Available'
                          ? 'default'
                          : doctor.status === 'On Leave'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {doctor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{doctor.patients}</TableCell>
                  <TableCell className='text-right'>
                    <Button variant='ghost' size='sm'>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
