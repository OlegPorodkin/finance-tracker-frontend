import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { updateMe, logout } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { settingsSchema } from '@/lib/validators';
import { CURRENCY_OPTIONS } from '@/lib/constants';
import { isApiError } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type FormValues = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logoutStore = useAuthStore((s) => s.logout);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: '', currency: 'USD' },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, currency: user.currency });
    }
  }, [user, reset]);

  async function onSubmit(data: FormValues) {
    try {
      const updated = await updateMe(data);
      setUser(updated);
      reset({ name: updated.name, currency: updated.currency });
      toast.success('Settings saved');
    } catch (err) {
      if (isApiError(err) && err.errors) {
        err.errors.forEach(({ field, message }) =>
          setError(field as keyof FormValues, { message })
        );
      }
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      logoutStore();
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Profile form */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Profile
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
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
            <p className="text-xs text-muted-foreground">
              Changing currency affects how all amounts are displayed.
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </section>

      <Separator />

      {/* Danger zone */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Account
        </h2>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Log out</p>
            <p className="text-xs text-muted-foreground">Sign out of your account on this device.</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut size={15} />
            Log out
          </Button>
        </div>
      </section>
    </div>
  );
}
