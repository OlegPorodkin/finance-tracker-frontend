import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { register as registerUser } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { registerSchema } from '@/lib/validators';
import { isApiError } from '@/types';
import { CURRENCY_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type RegisterForm = z.infer<typeof registerSchema>;

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /\p{Lu}/u.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /\p{Ll}/u.test(p) },
  { label: 'Digit (0–9)', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character (!@#…)', test: (p: string) => /[^\p{L}\p{N}]/u.test(p) },
];

function getStrengthColor(met: number) {
  if (met <= 1) return 'bg-red-500';
  if (met <= 3) return 'bg-amber-500';
  if (met === 4) return 'bg-blue-500';
  return 'bg-green-500';
}

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    register,
    control,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema), defaultValues: { currency: 'USD' } });

  const [showPassword, setShowPassword] = useState(false);
  const password = watch('password') ?? '';
  const requirements = PASSWORD_REQUIREMENTS.map((r) => ({ ...r, met: r.test(password) }));
  const metCount = requirements.filter((r) => r.met).length;
  const strengthColor = getStrengthColor(metCount);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  async function onSubmit(data: RegisterForm) {
    try {
      const user = await registerUser(data);
      setUser(user);
      navigate('/', { replace: true });
    } catch (err) {
      if (isApiError(err) && err.errors) {
        err.errors.forEach(({ field, message }) =>
          setError(field as keyof RegisterForm, { message })
        );
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                autoComplete="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {requirements.map((req, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-colors duration-300',
                          req.met ? strengthColor : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                  <ul className="space-y-0.5">
                    {requirements.map((req, i) => (
                      <li
                        key={i}
                        className={cn(
                          'flex items-center gap-1.5 text-xs transition-colors',
                          req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                        )}
                      >
                        {req.met ? <Check size={11} /> : <X size={11} />}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
