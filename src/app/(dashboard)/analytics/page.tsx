import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Analytics</h1>
        <div className='flex items-center gap-2'>
          <Select defaultValue='30days'>
            <SelectTrigger className='w-[180px] border-blue-200'>
              <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7days'>Last 7 days</SelectItem>
              <SelectItem value='30days'>Last 30 days</SelectItem>
              <SelectItem value='90days'>Last 90 days</SelectItem>
              <SelectItem value='year'>Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button className='bg-blue-600 hover:bg-blue-700'>
            <TrendingUp className='mr-2 h-4 w-4' />
            Export Report
          </Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-blue-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Patients
            </CardTitle>
            <Users className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='flex h-[80px] items-center justify-center'>
              <p className='text-muted-foreground text-xs'>
                PowerBI data will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-blue-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Appointments</CardTitle>
            <Calendar className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='flex h-[80px] items-center justify-center'>
              <p className='text-muted-foreground text-xs'>
                PowerBI data will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-blue-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Wait Time
            </CardTitle>
            <Activity className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='flex h-[80px] items-center justify-center'>
              <p className='text-muted-foreground text-xs'>
                PowerBI data will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-blue-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='flex h-[80px] items-center justify-center'>
              <p className='text-muted-foreground text-xs'>
                PowerBI data will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='bg-blue-100'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='patients'>Patient Analytics</TabsTrigger>
          <TabsTrigger value='appointments'>Appointment Analytics</TabsTrigger>
          <TabsTrigger value='financial'>Financial Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card className='col-span-2'>
              <CardHeader>
                <CardTitle>Patient Trends</CardTitle>
                <CardDescription>
                  Monthly patient registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent className='flex h-[300px] items-center justify-center'>
                <div className='text-center'>
                  <BarChart3 className='mx-auto mb-2 h-12 w-12 text-blue-600' />
                  <p className='text-muted-foreground'>
                    PowerBI chart will be embedded here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
                <CardDescription>Age distribution of patients</CardDescription>
              </CardHeader>
              <CardContent className='flex h-[300px] items-center justify-center'>
                <div className='text-center'>
                  <PieChart className='mx-auto mb-2 h-12 w-12 text-blue-600' />
                  <p className='text-muted-foreground'>
                    PowerBI chart will be embedded here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>
                Patient satisfaction and efficiency metrics by department
              </CardDescription>
            </CardHeader>
            <CardContent className='flex h-[250px] items-center justify-center'>
              <div className='text-center'>
                <BarChart3 className='mx-auto mb-2 h-12 w-12 text-blue-600' />
                <p className='text-muted-foreground'>
                  PowerBI chart will be embedded here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='patients' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Patient Analytics</CardTitle>
              <CardDescription>
                Detailed patient statistics and trends
              </CardDescription>
            </CardHeader>
            <CardContent className='pl-2'>
              <div className='flex h-[600px] items-center justify-center rounded-md border bg-slate-50'>
                <div className='space-y-4 text-center'>
                  <BarChart3 className='mx-auto h-16 w-16 text-blue-600' />
                  <p className='text-muted-foreground'>
                    PowerBI Patient Analytics will be embedded here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='appointments' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Appointment Analytics</CardTitle>
              <CardDescription>
                Appointment trends and statistics
              </CardDescription>
            </CardHeader>
            <CardContent className='pl-2'>
              <div className='flex h-[600px] items-center justify-center rounded-md border bg-slate-50'>
                <div className='space-y-4 text-center'>
                  <LineChart className='mx-auto h-16 w-16 text-blue-600' />
                  <p className='text-muted-foreground'>
                    PowerBI Appointment Analytics will be embedded here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='financial' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Financial Analytics</CardTitle>
              <CardDescription>Revenue and expense analysis</CardDescription>
            </CardHeader>
            <CardContent className='pl-2'>
              <div className='flex h-[600px] items-center justify-center rounded-md border bg-slate-50'>
                <div className='space-y-4 text-center'>
                  <PieChart className='mx-auto h-16 w-16 text-blue-600' />
                  <p className='text-muted-foreground'>
                    PowerBI Financial Analytics will be embedded here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
