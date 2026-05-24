"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Search, Loader2, Sparkles, ChevronDown } from "lucide-react";

interface SearchBarProps {
  onSearch: (address: string, chain: string) => void;
  loading: boolean;
  chain?: string;
  onChainChange?: (chain: string) => void;
  showChainSelector?: boolean;
}

const CHAINS = [
  { id: "eth", label: "Ethereum", icon: "⟠", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { id: "polygon", label: "Polygon", icon: "⬡", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { id: "arbitrum", label: "Arbitrum", icon: "🔵", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "optimism", label: "Optimism", icon: "🔴", color: "bg-rose-50 text-rose-600 border-rose-200" },
  { id: "base", label: "Base", icon: "🔷", color: "bg-sky-50 text-sky-600 border-sky-200" },
  { id: "bnb", label: "BNB", icon: "🟡", color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
];

export default function SearchBar({ onSearch, loading, chain: chainProp, onChainChange, showChainSelector = true }: SearchBarProps) {
  const [input, setInput] = useState("");
  const [showChains, setShowChains] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const chain = chainProp || "eth";
  const selectedChain = CHAINS.find((c) => c.id === chain) || CHAINS[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowChains(false);
      }
    }
    if (showChains) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showChains]);

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
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 rounded-2xl opacity-30 group-hover:opacity-60 blur-md transition duration-300 pointer-events-none" />

        {/* Input container */}
        <div className="relative flex items-center glass-card rounded-2xl">
          {/* Chain selector (optional) */}
          {showChainSelector && (
            <div ref={dropdownRef} className="relative ml-2 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowChains(!showChains);
                }}
                className={`flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-semibold border transition cursor-pointer hover:opacity-80 active:scale-95 ${selectedChain.color}`}
              >
                <span className="text-sm sm:text-base">{selectedChain.icon}</span>
                <span className="hidden sm:inline">{selectedChain.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showChains ? "rotate-180" : ""}`} />
              </button>

              {showChains && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 z-[200] min-w-[160px] animate-fade-in max-h-[180px] overflow-y-auto scrollbar-thin">
                  {CHAINS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChainChange?.(c.id);
                        setShowChains(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition cursor-pointer ${
                        c.id === chain ? "font-bold text-fuchsia-600 bg-fuchsia-50" : "text-gray-600"
                      }`}
                    >
                      <span className="w-5 text-center text-base flex-shrink-0">{c.icon}</span>
                      <span className="flex-1 text-left">{c.label}</span>
                      {c.id === chain && <span className="ml-auto text-fuchsia-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search icon with gradient background */}
          <div className={`${showChainSelector ? "ml-2" : "ml-4"} p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 flex-shrink-0 shadow-md shadow-fuchsia-300/40`}>
            <Search className="w-5 h-5 text-white" />
          </div>

          {/* Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className="flex-1 bg-transparent text-gray-800 px-2 sm:px-4 py-3 sm:py-4 outline-none placeholder:text-gray-400 font-mono text-xs sm:text-sm min-w-0"
            disabled={loading}
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mr-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl font-semibold text-xs sm:text-sm hover:from-fuchsia-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-fuchsia-500/20 flex-shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Analyze</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showChainSelector && (
        <p className="text-center text-gray-400 text-xs mt-4">
          Supports Ethereum, Polygon, Arbitrum, Optimism, and Base
        </p>
      )}
    </form>
  );
}
