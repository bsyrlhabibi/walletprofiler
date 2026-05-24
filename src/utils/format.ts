/**
 * Formatting utility functions used across the application.
 * @module utils/format
 */

/**
 * Shorten an Ethereum address to `0xabcd...1234` format.
 * @param addr - Full hex address
 * @returns Shortened address string, or "—" if empty
 */
export function shortenAddress(addr: string): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Format a large number with locale-aware commas.
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with commas
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a transaction value for display with smart abbreviations.
 * Large values use M/K suffixes, small values use more decimals.
 * @param val - The numeric value to format
 * @returns Human-readable value string
 */
export function formatTxValue(val: number): string {
  if (val === 0) return "0";
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(2)}K`;
  if (val >= 1) return val.toFixed(4);
  if (val >= 0.0001) return val.toFixed(6);
  return val.toExponential(2);
}

/**
 * Format a token balance for compact display.
 * Uses K/M suffixes for large values, appropriate decimal places for small.
 * @param balance - Raw balance as a number
 * @returns Compact formatted string
 */
export function formatTokenBalance(balance: number): string {
  if (balance > 1000000) return `${(balance / 1000000).toFixed(2)}M`;
  if (balance > 1000) return `${(balance / 1000).toFixed(2)}K`;
  if (balance > 1) return balance.toFixed(2);
  return balance.toFixed(6);
}

/**
 * Convert a Unix timestamp to a relative "time ago" string.
 * Returns "Just now", "Xm ago", "Xh ago", "Xd ago", or a date.
 * @param ts - Unix timestamp in seconds (0 returns "Unknown")
 * @returns Human-readable relative time string
 */
export function formatTimeAgo(ts: number): string {
  if (!ts) return "Unknown";
  const diff = Date.now() / 1000 - ts;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Validate a hex Ethereum address.
 * @param addr - Address string to validate
 * @returns True if the address matches `0x` + 40 hex characters
 */
export function isAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

/**
 * Get a friendly chain display name from its ID.
 * @param chainId - Chain identifier (e.g. "eth", "polygon")
 * @returns Human-readable chain name
 */
export function getChainDisplayName(chainId: string): string {
  const names: Record<string, string> = {
    eth: "Ethereum", polygon: "Polygon", arbitrum: "Arbitrum",
    optimism: "Optimism", bnb: "BNB Chain", base: "Base",
  };
  return names[chainId] || chainId;
}
