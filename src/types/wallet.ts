/**
 * Core TypeScript interfaces and types for the WalletProfiler application.
 * @module types/wallet
 */

/** Token balance held by a wallet. */
export interface TokenBalance {
  contractAddress: string;
  name: string;
  symbol: string;
  logo: string | null;
  balance: string;
  balanceFormatted: number;
  decimals: number;
  priceUsd: number | null;
  valueUsd: number | null;
}

/** A single on-chain transaction. */
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: number;
  timestamp: number;
  method: string;
  description?: string;
  status: "success" | "failed";
  gasUsed: string;
  gasPrice: string;
  direction: "in" | "out" | "self";
  category: string;
  /** Token symbol: "ETH", "USDC", etc. */
  asset: string;
  /** Token full name: "Ethereum", "USD Coin", etc. */
  tokenName: string;
}

/** Aggregated trading pattern analysis for a wallet. */
export interface TradingPattern {
  totalTransactions: number;
  firstActivity: number;
  lastActivity: number;
  activeDays: number;
  avgTxPerDay: number;
  avgTxValue: number;
  medianTxValue: number;
  largestTx: number;
  totalVolume: number;
  uniqueTokens: number;
  uniqueContracts: number;
  buyCount: number;
  sellCount: number;
  buyRatio: number;
  preferredTokens: { symbol: string; count: number }[];
  activityByHour: number[];
  activityByDay: number[];
  /** On-chain activity level (0-100). */
  activityScore: number;
  /** Legitimacy / safety score (0-100). */
  trustScore: number;
  /** Human-readable trust label. */
  trustLevel: string;
  trustFactors: string[];
  activityFactors: string[];
  personaType: string;
  personaEmoji: string;
  personaDescription: string;
  degenScore: number;
}

/** A single slice in the portfolio pie chart. */
export interface PortfolioSlice {
  category: string;
  label: string;
  color: string;
  emoji: string;
  valueUsd: number;
  percentage: number;
  tokenCount: number;
  tokens: { symbol: string; valueUsd: number }[];
}

/** Full wallet profile returned by the API. */
export interface WalletProfile {
  address: string;
  walletLabel: string | null;
  walletType: string | null;
  walletTag: string | null;
  ethBalance: number;
  ethBalanceUsd: number;
  tokenBalances: TokenBalance[];
  totalValueUsd: number;
  transactionCount: number;
  transactions: Transaction[];
  pattern: TradingPattern;
  chain: string;
  explorerUrl: string;
  portfolioBreakdown?: PortfolioSlice[];
}

/** Single cell in an activity heatmap grid. */
export interface ActivityHeatmapData {
  day: number;
  hour: number;
  value: number;
}

/** A data point for time-series charts. */
export interface ChartDataPoint {
  date: string;
  value: number;
  count: number;
}

/** Raw transfer object from Alchemy's alchemy_getAssetTransfers. */
export interface RawTransfer {
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  category: string;
  blockNum: string;
  rawContract?: { value?: string; decimal?: string };
}
