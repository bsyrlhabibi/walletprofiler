import { Transaction, TradingPattern, TokenBalance } from "./types";

const PERSONAS = [
  { min: 0, max: 20, type: "Observer", emoji: "👀", description: "Barely on-chain. Watches from the sidelines." },
  { min: 20, max: 40, type: "Casual", emoji: "🚶", description: "Occasional transactions. Dipping toes in DeFi." },
  { min: 40, max: 60, type: "Active Trader", emoji: "📊", description: "Regular on-chain activity. Knows the game." },
  { min: 60, max: 80, type: "Degen", emoji: "🔥", description: "Lives on-chain. High frequency, high risk." },
  { min: 80, max: 101, type: "Whale Degen", emoji: "🐋", description: "Top-tier on-chain presence. Moves markets." },
];

// Known trusted tokens (blue chips)
const TRUSTED_TOKENS = new Set([
  "WETH", "USDC", "USDT", "DAI", "WBTC", "LINK", "UNI", "AAVE",
  "COMP", "MKR", "SNX", "CRV", "LDO", "RPL", "PEPE", "SHIB",
  "ENS", "LRC", "ZRX", "BAL", "SUSHI", "YFI", "GRT", "MATIC",
]);

// Known trusted contract patterns (DEX routers, well-known protocols)
const TRUSTED_CONTRACT_PATTERNS = [
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2 Router
  "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3 Router
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", // Uniswap V3 Router 02
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff", // 0x Exchange
  "0x1111111254fb6c44bac0bed2854e76f90643097d", // 1inch V4
  "0x1111111254eeb25477b68fb85ed929f73a960582", // 1inch V5
  "0xdef171fe48cf0115b1d80b88dc8eab59176fee57", // 0x Exchange Proxy
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad", // Uniswap Universal Router
];

export function analyzeTransactions(
  txs: Transaction[],
  tokens: TokenBalance[]
): TradingPattern {
  if (txs.length === 0) {
    return {
      totalTransactions: 0, firstActivity: 0, lastActivity: 0,
      activeDays: 0, avgTxPerDay: 0, avgTxValue: 0, medianTxValue: 0,
      largestTx: 0, totalVolume: 0, uniqueTokens: 0, uniqueContracts: 0,
      buyCount: 0, sellCount: 0, buyRatio: 0, preferredTokens: [],
      activityByHour: new Array(24).fill(0), activityByDay: new Array(7).fill(0),
      activityScore: 0, trustScore: 50, trustLevel: "Unknown",
      trustFactors: ["No on-chain activity"], activityFactors: ["No transactions"],
      personaType: "Ghost", personaEmoji: "👻",
      personaDescription: "No on-chain activity detected.", degenScore: 0,
    };
  }

  const values = txs.map((t) => t.valueFormatted).sort((a, b) => a - b);
  const totalVolume = values.reduce((a, b) => a + b, 0);
  const avgTxValue = totalVolume / txs.length;
  const medianTxValue = values[Math.floor(values.length / 2)];
  const largestTx = values[values.length - 1];

  const days = new Set(txs.map((t) => Math.floor(t.timestamp / 86400)));
  const activeDays = days.size;
  const firstActivity = txs[txs.length - 1].timestamp;
  const lastActivity = txs[0].timestamp;

  const buyCount = txs.filter((t) => t.direction === "in").length;
  const sellCount = txs.filter((t) => t.direction === "out").length;
  const buyRatio = buyCount / (buyCount + sellCount || 1);

  const activityByHour = new Array(24).fill(0);
  const activityByDay = new Array(7).fill(0);
  for (const tx of txs) {
    if (tx.timestamp > 0) {
      const date = new Date(tx.timestamp * 1000);
      activityByHour[date.getUTCHours()]++;
      activityByDay[date.getUTCDay()]++;
    }
  }

  const contractSet = new Set(txs.map((t) => t.to).filter(Boolean));
  const uniqueContracts = contractSet.size;
  const uniqueTokens = tokens.length;

  const preferredTokens = tokens
    .slice(0, 5)
    .map((t) => ({ symbol: t.symbol, count: 1 }));

  // =============================================
  // ACTIVITY SCORE (0-100) — seberapa aktif
  // =============================================
  const activityFactors: string[] = [];
  let activityScore = 0;

  const txScore = Math.min(txs.length / 50, 1) * 20;
  activityScore += txScore;
  if (txs.length > 100) activityFactors.push(`High transaction count (${txs.length})`);
  else if (txs.length > 20) activityFactors.push(`Moderate activity (${txs.length} txs)`);
  else activityFactors.push(`Low activity (${txs.length} txs)`);

  const dayScore = Math.min(activeDays / 30, 1) * 15;
  activityScore += dayScore;
  if (activeDays > 30) activityFactors.push(`Consistent presence (${activeDays} active days)`);

  const volScore = Math.min(totalVolume / 10, 1) * 15;
  activityScore += volScore;
  if (totalVolume > 10) activityFactors.push(`High volume (${totalVolume.toFixed(2)} Ξ)`);

  const divScore = Math.min(uniqueContracts / 20, 1) * 15;
  activityScore += divScore;
  if (uniqueContracts > 20) activityFactors.push(`Diverse interactions (${uniqueContracts} contracts)`);

  const tokenScore = Math.min(uniqueTokens / 10, 1) * 10;
  activityScore += tokenScore;

  const ratioScore = (buyRatio > 0.5 ? buyRatio : 1 - buyRatio) * 10;
  activityScore += ratioScore;

  const sizeScore = Math.min(avgTxValue / 1, 1) * 15;
  activityScore += sizeScore;
  if (avgTxValue > 1) activityFactors.push(`Above-average tx size (${avgTxValue.toFixed(2)} Ξ)`);

  activityScore = Math.round(Math.min(activityScore, 100));

  // =============================================
  // TRUST SCORE (0-100) — seberapa legit/aman
  // =============================================
  const trustFactors: string[] = [];
  let trustScore = 50; // start neutral

  // 1. Account age (older = more trustworthy)
  if (firstActivity > 0 && lastActivity > 0) {
    const ageDays = (lastActivity - firstActivity) / 86400;
    if (ageDays > 365) {
      trustScore += 15;
      trustFactors.push(`Account age: ${Math.floor(ageDays / 365)}+ year(s)`);
    } else if (ageDays > 90) {
      trustScore += 10;
      trustFactors.push(`Account age: ${Math.floor(ageDays / 30)}+ month(s)`);
    } else if (ageDays > 30) {
      trustScore += 5;
      trustFactors.push(`Account age: ${Math.floor(ageDays / 30)} month(s)`);
    } else {
      trustScore -= 10;
      trustFactors.push("New account (< 30 days)");
    }
  }

  // 2. Failed tx ratio (more failures = less trustworthy)
  const failedCount = txs.filter((t) => t.status === "failed").length;
  const failRatio = failedCount / txs.length;
  if (failRatio > 0.3) {
    trustScore -= 20;
    trustFactors.push(`High failure rate (${(failRatio * 100).toFixed(0)}%) — possible honeypot interactions`);
  } else if (failRatio > 0.1) {
    trustScore -= 10;
    trustFactors.push(`Some failed transactions (${(failRatio * 100).toFixed(0)}%)`);
  } else if (txs.length > 10) {
    trustScore += 5;
    trustFactors.push("Low failure rate — clean execution history");
  }

  // 3. Interaction with trusted contracts
  let trustedContractCount = 0;
  for (const contract of Array.from(contractSet)) {
    if (TRUSTED_CONTRACT_PATTERNS.includes(contract.toLowerCase())) {
      trustedContractCount++;
    }
  }
  if (trustedContractCount > 0) {
    trustScore += 10;
    trustFactors.push(`Interacts with known trusted protocols (${trustedContractCount})`);
  }

  // 4. Token quality (holding blue chips = more legit)
  const trustedTokenCount = tokens.filter((t) =>
    TRUSTED_TOKENS.has(t.symbol.toUpperCase())
  ).length;
  if (trustedTokenCount >= 3) {
    trustScore += 10;
    trustFactors.push(`Holds ${trustedTokenCount} established tokens (blue chips)`);
  } else if (trustedTokenCount >= 1) {
    trustScore += 5;
    trustFactors.push(`Holds ${trustedTokenCount} known token(s)`);
  }

  // 5. Suspicious patterns
  // Very one-sided buy/sell ratio (potential pump scheme)
  if (buyRatio > 0.95 || buyRatio < 0.05) {
    trustScore -= 10;
    trustFactors.push("Extreme buy/sell imbalance — potential scheme activity");
  }

  // Very large single transaction relative to average
  if (largestTx > avgTxValue * 100 && avgTxValue > 0) {
    trustScore -= 5;
    trustFactors.push("Unusually large transaction spike detected");
  }

  // Holding many unknown tokens (potential dust/spam tokens)
  const unknownTokens = tokens.filter((t) =>
    !TRUSTED_TOKENS.has(t.symbol.toUpperCase()) &&
    t.symbol !== "???" &&
    t.balanceFormatted > 0
  ).length;
  if (unknownTokens > 20) {
    trustScore -= 5;
    trustFactors.push(`${unknownTokens} unknown tokens in portfolio (possible dust/spam)`);
  }

  // 6. Normal, consistent activity = positive
  if (txs.length > 50 && failRatio < 0.05 && activeDays > 60) {
    trustScore += 10;
    trustFactors.push("Consistent, reliable on-chain behavior");
  }

  trustScore = Math.round(Math.max(0, Math.min(100, trustScore)));

  // Trust level label
  let trustLevel: string;
  if (trustScore >= 80) trustLevel = "Trusted";
  else if (trustScore >= 60) trustLevel = "Moderate";
  else if (trustScore >= 40) trustLevel = "Caution";
  else trustLevel = "Risky";

  // Persona based on ACTIVITY score (not trust)
  const persona = PERSONAS.find((p) => activityScore >= p.min && activityScore < p.max) || PERSONAS[0];

  return {
    totalTransactions: txs.length,
    firstActivity,
    lastActivity,
    activeDays,
    avgTxPerDay: activeDays > 0 ? +(txs.length / activeDays).toFixed(2) : 0,
    avgTxValue: +avgTxValue.toFixed(6),
    medianTxValue: +medianTxValue.toFixed(6),
    largestTx: +largestTx.toFixed(6),
    totalVolume: +totalVolume.toFixed(4),
    uniqueTokens,
    uniqueContracts,
    buyCount,
    sellCount,
    buyRatio: +buyRatio.toFixed(3),
    preferredTokens,
    activityByHour,
    activityByDay,
    activityScore,
    trustScore,
    trustLevel,
    trustFactors,
    activityFactors,
    personaType: persona.type,
    personaEmoji: persona.emoji,
    personaDescription: persona.description,
    degenScore: activityScore,
  };
}
