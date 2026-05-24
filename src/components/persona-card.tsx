"use client";

import { TradingPattern } from "@/lib/types";
import { TrendingUp, Flame, Zap, Copy, Check, Layers, Link2, ExternalLink, Tag } from "lucide-react";

const CHAIN_LABELS: Record<string, { name: string; icon: string; color: string; currency: string }> = {
  eth: { name: "Ethereum", icon: "⟠", color: "bg-indigo-100 text-indigo-700", currency: "ETH" },
  polygon: { name: "Polygon", icon: "⬡", color: "bg-purple-100 text-purple-700", currency: "MATIC" },
  arbitrum: { name: "Arbitrum", icon: "🔵", color: "bg-blue-100 text-blue-700", currency: "ETH" },
  optimism: { name: "Optimism", icon: "🔴", color: "bg-rose-100 text-rose-700", currency: "ETH" },
  base: { name: "Base", icon: "🔷", color: "bg-sky-100 text-sky-700", currency: "ETH" },
  bnb: { name: "BNB Chain", icon: "🟡", color: "bg-yellow-100 text-yellow-700", currency: "BNB" },
};
import { useState } from "react";

interface PersonaCardProps {
  pattern: TradingPattern;
  address: string;
  ethBalance: number;
  totalTokens: number;
  chain?: string;
  totalValueUsd?: number;
  ethBalanceUsd?: number;
  explorerUrl?: string;
  walletLabel?: string | null;
  walletType?: string | null;
  walletTag?: string | null;
}

export default function PersonaCard({ pattern, address, ethBalance, totalTokens, chain, totalValueUsd, ethBalanceUsd, explorerUrl, walletLabel, walletType, walletTag }: PersonaCardProps) {
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
    <div className="glass-card p-4 sm:p-6 animate-fade-in relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-fuchsia-200/30 to-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-cyan-200/20 to-blue-200/10 rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-3xl sm:text-5xl shadow-lg shadow-fuchsia-200/50 pulse-ring">
                {pattern.personaEmoji}
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-gray-800">{pattern.personaType}</h2>
              <p className="text-gray-500 text-sm max-w-xs">{pattern.personaDescription}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Activity Score</div>
            <div className={`text-3xl sm:text-5xl font-black bg-gradient-to-r ${scoreColor(pattern.activityScore)} bg-clip-text text-transparent`}>
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

        {/* Known Wallet Label */}
        {walletLabel && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
              walletType === "exchange" ? "bg-amber-50 text-amber-700 border-amber-200" :
              walletType === "protocol" ? "bg-purple-50 text-purple-700 border-purple-200" :
              walletType === "dao" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              walletType === "bot" ? "bg-gray-50 text-gray-600 border-gray-200" :
              "bg-blue-50 text-blue-700 border-blue-200"
            } border`}>
              <Tag className="w-3.5 h-3.5" />
              {walletLabel}
              {walletTag && <span className="text-xs opacity-70">({walletTag})</span>}
            </span>
          </div>
        )}

        {/* Address bar */}
        <div className="bg-gray-50 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 mb-5 flex items-center justify-between border border-gray-100 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-400 flex-shrink-0">Address</span>
            <span className="font-mono text-sm text-gray-700 truncate">{address}</span>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <button onClick={copyAddr} className="text-gray-400 hover:text-fuchsia-500 transition">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            {explorerUrl && (
              <a
                href={`https://${explorerUrl}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-fuchsia-500 transition"
                title={`View on ${explorerUrl}`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
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

        {/* Total USD Value */}
        {totalValueUsd !== undefined && totalValueUsd > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-600 font-medium mb-1">Total Portfolio Value</div>
                <div className="text-3xl font-black text-emerald-700">
                  ${totalValueUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              {ethBalanceUsd !== undefined && ethBalanceUsd > 0 && (
                <div className="text-right">
                  <div className="text-xs text-emerald-500">Native Token</div>
                  <div className="text-sm font-semibold text-emerald-600">
                    ${ethBalanceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatBox
            icon={<TrendingUp className="w-4 h-4 text-indigo-500" />}
            label={chain && CHAIN_LABELS[chain] ? `${CHAIN_LABELS[chain].currency} Balance` : "Balance"}
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
            label={chain && CHAIN_LABELS[chain] ? `${CHAIN_LABELS[chain].currency} Volume` : "Volume"}
            value={`${pattern.totalVolume.toFixed(2)} ${chain && CHAIN_LABELS[chain] ? CHAIN_LABELS[chain].currency : "ETH"}`}
            sub={`Avg ${pattern.avgTxValue.toFixed(4)} ${chain && CHAIN_LABELS[chain] ? CHAIN_LABELS[chain].currency : "ETH"}`}
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
