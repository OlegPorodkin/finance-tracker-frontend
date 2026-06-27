import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, startOfMonth } from 'date-fns';
import type { Budget } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { isApiError } from '@/types';
import { BUDGET_PERIODS } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  limit: z
    .string()
    .min(1, 'Required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be a positive number'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().min(1, 'Start date is required'),
  alertThreshold: z
    .string()
    .refine((v) => {
      const n = parseInt(v, 10);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, 'Must be 0–100'),
});

type FormValues = z.infer<typeof formSchema>;

interface BudgetModalProps {
  open: boolean;
  budget: Budget | null;
  onClose: () => void;
  onSubmit: (data: {
    categoryId: string;
    limitAmountInCents: number;
    period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    startDate: string;
    alertThreshold: number;
  }) => Promise<void>;
}

const PERIOD_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export function BudgetModal({ open, budget, onClose, onSubmit }: BudgetModalProps) {
  const { active: activeCategories } = useCategories();
  const expenseCategories = activeCategories.filter((c) => c.type === 'EXPENSE');

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: '',
      limit: '',
      period: 'MONTHLY',
      startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      alertThreshold: '80',
    },
  });

  useEffect(() => {
    if (budget) {
      reset({
        categoryId: budget.categoryId,
        limit: String(budget.limitAmountInCents / 100),
        period: budget.period,
        startDate: budget.startDate,
        alertThreshold: String(budget.alertThreshold),
      });
    } else {
      reset({
        categoryId: '',
        limit: '',
        period: 'MONTHLY',
        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        alertThreshold: '80',
      });
    }
  }, [budget, open, reset]);

  async function handleFormSubmit(data: FormValues) {
    try {
      await onSubmit({
        categoryId: data.categoryId,
        limitAmountInCents: Math.round(parseFloat(data.limit) * 100),
        period: data.period,
        startDate: data.startDate,
        alertThreshold: parseInt(data.alertThreshold, 10),
      });
      onClose();
    } catch (err) {
      if (isApiError(err) && err.errors) {
        err.errors.forEach(({ field, message }) => {
          const key = field === 'limitAmountInCents' ? 'limit' : field;
          setError(key as keyof FormValues, { message });
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit budget' : 'Add budget'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!!budget}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="limit">Limit</Label>
              <Input id="limit" type="number" step="0.01" min="0.01" placeholder="0.00" {...register('limit')} />
              {errors.limit && (
                <p className="text-sm text-destructive">{errors.limit.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Period</Label>
              <Controller
                control={control}
                name="period"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} modal={false}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_PERIODS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PERIOD_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Period start</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alertThreshold">Alert at (%)</Label>
              <Input
                id="alertThreshold"
                type="number"
                min="0"
                max="100"
                placeholder="80"
                {...register('alertThreshold')}
              />
              {errors.alertThreshold && (
                <p className="text-sm text-destructive">{errors.alertThreshold.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : budget ? 'Save changes' : 'Add budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
