"use client";

import { TradingPattern } from "@/lib/types";
import { TrendingUp, Flame, Zap, Copy, Check, Layers, Link2 } from "lucide-react";

const CHAIN_LABELS: Record<string, { name: string; icon: string; color: string }> = {
  eth: { name: "Ethereum", icon: "⟠", color: "bg-indigo-100 text-indigo-700" },
  polygon: { name: "Polygon", icon: "⬡", color: "bg-purple-100 text-purple-700" },
  arbitrum: { name: "Arbitrum", icon: "🔵", color: "bg-blue-100 text-blue-700" },
  optimism: { name: "Optimism", icon: "🔴", color: "bg-rose-100 text-rose-700" },
  base: { name: "Base", icon: "🔷", color: "bg-sky-100 text-sky-700" },
};
import { useState } from "react";

interface PersonaCardProps {
  pattern: TradingPattern;
  address: string;
  ethBalance: number;
  totalTokens: number;
  chain?: string;
}

export default function PersonaCard({ pattern, address, ethBalance, totalTokens, chain }: PersonaCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAddr = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "from-fuchsia-500 to-purple-600";
    if (score >= 60) return "from-indigo-500 to-blue-600";
    if (score >= 40) return "from-cyan-500 to-teal-500";
    if (score >= 20) return "from-gray-400 to-gray-500";
    return "from-gray-300 to-gray-400";
  };

  return (
    <div className="glass-card p-6 animate-fade-in relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-fuchsia-200/30 to-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-cyan-200/20 to-blue-200/10 rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-5xl shadow-lg shadow-fuchsia-200/50 pulse-ring">
                {pattern.personaEmoji}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">{pattern.personaType}</h2>
              <p className="text-gray-500 text-sm max-w-xs">{pattern.personaDescription}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Activity Score</div>
            <div className={`text-5xl font-black bg-gradient-to-r ${scoreColor(pattern.activityScore)} bg-clip-text text-transparent`}>
              {pattern.activityScore}
            </div>
          </div>
        </div>

        {/* Chain badge + Address bar */}
        {chain && CHAIN_LABELS[chain] && (
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${CHAIN_LABELS[chain].color}`}>
              <Link2 className="w-3 h-3" />
              {CHAIN_LABELS[chain].icon} {CHAIN_LABELS[chain].name} Network
            </span>
          </div>
        )}

        {/* Address bar */}
        <div className="bg-gray-50 rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-400 flex-shrink-0">Address</span>
            <span className="font-mono text-sm text-gray-700 truncate">{address}</span>
          </div>
          <button onClick={copyAddr} className="text-gray-400 hover:text-fuchsia-500 transition ml-2 flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Activity bar */}
        <div className="mb-5">
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${scoreColor(pattern.activityScore)} rounded-full transition-all duration-1000 score-bar-shimmer`}
              style={{ width: `${pattern.activityScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">Observer 👀</span>
            <span className="text-[10px] text-gray-400">Whale Degen 🐋</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox
            icon={<TrendingUp className="w-4 h-4 text-indigo-500" />}
            label="Balance"
            value={ethBalance.toFixed(4)}
            sub={`${totalTokens} tokens`}
            color="indigo"
          />
          <StatBox
            icon={<Flame className="w-4 h-4 text-orange-500" />}
            label="Transactions"
            value={pattern.totalTransactions.toString()}
            sub={`${pattern.activeDays} active days`}
            color="orange"
          />
          <StatBox
            icon={<Zap className="w-4 h-4 text-amber-500" />}
            label="Volume"
            value={`${pattern.totalVolume.toFixed(2)} Ξ`}
            sub={`Avg ${pattern.avgTxValue.toFixed(4)} Ξ`}
            color="amber"
          />
          <StatBox
            icon={<Layers className="w-4 h-4 text-fuchsia-500" />}
            label="Contracts"
            value={pattern.uniqueContracts.toString()}
            sub={`${pattern.uniqueTokens} tokens held`}
            color="fuchsia"
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100",
    orange: "bg-orange-50 border-orange-100",
    amber: "bg-amber-50 border-amber-100",
    fuchsia: "bg-fuchsia-50 border-fuchsia-100",
  };

  return (
    <div className={`${bgMap[color] || "bg-gray-50 border-gray-100"} rounded-xl p-3 border glass-card-hover transition-all`}>
      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </div>
  );
}
