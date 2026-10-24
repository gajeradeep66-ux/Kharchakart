export const categories = [
  { name: 'Travel', icon: '✈️', color: 'blue' },
  { name: 'Meals', icon: '🍽️', color: 'green' },
  { name: 'Office Supplies', icon: '📎', color: 'yellow' },
  { name: 'Software', icon: '💻', color: 'purple' },
  { name: 'Marketing', icon: '📢', color: 'pink' },
  { name: 'Training', icon: '📚', color: 'indigo' },
  { name: 'Equipment', icon: '🔧', color: 'gray' },
  { name: 'Healthcare', icon: '🏥', color: 'red' },
  { name: 'Transportation', icon: '🚗', color: 'cyan' },
  { name: 'Other', icon: '📋', color: 'slate' },
];

export const formatCurrency = (amount, currency = 'INR') => {
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    SGD: 'S$',
    JPY: '¥',
  };

  const symbol = currencySymbols[currency] || currency;
  const formattedAmount = Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  return `${symbol}${formattedAmount}`;
};

export const getCurrencyTotals = (expenses) => expenses.reduce((totals, expense) => {
  const currency = expense.currency || 'INR';
  const amount = Number(expense.amount);
  if (Number.isFinite(amount)) {
    totals[currency] = (totals[currency] || 0) + amount;
  }
  return totals;
}, {});

export const formatCurrencyTotals = (expenses) => Object.entries(getCurrencyTotals(expenses))
  .map(([currency, total]) => `${formatCurrency(total, currency)} ${currency}`)
  .join(' · ');

export const getExpensesThisMonth = (expenses) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  return (expenses || []).filter((expense) => {
    const date = new Date(expense.date);
    return !Number.isNaN(date.getTime()) && date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getCategoryIcon = (categoryName) => {
  const category = categories.find((c) => c.name === categoryName);
  return category ? category.icon : '📋';
};

export const getCategoryColor = (categoryName) => {
  const category = categories.find((c) => c.name === categoryName);
  return category ? category.color : 'slate';
};
