"use client";

import { TradingPattern } from "@/lib/types";
import { Shield, TrendingUp, CheckCircle, AlertTriangle, Info, Zap, Activity } from "lucide-react";

interface TrustActivityPanelProps {
  pattern: TradingPattern;
}

export default function TrustActivityPanel({ pattern }: TrustActivityPanelProps) {
  const trustConfig: Record<string, { color: string; bg: string; icon: typeof Shield; label: string; emoji: string }> = {
    Trusted: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle, label: "Trusted", emoji: "✅" },
    Moderate: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Shield, label: "Moderate", emoji: "🛡️" },
    Caution: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Info, label: "Caution", emoji: "⚠️" },
    Risky: { color: "text-rose-600", bg: "bg-rose-50 border-rose-200", icon: AlertTriangle, label: "Risky", emoji: "🚨" },
    Unknown: { color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: Info, label: "Unknown", emoji: "❓" },
  };

  const trust = trustConfig[pattern.trustLevel] || trustConfig.Unknown;
  const TrustIcon = trust.icon;

  const getBarColor = (score: number, type: "activity" | "trust") => {
    if (type === "trust") {
      if (score >= 80) return "from-emerald-400 to-green-500";
      if (score >= 60) return "from-blue-400 to-indigo-500";
      if (score >= 40) return "from-amber-400 to-orange-500";
      return "from-rose-400 to-red-500";
    }
    // activity
    if (score >= 80) return "from-fuchsia-400 to-purple-500";
    if (score >= 60) return "from-indigo-400 to-blue-500";
    if (score >= 40) return "from-cyan-400 to-teal-500";
    return "from-gray-300 to-gray-400";
  };

  return (
    <div className="glass-card p-5 animate-fade-in animate-fade-in-delay-2 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-fuchsia-500" />
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Wallet Intelligence</h3>
      </div>

      {/* Activity Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Activity Score</span>
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
            {pattern.activityScore}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full bg-gradient-to-r ${getBarColor(pattern.activityScore, "activity")} rounded-full transition-all duration-1000`}
            style={{ width: `${pattern.activityScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-2">
          <span>Quiet</span>
          <span>Hyperactive</span>
        </div>
        {/* Activity factors */}
        <div className="space-y-1">
          {pattern.activityFactors.slice(0, 3).map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-fuchsia-50/50 rounded-lg px-3 py-1.5">
              <TrendingUp className="w-3 h-3 text-fuchsia-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-800" />

      {/* Trust Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trust Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${trust.bg} ${trust.color}`}>
              {trust.emoji} {trust.label}
            </span>
            <span className={`text-2xl font-black bg-gradient-to-r ${getBarColor(pattern.trustScore, "trust")} bg-clip-text text-transparent`}>
              {pattern.trustScore}
            </span>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full bg-gradient-to-r ${getBarColor(pattern.trustScore, "trust")} rounded-full transition-all duration-1000`}
            style={{ width: `${pattern.trustScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-2">
          <span>Risky</span>
          <span>Fully Trusted</span>
        </div>
        {/* Trust factors */}
        <div className="space-y-1">
          {pattern.trustFactors.map((f, i) => {
            const isNegative = f.toLowerCase().includes("high failure") ||
              f.toLowerCase().includes("extreme") ||
              f.toLowerCase().includes("new account") ||
              f.toLowerCase().includes("suspicious") ||
              f.toLowerCase().includes("unknown") ||
              f.toLowerCase().includes("dust");
            return (
              <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-1.5 ${isNegative ? "bg-rose-50/50" : "bg-emerald-50/50"}`}>
                {isNegative ? (
                  <AlertTriangle className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">{f}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
