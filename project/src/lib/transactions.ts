import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import type { Transaction } from '@/types/transaction';

export async function createTransaction(
  userId: string,
  type: 'income' | 'expense',
  amount: number,
  description: string,
  category: string,
  date: string
) {
  const db = await getDb();
  const id = uuidv4();
  
  const transaction: Transaction = {
    id,
    userId,
    type,
    amount,
    description,
    category,
    date,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.add('transactions', transaction);
  return transaction;
}

export async function getTransactions(userId: string) {
  const db = await getDb();
  const tx = db.transaction('transactions', 'readonly');
  const index = tx.store.index('by-user');
  return index.getAll(userId);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  return db.getAll('transactions');
}

export async function updateTransaction(
  id: string,
  type: 'income' | 'expense',
  amount: number,
  description: string,
  category: string,
  date: string
) {
  const db = await getDb();
  const transaction = await db.get('transactions', id);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const updatedTransaction = {
    ...transaction,
    type,
    amount,
    description,
    category,
    date,
    updatedAt: new Date().toISOString(),
  };

  await db.put('transactions', updatedTransaction);
  return updatedTransaction;
}

export async function deleteTransaction(id: string) {
  const db = await getDb();
  await db.delete('transactions', id);
}

export async function getTransactionStats(userId: string) {
  const transactions = await getTransactions(userId);

  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.income += t.amount;
      } else {
        acc.expense += t.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return {
    totalIncome: totals.income,
    totalExpenses: totals.expense,
    savings: totals.income - totals.expense,
  };
}