import { useState, useRef } from "react";
import { analyseReceipt, imageToBase64 } from "../lib/gemini";
import { saveReceipt, loadBudget } from "../lib/storage";

export default function ReceiptUpload({ currency, onReceiptScanned }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  async function processFile(file) {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image of your receipt.");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const base64 = await imageToBase64(file);
      const budget = loadBudget();
      const result = await analyseReceipt(base64, file.type, budget);
      const saved = saveReceipt(result);
      onReceiptScanned(saved);
    } catch (err) {
        const errorMsg = err.message.includes("429")
          ? "Too many requests. Please wait a moment and try again."
          : "Could not analyse receipt. Please try again with a clearer image.";
        setError(errorMsg);
        console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }

  function handleFileInput(e) {
    processFile(e.target.files[0]);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Scan Receipt
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a photo of your receipt and we'll analyse it instantly
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${dragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {preview ? (
          <img
            src={preview}
            alt="Receipt preview"
            className="max-h-48 mx-auto rounded-xl object-contain"
          />
        ) : (
          <div className="space-y-3">
            <div className="text-5xl">🧾</div>
            <p className="text-gray-600 font-medium">
              Drop your receipt here
            </p>
            <p className="text-gray-400 text-sm">
              or click to browse files
            </p>
            <p className="text-gray-300 text-xs">
              Supports JPG, PNG, WEBP
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-3 bg-blue-50 rounded-xl py-4">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-700 text-sm font-medium">
            Analysing your receipt...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Scan Another Button */}
      {preview && !loading && (
        <button
          onClick={() => {
            setPreview(null);
            setError(null);
            inputRef.current.value = "";
          }}
          className="mt-4 w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-xl transition-colors duration-200"
        >
          Scan Another Receipt
        </button>
      )}
    </div>
  );
}