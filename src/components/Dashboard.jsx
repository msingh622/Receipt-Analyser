import { useState } from "react";
import { deleteReceipt, getSpendingByCategory, loadReceipts } from "../lib/storage";

const CATEGORY_ICONS = {
  Groceries: "🛒",
  "Food & Dining": "🍽️",
  Healthcare: "💊",
  Entertainment: "🎬",
  Transport: "🚗",
  Shopping: "🛍️",
  Other: "📦",
};

export default function Dashboard({ budget, currency, onReceiptDeleted }) {
  const spending = getSpendingByCategory();
  const receipts = loadReceipts();
  const [expandedReceipt, setExpandedReceipt] = useState(null);

  const totalBudget = Object.values(budget).reduce((a, b) => a + b, 0);
  const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);
  const totalRemaining = totalBudget - totalSpent;

  function handleDelete(id) {
    deleteReceipt(id);
    onReceiptDeleted();
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Budget</p>
          <p className="text-xl font-bold text-gray-800">
            {currency.symbol}{totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Spent</p>
          <p className="text-xl font-bold text-red-500">
            {currency.symbol}{totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Remaining</p>
          <p className={`text-xl font-bold ${totalRemaining >= 0 ? "text-green-500" : "text-red-500"}`}>
            {currency.symbol}{Math.abs(totalRemaining).toLocaleString()}
            {totalRemaining < 0 && " over"}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          Spending by Category
        </h2>
        <div className="space-y-4">
          {Object.entries(budget).map(([category, budgetAmount]) => {
            const spent = spending[category] || 0;
            const percentage = Math.min((spent / budgetAmount) * 100, 100);
            const isOver = spent > budgetAmount;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {CATEGORY_ICONS[category] || "📦"}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {category}
                    </span>
                    {isOver && (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                        over budget
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isOver ? "text-red-500" : "text-gray-700"}`}>
                      {currency.symbol}{spent.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {" "}/ {currency.symbol}{budgetAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? "bg-red-400"
                        : percentage > 75
                        ? "bg-amber-400"
                        : "bg-green-400"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Receipt History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          Receipt History
        </h2>

        {receipts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-gray-400 text-sm">
              No receipts scanned yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="border border-gray-100 rounded-xl overflow-hidden"
              >
                {/* Receipt Row */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedReceipt(
                      expandedReceipt === receipt.id ? null : receipt.id
                    )
                  }
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {receipt.store || "Unknown Store"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(receipt.scannedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800">
                      {currency.symbol}
                      {receipt.total?.toLocaleString()}
                    </span>
                    <span className="text-gray-300">
                      {expandedReceipt === receipt.id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded Items */}
                {expandedReceipt === receipt.id && (
                  <div className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50">
                    {receipt.items?.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">{item.name}</span>
                        <span className="text-gray-800 font-medium">
                          {currency.symbol}
                          {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      className="mt-2 w-full text-xs text-red-400 hover:text-red-600 py-1.5 border border-red-100 hover:border-red-200 rounded-lg transition-colors"
                    >
                      Delete Receipt
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}