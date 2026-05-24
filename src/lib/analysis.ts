import { Transaction, TradingPattern, TokenBalance } from "./types";

const PERSONAS = [
  {
    min: 0, max: 20,
    type: "Observer", emoji: "👀",
    description: "Barely on-chain. Watches from the sidelines.",
  },
  {
    min: 20, max: 40,
    type: "Casual", emoji: "🚶",
    description: "Occasional transactions. Dipping toes in DeFi.",
  },
  {
    min: 40, max: 60,
    type: "Active Trader", emoji: "📊",
    description: "Regular on-chain activity. Knows the game.",
  },
  {
    min: 60, max: 80,
    type: "Degen", emoji: "🔥",
    description: "Lives on-chain. High frequency, high risk.",
  },
  {
    min: 80, max: 101,
    type: "Whale Degen", emoji: "🐋",
    description: "Top-tier on-chain presence. Moves markets.",
  },
];

export function analyzeTransactions(
  txs: Transaction[],
  tokens: TokenBalance[]
): TradingPattern {
  if (txs.length === 0) {
    return {
      totalTransactions: 0,
      firstActivity: 0,
      lastActivity: 0,
      activeDays: 0,
      avgTxPerDay: 0,
      avgTxValue: 0,
      medianTxValue: 0,
      largestTx: 0,
      totalVolume: 0,
      uniqueTokens: 0,
      uniqueContracts: 0,
      buyCount: 0,
      sellCount: 0,
      buyRatio: 0,
      preferredTokens: [],
      activityByHour: new Array(24).fill(0),
      activityByDay: new Array(7).fill(0),
      riskScore: 0,
      personaType: "Ghost",
      personaEmoji: "👻",
      personaDescription: "No on-chain activity detected.",
      degenScore: 0,
    };
  }

  const values = txs.map((t) => t.valueFormatted).sort((a, b) => a - b);
  const totalVolume = values.reduce((a, b) => a + b, 0);
  const avgTxValue = totalVolume / txs.length;
  const medianTxValue = values[Math.floor(values.length / 2)];
  const largestTx = values[values.length - 1];

  // Unique days
  const days = new Set(txs.map((t) => Math.floor(t.timestamp / 86400)));
  const activeDays = days.size;
  const firstActivity = txs[txs.length - 1].timestamp;
  const lastActivity = txs[0].timestamp;

  // Direction counts
  const buyCount = txs.filter((t) => t.direction === "in").length;
  const sellCount = txs.filter((t) => t.direction === "out").length;
  const buyRatio = buyCount / (buyCount + sellCount || 1);

  // Activity heatmap
  const activityByHour = new Array(24).fill(0);
  const activityByDay = new Array(7).fill(0);
  for (const tx of txs) {
    const date = new Date(tx.timestamp * 1000);
    activityByHour[date.getUTCHours()]++;
    activityByDay[date.getUTCDay()]++;
  }

  // Unique tokens/contracts
  const contractSet = new Set(txs.map((t) => t.to).filter(Boolean));
  const uniqueContracts = contractSet.size;
  const uniqueTokens = tokens.length;

  // Preferred tokens
  const tokenFreq: Record<string, number> = {};
  for (const tx of txs) {
    if (tx.category === "erc20" || tx.category === "swap") {
      // We'll count by method mentions
    }
  }
  // Use token balances as proxy for preferred tokens
  const preferredTokens = tokens
    .slice(0, 5)
    .map((t) => ({ symbol: t.symbol, count: 1 }));

  // Scoring
  let score = 0;
  score += Math.min(txs.length / 50, 1) * 20; // tx count (max 20)
  score += Math.min(activeDays / 30, 1) * 15; // active days (max 15)
  score += Math.min(totalVolume / 10, 1) * 15; // volume (max 15)
  score += Math.min(uniqueContracts / 20, 1) * 15; // diversity (max 15)
  score += Math.min(uniqueTokens / 10, 1) * 10; // token variety (max 10)
  score += (buyRatio > 0.5 ? buyRatio : 1 - buyRatio) * 10; // activity bias (max 10)
  score += Math.min(avgTxValue / 1, 1) * 15; // avg tx size (max 15)

  const degenScore = Math.round(Math.min(score, 100));
  const riskScore = Math.round(
    Math.min(
      (largestTx > 5 ? 30 : largestTx * 6) +
        (avgTxValue > 1 ? 20 : avgTxValue * 20) +
        (uniqueContracts > 50 ? 25 : uniqueContracts * 0.5) +
        (txs.length > 100 ? 25 : txs.length * 0.25),
      100
    )
  );

  const persona = PERSONAS.find((p) => degenScore >= p.min && degenScore < p.max) || PERSONAS[0];

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
    riskScore,
    personaType: persona.type,
    personaEmoji: persona.emoji,
    personaDescription: persona.description,
    degenScore,
  };
}
