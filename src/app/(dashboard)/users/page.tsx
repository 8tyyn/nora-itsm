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

// Mock data for users
const users = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Patient',
    status: 'Active',
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'Staff',
    status: 'Active',
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    role: 'Patient',
    status: 'Inactive',
    lastActive: '3 days ago'
  },
  {
    id: '4',
    name: 'Dave Brown',
    email: 'dave@example.com',
    role: 'Administrator',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: '5',
    name: 'Eve Davis',
    email: 'eve@example.com',
    role: 'Patient',
    status: 'Active',
    lastActive: '5 hours ago'
  }
];

export default function UsersPage() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Users</h1>
        <Button className='bg-blue-600 hover:bg-blue-700' asChild>
          <Link href='/users/add'>Add User</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center gap-4'>
            <Input placeholder='Search users...' className='max-w-sm' />
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32`}
                          alt={user.name}
                        />
                        <AvatarFallback className='bg-blue-100 text-blue-700'>
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{user.name}</span>
                        <span className='text-muted-foreground text-xs'>
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.status === 'Active'
                          ? 'bg-blue-600'
                          : 'bg-slate-500'
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                      className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                    >
                      <Link href={`/users/${user.id}`}>View</Link>
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
