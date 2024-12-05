import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser } from '@/lib/admin';
import { getCurrentUser } from '@/lib/auth';
import { UserList } from '@/components/admin/UserList';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminTransactionList } from '@/components/admin/AdminTransactionList';
import { getAllTransactions } from '@/lib/transactions';
import { formatCurrency } from '@/lib/utils';
import type { User } from '@/types/user';
import type { Transaction } from '@/types/transaction';

export function AdminPage() {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }

      const currentUser = await getCurrentUser(userId);
      if (!currentUser || currentUser.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      // Load users
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setStats({ totalUsers: fetchedUsers.length });
    };

    checkAdminAccess();
  }, [navigate]);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their transactions.')) {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      
      if (selectedUser === userId) {
        setSelectedUser(null);
        setUserTransactions([]);
      }
    }
  };

  const handleUserSelect = async (userId: string) => {
    setSelectedUser(userId);
    const transactions = await getAllTransactions();
    const userTxns = transactions.filter(t => t.userId === userId);
    setUserTransactions(userTxns);
  };

  const selectedUserDetails = selectedUser ? users.find(u => u.id === selectedUser) : null;

  const calculateUserStats = () => {
    if (!userTransactions.length) return null;

    const totalIncome = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const incomeCategories = userTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const expenseCategories = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalTransactions: userTransactions.length,
      totalIncome,
      totalExpenses,
      balance,
      incomeCategories,
      expenseCategories,
    };
  };

  const userStats = selectedUserDetails ? calculateUserStats() : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            Logout
          </button>
        </div>

        <div className="space-y-8">
          <AdminStats stats={stats} />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                User Management
              </h2>
            </div>
            <UserList
              users={users}
              onDeleteUser={handleDeleteUser}
              onSelectUser={handleUserSelect}
              selectedUserId={selectedUser}
            />
          </div>

          {selectedUser && selectedUserDetails && userStats && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Financial Summary for {selectedUserDetails.name}
                  </h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {userStats.totalTransactions}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">Total Income</p>
                      <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                        {formatCurrency(userStats.totalIncome)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">Total Expenses</p>
                      <p className="text-xl font-semibold text-red-700 dark:text-red-300">
                        {formatCurrency(userStats.totalExpenses)}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Current Balance</p>
                      <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                        {formatCurrency(userStats.balance)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Transaction History
                  </h2>
                </div>
                <AdminTransactionList
                  transactions={userTransactions}
                  users={users}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}