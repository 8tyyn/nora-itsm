'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { UserModel } from '@/models/UserModel';
import { DoctorService } from '@/services/DoctorService';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Mock data for doctors

export default function DoctorsPage() {
  const getDoctors = async (token: string) => {
    const data = await DoctorService.getAll(token);
    setDoctors(data);
  };

  useEffect(() => {
    const token = localStorage.getItem('token')!;
    getDoctors(token);
  }, []);
  const [doctors, setDoctors] = useState<UserModel[]>([]);
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Doctors</h1>
        <Button className='bg-blue-600 hover:bg-blue-700' asChild>
          <Link href='/doctors/add'>Add Doctor</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center gap-4'>
            <Input placeholder='Search doctors...' className='max-w-sm' />
            <Button
              variant='outline'
              className='border-blue-200 text-blue-700 hover:bg-blue-50'
            >
              Filter
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor._id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='bg-blue-100 text-blue-700'>
                          {doctor.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{doctor.fullName}</span>
                        <span className='text-muted-foreground text-xs'>
                          {doctor.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        doctor.status === 'Active'
                          ? 'bg-blue-600'
                          : doctor.status === 'Inactive'
                            ? 'bg-slate-500'
                            : 'bg-amber-500'
                      }
                    >
                      {doctor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                    >
                      <Link href={`/doctors/${doctor._id}`}>View</Link>
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
