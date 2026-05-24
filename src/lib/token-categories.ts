/**
 * Token categorization and portfolio breakdown utilities.
 * Classifies tokens into categories (stablecoin, DeFi, L2, etc.)
 * and builds portfolio pie chart data.
 * @module lib/token-categories
 */

import type { PortfolioSlice } from "@/types/wallet";

export type TokenCategory = "stablecoin" | "defi" | "l2" | "meme" | "wrapped" | "governance" | "nft" | "other";

/** Display metadata for a token category. */
export interface CategoryInfo {
  label: string;
  color: string;
  emoji: string;
}

/** Category display configuration (label, color, emoji). */
export const CATEGORY_MAP: Record<TokenCategory, CategoryInfo> = {
  stablecoin: { label: "Stablecoins", color: "#10b981", emoji: "💵" },
  defi:       { label: "DeFi", color: "#8b5cf6", emoji: "🏦" },
  l2:         { label: "Layer 2", color: "#3b82f6", emoji: "🔷" },
  meme:       { label: "Meme Coins", color: "#f59e0b", emoji: "🐸" },
  wrapped:    { label: "Wrapped", color: "#6366f1", emoji: "🔄" },
  governance: { label: "Governance", color: "#ec4899", emoji: "🏛️" },
  nft:        { label: "NFT Tokens", color: "#14b8a6", emoji: "🎨" },
  other:      { label: "Other", color: "#9ca3af", emoji: "📦" },
};

const STABLECOINS = new Set([
  "USDC", "USDT", "DAI", "BUSD", "TUSD", "USDP", "FRAX", "LUSD", "sUSD",
  "GUSD", "USDD", "CUSD", "MIM", "DOLA", "ALUSD", "agEUR", "EURC",
]);

const DEFI_TOKENS = new Set([
  "UNI", "AAVE", "COMP", "MKR", "SNX", "CRV", "LDO", "RPL", "SUSHI",
  "YFI", "BAL", "1INCH", "DYDX", "GMX", "PENDLE", "EIGEN", "ENA",
  "CVX", "FXS", "ALCX", "BADGER", "KP3R", "CREAM", "BNT", "RUNE",
  "JOE", "VELO", "AERO", "GRAIL", "CAMELOT",
]);

const L2_TOKENS = new Set(["ARB", "OP", "MATIC", "IMX", "METIS", "BOBA", "LRC"]);

const MEME_TOKENS = new Set([
  "PEPE", "SHIB", "DOGE", "FLOKI", "WIF", "BONK", "BRETT", "DEGEN",
  "TOSHI", "MOG", "TURBO", "LADYS", "LUNC", "ELON", "AKITA",
]);

const WRAPPED_TOKENS = new Set([
  "WETH", "WBTC", "WMATIC", "WBNB", "WAVAX", "WSOL", "stETH", "rETH",
  "cbETH", "sfrxETH", "weETH",
]);

const GOVERNANCE_TOKENS = new Set([
  "ENS", "UNI", "AAVE", "COMP", "MKR", "DYDX", "RPL", "BAL",
  "SNX", "YFI", "SUSHI", "1INCH", "BLUR", "LOOKS",
]);

const NFT_TOKENS = new Set([
  "APE", "BLUR", "LOOKS", "SAND", "MANA", "AXS", "GALA", "ILV",
  "RNDR", "RARI", "SUDO", "X2Y2",
]);

/**
 * Categorize a token by its symbol into one of the predefined categories.
 * Priority: stablecoin > meme > wrapped > l2 > nft > defi > governance > other.
 * @param symbol - Token ticker symbol
 * @returns The TokenCategory classification
 */
export function categorizeToken(symbol: string): TokenCategory {
  const upper = symbol.toUpperCase();
  if (STABLECOINS.has(upper)) return "stablecoin";
  if (MEME_TOKENS.has(upper)) return "meme";
  if (WRAPPED_TOKENS.has(upper)) return "wrapped";
  if (L2_TOKENS.has(upper)) return "l2";
  if (NFT_TOKENS.has(upper)) return "nft";
  if (DEFI_TOKENS.has(upper)) return "defi";
  if (GOVERNANCE_TOKENS.has(upper)) return "governance";
  return "other";
}

/**
 * Build a portfolio breakdown array from token balances and native balance.
 * Groups tokens by category and calculates percentages for pie chart display.
 *
 * @param tokens - Array of tokens with symbol and USD value
 * @param nativeBalanceUsd - USD value of the native token balance
 * @param nativeCurrency - Native currency symbol (e.g. "ETH")
 * @returns Sorted array of PortfolioSlice objects (largest first)
 */
export function buildPortfolioBreakdown(
  tokens: { symbol: string; valueUsd: number | null }[],
  nativeBalanceUsd: number,
  nativeCurrency: string,
): PortfolioSlice[] {
  const categoryValues: Record<TokenCategory, { valueUsd: number; tokens: { symbol: string; valueUsd: number }[] }> = {
    stablecoin: { valueUsd: 0, tokens: [] },
    defi:       { valueUsd: 0, tokens: [] },
    l2:         { valueUsd: 0, tokens: [] },
    meme:       { valueUsd: 0, tokens: [] },
    wrapped:    { valueUsd: 0, tokens: [] },
    governance: { valueUsd: 0, tokens: [] },
    nft:        { valueUsd: 0, tokens: [] },
    other:      { valueUsd: 0, tokens: [] },
  };

  if (nativeBalanceUsd > 0) {
    categoryValues.wrapped.valueUsd += nativeBalanceUsd;
    categoryValues.wrapped.tokens.push({ symbol: nativeCurrency, valueUsd: nativeBalanceUsd });
  }

  for (const token of tokens) {
    if (!token.valueUsd || token.valueUsd <= 0) continue;
    const cat = categorizeToken(token.symbol);
    categoryValues[cat].valueUsd += token.valueUsd;
    categoryValues[cat].tokens.push({ symbol: token.symbol, valueUsd: token.valueUsd });
  }

  const totalValue = Object.values(categoryValues).reduce((sum, c) => sum + c.valueUsd, 0);

  const slices: PortfolioSlice[] = [];
  for (const [cat, info] of Object.entries(categoryValues)) {
    if (info.valueUsd <= 0) continue;
    const meta = CATEGORY_MAP[cat as TokenCategory];
    slices.push({
      category: cat,
      label: meta.label,
      color: meta.color,
      emoji: meta.emoji,
      valueUsd: info.valueUsd,
      percentage: totalValue > 0 ? (info.valueUsd / totalValue) * 100 : 0,
      tokenCount: info.tokens.length,
      tokens: info.tokens.sort((a, b) => b.valueUsd - a.valueUsd),
    });
  }

  return slices.sort((a, b) => b.valueUsd - a.valueUsd);
}
