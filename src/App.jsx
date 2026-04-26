import { useState, useRef, useEffect } from "react";
import { loadBudget, loadCurrency, saveCurrency, CURRENCIES, getDefaultBudget } from "./lib/storage";
import BudgetSetup from "./components/BudgetSetup";
import ReceiptUpload from "./components/ReceiptUpload";
import ItemsTable from "./components/ItemsTable";
import Dashboard from "./components/Dashboard";

const TABS = ["Scan Receipt", "Dashboard", "Budget"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Scan Receipt");
  const [budget, setBudget] = useState(loadBudget());
  const [currency, setCurrency] = useState(loadCurrency());
  const [lastReceipt, setLastReceipt] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const currencyRef = useRef();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setShowCurrencyMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCurrencyChange(code) {
    const selected = CURRENCIES.find((c) => c.code === code);
    saveCurrency(code);
    setCurrency(selected);
    setBudget(getDefaultBudget());
    setShowCurrencyMenu(false);
  }

  function handleBudgetSave(newBudget, newCurrency) {
    setBudget(newBudget);
    setCurrency(newCurrency);
  }

  function handleReceiptScanned(receipt) {
    setLastReceipt(receipt);
    setActiveTab("Scan Receipt");
    setRefreshKey((k) => k + 1);
  }

  function handleReceiptDeleted() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              🧾 Receipt Analyser
            </h1>
            <p className="text-xs text-gray-400">
              Track • Analyse • Save
            </p>
          </div>

          {/* Currency Button with Dropdown */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setShowCurrencyMenu((prev) => !prev)}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 transition-colors duration-200"
            >
              <span className="text-lg">{currency.symbol}</span>
              <div className="text-left">
                <p className="text-xs text-gray-400 leading-none">Currency</p>
                <p className="text-sm font-semibold text-gray-700 leading-tight">
                  {currency.code}
                </p>
              </div>
              <span className="text-gray-300 text-xs ml-1">
                {showCurrencyMenu ? "▲" : "▼"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showCurrencyMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-20">
                <p className="text-xs text-gray-400 px-4 pt-3 pb-1 font-medium uppercase tracking-wide">
                  Select Currency
                </p>
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencyChange(c.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                      currency.code === c.code
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="w-6 text-base">{c.symbol}</span>
                    <span className="flex-1 text-left">{c.name}</span>
                    {currency.code === c.code && (
                      <span className="text-blue-400 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 pb-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {activeTab === "Scan Receipt" && (
          <>
            <ReceiptUpload
              currency={currency}
              onReceiptScanned={handleReceiptScanned}
            />
            {lastReceipt && (
              <ItemsTable receipt={lastReceipt} currency={currency} />
            )}
          </>
        )}

        {activeTab === "Dashboard" && (
          <Dashboard
            key={refreshKey}
            budget={budget}
            currency={currency}
            onReceiptDeleted={handleReceiptDeleted}
          />
        )}

        {activeTab === "Budget" && (
          <BudgetSetup budget={budget} onSave={handleBudgetSave} />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-gray-300">
          Powered by Gemini AI • Your data stays on your device
        </p>
      </footer>
    </div>
  );
}