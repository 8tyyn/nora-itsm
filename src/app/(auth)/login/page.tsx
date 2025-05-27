'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Github, Loader2, HeartPulse } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserService } from '@/services/UserService';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  rememberMe: z.boolean().default(false)
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    const result = await UserService.login(values.email, values.password);
    if (result != null) {
      router.push('/dashboard');
    } else {
      toast.error('Cannot login , error occured');
    }
    setIsLoading(false);
  }

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
          Sign in to your account to continue
        </p>
      </div>

      <Card className='border-blue-800/30 bg-blue-900/10 backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-white'>Sign In</CardTitle>
          <CardDescription className='text-gray-300'>
            Enter your email and password to access your account
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
                    <FormMessage className='text-red-300' />
                  </FormItem>
                )}
              />
              <div className='flex items-center justify-between'>
                <FormField
                  control={form.control}
                  name='rememberMe'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center space-y-0 space-x-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className='border-blue-800/50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500'
                        />
                      </FormControl>
                      <FormLabel className='text-sm font-normal text-gray-300'>
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Link
                  href='/auth/forgot-password'
                  className='text-sm font-medium text-blue-400 hover:text-blue-300'
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type='submit'
                className='w-full bg-blue-600 text-white hover:bg-blue-700'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
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

          <div className='grid grid-cols-1 gap-2'>
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
              <Github className='mr-2 h-4 w-4' />
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-sm text-gray-400'>
            Don&apos;t have an account?{' '}
            <Link
              href='../signup'
              className='font-medium text-blue-400 hover:text-blue-300'
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
