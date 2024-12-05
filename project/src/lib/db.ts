import { openDB, DBSchema } from 'idb';
import type { User } from '@/types/user';
import type { Transaction } from '@/types/transaction';

interface FinanceDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-user': string };
  };
}

const dbPromise = openDB<FinanceDB>('finance-db', 1, {
  upgrade(db) {
    const userStore = db.createObjectStore('users', { keyPath: 'id' });
    userStore.createIndex('by-email', 'email', { unique: true });

    const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
    transactionStore.createIndex('by-user', 'userId');
  },
});

export async function getDb() {
  return dbPromise;
}