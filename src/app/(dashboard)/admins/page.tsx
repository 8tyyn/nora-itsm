'use client';
import Link from 'next/link';
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
import { ShieldCheck, Shield } from 'lucide-react';
import { AdminService } from '@/services/AdminService';
import { useEffect, useState } from 'react';
import { UserModel } from '@/models/UserModel';

export default function AdminsPage() {
  const getUsers = async (token: string) => {
    const data = await AdminService.getAll(token);
    setAdmins(data);
  };

  useEffect(() => {
    const token = localStorage.getItem('token')!;
    getUsers(token);
  }, []);
  const [admins, setAdmins] = useState<UserModel[]>([]);
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Administrators</h1>
        <Button className='bg-blue-600 hover:bg-blue-700' asChild>
          <Link href='/admins/add'>Add Administrator</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Administrator Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center gap-4'>
            <Input
              placeholder='Search administrators...'
              className='max-w-sm'
            />
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
                <TableHead>Administrator</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32`}
                          alt={admin.fullName}
                        />
                        <AvatarFallback className='bg-blue-100 text-blue-700'>
                          {admin.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{admin.fullName}</span>
                        <span className='text-muted-foreground text-xs'>
                          {admin.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {admin.role === 'Super Admin' ? (
                        <>
                          <ShieldCheck className='h-4 w-4 text-red-600' />
                          <Badge className='bg-red-600'>Super Admin</Badge>
                        </>
                      ) : (
                        <>
                          <Shield className='h-4 w-4 text-blue-600' />
                          <Badge className='bg-blue-600'>Admin</Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{admin.lastActive}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        asChild
                        className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                      >
                        <Link href={`/admins/${admin._id}`}>View</Link>
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                      >
                        <Link href={`/admins/edit/${admin._id}`}>Edit</Link>
                      </Button>
                    </div>
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
