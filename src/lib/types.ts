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
  description?: string;
  status: "success" | "failed";
  gasUsed: string;
  gasPrice: string;
  direction: "in" | "out" | "self";
  category: string;
  asset: string;        // token symbol: "ETH", "POOL", "USDC", etc
  tokenName: string;    // token full name: "Ethereum", "PoolTogether", etc
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
  // Rebranded scores
  activityScore: number;   // seberapa aktif on-chain (0-100)
  trustScore: number;      // seberapa legit/aman wallet ini (0-100)
  trustLevel: string;      // "Trusted" | "Moderate" | "Caution" | "Risky"
  trustFactors: string[];  // alasan trust score
  activityFactors: string[]; // alasan activity score
  // Persona
  personaType: string;
  personaEmoji: string;
  personaDescription: string;
  degenScore: number;
}

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
