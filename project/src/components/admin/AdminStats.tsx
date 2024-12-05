import React from 'react';
import { Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.totalUsers}
            </p>
          </div>
          <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );
}