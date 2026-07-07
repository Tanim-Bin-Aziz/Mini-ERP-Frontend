import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from './auth.api';
import { useAppDispatch } from '@/hooks/useAuth';
import { setCredentials } from '@/store/authSlice';
import { getErrorMessage } from '@/lib/getErrorMessage';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
      navigate(from, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Invalid email or password'));
    },
  });

  const onSubmit = (values: LoginFormValues) => mutation.mutate(values);

  return (
    <AuthLayout>
      <div className="mb-6 lg:hidden">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand font-display text-sm font-bold text-white">
            M
          </div>
          <span className="font-display text-lg font-semibold">Mini ERP</span>
        </div>
      </div>

      <h2 className="font-display text-xl font-semibold text-ink">Sign in</h2>
      <p className="mt-1 text-sm text-ink-soft">Enter your credentials to access the console.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="mt-1 w-full" isLoading={mutation.isPending}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Access is provisioned by an administrator — contact your manager if you don't have credentials.
      </p>
    </AuthLayout>
  );
};
