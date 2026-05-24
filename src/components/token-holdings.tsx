"use client";

import { TokenBalance } from "@/lib/types";
import { Coins, ExternalLink } from "lucide-react";

interface TokenHoldingsProps {
  tokens: TokenBalance[];
  ethBalance: number;
}

export default function TokenHoldings({ tokens, ethBalance }: TokenHoldingsProps) {
  const displayTokens = tokens.slice(0, 15);

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          Token Holdings
        </h3>
        <span className="text-xs text-gray-500">{tokens.length + 1} assets</span>
      </div>

      <div className="space-y-1.5">
        {/* ETH */}
        <div className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-sm">
              Ξ
            </div>
            <div>
              <div className="text-sm font-medium text-white">Ethereum</div>
              <div className="text-xs text-gray-500">ETH</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-white">{ethBalance.toFixed(4)}</div>
          </div>
        </div>

        {/* ERC-20 tokens */}
        {displayTokens.map((token, i) => {
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
              className="flex items-center justify-between py-2 px-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs overflow-hidden">
                  {token.logo ? (
                    <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">{token.symbol.slice(0, 2)}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white truncate max-w-[120px]">{token.name}</div>
                  <div className="text-xs text-gray-500">{token.symbol}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-mono text-gray-300">{displayBalance}</div>
                </div>
                <a
                  href={`https://etherscan.io/token/${token.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-400 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}

        {displayTokens.length === 0 && (
          <div className="text-center text-gray-600 text-sm py-4">
            No ERC-20 tokens found
          </div>
        )}
      </div>
    </div>
  );
}
