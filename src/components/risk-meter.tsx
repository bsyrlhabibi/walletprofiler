"use client";

import { TradingPattern } from "@/lib/types";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface RiskMeterProps {
  pattern: TradingPattern;
}

export default function RiskMeter({ pattern }: RiskMeterProps) {
  const riskLevel = pattern.riskScore >= 70 ? "high" : pattern.riskScore >= 40 ? "medium" : "low";

  const riskConfig = {
    high: { color: "text-red-400", bg: "from-red-500/20 to-red-600/5", icon: AlertTriangle, label: "High Risk" },
    medium: { color: "text-yellow-400", bg: "from-yellow-500/20 to-yellow-600/5", icon: Shield, label: "Medium Risk" },
    low: { color: "text-green-400", bg: "from-green-500/20 to-green-600/5", icon: CheckCircle, label: "Low Risk" },
  };

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const insights = [];
  if (pattern.largestTx > 10) insights.push("Large single transactions detected");
  if (pattern.uniqueContracts > 50) insights.push("High contract interaction diversity");
  if (pattern.avgTxValue > 1) insights.push("Above-average transaction values");
  if (pattern.totalTransactions > 1000) insights.push("Very high transaction count");
  if (pattern.buyRatio > 0.8 || pattern.buyRatio < 0.2) insights.push("Unusual buy/sell ratio");

  return (
    <div className={`bg-gradient-to-br ${config.bg} rounded-xl border border-gray-700/30 p-4`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-6 h-6 ${config.color}`} />
        <div>
          <h3 className="text-sm font-semibold text-gray-300">Risk Assessment</h3>
          <span className={`text-lg font-bold ${config.color}`}>{config.label}</span>
        </div>
        <div className="ml-auto">
          <div className={`text-3xl font-black ${config.color}`}>{pattern.riskScore}</div>
          <div className="text-[10px] text-gray-500 text-center">/ 100</div>
        </div>
      </div>

      {/* Risk bar */}
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            riskLevel === "high" ? "bg-gradient-to-r from-red-500 to-red-400" :
            riskLevel === "medium" ? "bg-gradient-to-r from-yellow-500 to-yellow-400" :
            "bg-gradient-to-r from-green-500 to-green-400"
          }`}
          style={{ width: `${pattern.riskScore}%` }}
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-500">Buy/Sell</div>
          <div className="text-sm font-mono text-white">
            {pattern.buyCount}/{pattern.sellCount}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Largest Tx</div>
          <div className="text-sm font-mono text-white">
            {pattern.largestTx.toFixed(2)} Ξ
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Contracts</div>
          <div className="text-sm font-mono text-white">{pattern.uniqueContracts}</div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-1">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${config.color} mt-1.5 flex-shrink-0`} />
              <span className="text-xs text-gray-400">{insight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
