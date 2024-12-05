import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format, parse, compareAsc } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface TransactionChartsProps {
  transactions: Transaction[];
}

export function TransactionCharts({ transactions }: TransactionChartsProps) {
  // Process data for category distribution (Doughnut Chart)
  const categoryData = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          'rgba(94, 129, 244, 0.8)',
          'rgba(255, 122, 105, 0.8)',
          'rgba(79, 209, 197, 0.8)',
          'rgba(162, 93, 220, 0.8)',
          'rgba(255, 181, 71, 0.8)',
          'rgba(110, 117, 159, 0.8)',
        ],
        borderColor: 'transparent',
        borderWidth: 0,
        spacing: 2,
        borderRadius: 20,
        hoverOffset: 8,
      },
    ],
  };

  // Process data for monthly income and expenses (Bar Chart)
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = format(new Date(transaction.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const dateA = parse(a, 'MMM yyyy', new Date());
    const dateB = parse(b, 'MMM yyyy', new Date());
    return compareAsc(dateA, dateB);
  });

  const barChartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Income',
        data: sortedMonths.map(month => monthlyData[month].income),
        backgroundColor: 'rgba(94, 129, 244, 0.8)',
        borderColor: 'transparent',
        borderRadius: {
          topLeft: 8,
          topRight: 8,
        },
        borderSkipped: false,
        barThickness: 24,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
      {
        label: 'Expenses',
        data: sortedMonths.map(month => monthlyData[month].expense),
        backgroundColor: 'rgba(255, 122, 105, 0.8)',
        borderColor: 'transparent',
        borderRadius: {
          topLeft: 8,
          topRight: 8,
        },
        borderSkipped: false,
        barThickness: 24,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses',
        padding: {
          bottom: 30,
        },
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: '500',
        },
        color: '#1f2937',
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#6b7280',
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#6b7280',
          padding: 8,
          callback: (value: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: 'Expense Distribution',
        padding: {
          bottom: 30,
        },
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: '500',
        },
        color: '#1f2937',
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        cornerRadius: 8,
      },
    },
    cutout: '75%',
    radius: '90%',
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="h-[400px]">
          <Bar options={barOptions} data={barChartData} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="h-[400px]">
          <Doughnut options={pieOptions} data={pieChartData} />
        </div>
      </div>
    </div>
  );
}