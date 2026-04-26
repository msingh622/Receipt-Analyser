import { useState } from "react";
import {
  saveBudget,
  saveCurrency,
  loadCurrency,
  CURRENCIES,
  getDefaultBudget,
} from "../lib/storage";

const CATEGORIES = [
  { name: "Groceries", icon: "🛒" },
  { name: "Food & Dining", icon: "🍽️" },
  { name: "Healthcare", icon: "💊" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Transport", icon: "🚗" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Other", icon: "📦" },
];

export default function BudgetSetup({ budget, onSave }) {
  const [currency, setCurrency] = useState(loadCurrency());
  const [values, setValues] = useState(budget);
  const [saved, setSaved] = useState(false);

  function handleCurrencyChange(code) {
    const selected = CURRENCIES.find((c) => c.code === code);
    setCurrency(selected);
    saveCurrency(code);
    setValues(getDefaultBudget());
  }

  function handleChange(category, value) {
    setValues((prev) => ({
      ...prev,
      [category]: parseFloat(value) || 0,
    }));
  }

  function handleSave() {
    saveBudget(values);
    setSaved(true);
    onSave(values, currency);
    setTimeout(() => setSaved(false), 2000);
  }

  const total = Object.values(values).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Monthly Budget
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Set how much you plan to spend in each category
        </p>
      </div>

      {/* Currency Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <select
          value={currency.code}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Inputs */}
      <div className="space-y-3">
        {CATEGORIES.map(({ name, icon }) => (
          <div
            key={name}
            className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
          >
            <span className="text-xl w-8">{icon}</span>
            <span className="flex-1 text-sm font-medium text-gray-700">
              {name}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">{currency.symbol}</span>
              <input
                type="number"
                min="0"
                value={values[name] || 0}
                onChange={(e) => handleChange(name, e.target.value)}
                className="w-28 text-right border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
        <span className="text-sm font-semibold text-blue-700">
          Total Monthly Budget
        </span>
        <span className="text-lg font-bold text-blue-700">
          {currency.symbol}{total.toLocaleString()}
        </span>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
      >
        {saved ? "✅ Saved!" : "Save Budget"}
      </button>
    </div>
  );
}