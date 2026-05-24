"use client";

interface ChainTabsProps {
  activeChain: string;
  onChainChange: (chain: string) => void;
  loading?: boolean;
}

const CHAINS = [
  { id: "eth", label: "Ethereum", icon: "⟠", color: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100" },
  { id: "polygon", label: "Polygon", icon: "⬡", color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100" },
  { id: "arbitrum", label: "Arbitrum", icon: "🔵", color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" },
  { id: "optimism", label: "Optimism", icon: "🔴", color: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" },
  { id: "base", label: "Base", icon: "🔷", color: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100" },
  { id: "bnb", label: "BNB", icon: "🟡", color: "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100" },
];

export default function ChainTabs({ activeChain, onChainChange, loading }: ChainTabsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin px-1">
      {CHAINS.map((c) => (
        <button
          key={c.id}
          onClick={() => onChainChange(c.id)}
          disabled={loading}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold border transition-all flex-shrink-0 ${
            c.id === activeChain
              ? `${c.color} ring-2 ring-offset-1 ring-fuchsia-300 shadow-md`
              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
          } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
        >
          <span>{c.icon}</span>
          <span className="hidden sm:inline">{c.label}</span>
        </button>
      ))}
    </div>
  );
}
