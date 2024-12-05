import { getDb } from './db';
import type { User } from '@/types/user';

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const db = await getDb();
  const users = await db.getAll('users');
  return users
    .filter(user => user.role !== 'admin') // Don't show admin in the list
    .map(({ password: _, ...user }) => user);
}

export async function deleteUser(userId: string): Promise<void> {
  const db = await getDb();
  
  // Check if user exists and is not admin
  const user = await db.get('users', userId);
  if (!user || user.role === 'admin') {
    throw new Error('Cannot delete this user');
  }

  // Delete user and their transactions
  await db.delete('users', userId);
  const tx = db.transaction('transactions', 'readwrite');
  const index = tx.store.index('by-user');
  const userTransactions = await index.getAllKeys(userId);
  await Promise.all(userTransactions.map(id => tx.store.delete(id)));
  await tx.done;
}