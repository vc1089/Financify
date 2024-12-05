import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const transactionSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  }),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  initialData?: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: string;
    date: string;
  } | null;
  onCancel?: () => void;
}

const CATEGORIES = {
  income: [
    'Salary',
    'Business Income',
    'Investments (Dividends, Interest)',
    'Freelancing/Side Hustles',
    'Bonuses'
  ],
  expense: [
    'Housing (Rent, Mortgage, Utilities)',
    'Food & Dining (Groceries, Restaurants)',
    'Transportation (Fuel, Public Transport)',
    'Shopping (Clothing, Electronics, Personal Care)',
    'Entertainment (Subscriptions, Events, Leisure Activities)'
  ]
};

export function TransactionForm({ onSubmit, initialData, onCancel }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData
      ? {
          type: initialData.type,
          amount: String(initialData.amount),
          description: initialData.description,
          category: initialData.category,
          date: new Date(initialData.date).toISOString().split('T')[0],
        }
      : {
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          category: '',
        },
  });

  const currentType = watch('type');

  useEffect(() => {
    if (!initialData) {
      setValue('category', '');
    }
  }, [currentType, setValue, initialData]);

  const onSubmitForm = async (data: TransactionFormData) => {
    await onSubmit(data);
    if (!initialData) {
      reset({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Transaction Type
        </label>
        <select
          {...register('type')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        {errors.type && (
          <span className="text-sm text-red-500 dark:text-red-400">{errors.type.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date
        </label>
        <Input
          type="date"
          {...register('date')}
          error={errors.date?.message}
          className="dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount
        </label>
        <Input
          type="number"
          step="0.01"
          {...register('amount')}
          error={errors.amount?.message}
          className="dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <Input
          type="text"
          {...register('description')}
          error={errors.description?.message}
          className="dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          {...register('category')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Select a category</option>
          {CATEGORIES[currentType].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <span className="text-sm text-red-500 dark:text-red-400">{errors.category.message}</span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
        </Button>
        {initialData && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}