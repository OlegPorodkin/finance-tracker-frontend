import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Category } from '@/types';
import { categorySchema } from '@/lib/validators';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants';
import { isApiError } from '@/types';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
}

export function CategoryModal({ open, category, onClose, onSubmit }: CategoryModalProps) {
  const isDefault = category?.isDefault ?? false;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', type: 'EXPENSE', color: CATEGORY_COLORS[0], icon: CATEGORY_ICONS[0] },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  useEffect(() => {
    if (category) {
      reset({ name: category.name, type: category.type, color: category.color, icon: category.icon });
    } else {
      reset({ name: '', type: 'EXPENSE', color: CATEGORY_COLORS[0], icon: CATEGORY_ICONS[0] });
    }
  }, [category, open, reset]);

  async function handleFormSubmit(data: FormValues) {
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      if (isApiError(err) && err.errors) {
        err.errors.forEach(({ field, message }) =>
          setError(field as keyof FormValues, { message })
        );
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit category' : 'Add category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Category name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isDefault}>
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

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        'h-7 w-7 rounded-full transition-transform hover:scale-110',
                        field.value === color && 'ring-2 ring-offset-2 ring-foreground scale-110'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => field.onChange(color)}
                    />
                  ))}
                  <input
                    type="color"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    title="Custom color"
                  />
                </div>
              )}
            />
            {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div className="grid grid-cols-8 gap-1.5 rounded-md border p-2">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      title={icon}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent',
                        field.value === icon && 'bg-accent ring-1 ring-ring'
                      )}
                      onClick={() => field.onChange(icon)}
                    >
                      <CategoryIcon iconName={icon} color={selectedColor} size={18} />
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-md border p-3">
            <CategoryIcon iconName={selectedIcon} color={selectedColor} size={20} />
            <span className="text-sm font-medium">
              {watch('name') || 'Category name'}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : category ? 'Save changes' : 'Add category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
