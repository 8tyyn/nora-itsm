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
  Edit,
  X,
  Stethoscope,
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

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Programmation Created
            </CardTitle>
            <Calendar className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent className='h-[150px] w-[1000px] p-0'>
            <iframe
              src='https://app.powerbi.com/view?r=eyJrIjoiOWY4MDI3NWEtNThhOC00YTMxLWI3ZWYtMDk1ZDExYTYxYzk0IiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
              className='h-full w-full rounded-b-lg'
              frameBorder='0'
              allowFullScreen={true}
              title='Patient Demographics - Age Distribution'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Programmation Modified
            </CardTitle>
            <Edit className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent className='h-[150px] w-[1000px] p-0'>
            <iframe
              src='https://app.powerbi.com/view?r=eyJrIjoiYTRhODU3OTctMGY2Yi00OGYwLTg3MzQtYWVjNDExM2QyMzAwIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
              className='h-full w-full rounded-b-lg'
              frameBorder='0'
              allowFullScreen={true}
              title='Patient Demographics - Age Distribution'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Programmation Cancelled
            </CardTitle>
            <X className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent className='h-[150px] w-[1000px] p-0'>
            <iframe
              src='https://app.powerbi.com/view?r=eyJrIjoiZTIyNGQ0MjgtY2NjYi00Y2I4LTlkYWYtYjQ4OTJmOTJmN2EyIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
              className='h-full w-full rounded-b-lg'
              frameBorder='0'
              allowFullScreen={true}
              title='Patient Demographics - Age Distribution'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Steps Modified
            </CardTitle>
            <Activity className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent className='h-[150px] w-[1000px] p-0'>
            <iframe
              src='https://app.powerbi.com/view?r=eyJrIjoiYmVmNDNhOGUtOGMxNi00MWViLTkwYWQtMmQ2MmU1MjEzYzYwIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
              className='h-full w-full rounded-b-lg'
              frameBorder='0'
              allowFullScreen={true}
              title='Patient Demographics - Age Distribution'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Patient Count</CardTitle>
            <Users className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent className='h-[150px] w-[1000px] p-0'>
            <iframe
              src='https://app.powerbi.com/view?r=eyJrIjoiMTJlNzMyNGYtY2Y1OC00ZDE4LThlMDctZjVhZTkwOWExNGNmIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
              className='h-full w-full rounded-b-lg'
              frameBorder='0'
              allowFullScreen={true}
              title='Patient Demographics - Age Distribution'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Doctors Count</CardTitle>
            <Stethoscope className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent className='h-[150px] w-[1000px] p-0'>
            <iframe
              src='https://app.powerbi.com/view?r=eyJrIjoiMGYyMDA5ZTktYjljZC00NjEwLTg5NmQtZDVlM2EyZmVjZmEyIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
              className='h-full w-full rounded-b-lg'
              frameBorder='0'
              allowFullScreen={true}
              title='Patient Demographics - Age Distribution'
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='programmation' className='space-y-4'>
        <TabsList className='bg-blue-100'>
          <TabsTrigger value='programmation'>
            Programmation Analytics
          </TabsTrigger>
          <TabsTrigger value='patients'>Patient Analytics</TabsTrigger>
          <TabsTrigger value='doctors'>Doctor Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='programmation' className='space-y-4'>
          {/* First Row */}
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Programmation by Accommodation</CardTitle>
                <CardDescription>
                  Total programmation created by accommodation label (Donut
                  Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[500px] w-[1300px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiY2M2YmRhYjYtMzgxMC00ZTg0LWE5OWItZWUzNmM4MGUxYzRjIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programmation by Status</CardTitle>
                <CardDescription>
                  Total programmation created by status label (Pie Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[500px] w-[1500px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiZDk0NDUxYzAtMmJlNi00MDQ1LTlhODMtM2ZhOTQ2M2ExYTY0IiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>
          </div>

          {/* Second Row */}
          <div className='grid gap-4 md:grid-cols-5'>
            <Card className='md:col-span-3'>
              <CardHeader>
                <CardTitle>Programmation Timeline</CardTitle>
                <CardDescription>
                  Total programmation created by Year, Quarter, Month, Day
                  (Ribbon Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[500px] w-[1300] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiNmFmNjhhNGQtMmMxNi00MDczLWJiZWUtNGYwZTkxOTc5Y2NjIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>

            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle>Programmation Summary</CardTitle>
                <CardDescription>
                  Created, Modified, Cancelled (Grouped Bar Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[500px] w-[1300px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiNjI1NjkwNzMtNjdmMi00MjJhLThiMGItYTU2NDkzZmM1YTk2IiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>
          </div>

          {/* Third Row */}
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Steps & Programmation Modifications</CardTitle>
                <CardDescription>
                  Line and Grouped Bar Chart by timeline
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[600px] w-[1300px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiOTI1OTIwYzUtNWYzNC00MjY3LWFhY2MtOGFlYjk1OGVmNDg1IiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>100% Stacked Area Chart</CardTitle>
                <CardDescription>
                  Steps modified and programmation modified by timeline
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[600px] w-[1300px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiYmFhZDk3ZWEtYjk2ZC00OTFlLTllMDUtZjk4NDNmMWE1MDViIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>
          </div>

          {/* Fourth Row */}
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Programmation Funnel</CardTitle>
                <CardDescription>
                  Cancelled, Created, Modified (Funnel Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[500px] w-[1300px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiYmRjMDNlNjMtNTIxNC00Nzc3LWE4MTMtZjdiMTUzZWJlNjZjIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programmation Distribution</CardTitle>
                <CardDescription>
                  Cancelled, Created, Modified (Pie Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[500px] w-[1300px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiOWJiMDI2MGItYzM2YS00MWUwLTliZmUtNDBiNzFiMDczYmJlIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Programmation Data Table</CardTitle>
              <CardDescription>
                Detailed programmation statistics
              </CardDescription>
            </CardHeader>
            <CardContent className='flex h-[900px] items-center justify-center'>
              <iframe
                src='https://app.powerbi.com/view?r=eyJrIjoiODIzYmU5NzctMDJjYy00MDA5LTljMmQtYTU3ODhkYTYyYTFhIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                className='h-full w-full rounded-b-lg'
                frameBorder='0'
                allowFullScreen={true}
                title='Patient Demographics - Age Distribution'
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='patients' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle>Patient Count by Action</CardTitle>
                <CardDescription>
                  Recorded patient count by action name (Stacked Bar Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[650px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiMTBlMDk2N2YtYmUyZi00MzQ0LThlYzUtNmQxNWMwMTBiYjQwIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>

            <Card className='md:col-span-1'>
              <CardHeader>
                <CardTitle>Patient Data Table</CardTitle>
                <CardDescription>
                  Detailed patient analytics data
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[650px] w-[1150px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiZDI3YWFkMjQtZmQ1OC00MjZmLWIxYjQtMDVjY2U0NTY0ZmI4IiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='doctors' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card className='md:col-span-1'>
              <CardHeader>
                <CardTitle>Doctor Data Table</CardTitle>
                <CardDescription>Detailed doctor statistics</CardDescription>
              </CardHeader>
              <CardContent className='h-[700px] w-[1400px] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiY2FkYjYxMGYtY2RkNy00ODQyLWE2MWEtOTNlN2E1ZTk3ZTRlIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>

            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle>Doctor Count by Specialty</CardTitle>
                <CardDescription>
                  Recorded doctor count by specialty name (Area Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[700px] w-[full] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiMzI0YzNiOTctNzUzZS00NjY5LTk1OTctMWYwOTU4NWVlNDgxIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle>Specialty Distribution</CardTitle>
                <CardDescription>
                  Doctor count by specialty (Stacked Bar Chart)
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[700px] w-[full] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiNDQwYjYyMzAtYjNiMi00MjRmLThkM2QtYmNhNmRlOWM4MTNiIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>

            <Card className='md:col-span-1'>
              <CardHeader>
                <CardTitle>Doctor Analytics Table</CardTitle>
                <CardDescription>
                  Comprehensive doctor data table
                </CardDescription>
              </CardHeader>
              <CardContent className='h-[700px] w-[1300] p-0'>
                <iframe
                  src='https://app.powerbi.com/view?r=eyJrIjoiMGE4YTZkNTMtNGZmZC00OGY3LTgwNjEtY2U5ZGUzYzliZDJmIiwidCI6ImZkY2M5YWVhLTlmMjItNDI4YS04ZTQ3LWQxNzE3MDRkZGFmZSJ9'
                  className='h-full w-full rounded-b-lg'
                  frameBorder='0'
                  allowFullScreen={true}
                  title='Patient Demographics - Age Distribution'
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
