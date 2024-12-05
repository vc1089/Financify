import { SHA256 } from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db';
import type { User } from '@/types/user';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'password',
};

export async function initializeAdmin() {
  const db = await getDb();
  const adminExists = await db.transaction('users', 'readonly')
    .store.index('by-email')
    .get(ADMIN_CREDENTIALS.email);

  if (!adminExists) {
    const hashedPassword = SHA256(ADMIN_CREDENTIALS.password).toString();
    const admin: User = {
      id: uuidv4(),
      name: 'Admin',
      email: ADMIN_CREDENTIALS.email,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.add('users', admin);
  }
}

export async function createUser(name: string, email: string, password: string) {
  const db = await getDb();
  const hashedPassword = SHA256(password).toString();
  const id = uuidv4();
  
  const user: User = {
    id,
    name,
    email,
    password: hashedPassword,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.add('users', user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error.name === 'ConstraintError') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function verifyUser(email: string, password: string) {
  const db = await getDb();
  const hashedPassword = SHA256(password).toString();

  // Special handling for admin login
  if (email === ADMIN_CREDENTIALS.email) {
    const adminUser = await db.transaction('users', 'readonly')
      .store.index('by-email')
      .get(ADMIN_CREDENTIALS.email);

    if (adminUser && adminUser.password === hashedPassword && adminUser.role === 'admin') {
      const { password: _, ...adminWithoutPassword } = adminUser;
      return adminWithoutPassword;
    }
    return null;
  }

  // Regular user login
  const tx = db.transaction('users', 'readonly');
  const index = tx.store.index('by-email');
  const user = await index.get(email);

  if (!user || user.password !== hashedPassword) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getCurrentUser(userId: string) {
  if (!userId) return null;

  const db = await getDb();
  const user = await db.get('users', userId);
  
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUser(userId: string, currentPassword: string, updates: Partial<User>) {
  const db = await getDb();
  const user = await db.get('users', userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const hashedCurrentPassword = SHA256(currentPassword).toString();
  if (user.password !== hashedCurrentPassword) {
    throw new Error('Current password is incorrect');
  }

  // If new password is provided, hash it
  const updatedUser = {
    ...user,
    ...updates,
    password: updates.password ? SHA256(updates.password).toString() : user.password,
    updatedAt: new Date().toISOString(),
  };

  await db.put('users', updatedUser);
  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}