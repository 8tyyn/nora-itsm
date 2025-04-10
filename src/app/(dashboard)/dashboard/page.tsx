import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='bg-blue-100'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='reports'>Reports</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='bg-blue-100'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Users
                </CardTitle>
                <Users className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>1,248</div>
                <p className='text-muted-foreground text-xs'>
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card className='bg-blue-100'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Doctors
                </CardTitle>
                <Users className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>324</div>
                <p className='text-muted-foreground text-xs'>
                  +4% from last month
                </p>
              </CardContent>
            </Card>
            <Card className='bg-blue-100'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Appointments
                </CardTitle>
                <Calendar className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>573</div>
                <p className='text-muted-foreground text-xs'>
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card className='bg-blue-100'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Revenue</CardTitle>
                <DollarSign className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$45,231.89</div>
                <p className='text-muted-foreground text-xs'>
                  +7% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>PowerBI Dashboard</CardTitle>
                <CardDescription>
                  Embedded PowerBI report for healthcare analytics
                </CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                <div className='flex h-[400px] items-center justify-center rounded-md border bg-slate-50'>
                  <p className='text-muted-foreground'>
                    PowerBI Embed would go here
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='flex items-center gap-4'>
                      <div className='rounded-full bg-blue-100 p-2'>
                        <div className='h-2 w-2 rounded-full bg-blue-600' />
                      </div>
                      <div className='flex-1 space-y-1'>
                        <p className='text-sm leading-none font-medium'>
                          User updated their profile
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          2 hours ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='analytics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Detailed analytics from PowerBI</CardDescription>
            </CardHeader>
            <CardContent className='pl-2'>
              <div className='flex h-[600px] items-center justify-center rounded-md border bg-slate-50'>
                <p className='text-muted-foreground'>
                  PowerBI Analytics would go here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='reports' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generated reports and exports</CardDescription>
            </CardHeader>
            <CardContent className='pl-2'>
              <div className='flex h-[600px] items-center justify-center rounded-md border bg-slate-50'>
                <p className='text-muted-foreground'>
                  PowerBI Reports would go here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
