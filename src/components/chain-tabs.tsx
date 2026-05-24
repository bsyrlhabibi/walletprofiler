"use client";

interface ChainTabsProps {
  activeChain: string;
  onChainChange: (chain: string) => void;
  loading?: boolean;
}

const CHAINS = [
  { id: "eth", label: "Ethereum", icon: "⟠", color: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100" },
  { id: "polygon", label: "Polygon", icon: "⬡", color: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-100" },
  { id: "arbitrum", label: "Arbitrum", icon: "🔵", color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-100" },
  { id: "optimism", label: "Optimism", icon: "🔴", color: "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700 hover:bg-rose-100" },
  { id: "base", label: "Base", icon: "🔷", color: "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700 hover:bg-sky-100" },
  { id: "bnb", label: "BNB", icon: "🟡", color: "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100" },
];

export default function ChainTabs({ activeChain, onChainChange, loading }: ChainTabsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin px-1">
      {CHAINS.map((c) => (
        <button
          key={c.id}
          onClick={() => onChainChange(c.id)}
          disabled={loading}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold border-2 transition-all flex-shrink-0 whitespace-nowrap ${
            c.id === activeChain
              ? `${c.color} shadow-md scale-105`
              : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 border-transparent"
          } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
        >
          <span>{c.icon}</span>
          <span className="hidden sm:inline">{c.label}</span>
        </button>
      ))}
    </div>
  );
}
