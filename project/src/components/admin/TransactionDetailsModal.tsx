import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import type { Transaction } from '@/types/transaction';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
            <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
              {transaction.type}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
            <p className={`text-base font-medium ${
              transaction.type === 'income' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {transaction.description}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {transaction.category}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {format(new Date(transaction.date), 'PPpp')}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {format(new Date(transaction.createdAt), 'PPpp')}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {format(new Date(transaction.updatedAt), 'PPpp')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}