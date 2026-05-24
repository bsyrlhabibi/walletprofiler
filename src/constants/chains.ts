/**
 * Chain configuration constants used across the application.
 * @module constants/chains
 */

/** Supported blockchain chain identifiers. */
export const SUPPORTED_CHAINS = ["eth", "polygon", "arbitrum", "optimism", "base", "bnb"] as const;
export type ChainId = (typeof SUPPORTED_CHAINS)[number];

/** Chain metadata for UI display. */
export const CHAIN_META: Record<ChainId, { id: ChainId; label: string; icon: string; color: string }> = {
  eth:      { id: "eth",      label: "Ethereum", icon: "⟠", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  polygon:  { id: "polygon",  label: "Polygon",  icon: "⬡", color: "bg-purple-50 text-purple-600 border-purple-200" },
  arbitrum: { id: "arbitrum", label: "Arbitrum", icon: "🔵", color: "bg-blue-50 text-blue-600 border-blue-200" },
  optimism: { id: "optimism", label: "Optimism", icon: "🔴", color: "bg-rose-50 text-rose-600 border-rose-200" },
  base:     { id: "base",     label: "Base",     icon: "🔷", color: "bg-sky-50 text-sky-600 border-sky-200" },
  bnb:      { id: "bnb",      label: "BNB",      icon: "🟡", color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
};

/** Native currency symbol for each chain. */
export const CHAIN_CURRENCY: Record<ChainId, string> = {
  eth: "ETH", polygon: "MATIC", arbitrum: "ETH", optimism: "ETH", base: "ETH", bnb: "BNB",
};

/** Human-readable chain names. */
export const CHAIN_NAMES: Record<ChainId, string> = {
  eth: "Ethereum", polygon: "Polygon", arbitrum: "Arbitrum",
  optimism: "Optimism", base: "Base", bnb: "BNB Chain",
};

/** Block explorer domains per chain. */
export const CHAIN_EXPLORER: Record<ChainId, string> = {
  eth: "etherscan.io", polygon: "polygonscan.com", arbitrum: "arbiscan.io",
  optimism: "optimistic.etherscan.io", base: "basescan.org", bnb: "bscscan.com",
};

/** Alchemy subdomain endpoints per chain. */
export const CHAIN_ENDPOINTS: Record<ChainId, string> = {
  eth: "eth-mainnet", polygon: "polygon-mainnet", arbitrum: "arb-mainnet",
  optimism: "opt-mainnet", base: "base-mainnet", bnb: "bnb-mainnet",
};

/** CoinGecko IDs for native tokens. */
export const CHAIN_COINGECKO_ID: Record<ChainId, string> = {
  eth: "ethereum", polygon: "matic-network", arbitrum: "ethereum",
  optimism: "ethereum", base: "ethereum", bnb: "binancecoin",
};

/** Chain metadata for persona card display (with extended styling). */
export const CHAIN_LABELS: Record<ChainId, { name: string; icon: string; color: string; currency: string }> = {
  eth:      { name: "Ethereum",   icon: "⟠", color: "bg-indigo-100 text-indigo-700", currency: "ETH" },
  polygon:  { name: "Polygon",    icon: "⬡", color: "bg-purple-100 text-purple-700", currency: "MATIC" },
  arbitrum: { name: "Arbitrum",   icon: "🔵", color: "bg-blue-100 text-blue-700",     currency: "ETH" },
  optimism: { name: "Optimism",   icon: "🔴", color: "bg-rose-100 text-rose-700",     currency: "ETH" },
  base:     { name: "Base",       icon: "🔷", color: "bg-sky-100 text-sky-700",       currency: "ETH" },
  bnb:      { name: "BNB Chain",  icon: "🟡", color: "bg-yellow-100 text-yellow-700", currency: "BNB" },
};

/** Native token display info per chain. */
export const CHAIN_NATIVE: Record<ChainId, { name: string; symbol: string; icon: string; color: string }> = {
  eth:      { name: "Ethereum",   symbol: "ETH",   icon: "Ξ", color: "from-blue-400 to-indigo-500" },
  polygon:  { name: "Polygon",    symbol: "MATIC", icon: "⬡", color: "from-purple-400 to-violet-500" },
  arbitrum: { name: "Arbitrum",   symbol: "ETH",   icon: "🔵", color: "from-blue-400 to-sky-500" },
  optimism: { name: "Optimism",   symbol: "ETH",   icon: "🔴", color: "from-rose-400 to-red-500" },
  base:     { name: "Base",       symbol: "ETH",   icon: "🔷", color: "from-sky-400 to-cyan-500" },
  bnb:      { name: "BNB Chain",  symbol: "BNB",   icon: "🟡", color: "from-yellow-400 to-amber-500" },
};
