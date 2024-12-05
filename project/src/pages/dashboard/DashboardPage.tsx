import React, { useState, useEffect } from 'react';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TransactionForm } from '@/components/dashboard/TransactionForm';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { TransactionCharts } from '@/components/dashboard/TransactionCharts';
import { ChatBot } from '@/components/dashboard/ChatBot';
import { SettingsButton } from '@/components/dashboard/SettingsButton';
import { ImportExportButtons } from '@/components/dashboard/ImportExportButtons';
import { createTransaction, getTransactions, updateTransaction, deleteTransaction } from '@/lib/transactions';
import type { Transaction } from '@/types/transaction';
import { useNavigate } from 'react-router-dom';

interface DashboardPageProps {
  isDarkMode: boolean;
  onThemeChange: () => void;
}

export function DashboardPage({ isDarkMode, onThemeChange }: DashboardPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    // Load transactions when component mounts
    const loadTransactions = async () => {
      try {
        const userTransactions = await getTransactions(userId);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    };

    loadTransactions();
  }, [userId, navigate]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpenses;

  const handleAddTransaction = async (data: any) => {
    if (!userId) return;

    try {
      const newTransaction = await createTransaction(
        userId,
        data.type,
        Number(data.amount),
        data.description,
        data.category,
        data.date
      );

      setTransactions((prev) => [newTransaction, ...prev]);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdateTransaction = async (data: any) => {
    if (!editingTransaction) return;

    try {
      const updated = await updateTransaction(
        editingTransaction.id,
        data.type,
        Number(data.amount),
        data.description,
        data.category,
        data.date
      );

      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setEditingTransaction(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleImportTransactions = async (importedTransactions: Transaction[]) => {
    if (!userId) return;

    try {
      const newTransactions = await Promise.all(
        importedTransactions.map((t) =>
          createTransaction(
            userId,
            t.type,
            t.amount,
            t.description,
            t.category,
            t.date
          )
        )
      );

      setTransactions((prev) => [...newTransactions, ...prev]);
    } catch (error) {
      console.error('Failed to import transactions:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Financify
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track your income, expenses, and savings in one place.
            </p>
          </div>

          <SummaryCards
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            savings={savings}
          />

          <TransactionCharts transactions={transactions} />

          <div className="flex justify-end">
            <ImportExportButtons
              transactions={transactions}
              onImport={handleImportTransactions}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <TransactionForm
                  onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                  initialData={editingTransaction}
                  onCancel={() => setEditingTransaction(null)}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <TransactionList
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </div>
          </div>
        </div>
      </div>
      
      <ChatBot
        onTransactionAdded={(transaction) => {
          setTransactions((prev) => [transaction, ...prev]);
        }}
        onTransactionDeleted={(id) => {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
        }}
      />
      <SettingsButton onThemeChange={onThemeChange} isDarkMode={isDarkMode} />
    </div>
  );
}