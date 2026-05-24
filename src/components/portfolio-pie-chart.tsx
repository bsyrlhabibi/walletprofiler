"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PortfolioSlice } from "@/lib/token-categories";
import { useState } from "react";

interface PortfolioPieChartProps {
  slices: PortfolioSlice[];
  totalValueUsd: number;
}

export default function PortfolioPieChart({ slices, totalValueUsd }: PortfolioPieChartProps) {
  const [activeSlice, setActiveSlice] = useState<PortfolioSlice | null>(null);

  if (slices.length === 0 || totalValueUsd <= 0) return null;

  const chartData = slices.map((s) => ({
    name: s.label,
    value: s.valueUsd,
    color: s.color,
    emoji: s.emoji,
    percentage: s.percentage,
    tokenCount: s.tokenCount,
    tokens: s.tokens,
  }));

  const displaySlice = activeSlice || slices[0];

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Portfolio Breakdown</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveSlice(slices[index])}
                onMouseLeave={() => setActiveSlice(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="white"
                    strokeWidth={2}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      filter: activeSlice && activeSlice.label !== entry.name ? "opacity(0.5)" : "none",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{data.emoji}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{data.name}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ${data.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {data.percentage.toFixed(1)}% · {data.tokenCount} token{data.tokenCount > 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center text overlay */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none sm:hidden">
          <div className="text-lg font-black text-gray-800 dark:text-gray-100">
            ${totalValueUsd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Legend / Details */}
        <div className="flex-1 w-full">
          {/* Active slice detail */}
          <div className="mb-4 p-3 rounded-xl border" style={{ backgroundColor: `${displaySlice.color}10`, borderColor: `${displaySlice.color}30` }}>
            <div className="flex items-center gap-2 mb-1">
              <span>{displaySlice.emoji}</span>
              <span className="font-bold text-gray-800 dark:text-gray-100">{displaySlice.label}</span>
              <span className="text-sm font-semibold" style={{ color: displaySlice.color }}>
                {displaySlice.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">
              ${displaySlice.valueUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {displaySlice.tokens.slice(0, 5).map((t) => (
                <span
                  key={t.symbol}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-gray-800/50 border"
                  style={{ borderColor: `${displaySlice.color}30`, color: displaySlice.color }}
                >
                  {t.symbol}
                  {t.valueUsd > 0 && (
                    <span className="text-gray-500 dark:text-gray-400">
                      ${t.valueUsd >= 1000 ? `${(t.valueUsd / 1000).toFixed(1)}k` : t.valueUsd.toFixed(0)}
                    </span>
                  )}
                </span>
              ))}
              {displaySlice.tokens.length > 5 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">+{displaySlice.tokens.length - 5} more</span>
              )}
            </div>
          </div>

          {/* Category list */}
          <div className="space-y-1.5">
            {slices.map((s) => (
              <button
                key={s.category}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all text-left ${
                  activeSlice?.category === s.category ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                }`}
                onMouseEnter={() => setActiveSlice(s)}
                onMouseLeave={() => setActiveSlice(null)}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex-1">{s.emoji} {s.label}</span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  ${s.valueUsd >= 1000 ? `${(s.valueUsd / 1000).toFixed(1)}k` : s.valueUsd.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right">{s.percentage.toFixed(1)}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
