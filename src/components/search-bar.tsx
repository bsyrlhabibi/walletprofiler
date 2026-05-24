"use client";

import { useState, FormEvent } from "react";
import { Search, Loader2, Sparkles, ChevronDown } from "lucide-react";

interface SearchBarProps {
  onSearch: (address: string, chain: string) => void;
  loading: boolean;
}

const CHAINS = [
  { id: "eth", label: "Ethereum", icon: "⟠", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { id: "polygon", label: "Polygon", icon: "⬡", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { id: "arbitrum", label: "Arbitrum", icon: "🔵", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { id: "optimism", label: "Optimism", icon: "🔴", color: "bg-rose-50 text-rose-600 border-rose-100" },
  { id: "base", label: "Base", icon: "🔷", color: "bg-sky-50 text-sky-600 border-sky-100" },
];

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [input, setInput] = useState("");
  const [chain, setChain] = useState("eth");
  const [showChains, setShowChains] = useState(false);

  const selectedChain = CHAINS.find((c) => c.id === chain) || CHAINS[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed && trimmed.startsWith("0x") && trimmed.length === 42) {
      onSearch(trimmed, chain);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 rounded-2xl opacity-30 group-hover:opacity-60 blur-md transition duration-300" />
        <div className="relative flex items-center glass-card rounded-2xl overflow-hidden">
          {/* Chain selector */}
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setShowChains(!showChains)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${selectedChain.color}`}
            >
              <span>{selectedChain.icon}</span>
              <span className="hidden sm:inline">{selectedChain.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showChains && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[140px]">
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setChain(c.id); setShowChains(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition ${c.id === chain ? "font-semibold" : "text-gray-600"}`}
                  >
                    <span>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-2 p-2 rounded-xl bg-fuchsia-50">
            <Search className="w-5 h-5 text-fuchsia-500" />
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
            className="mr-2 px-6 py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-fuchsia-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
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
        Supports Ethereum, Polygon, Arbitrum, Optimism, and Base
      </p>
    </form>
  );
}
