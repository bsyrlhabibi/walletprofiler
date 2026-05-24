// Token categorization for portfolio breakdown

export type TokenCategory = "stablecoin" | "defi" | "l2" | "meme" | "wrapped" | "governance" | "nft" | "other";

export interface CategoryInfo {
  label: string;
  color: string;
  emoji: string;
}

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

// Stablecoins
const STABLECOINS = new Set([
  "USDC", "USDT", "DAI", "BUSD", "TUSD", "USDP", "FRAX", "LUSD", "sUSD",
  "GUSD", "USDD", "CUSD", "MIM", "DOLA", "ALUSD", "agEUR", "EURC",
]);

// DeFi tokens
const DEFI_TOKENS = new Set([
  "UNI", "AAVE", "COMP", "MKR", "SNX", "CRV", "LDO", "RPL", "SUSHI",
  "YFI", "BAL", "1INCH", "DYDX", "GMX", "PENDLE", "EIGEN", "ENA",
  "CVX", "FXS", "ALCX", "BADGER", "KP3R", "CREAM", "BNT", "RUNE",
  "JOE", "VELO", "AERO", "GRAIL", "CAMELOT",
]);

// Layer 2 tokens
const L2_TOKENS = new Set([
  "ARB", "OP", "MATIC", "IMX", "METIS", "BOBA", "LRC",
]);

// Meme coins
const MEME_TOKENS = new Set([
  "PEPE", "SHIB", "DOGE", "FLOKI", "WIF", "BONK", "BRETT", "DEGEN",
  "TOSHI", "MOG", "TURBO", "LADYS", "LUNC", "ELON", "AKITA",
]);

// Wrapped tokens
const WRAPPED_TOKENS = new Set([
  "WETH", "WBTC", "WMATIC", "WBNB", "WAVAX", "WSOL", "stETH", "rETH",
  "cbETH", "sfrxETH", "weETH",
]);

// Governance tokens
const GOVERNANCE_TOKENS = new Set([
  "ENS", "UNI", "AAVE", "COMP", "MKR", "DYDX", "RPL", "BAL",
  "SNX", "YFI", "SUSHI", "1INCH", "BLUR", "LOOKS",
]);

// NFT-related tokens
const NFT_TOKENS = new Set([
  "APE", "BLUR", "LOOKS", "SAND", "MANA", "AXS", "GALA", "ILV",
  "RNDR", "RARI", "SUDO", "X2Y2",
]);

/**
 * Categorize a token by its symbol
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

export interface PortfolioSlice {
  category: TokenCategory;
  label: string;
  color: string;
  emoji: string;
  valueUsd: number;
  percentage: number;
  tokenCount: number;
  tokens: { symbol: string; valueUsd: number }[];
}

/**
 * Build portfolio breakdown from token balances + native balance
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

  // Add native token as "wrapped" category (it's the base asset)
  if (nativeBalanceUsd > 0) {
    categoryValues.wrapped.valueUsd += nativeBalanceUsd;
    categoryValues.wrapped.tokens.push({ symbol: nativeCurrency, valueUsd: nativeBalanceUsd });
  }

  // Categorize ERC-20 tokens
  for (const token of tokens) {
    if (!token.valueUsd || token.valueUsd <= 0) continue;
    const cat = categorizeToken(token.symbol);
    categoryValues[cat].valueUsd += token.valueUsd;
    categoryValues[cat].tokens.push({ symbol: token.symbol, valueUsd: token.valueUsd });
  }

  const totalValue = Object.values(categoryValues).reduce((sum, c) => sum + c.valueUsd, 0);

  // Build slices (only non-zero)
  const slices: PortfolioSlice[] = [];
  for (const [cat, info] of Object.entries(categoryValues)) {
    if (info.valueUsd <= 0) continue;
    const meta = CATEGORY_MAP[cat as TokenCategory];
    slices.push({
      category: cat as TokenCategory,
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
