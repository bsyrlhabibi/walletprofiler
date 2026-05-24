"use client";

import { TokenBalance } from "@/lib/types";
import { Coins, ExternalLink, Gem } from "lucide-react";

interface TokenHoldingsProps {
  tokens: TokenBalance[];
  ethBalance: number;
}

export default function TokenHoldings({ tokens, ethBalance }: TokenHoldingsProps) {
  const displayTokens = tokens.slice(0, 15);

  return (
    <div className="glass-card p-4 animate-fade-in animate-fade-in-delay-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          Token Holdings
        </h3>
        <span className="text-xs text-gray-400 bg-amber-50 px-2 py-0.5 rounded-full">{tokens.length + 1} assets</span>
      </div>

      <div className="space-y-1.5">
        {/* ETH */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-blue-50/80 rounded-xl border border-blue-100/50 hover:bg-blue-50 transition">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-200">
              Ξ
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">Ethereum</div>
              <div className="text-xs text-gray-400">ETH</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-semibold text-gray-800">{ethBalance.toFixed(4)}</div>
          </div>
        </div>

        {/* ERC-20 tokens */}
        {displayTokens.map((token) => {
          const formatted = token.balanceFormatted;
          if (formatted === 0) return null;

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
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition group"
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
                  <div className="text-xs text-gray-400">{token.symbol}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-mono text-gray-600">{displayBalance}</div>
                </div>
                <a
                  href={`https://etherscan.io/token/${token.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 group-hover:text-indigo-400 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}

        {displayTokens.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-6">
            No ERC-20 tokens found
          </div>
        )}
      </div>
    </div>
  );
}
