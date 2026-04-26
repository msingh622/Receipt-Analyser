const BUDGET_KEY = "receipt_analyser_budget";
const RECEIPTS_KEY = "receipt_analyser_receipts";
const CURRENCY_KEY = "receipt_analyser_currency";

// ─── Currency ─────────────────────────────────────────

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

export function saveCurrency(currencyCode) {
  localStorage.setItem(CURRENCY_KEY, currencyCode);
}

export function loadCurrency() {
  const code = localStorage.getItem(CURRENCY_KEY) || "INR";
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

// ─── Budget ───────────────────────────────────────────

export function saveBudget(budget) {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
}

export function loadBudget() {
  const data = localStorage.getItem(BUDGET_KEY);
  if (!data) return getDefaultBudget();
  return JSON.parse(data);
}

export function getDefaultBudget() {
  const currency = loadCurrency();

  const defaults = {
    INR: {
      Groceries: 5000,
      "Food & Dining": 3000,
      Healthcare: 2000,
      Entertainment: 1500,
      Transport: 2000,
      Shopping: 3000,
      Other: 1000,
    },
    USD: {
      Groceries: 400,
      "Food & Dining": 200,
      Healthcare: 150,
      Entertainment: 100,
      Transport: 150,
      Shopping: 200,
      Other: 100,
    },
    EUR: {
      Groceries: 350,
      "Food & Dining": 180,
      Healthcare: 130,
      Entertainment: 90,
      Transport: 130,
      Shopping: 180,
      Other: 90,
    },
    GBP: {
      Groceries: 300,
      "Food & Dining": 150,
      Healthcare: 120,
      Entertainment: 80,
      Transport: 120,
      Shopping: 150,
      Other: 80,
    },
  };

  return defaults[currency.code] || defaults["USD"];
}

// ─── Receipts ─────────────────────────────────────────

export function saveReceipt(receipt) {
  const receipts = loadReceipts();
  const newReceipt = {
    ...receipt,
    id: Date.now(),
    scannedAt: new Date().toISOString(),
  };
  receipts.unshift(newReceipt);
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  return newReceipt;
}

export function loadReceipts() {
  const data = localStorage.getItem(RECEIPTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function deleteReceipt(id) {
  const receipts = loadReceipts();
  const filtered = receipts.filter((r) => r.id !== id);
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify(filtered));
}

export function clearAllData() {
  localStorage.removeItem(BUDGET_KEY);
  localStorage.removeItem(RECEIPTS_KEY);
  localStorage.removeItem(CURRENCY_KEY);
}

// ─── Spending summary ─────────────────────────────────

export function getSpendingByCategory() {
  const receipts = loadReceipts();
  const spending = {};

  receipts.forEach((receipt) => {
    receipt.items?.forEach((item) => {
      const cat = item.category || "Other";
      spending[cat] = (spending[cat] || 0) + item.price * item.quantity;
    });
  });

  return spending;
}