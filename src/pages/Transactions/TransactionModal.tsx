import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import type { Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { isApiError } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z
    .string()
    .min(1, 'Required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be a positive number'),
  date: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  categoryId: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionModalProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSubmit: (data: Omit<FormValues, 'amount'> & { amountInCents: number }) => Promise<void>;
}

export function TransactionModal({ open, transaction, onClose, onSubmit }: TransactionModalProps) {
  const { active: activeCategories } = useCategories();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      description: '',
      categoryId: '',
      notes: '',
    },
  });

  const selectedType = useWatch({ control, name: 'type' });
  const filteredCategories = activeCategories.filter((c) => c.type === selectedType);

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: String(transaction.amountInCents / 100),
        date: transaction.date,
        description: transaction.description,
        categoryId: transaction.categoryId,
        notes: transaction.notes ?? '',
      });
    } else {
      reset({
        type: 'EXPENSE',
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        description: '',
        categoryId: '',
        notes: '',
      });
    }
  }, [transaction, open, reset]);

  // Reset category when type changes and current selection doesn't match new type
  useEffect(() => {
    const currentId = getValues('categoryId');
    if (currentId && !filteredCategories.some((c) => c.id === currentId)) {
      setValue('categoryId', '');
    }
  // filteredCategories is derived from selectedType — selectedType as dep is sufficient
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  async function handleFormSubmit(data: FormValues) {
    try {
      await onSubmit({
        type: data.type,
        amountInCents: Math.round(parseFloat(data.amount) * 100),
        date: data.date,
        description: data.description,
        categoryId: data.categoryId,
        notes: data.notes || undefined,
      });
      onClose();
    } catch (err) {
      if (isApiError(err) && err.errors) {
        err.errors.forEach(({ field, message }) => {
          const key = field === 'amountInCents' ? 'amount' : field;
          setError(key as keyof FormValues, { message });
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit transaction' : 'Add transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} modal={false}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} modal={false}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
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
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" {...register('amount')} />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="What was this for?" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" placeholder="Additional details" {...register('notes')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : transaction ? 'Save changes' : 'Add transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
