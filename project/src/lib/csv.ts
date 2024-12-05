import { Transaction } from '@/types/transaction';
import { parse, unparse } from 'papaparse';

export function exportToCSV(transactions: Transaction[]) {
  const csv = unparse(transactions.map(t => ({
    type: t.type,
    amount: t.amount,
    description: t.description,
    category: t.category,
    date: new Date(t.date).toISOString().split('T')[0]
  })));
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    parse(file, {
      header: true,
      complete: (results) => {
        try {
          const transactions: Transaction[] = results.data.map((row: any) => ({
            id: crypto.randomUUID(),
            type: row.type as 'income' | 'expense',
            amount: Number(row.amount),
            description: row.description,
            category: row.category,
            date: new Date(row.date).toISOString()
          }));
          resolve(transactions);
        } catch (error) {
          reject(new Error('Invalid CSV format'));
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}