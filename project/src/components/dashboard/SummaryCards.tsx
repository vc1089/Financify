import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
}

export function SummaryCards({ totalIncome, totalExpenses, savings }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <ArrowUpCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <ArrowDownCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Savings</p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(savings)}
            </p>
          </div>
          <PiggyBank className="h-8 w-8 text-blue-500 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );
}