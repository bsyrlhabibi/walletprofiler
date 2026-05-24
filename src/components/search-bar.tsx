"use client";

import { useState, FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (address: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed && trimmed.startsWith("0x") && trimmed.length === 42) {
      onSearch(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition duration-200" />
        <div className="relative flex items-center bg-gray-900 rounded-xl border border-gray-700">
          <Search className="ml-4 w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className="flex-1 bg-transparent text-white px-4 py-4 outline-none placeholder:text-gray-500 font-mono text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mr-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
      </div>
      <p className="text-center text-gray-500 text-xs mt-3">
        Paste any Ethereum address to get a full wallet intelligence report
      </p>
    </form>
  );
}
