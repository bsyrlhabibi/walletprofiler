"use client";

import { useState, FormEvent } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";

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
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl opacity-40 group-hover:opacity-70 blur-md transition duration-300" />
        <div className="relative flex items-center glass-card rounded-2xl overflow-hidden">
          <div className="ml-4 p-2 rounded-xl bg-indigo-50">
            <Search className="w-5 h-5 text-indigo-500" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className="flex-1 bg-transparent text-gray-800 px-4 py-4 outline-none placeholder:text-gray-400 font-mono text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mr-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-indigo-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>
      <p className="text-center text-gray-400 text-xs mt-4">
        Paste any Ethereum address to get a full wallet intelligence report
      </p>
    </form>
  );
}
