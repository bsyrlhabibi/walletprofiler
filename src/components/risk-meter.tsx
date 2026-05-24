"use client";

import { TradingPattern } from "@/lib/types";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface RiskMeterProps {
  pattern: TradingPattern;
}

export default function RiskMeter({ pattern }: RiskMeterProps) {
  const riskLevel = pattern.riskScore >= 70 ? "high" : pattern.riskScore >= 40 ? "medium" : "low";

  const riskConfig = {
    high: { color: "text-rose-600", bg: "bg-rose-50 border-rose-100", barFrom: "from-rose-400", barTo: "to-red-500", icon: AlertTriangle, label: "High Risk" },
    medium: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", barFrom: "from-amber-400", barTo: "to-orange-500", icon: Shield, label: "Medium Risk" },
    low: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", barFrom: "from-emerald-400", barTo: "to-teal-500", icon: CheckCircle, label: "Low Risk" },
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
    <div className={`glass-card p-4 animate-fade-in animate-fade-in-delay-2 border ${config.bg}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600">Risk Assessment</h3>
          <span className={`text-lg font-bold ${config.color}`}>{config.label}</span>
        </div>
        <div className="ml-auto">
          <div className={`text-4xl font-black bg-gradient-to-r ${config.barFrom} ${config.barTo} bg-clip-text text-transparent`}>
            {pattern.riskScore}
          </div>
          <div className="text-[10px] text-gray-400 text-center">/ 100</div>
        </div>
      </div>

      {/* Risk bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full bg-gradient-to-r ${config.barFrom} ${config.barTo} rounded-full transition-all duration-1000`}
          style={{ width: `${pattern.riskScore}%` }}
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center bg-white/60 rounded-lg p-2">
          <div className="text-[10px] text-gray-400 font-medium">Buy/Sell</div>
          <div className="text-sm font-mono font-bold text-gray-700">
            {pattern.buyCount}/{pattern.sellCount}
          </div>
        </div>
        <div className="text-center bg-white/60 rounded-lg p-2">
          <div className="text-[10px] text-gray-400 font-medium">Largest Tx</div>
          <div className="text-sm font-mono font-bold text-gray-700">
            {pattern.largestTx.toFixed(2)} Ξ
          </div>
        </div>
        <div className="text-center bg-white/60 rounded-lg p-2">
          <div className="text-[10px] text-gray-400 font-medium">Contracts</div>
          <div className="text-sm font-mono font-bold text-gray-700">{pattern.uniqueContracts}</div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-1.5">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/50 rounded-lg px-3 py-1.5">
              <TrendingUp className={`w-3.5 h-3.5 ${config.color} mt-0.5 flex-shrink-0`} />
              <span className="text-xs text-gray-500">{insight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
