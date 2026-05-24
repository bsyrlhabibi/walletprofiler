"use client";

import { TradingPattern } from "@/lib/types";
import { Shield, TrendingUp, Flame, Zap } from "lucide-react";

interface PersonaCardProps {
  pattern: TradingPattern;
  address: string;
  ethBalance: number;
  totalTokens: number;
}

export default function PersonaCard({ pattern, address, ethBalance, totalTokens }: PersonaCardProps) {
  const scoreColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    if (score >= 20) return "text-blue-400";
    return "text-gray-400";
  };

  const scoreGradient = (score: number) => {
    if (score >= 80) return "from-red-500 to-orange-500";
    if (score >= 60) return "from-orange-500 to-yellow-500";
    if (score >= 40) return "from-yellow-500 to-green-500";
    if (score >= 20) return "from-blue-500 to-cyan-500";
    return "from-gray-500 to-gray-600";
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-5xl">{pattern.personaEmoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{pattern.personaType}</h2>
                <p className="text-gray-400 text-sm">{pattern.personaDescription}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-black ${scoreColor(pattern.degenScore)}`}>
              {pattern.degenScore}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Degen Score</div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-800/50 rounded-lg px-4 py-2 mb-6">
          <span className="text-xs text-gray-500">Address</span>
          <p className="font-mono text-sm text-gray-300 truncate">{address}</p>
        </div>

        {/* Score bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${scoreGradient(pattern.degenScore)} rounded-full transition-all duration-1000`}
              style={{ width: `${pattern.degenScore}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox
            icon={<TrendingUp className="w-4 h-4" />}
            label="ETH Balance"
            value={ethBalance.toFixed(4)}
            sub={`${totalTokens} tokens`}
          />
          <StatBox
            icon={<Flame className="w-4 h-4" />}
            label="Transactions"
            value={pattern.totalTransactions.toString()}
            sub={`${pattern.activeDays} active days`}
          />
          <StatBox
            icon={<Zap className="w-4 h-4" />}
            label="Volume"
            value={`${pattern.totalVolume.toFixed(2)} Ξ`}
            sub={`Avg ${pattern.avgTxValue.toFixed(4)} Ξ`}
          />
          <StatBox
            icon={<Shield className="w-4 h-4" />}
            label="Risk Score"
            value={`${pattern.riskScore}/100`}
            sub={`${pattern.uniqueContracts} contracts`}
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, sub }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
  );
}
