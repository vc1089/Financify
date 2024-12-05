import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV, parseCSV } from '@/lib/csv';
import type { Transaction } from '@/types/transaction';

interface ImportExportButtonsProps {
  transactions: Transaction[];
  onImport: (transactions: Transaction[]) => void;
}

export function ImportExportButtons({ transactions, onImport }: ImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedTransactions = await parseCSV(file);
      onImport(importedTransactions);
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Failed to import CSV:', error);
      alert('Failed to import CSV. Please check the file format.');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToCSV(transactions)}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}