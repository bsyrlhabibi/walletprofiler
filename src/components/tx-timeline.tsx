"use client";

import { Transaction } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, ExternalLink } from "lucide-react";

interface TxTimelineProps {
  transactions: Transaction[];
}

export default function TxTimeline({ transactions }: TxTimelineProps) {
  const displayTxs = transactions.slice(0, 20);

  const getIcon = (dir: string) => {
    switch (dir) {
      case "in": return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case "out": return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDirectionLabel = (dir: string) => {
    switch (dir) {
      case "in": return "Received";
      case "out": return "Sent";
      default: return "Self";
    }
  };

  const getDirectionColor = (dir: string) => {
    switch (dir) {
      case "in": return "text-green-400";
      case "out": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const shortenAddr = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

  const formatTime = (ts: number) => {
    if (!ts) return "Unknown";
    const d = new Date(ts * 1000);
    const now = Date.now() / 1000;
    const diff = now - ts;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/30 p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Transactions</h3>
      <div className="space-y-1">
        {displayTxs.map((tx, i) => (
          <a
            key={`${tx.hash}-${i}`}
            href={`https://etherscan.io/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-800/50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                {getIcon(tx.direction)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getDirectionColor(tx.direction)}`}>
                    {getDirectionLabel(tx.direction)}
                  </span>
                  <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                    {tx.category}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">
                  {tx.direction === "in" ? `from ${shortenAddr(tx.from)}` : `to ${shortenAddr(tx.to)}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`text-sm font-mono ${getDirectionColor(tx.direction)}`}>
                  {tx.direction === "in" ? "+" : "−"}{tx.valueFormatted.toFixed(4)} Ξ
                </div>
                <div className="text-xs text-gray-600">{formatTime(tx.timestamp)}</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition" />
            </div>
          </a>
        ))}
        {displayTxs.length === 0 && (
          <div className="text-center text-gray-600 text-sm py-8">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}
