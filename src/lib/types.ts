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

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: number;
  timestamp: number;
  method: string;
  status: "success" | "failed";
  gasUsed: string;
  gasPrice: string;
  direction: "in" | "out" | "self";
  category: string;
}

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
  riskScore: number;
  personaType: string;
  personaEmoji: string;
  personaDescription: string;
  degenScore: number;
}

export interface WalletProfile {
  address: string;
  ensName: string | null;
  ethBalance: number;
  ethBalanceUsd: number;
  tokenBalances: TokenBalance[];
  totalValueUsd: number;
  transactionCount: number;
  transactions: Transaction[];
  pattern: TradingPattern;
  chain: string;
}

export interface ActivityHeatmapData {
  day: number;
  hour: number;
  value: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  count: number;
}
