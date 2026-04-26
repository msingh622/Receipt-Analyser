const CATEGORY_COLORS = {
    Groceries: "bg-green-100 text-green-700",
    "Food & Dining": "bg-orange-100 text-orange-700",
    Healthcare: "bg-blue-100 text-blue-700",
    Entertainment: "bg-purple-100 text-purple-700",
    Transport: "bg-yellow-100 text-yellow-700",
    Shopping: "bg-pink-100 text-pink-700",
    Other: "bg-gray-100 text-gray-700",
  };
  
  export default function ItemsTable({ receipt, currency }) {
    if (!receipt) return null;
  
    const unnecessaryItems = receipt.items?.filter((i) => !i.necessary) || [];
    const cheaperItems = receipt.items?.filter((i) => i.cheaper_alternative) || [];
  
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Receipt Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {receipt.store || "Receipt"}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {receipt.date || "Date not found"} •{" "}
              {receipt.items?.length || 0} items
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-800">
              {currency.symbol}
              {receipt.total?.toLocaleString()}
            </p>
          </div>
        </div>
  
        {/* Warning Badges */}
        <div className="flex flex-wrap gap-2">
          {unnecessaryItems.length > 0 && (
            <span className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1.5 rounded-full">
              ⚠️ {unnecessaryItems.length} unnecessary item
              {unnecessaryItems.length > 1 ? "s" : ""}
            </span>
          )}
          {cheaperItems.length > 0 && (
            <span className="bg-amber-50 text-amber-600 text-xs font-medium px-3 py-1.5 rounded-full">
              💡 {cheaperItems.length} cheaper alternative
              {cheaperItems.length > 1 ? "s" : ""} found
            </span>
          )}
          {unnecessaryItems.length === 0 && cheaperItems.length === 0 && (
            <span className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1.5 rounded-full">
              ✅ Great choices on this receipt!
            </span>
          )}
        </div>
  
        {/* Items List */}
        <div className="space-y-2">
          {receipt.items?.map((item, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-xl p-4 space-y-2"
            >
              {/* Item Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    {!item.necessary && (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                        not essential
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        CATEGORY_COLORS[item.category] ||
                        CATEGORY_COLORS["Other"]
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-gray-400">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {currency.symbol}
                  {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
  
              {/* Cheaper Alternative */}
              {item.cheaper_alternative && (
                <div className="bg-amber-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700">
                    💡 {item.cheaper_alternative}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
  
        {/* Insights */}
        {receipt.insights?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">
              AI Insights
            </h3>
            {receipt.insights.map((insight, index) => (
              <div
                key={index}
                className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3"
              >
                <p className="text-sm text-blue-700">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }