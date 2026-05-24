"use client";

import { Transaction } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, ExternalLink, Clock } from "lucide-react";

interface TxTimelineProps {
  transactions: Transaction[];
  currency?: string;
}

export default function TxTimeline({ transactions, currency = "ETH" }: TxTimelineProps) {
  const displayTxs = transactions.slice(0, 20);

  const getIcon = (dir: string) => {
    switch (dir) {
      case "in": return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
      case "out": return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBg = (dir: string) => {
    switch (dir) {
      case "in": return "bg-emerald-50";
      case "out": return "bg-rose-50";
      default: return "bg-gray-50";
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
      case "in": return "text-emerald-600";
      case "out": return "text-rose-600";
      default: return "text-gray-500";
    }
  };

  const shortenAddr = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

  const formatTime = (ts: number) => {
    if (!ts) return "Unknown";
    const diff = Date.now() / 1000 - ts;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get the correct display token for a transaction
  const getDisplayToken = (tx: Transaction) => {
    // If it's an external/native transfer, show native currency
    if (tx.category === "external") return currency;
    // Otherwise show the actual asset name
    return tx.asset || "???";
  };

  // Format value based on token type
  const formatValue = (tx: Transaction) => {
    const val = tx.valueFormatted;
    if (tx.category === "external") {
      // Native token — show 4 decimals
      return val.toFixed(4);
    }
    // ERC-20 — format based on size
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(2)}K`;
    if (val >= 1) return val.toFixed(2);
    return val.toFixed(4);
  };

  const getCategoryBadge = (tx: Transaction) => {
    if (tx.category === "external") return null;
    return (
      <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full font-medium border border-purple-100">
        {tx.category === "erc20" ? "ERC-20" : tx.category === "erc721" ? "NFT" : tx.category === "erc1155" ? "ERC-1155" : tx.category}
      </span>
    );
  };

  return (
    <div className="glass-card p-4 animate-fade-in animate-fade-in-delay-3">
      <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-fuchsia-400" />
        Recent Transactions
      </h3>
      <div className="space-y-1">
        {displayTxs.map((tx, i) => {
          const token = getDisplayToken(tx);
          const value = formatValue(tx);
          const badge = getCategoryBadge(tx);

          return (
            <a
              key={`${tx.hash}-${i}`}
              href={`https://etherscan.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${getBg(tx.direction)} flex items-center justify-center`}>
                  {getIcon(tx.direction)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getDirectionColor(tx.direction)}`}>
                      {getDirectionLabel(tx.direction)}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                      {token}
                    </span>
                    {badge}
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    {tx.direction === "in" ? `from ${shortenAddr(tx.from)}` : `to ${shortenAddr(tx.to)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-sm font-mono font-semibold ${getDirectionColor(tx.direction)}`}>
                    {tx.direction === "in" ? "+" : "−"}{value} {token}
                  </div>
                  <div className="text-xs text-gray-400">{formatTime(tx.timestamp)}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-fuchsia-400 transition" />
              </div>
            </a>
          );
        })}
        {displayTxs.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}
