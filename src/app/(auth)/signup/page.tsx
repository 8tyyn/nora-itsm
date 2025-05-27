'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, HeartPulse } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { UserService } from '@/services/UserService'; // Import the UserService

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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter'
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter'
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  role: z.string({ required_error: 'Please select a role' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  address: z
    .string()
    .min(5, { message: 'Address must be at least 5 characters' }),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions'
  })
});

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: '',
      phone: '',
      address: '',
      terms: false
    }
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  // Watch password field to calculate strength
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'password' && value.password) {
        calculatePasswordStrength(value.password as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    // Map role values from the form to the backend expected values
    const roleMapping: Record<string, string> = {
      user: 'User',
      doctor: 'Doctor'
    };

    // Create registration payload based on form values
    const registrationData = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      role: roleMapping[values.role] || values.role, // Map the role or use as is
      phone: values.phone,
      address: values.address,
      status: 'Pending', // Default status
      dateJoined: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    try {
      // Call the register method from UserService
      const result = await UserService.register(registrationData);
      setIsLoading(false);

      // Show success message or redirect to login
      console.log('Registration successful:', result);
      router.push('/login');
    } catch (err: any) {
      setIsLoading(false);
      // Display error message
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-yellow-500';
    if (passwordStrength <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className='w-full max-w-md'>
      <div className='mb-8 flex flex-col items-center text-center'>
        <div className='mb-4 rounded-full bg-blue-500/20 p-3 backdrop-blur-sm'>
          <HeartPulse className='h-6 w-6 text-blue-400' />
        </div>
        <h1 className='text-2xl font-bold tracking-tight text-white'>
          Healthcare Admin
        </h1>
        <p className='text-sm text-gray-300'>
          Create an account to get started
        </p>
      </div>

      <Card className='border-blue-800/30 bg-blue-900/10 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-white'>Sign Up</CardTitle>
          <CardDescription className='text-gray-300'>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert
              variant='destructive'
              className='mb-4 border-red-800/30 bg-red-900/20 text-red-200'
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-200'>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
                        {...field}
                        className='border-blue-800/50 bg-blue-900/20 text-white placeholder:text-gray-500 focus:border-blue-600'
                      />
                    </FormControl>
                    <FormMessage className='text-red-300' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-200'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='name@example.com'
                        {...field}
                        className='border-blue-800/50 bg-blue-900/20 text-white placeholder:text-gray-500 focus:border-blue-600'
                      />
                    </FormControl>
                    <FormMessage className='text-red-300' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-200'>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='border-blue-800/50 bg-blue-900/20 text-white focus:border-blue-600'>
                          <SelectValue
                            placeholder='Select your role'
                            className='text-gray-400'
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='border-blue-800/50 bg-blue-900'>
                        <SelectItem
                          value='user'
                          className='text-white focus:bg-blue-800 focus:text-white'
                        >
                          User
                        </SelectItem>
                        <SelectItem
                          value='doctor'
                          className='text-white focus:bg-blue-800 focus:text-white'
                        >
                          Doctor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className='text-red-300' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-200'>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+1234567890'
                        {...field}
                        className='border-blue-800/50 bg-blue-900/20 text-white placeholder:text-gray-500 focus:border-blue-600'
                      />
                    </FormControl>
                    <FormMessage className='text-red-300' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-200'>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='123 Health St, Wellness City'
                        {...field}
                        className='border-blue-800/50 bg-blue-900/20 text-white placeholder:text-gray-500 focus:border-blue-600'
                      />
                    </FormControl>
                    <FormMessage className='text-red-300' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-200'>Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          {...field}
                          className='border-blue-800/50 bg-blue-900/20 pr-10 text-white placeholder:text-gray-500 focus:border-blue-600'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute top-0 right-0 h-full px-3 py-2 text-gray-400 hover:text-gray-200'
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                          <span className='sr-only'>
                            {showPassword ? 'Hide password' : 'Show password'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    {field.value && (
                      <div className='mt-2 space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-400'>
                            Password strength: {getPasswordStrengthText()}
                          </span>
                        </div>
                      </div>
                    )}
                    <FormMessage className='text-red-300' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='terms'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border border-blue-800/30 bg-blue-900/20 p-4'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='border-blue-800/50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500'
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel className='text-gray-200'>
                        Accept terms and conditions
                      </FormLabel>
                      <FormDescription className='text-xs text-gray-400'>
                        By creating an account, you agree to our{' '}
                        <Link
                          href='#'
                          className='text-blue-400 underline hover:text-blue-300'
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href='#'
                          className='text-blue-400 underline hover:text-blue-300'
                        >
                          Privacy Policy
                        </Link>
                        .
                      </FormDescription>
                    </div>
                    <FormMessage className='text-red-300' />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full bg-blue-600 text-white hover:bg-blue-700'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <Separator className='w-full bg-blue-800/50' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='rounded bg-blue-900/30 px-2 text-gray-400'>
                Or continue with
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              className='border-blue-800/50 bg-blue-900/20 text-gray-200 hover:bg-blue-800/30'
            >
              <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
                <path d='M1 1h22v22H1z' fill='none' />
              </svg>
              Google
            </Button>
            <Button
              variant='outline'
              className='border-blue-800/50 bg-blue-900/20 text-gray-200 hover:bg-blue-800/30'
            >
              <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                <path
                  d='M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z'
                  fill='currentColor'
                />
              </svg>
              Apple
            </Button>
          </div>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-sm text-gray-400'>
            Already have an account?{' '}
            <Link
              href='../login'
              className='font-medium text-blue-400 hover:text-blue-300'
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
