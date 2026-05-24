"use client";

import { TokenBalance } from "@/lib/types";
import { Coins, ExternalLink, Gem } from "lucide-react";

interface TokenHoldingsProps {
  tokens: TokenBalance[];
  ethBalance: number;
  chain?: string;
  explorerUrl?: string;
  nativePriceUsd?: number;
}

const CHAIN_NATIVE: Record<string, { name: string; symbol: string; icon: string; color: string }> = {
  eth: { name: "Ethereum", symbol: "ETH", icon: "Ξ", color: "from-blue-400 to-indigo-500" },
  polygon: { name: "Polygon", symbol: "MATIC", icon: "⬡", color: "from-purple-400 to-violet-500" },
  arbitrum: { name: "Arbitrum", symbol: "ETH", icon: "🔵", color: "from-blue-400 to-sky-500" },
  optimism: { name: "Optimism", symbol: "ETH", icon: "🔴", color: "from-rose-400 to-red-500" },
  base: { name: "Base", symbol: "ETH", icon: "🔷", color: "from-sky-400 to-cyan-500" },
  bnb: { name: "BNB Chain", symbol: "BNB", icon: "🟡", color: "from-yellow-400 to-amber-500" },
};

export default function TokenHoldings({ tokens, ethBalance, chain, explorerUrl = "etherscan.io", nativePriceUsd }: TokenHoldingsProps) {
  const native = CHAIN_NATIVE[chain || "eth"] || CHAIN_NATIVE.eth;

  // Sort: tokens with USD value first (desc), then those without
  const sortedTokens = [...tokens].sort((a, b) => {
    const aVal = a.valueUsd || 0;
    const bVal = b.valueUsd || 0;
    if (aVal > 0 && bVal > 0) return bVal - aVal;
    if (aVal > 0) return -1;
    if (bVal > 0) return 1;
    return b.balanceFormatted - a.balanceFormatted;
  });

  const nativeUsd = nativePriceUsd && nativePriceUsd > 0 ? ethBalance * nativePriceUsd : null;

  return (
    <div className="glass-card p-4 animate-fade-in animate-fade-in-delay-2 min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          Token Holdings
        </h3>
        <span className="text-xs text-gray-400 bg-amber-50 px-2 py-0.5 rounded-full">
          {tokens.length + 1} assets
        </span>
      </div>

      <div className="space-y-1.5 max-h-[372px] overflow-y-auto pr-1 scrollbar-thin">
        {/* Native token (ETH/MATIC) */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-blue-50/80 rounded-xl border border-gray-200 hover:bg-blue-50 transition sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${native.color} flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-200`}>
              {native.icon}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{native.name}</div>
              <div className="text-xs text-gray-400">{native.symbol}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-semibold text-gray-800">{ethBalance.toFixed(4)}</div>
            {nativeUsd !== null && (
              <div className="text-xs font-semibold text-emerald-600">
                ${nativeUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>

        {/* ERC-20 tokens — all tokens */}
        {sortedTokens.map((token) => {
          const formatted = token.balanceFormatted;

          const displayBalance = formatted > 1000000
            ? `${(formatted / 1000000).toFixed(2)}M`
            : formatted > 1000
            ? `${(formatted / 1000).toFixed(2)}K`
            : formatted > 1
            ? formatted.toFixed(2)
            : formatted.toFixed(6);

          return (
            <div
              key={token.contractAddress}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs overflow-hidden shadow-sm">
                  {token.logo ? (
                    <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Gem className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{token.name}</div>
                  <div className="text-xs text-gray-400">{token.symbol} · {displayBalance}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  {token.valueUsd && token.valueUsd > 0 ? (
                    <>
                      <div className="text-sm font-bold text-gray-800">
                        ${token.valueUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {token.priceUsd && token.priceUsd > 0 && (
                        <div className="text-[10px] text-gray-400">
                          @${token.priceUsd >= 1 ? token.priceUsd.toFixed(2) : token.priceUsd.toFixed(6)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-300">—</div>
                  )}
                </div>
                <a
                  href={`https://${explorerUrl}/token/${token.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 group-hover:text-fuchsia-400 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}

        {sortedTokens.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-6">
            No tokens with USD value found
          </div>
        )}
      </div>
    </div>
  );
}
