"use client";

import { useState } from "react";
import { Transaction } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, ExternalLink, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TxTimelineProps {
  transactions: Transaction[];
  currency?: string;
  explorerUrl?: string;
}

export default function TxTimeline({ transactions, currency = "ETH", explorerUrl = "etherscan.io" }: TxTimelineProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const filteredTxs = filter === "all"
    ? transactions
    : transactions.filter((tx) => tx.direction === filter);

  const totalPages = Math.max(1, Math.ceil(filteredTxs.length / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const displayTxs = filteredTxs.slice(start, start + perPage);

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

  const getDisplayToken = (tx: Transaction) => {
    if (tx.category === "external") return currency;
    return tx.asset || "???";
  };

  const formatValue = (tx: Transaction) => {
    const val = tx.valueFormatted;
    if (tx.category === "external") return val.toFixed(4);
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

  const pageBtn = "px-3 py-1.5 text-sm font-medium rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="glass-card p-4 animate-fade-in animate-fade-in-delay-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Clock className="w-4 h-4 text-fuchsia-400" />
          Transactions
        </h3>
        <span className="text-xs text-gray-400 bg-fuchsia-50 px-2 py-0.5 rounded-full">
          {filteredTxs.length}{filter !== "all" ? ` ${filter}` : ""} total
        </span>
      </div>

      {/* Table header */}
      <div className="flex items-center justify-between py-2 px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
        <div className="flex items-center gap-2 w-[200px]">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as "all" | "in" | "out");
              setPage(1);
            }}
            className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs font-semibold cursor-pointer hover:border-indigo-300 transition outline-none normal-case"
          >
            <option value="all">Any</option>
            <option value="in">In</option>
            <option value="out">Out</option>
          </select>
          <span>Type</span>
        </div>
        <div className="text-right min-w-[80px]">Amount</div>
        <div className="text-right min-w-[70px]">Age</div>
        <div className="w-[14px]"></div>
      </div>

      {/* Transaction list */}
      <div className="space-y-1">
        {displayTxs.map((tx, i) => {
          const token = getDisplayToken(tx);
          const value = formatValue(tx);
          const badge = getCategoryBadge(tx);

          return (
            <a
              key={`${tx.hash}-${start + i}`}
              href={`https://${explorerUrl}/tx/${tx.hash}`}
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
                <div className="text-right min-w-[80px]">
                  <div className={`text-sm font-mono font-semibold ${getDirectionColor(tx.direction)}`}>
                    {tx.direction === "in" ? "+" : "−"}{value} {token}
                  </div>
                </div>
                <div className="text-right min-w-[70px]">
                  <div className="text-xs text-gray-400">{formatTime(tx.timestamp)}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-fuchsia-400 transition" />
              </div>
            </a>
          );
        })}

        {filteredTxs.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            No transactions found
          </div>
        )}
      </div>

      {/* Pagination bar */}
      {filteredTxs.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          {/* Left: Show per page */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Show:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium cursor-pointer hover:border-indigo-300 transition outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>Records</span>
          </div>

          {/* Right: Page navigation */}
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={safePage <= 1} className={pageBtn}>
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className={pageBtn}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 font-medium px-2">
              Page {safePage} of {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className={pageBtn}>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={safePage >= totalPages} className={pageBtn}>
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
