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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function SettingsPage() {
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>

      <Tabs defaultValue='account' className='w-full'>
        <TabsList className='w-full justify-start'>
          <TabsTrigger value='account'>Account</TabsTrigger>
          <TabsTrigger value='appearance'>Appearance</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='powerbi'>PowerBI Integration</TabsTrigger>
        </TabsList>

        <TabsContent value='account' className='mt-4 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input id='name' defaultValue='John Doe' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' defaultValue='john.doe@example.com' />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='bio'>Bio</Label>
                <Input
                  id='bio'
                  defaultValue='Healthcare administrator with 5+ years of experience'
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='current-password'>Current Password</Label>
                <Input id='current-password' type='password' />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='new-password'>New Password</Label>
                  <Input id='new-password' type='password' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirm-password'>Confirm Password</Label>
                  <Input id='confirm-password' type='password' />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                Change Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value='appearance' className='mt-4 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='theme'>Theme</Label>
                <Select defaultValue='system'>
                  <SelectTrigger
                    id='theme'
                    className='border-blue-200 focus:ring-blue-500'
                  >
                    <SelectValue placeholder='Select theme' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='light'>Light</SelectItem>
                    <SelectItem value='dark'>Dark</SelectItem>
                    <SelectItem value='system'>System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='dense-mode'>Dense Mode</Label>
                  <p className='text-muted-foreground text-sm'>
                    Compact UI elements for more content on screen
                  </p>
                </div>
                <Switch id='dense-mode' />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='animations'>Animations</Label>
                  <p className='text-muted-foreground text-sm'>
                    Enable animations and transitions
                  </p>
                </div>
                <Switch id='animations' defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='mt-4 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='email-notifications'>
                    Email Notifications
                  </Label>
                  <p className='text-muted-foreground text-sm'>
                    Receive notifications via email
                  </p>
                </div>
                <Switch id='email-notifications' defaultChecked />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='browser-notifications'>
                    Browser Notifications
                  </Label>
                  <p className='text-muted-foreground text-sm'>
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch id='browser-notifications' defaultChecked />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='appointment-reminders'>
                    Appointment Reminders
                  </Label>
                  <p className='text-muted-foreground text-sm'>
                    Get reminders about upcoming appointments
                  </p>
                </div>
                <Switch id='appointment-reminders' defaultChecked />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='system-updates'>System Updates</Label>
                  <p className='text-muted-foreground text-sm'>
                    Get notified about system updates and maintenance
                  </p>
                </div>
                <Switch id='system-updates' />
              </div>
            </CardContent>
            <CardFooter>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value='powerbi' className='mt-4 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>PowerBI Integration</CardTitle>
              <CardDescription>
                Configure your PowerBI connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='powerbi-workspace'>PowerBI Workspace ID</Label>
                <Input
                  id='powerbi-workspace'
                  placeholder='Enter your PowerBI workspace ID'
                  className='border-blue-200 focus:ring-blue-500'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='powerbi-api-key'>API Key</Label>
                <Input
                  id='powerbi-api-key'
                  type='password'
                  placeholder='Enter your PowerBI API key'
                  className='border-blue-200 focus:ring-blue-500'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='powerbi-refresh-interval'>
                  Data Refresh Interval
                </Label>
                <Select defaultValue='30'>
                  <SelectTrigger
                    id='powerbi-refresh-interval'
                    className='border-blue-200 focus:ring-blue-500'
                  >
                    <SelectValue placeholder='Select refresh interval' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='15'>Every 15 minutes</SelectItem>
                    <SelectItem value='30'>Every 30 minutes</SelectItem>
                    <SelectItem value='60'>Every hour</SelectItem>
                    <SelectItem value='daily'>Once a day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='powerbi-auto-refresh'>Auto Refresh</Label>
                  <p className='text-muted-foreground text-sm'>
                    Automatically refresh PowerBI data
                  </p>
                </div>
                <Switch id='powerbi-auto-refresh' defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                Save PowerBI Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embedded Reports</CardTitle>
              <CardDescription>
                Manage which PowerBI reports are embedded in the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <p className='font-medium'>Patient Analytics Dashboard</p>
                    <p className='text-muted-foreground text-sm'>
                      Main dashboard for patient statistics
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <p className='font-medium'>Financial Reports</p>
                    <p className='text-muted-foreground text-sm'>
                      Revenue and expense tracking
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <p className='font-medium'>Staff Performance</p>
                    <p className='text-muted-foreground text-sm'>
                      Metrics for staff productivity
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <p className='font-medium'>Appointment Analytics</p>
                    <p className='text-muted-foreground text-sm'>
                      Appointment trends and statistics
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className='bg-blue-600 hover:bg-blue-700'>
                Update Report Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
