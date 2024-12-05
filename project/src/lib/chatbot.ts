import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from './transactions';
import { formatCurrency } from './utils';

interface ChatResponse {
  text: string;
  action?: 'add' | 'update' | 'delete';
  data?: any;
}

export async function analyzeChatPrompt(text: string, userId: string): Promise<ChatResponse> {
  const lowercaseText = text.toLowerCase();

  // Balance Queries
  if (lowercaseText.match(/balance|how much.*have/)) {
    return handleBalanceQuery(userId);
  }

  // Transaction Queries
  if (lowercaseText.match(/recent|show|list|view.*transactions/)) {
    return handleTransactionQuery(userId, text);
  }

  // Category Analysis
  if (lowercaseText.match(/spend.*on|spent.*on|expenses.*for/)) {
    return handleCategorySpendingQuery(userId, text);
  }

  // Transaction Management
  if (lowercaseText.match(/add|new|create|record/)) {
    if (lowercaseText.match(/transaction|expense|income|spent|earned|paid|received/)) {
      return handleAddTransaction(text, userId);
    }
  }

  if (lowercaseText.match(/delete|remove|cancel/)) {
    if (lowercaseText.includes('transaction')) {
      return handleDeleteTransaction(text, userId);
    }
  }

  // Savings Tips
  if (lowercaseText.match(/saving|save money|tips|advice|help.*save/)) {
    return handleSavingsTips(userId);
  }

  // App Help
  if (lowercaseText.match(/help|how to|what can you do|features/)) {
    return handleHelpQuery(text);
  }

  return {
    text: "I'm not sure how to help with that. Here's what you can ask me about:\n\n" +
          "📊 Financial Overview:\n" +
          "• 'What's my current balance?'\n" +
          "• 'Show my recent transactions'\n" +
          "• 'How much did I spend on groceries?'\n\n" +
          "💰 Transaction Management:\n" +
          "• 'Add new expense of $50 for groceries'\n" +
          "• 'Record income of $1000 for salary'\n" +
          "• 'Delete last transaction'\n\n" +
          "💡 Insights & Help:\n" +
          "• 'Give me savings tips'\n" +
          "• 'How do I use this app?'\n" +
          "• 'What features are available?'"
  };
}

async function handleBalanceQuery(userId: string): Promise<ChatResponse> {
  const transactions = await getTransactions(userId);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && isCurrentMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && isCurrentMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    text: `💰 Current Balance: ${formatCurrency(balance)}\n\n` +
          `This Month:\n` +
          `📈 Income: ${formatCurrency(monthlyIncome)}\n` +
          `📉 Expenses: ${formatCurrency(monthlyExpenses)}\n` +
          `💵 Net: ${formatCurrency(monthlyIncome - monthlyExpenses)}\n\n` +
          `All Time:\n` +
          `📈 Total Income: ${formatCurrency(totalIncome)}\n` +
          `📉 Total Expenses: ${formatCurrency(totalExpenses)}`
  };
}

async function handleTransactionQuery(userId: string, text: string): Promise<ChatResponse> {
  const { start, end } = findTimeframe(text);
  const transactions = await getTransactions(userId);
  
  const filteredTransactions = transactions
    .filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (filteredTransactions.length === 0) {
    return { 
      text: `No transactions found between ${format(start, 'PP')} and ${format(end, 'PP')}.\n\n` +
            `Try adding some transactions or checking a different time period.`
    };
  }

  let response = `📋 Transactions (${format(start, 'PP')} to ${format(end, 'PP')}):\n\n`;
  
  filteredTransactions.slice(0, 5).forEach(t => {
    const icon = t.type === 'income' ? '💵' : '💸';
    response += `${icon} ${format(new Date(t.date), 'PP')}\n` +
                `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} - ${t.description}\n` +
                `Category: ${t.category}\n\n`;
  });

  if (filteredTransactions.length > 5) {
    response += `...and ${filteredTransactions.length - 5} more transactions.\n\n`;
  }

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  response += `📊 Summary:\n` +
              `📈 Income: ${formatCurrency(totalIncome)}\n` +
              `📉 Expenses: ${formatCurrency(totalExpenses)}\n` +
              `💰 Net: ${formatCurrency(totalIncome - totalExpenses)}`;

  return { text: response };
}

async function handleCategorySpendingQuery(userId: string, text: string): Promise<ChatResponse> {
  const { start, end } = findTimeframe(text);
  const transactions = await getTransactions(userId);
  
  // Try to find specific category in the query
  const categories = [
    'Housing', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Salary', 'Business Income', 'Investments', 'Freelancing', 'Bonuses'
  ];
  
  const categoryMatch = categories.find(cat => 
    text.toLowerCase().includes(cat.toLowerCase()) ||
    text.toLowerCase().includes(cat.split(' ')[0].toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= start && date <= end &&
           (!categoryMatch || t.category.includes(categoryMatch));
  });

  if (filteredTransactions.length === 0) {
    return { 
      text: categoryMatch
        ? `No transactions found for category "${categoryMatch}" in this period.`
        : `No transactions found for this period.`
    };
  }

  const categorySpending = filteredTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  let response = categoryMatch
    ? `📊 Spending for "${categoryMatch}":\n\n`
    : `📊 Category breakdown:\n\n`;

  Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, amount]) => {
      const icon = category.toLowerCase().includes('income') ? '💵' : '💸';
      response += `${icon} ${category}: ${formatCurrency(amount)}\n`;
    });

  const total = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
  response += `\n💰 Total: ${formatCurrency(total)}`;

  return { text: response };
}

async function handleAddTransaction(text: string, userId: string): Promise<ChatResponse> {
  // Enhanced regex patterns
  const amountMatch = text.match(/\$?\s?(\d+(\.\d{2})?)/);
  const typeMatch = text.match(/income|salary|earned|received|expense|spent|paid/i);
  
  if (!amountMatch) {
    return {
      text: "I couldn't understand the amount. Please specify it clearly, like:\n" +
            "• 'Add expense of $50 for groceries'\n" +
            "• 'New income of $1000 from salary'"
    };
  }

  const amount = parseFloat(amountMatch[1]);
  const type = typeMatch?.[0].toLowerCase().includes('income') ? 'income' : 'expense';
  
  // Try to extract description and category
  let description = '';
  let category = '';

  if (text.includes('for') || text.includes('from')) {
    description = text.split(/for|from/).pop()?.trim() || '';
  }

  // Determine category based on keywords
  const categories = type === 'income'
    ? {
        'salary': ['salary', 'wage', 'paycheck'],
        'Business Income': ['business', 'company'],
        'Investments': ['investment', 'dividend', 'interest'],
        'Freelancing/Side Hustles': ['freelance', 'freelancing', 'contract'],
        'Bonuses': ['bonus', 'commission']
      }
    : {
        'Housing': ['rent', 'mortgage', 'utilities'],
        'Food & Dining': ['food', 'grocery', 'restaurant'],
        'Transportation': ['transport', 'fuel', 'gas', 'bus'],
        'Shopping': ['shopping', 'clothes', 'electronics'],
        'Entertainment': ['entertainment', 'movie', 'subscription']
      };

  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
      category = cat;
      break;
    }
  }

  if (!category) {
    category = type === 'income' ? 'Other Income' : 'Other Expenses';
  }

  try {
    const transaction = await createTransaction(
      userId,
      type,
      amount,
      description || 'Unspecified',
      category,
      new Date().toISOString()
    );

    return {
      text: `✅ Successfully added ${type}:\n` +
            `💰 Amount: ${formatCurrency(amount)}\n` +
            `📝 Description: ${description || 'Unspecified'}\n` +
            `🏷️ Category: ${category}`,
      action: 'add',
      data: transaction
    };
  } catch (error) {
    return {
      text: "❌ Sorry, I couldn't add the transaction. Please try again or add it manually."
    };
  }
}

async function handleDeleteTransaction(text: string, userId: string): Promise<ChatResponse> {
  if (text.includes('last')) {
    const transactions = await getTransactions(userId);
    const lastTransaction = transactions[0];
    
    if (!lastTransaction) {
      return { text: "❌ No transactions found to delete." };
    }

    await deleteTransaction(lastTransaction.id);
    return {
      text: `✅ Deleted last transaction:\n` +
            `💰 Amount: ${formatCurrency(lastTransaction.amount)}\n` +
            `📝 Description: ${lastTransaction.description}\n` +
            `🏷️ Category: ${lastTransaction.category}`,
      action: 'delete',
      data: { id: lastTransaction.id }
    };
  }

  return {
    text: "Please specify which transaction to delete. You can:\n" +
          "• Say 'delete last transaction'\n" +
          "• Use the delete button in the transaction list"
  };
}

async function handleSavingsTips(userId: string): Promise<ChatResponse> {
  const transactions = await getTransactions(userId);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && isCurrentMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && isCurrentMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);

  let response = "💡 Smart Savings Tips:\n\n";

  // Personalized tips based on spending patterns
  if (monthlyExpenses > monthlyIncome * 0.8) {
    response += "🚨 High Expense Alert:\n" +
                "• Your expenses are over 80% of your income\n" +
                "• Consider reviewing non-essential spending\n" +
                "• Look for areas to cut back\n\n";
  }

  response += "1. 💰 Budgeting Strategy:\n" +
              "• Follow the 50/30/20 rule:\n" +
              "  - 50% for needs (housing, food, utilities)\n" +
              "  - 30% for wants (entertainment, shopping)\n" +
              "  - 20% for savings and debt payment\n\n";

  response += "2. 📉 Expense Reduction:\n" +
              "• Review and cancel unused subscriptions\n" +
              "• Compare prices before purchases\n" +
              "• Use cashback and rewards programs\n\n";

  response += "3. 📈 Income Growth:\n" +
              "• Explore side hustle opportunities\n" +
              "• Develop high-demand skills\n" +
              "• Look for passive income sources\n\n";

  response += "4. 🎯 Smart Financial Habits:\n" +
              "• Set up automatic savings transfers\n" +
              "• Create an emergency fund\n" +
              "• Track expenses regularly\n\n";

  response += "Would you like more specific tips for any category?";

  return { text: response };
}

async function handleHelpQuery(text: string): Promise<ChatResponse> {
  const lowercaseText = text.toLowerCase();
  
  if (lowercaseText.match(/add|create|record/)) {
    return {
      text: "📝 How to Add Transactions:\n\n" +
            "You can say things like:\n" +
            "• 'Add expense of $50 for groceries'\n" +
            "• 'Record income of $1000 from salary'\n" +
            "• 'New payment of $30 for entertainment'\n\n" +
            "Or use the Add Transaction form in the dashboard."
    };
  }

  if (lowercaseText.match(/delete|remove/)) {
    return {
      text: "❌ How to Delete Transactions:\n\n" +
            "You can:\n" +
            "• Say 'delete last transaction'\n" +
            "• Use the delete button in the transaction list\n\n" +
            "Note: Deletions cannot be undone!"
    };
  }

  return {
    text: "🤖 Finance Assistant Help:\n\n" +
          "1. 💰 View Finances:\n" +
          "• 'What's my balance?'\n" +
          "• 'Show recent transactions'\n" +
          "• 'How much did I spend on food?'\n\n" +
          "2. 📝 Manage Transactions:\n" +
          "• 'Add expense of $50 for groceries'\n" +
          "• 'Record income of $1000'\n" +
          "• 'Delete last transaction'\n\n" +
          "3. 💡 Get Insights:\n" +
          "• 'Give me savings tips'\n" +
          "• 'Analyze my spending'\n" +
          "• 'Show my top expenses'\n\n" +
          "What would you like to know more about?"
  };
}

function findTimeframe(text: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (text.includes('today')) {
    return { start: today, end: now };
  }
  
  if (text.includes('this month')) {
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
  }
  
  if (text.includes('last month')) {
    const lastMonth = subMonths(now, 1);
    return {
      start: startOfMonth(lastMonth),
      end: endOfMonth(lastMonth),
    };
  }
  
  // Default to current month
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

function isCurrentMonth(dateStr: string): boolean {
  const date = parseISO(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && 
         date.getFullYear() === now.getFullYear();
}