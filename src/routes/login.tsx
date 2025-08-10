import { zodResolver } from '@hookform/resolvers/zod';
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { Download, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: Login,
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: '/login' }) as unknown as {
    redirect: string;
  };
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();

    try {
      await login(data);
      await navigate({ to: redirect ? redirect : '/torrents' });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(errorMessage);
      // Error is handled by the store
    }
  };

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='space-y-2 text-center'>
          <div className='flex items-center justify-center space-x-2'>
            <Download className='text-primary h-8 w-8' />
            <h1 className='text-2xl font-bold'>qBittorrent</h1>
          </div>
          <p className='text-muted-foreground'>
            Sign in to access the web interface
          </p>
        </div>

        {(import.meta.env.MODE === 'demo' ||
          (import.meta.env.DEV &&
            import.meta.env.VITE_USE_MOCK_PROVIDER === 'true')) && (
          <Alert variant='destructive'>
            <AlertTitle>Demo Mode</AlertTitle>
            <AlertDescription>
              This is a demo version using mock data. It shows how the interface
              will look, but is not connected to a real qBittorrent instance.
              <p>Use anything for credentials to login</p>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='Enter username'
                  {...register('username')}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className='text-destructive text-sm'>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter password'
                    {...register('password')}
                    className={
                      errors.password ? 'border-destructive pr-10' : 'pr-10'
                    }
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className='text-destructive text-sm'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className='text-muted-foreground text-center text-sm'>
          <p>Enter your qBittorrent WebUI credentials</p>
          <p className='mt-1'>
            Configure authentication in qBittorrent settings
          </p>
        </div>
      </div>
    </div>
  );
}
