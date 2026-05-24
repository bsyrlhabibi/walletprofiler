import { NextRequest, NextResponse } from "next/server";
import {
  getBalance, getAssetTransfers, getTokenBalances, getTokenMetadata,
  getBlock, isAlchemyConfigured, getSupportedChains, getChainCurrency,
  getExplorerUrl, getChainCoinGeckoId, getPrices, getCoinGeckoId, alchemyRPC
} from "@/lib/alchemy";
import { analyzeTransactions } from "@/lib/analysis";
import { getKnownWalletLabel } from "@/lib/known-wallets";
import { buildPortfolioBreakdown } from "@/lib/token-categories";
import { Transaction, TokenBalance, WalletProfile } from "@/lib/types";

function isAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

// Common function selectors → human-readable names
const METHOD_SELECTORS: Record<string, string> = {
  "0x3593564c": "Swap",
  "0x8803dbee": "Swap",
  "0x7ff36ab5": "SwapExactETHForTokens",
  "0x18cbafe5": "SwapExactTokensForETH",
  "0x38ed1739": "SwapExactTokensForTokens",
  "0xa9059cbb": "Transfer",
  "0x23b872dd": "TransferFrom",
  "0x095ea7b3": "Approve",
  "0x1249c58b": "Mint",
  "0xa0712d68": "Mint",
  "0x40c10f19": "Mint",
  "0x9dc29fac": "Burn",
  "0xdb006a75": "Redeem",
  "0x2e1a7d4d": "Withdraw",
  "0xd0e30db0": "Deposit",
  "0xe8e33700": "AddLiquidity",
  "0xf305d719": "AddLiquidityETH",
  "0xbaa2abde": "RemoveLiquidity",
  "0x02751cec": "RemoveLiquidityETH",
  "0x5c11d795": "SwapExactTokensForTokensSupportingFeeOnTransferTokens",
  "0xfb3bdb41": "SwapETHForExactTokens",
  "0x1a695230": "Transfer",
  "0x617ba037": "Supply",
  "0x69328dec": "Withdraw",
  "0xa415bcad": "Borrow",
  "0x573ade81": "Repay",
  "0x5cffe9de": "Execute",
  "0x00000000": "Transfer", // some tokens use this
};

function decodeMethod(input: string): string | null {
  if (!input || input === "0x" || input.length < 10) return null;
  const selector = input.slice(0, 10).toLowerCase();
  return METHOD_SELECTORS[selector] || null;
}

interface RawTransfer {
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  category: string;
  blockNum: string;
  rawContract?: { value?: string; decimal?: string };
}

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    let chain = req.nextUrl.searchParams.get("chain") || "eth";

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    if (!getSupportedChains().includes(chain)) chain = "eth";
    if (!isAlchemyConfigured()) {
      return NextResponse.json({ error: "Alchemy API key not configured" }, { status: 500 });
    }

    const addr = address.toLowerCase();
    const currency = getChainCurrency(chain);
    const nativeName = chain === "polygon" ? "Polygon" : chain === "base" ? "Base" : chain === "optimism" ? "Optimism" : chain === "arbitrum" ? "Arbitrum" : chain === "bnb" ? "BNB Chain" : "Ethereum";
    const explorerUrl = getExplorerUrl(chain);

    // Fetch more transfers (200 each direction) for richer grouping
    const [ethBalanceHex, allTransfersOut, allTransfersIn, ethOnlyOut, ethOnlyIn, rawTokenBalances, knownWallet] = await Promise.all([
      getBalance(address, chain),
      getAssetTransfers(chain, address, undefined, 200),
      getAssetTransfers(chain, undefined, address, 200),
      getAssetTransfers(chain, address, undefined, 200, ["external"]),
      getAssetTransfers(chain, undefined, address, 200, ["external"]),
      getTokenBalances(address, chain).catch(() => []),
      Promise.resolve(getKnownWalletLabel(address)),
    ]);

    const ethBalance = parseInt(ethBalanceHex, 16) / 1e18;

    // Process token balances with metadata
    const tokenBalances: TokenBalance[] = [];
    const tokenSymbols: string[] = [];

    for (const tb of rawTokenBalances) {
      const rawBalance = parseInt(tb.tokenBalance || "0x0", 16);
      if (rawBalance === 0) continue;

      let meta: { name?: string; symbol?: string; logo?: string; decimals?: number } = {};
      try {
        meta = await getTokenMetadata(tb.contractAddress, chain) || {};
      } catch { /* skip */ }

      const decimals = meta.decimals || 18;
      const symbol = meta.symbol || "???";
      tokenSymbols.push(symbol);

      tokenBalances.push({
        contractAddress: tb.contractAddress,
        name: meta.name || "Unknown",
        symbol,
        logo: meta.logo || null,
        balance: tb.tokenBalance,
        balanceFormatted: rawBalance / Math.pow(10, decimals),
        decimals,
        priceUsd: null,
        valueUsd: null,
      });
    }

    // Fetch prices from CoinGecko
    const coinGeckoIds: string[] = [getChainCoinGeckoId(chain)];
    for (const symbol of tokenSymbols) {
      const id = getCoinGeckoId(symbol);
      if (id) coinGeckoIds.push(id);
    }

    const prices = await getPrices(coinGeckoIds);

    const nativePriceId = getChainCoinGeckoId(chain);
    const nativePriceUsd = prices[nativePriceId] || 0;
    const ethBalanceUsd = ethBalance * nativePriceUsd;

    let totalTokenValueUsd = 0;
    for (const token of tokenBalances) {
      const cgId = getCoinGeckoId(token.symbol);
      if (cgId && prices[cgId]) {
        token.priceUsd = prices[cgId];
        token.valueUsd = token.balanceFormatted * prices[cgId];
        totalTokenValueUsd += token.valueUsd;
      }
    }

    const totalValueUsd = ethBalanceUsd + totalTokenValueUsd;
    const portfolioBreakdown = buildPortfolioBreakdown(tokenBalances, ethBalanceUsd, currency);

    // === GROUP ALL TRANSFERS BY TX HASH ===
    const allTransfers: RawTransfer[] = [...(allTransfersOut || []), ...(allTransfersIn || [])];
    const txGroups = new Map<string, RawTransfer[]>();

    for (const t of allTransfers) {
      if (!t.hash) continue;
      const existing = txGroups.get(t.hash) || [];
      existing.push({
        hash: t.hash,
        from: (t.from || "").toLowerCase(),
        to: (t.to || "").toLowerCase(),
        value: parseFloat(String(t.value || "0")),
        asset: t.asset || "???",
        category: t.category || "external",
        blockNum: t.blockNum || "0x0",
        rawContract: t.rawContract,
      });
      txGroups.set(t.hash, existing);
    }

    // Sort groups by block number (newest first)
    const sortedHashes = Array.from(txGroups.entries()).sort((a, b) => {
      const blockA = parseInt(a[1][0]?.blockNum || "0", 16);
      const blockB = parseInt(b[1][0]?.blockNum || "0", 16);
      return blockB - blockA;
    });

    // Fetch transaction receipts for method selectors (batch via Alchemy)
    const hashList = sortedHashes.slice(0, 50).map(([hash]) => hash);
    const receiptMap = new Map<string, { method: string; gasUsed: string; status: string }>();

    // Fetch receipts in parallel (5 at a time to not overwhelm)
    for (let i = 0; i < hashList.length; i += 5) {
      const batch = hashList.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map(async (hash) => {
          const receipt = await getTransactionReceipt(hash, chain);
          const txData = await getTransaction(hash, chain);
          const method = decodeMethod(txData?.input || "") || "Transfer";
          return {
            hash,
            method,
            gasUsed: receipt?.gasUsed || "0",
            status: receipt?.status === "0x1" ? "success" : "failed",
          };
        })
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) {
          receiptMap.set(r.value.hash, r.value);
        }
      }
    }

    // === BUILD ENHANCED TRANSACTIONS ===
    const transactions: Transaction[] = [];

    for (const [hash, transfers] of sortedHashes.slice(0, 100)) {
      const blockNum = parseInt(transfers[0]?.blockNum || "0x0", 16);
      const receipt = receiptMap.get(hash);

      // Categorize transfers in this tx
      const outTransfers = transfers.filter(t => t.from === addr && t.to !== addr);
      const inTransfers = transfers.filter(t => t.to === addr && t.from !== addr);
      const selfTransfers = transfers.filter(t => t.from === addr && t.to === addr);

      // Determine overall direction
      let direction: "in" | "out" | "self" = "out";
      if (outTransfers.length === 0 && inTransfers.length > 0) direction = "in";
      else if (outTransfers.length > 0 && inTransfers.length === 0) direction = "out";
      else if (outTransfers.length > 0 && inTransfers.length > 0) direction = "out"; // swap-like
      else if (selfTransfers.length > 0) direction = "self";

      // Build rich description
      const method = receipt?.method || "Transfer";
      let description = "";

      if (method === "Approve") {
        const token = outTransfers[0]?.asset || inTransfers[0]?.asset || "Token";
        description = `Approve ${token}`;
      } else if (outTransfers.length > 0 && inTransfers.length > 0) {
        // Swap-like: sent something, received something else
        const sentAsset = outTransfers.find(t => t.category === "external")?.asset ||
                          outTransfers[0]?.asset || currency;
        const sentVal = outTransfers.find(t => t.category === "external")?.value ||
                        outTransfers[0]?.value || 0;
        const recvAsset = inTransfers.find(t => t.category !== "external")?.asset ||
                          inTransfers[0]?.asset || currency;
        const recvVal = inTransfers.find(t => t.category !== "external")?.value ||
                        inTransfers[0]?.value || 0;

        const sentPrice = getQuickPrice(sentAsset, prices, currency, nativePriceUsd);
        const recvPrice = getQuickPrice(recvAsset, prices, currency, nativePriceUsd);

        description = `Swap ${formatTxValue(sentVal)} ${sentAsset}`;
        if (sentPrice > 0) description += ` ($${(sentVal * sentPrice).toFixed(2)})`;
        description += ` → ${formatTxValue(recvVal)} ${recvAsset}`;
        if (recvPrice > 0) description += ` ($${(recvVal * recvPrice).toFixed(2)})`;
      } else if (direction === "in") {
        const t = inTransfers[0];
        const price = getQuickPrice(t.asset, prices, currency, nativePriceUsd);
        description = `Receive ${formatTxValue(t.value)} ${t.asset}`;
        if (price > 0) description += ` ($${(t.value * price).toFixed(2)})`;
        description += ` from ${shortenAddr(t.from)}`;
      } else if (direction === "out") {
        const t = outTransfers[0];
        const price = getQuickPrice(t.asset, prices, currency, nativePriceUsd);
        description = `Send ${formatTxValue(t.value)} ${t.asset}`;
        if (price > 0) description += ` ($${(t.value * price).toFixed(2)})`;
        description += ` to ${shortenAddr(t.to)}`;
      } else {
        description = `Self Transfer`;
      }

      // Add method tag if it's not a simple transfer
      if (method !== "Transfer" && method !== "TransferFrom") {
        description = `[${method}] ${description}`;
      }

      // Add transfer count if complex
      if (transfers.length > 2) {
        description += ` (${transfers.length} transfers)`;
      }

      // Primary transfer for value display
      const primaryTransfer = direction === "in" ? inTransfers[0] : outTransfers[0] || transfers[0];
      const primaryAsset = primaryTransfer?.asset || currency;
      const primaryValue = primaryTransfer?.value || 0;

      const isNative = primaryTransfer?.category === "external";

      transactions.push({
        hash,
        from: primaryTransfer?.from || addr,
        to: primaryTransfer?.to || addr,
        value: primaryValue.toString(),
        valueFormatted: primaryValue,
        timestamp: 0,
        method: receipt?.method || "Transfer",
        description,
        status: (receipt?.status as "success" | "failed") || "success",
        gasUsed: receipt?.gasUsed || "0",
        gasPrice: "0",
        direction,
        category: primaryTransfer?.category || "external",
        asset: isNative ? currency : primaryAsset,
        tokenName: isNative ? nativeName : primaryAsset,
      });
    }

    // ETH-only volume
    const ethTransfers: any[] = [...(ethOnlyOut || []), ...(ethOnlyIn || [])];
    const ethSeen = new Set<string>();
    const uniqueEthTransfers = ethTransfers.filter((t: any) => {
      if (!t.hash || ethSeen.has(t.hash)) return false;
      ethSeen.add(t.hash);
      return true;
    });

    let ethVolume = 0;
    for (const t of uniqueEthTransfers) ethVolume += parseFloat(t.value || "0");

    // Get timestamps
    const blockNumSet = new Set<number>();
    for (const tx of transactions.slice(0, 20)) {
      // Find block number from txGroups
      const group = txGroups.get(tx.hash);
      if (group) {
        const bn = parseInt(group[0]?.blockNum || "0x0", 16);
        if (bn > 0) blockNumSet.add(bn);
      }
    }

    const blockTimestamps: Record<number, number> = {};
    for (const blockNum of Array.from(blockNumSet).slice(0, 10)) {
      try {
        const block = await getBlock(blockNum, chain);
        if (block) blockTimestamps[blockNum] = block.timestamp;
      } catch { /* skip */ }
    }

    for (const tx of transactions) {
      const group = txGroups.get(tx.hash);
      if (group) {
        const bn = parseInt(group[0]?.blockNum || "0x0", 16);
        tx.timestamp = blockTimestamps[bn] || 0;
      }
    }

    const pattern = analyzeTransactions(transactions, tokenBalances);
    pattern.totalVolume = +ethVolume.toFixed(4);
    pattern.avgTxValue = uniqueEthTransfers.length > 0
      ? +(ethVolume / uniqueEthTransfers.length).toFixed(6)
      : 0;

    const profile: WalletProfile & { portfolioBreakdown?: any } = {
      address: addr,
      walletLabel: knownWallet?.name || null,
      walletType: knownWallet?.type || null,
      walletTag: knownWallet?.tag || null,
      ethBalance,
      ethBalanceUsd,
      tokenBalances: tokenBalances.slice(0, 50),
      totalValueUsd,
      transactionCount: transactions.length,
      transactions: transactions.slice(0, 100),
      pattern,
      chain,
      explorerUrl,
      portfolioBreakdown,
    };

    return NextResponse.json(profile);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Wallet API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Helper: fetch transaction receipt
async function getTransactionReceipt(hash: string, chain: string) {
  try {
    const result = await import("@/lib/alchemy").then(m =>
      m.alchemyRPC("eth_getTransactionReceipt", [hash], chain)
    );
    return result;
  } catch {
    return null;
  }
}

// Helper: fetch transaction data (for input/method)
async function getTransaction(hash: string, chain: string) {
  try {
    const result = await import("@/lib/alchemy").then(m =>
      m.alchemyRPC("eth_getTransactionByHash", [hash], chain)
    );
    return result;
  } catch {
    return null;
  }
}

// Helper: get price for a token symbol
function getQuickPrice(symbol: string, prices: Record<string, number>, nativeCurrency: string, nativePrice: number): number {
  if (symbol === nativeCurrency) return nativePrice;
  const cgMap: Record<string, string> = {
    ETH: "ethereum", WETH: "ethereum", MATIC: "matic-network", WMATIC: "matic-network",
    USDC: "usd-coin", USDT: "tether", DAI: "dai", WBTC: "wrapped-bitcoin",
    LINK: "chainlink", UNI: "uniswap", AAVE: "aave", PEPE: "pepe", SHIB: "shiba-inu",
    ARB: "arbitrum", OP: "optimism", LDO: "lido-dao", CRV: "curve-dao-token",
  };
  const cgId = cgMap[symbol.toUpperCase()];
  return cgId ? (prices[cgId] || 0) : 0;
}

// Helper: format tx value nicely
function formatTxValue(val: number): string {
  if (val === 0) return "0";
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(2)}K`;
  if (val >= 1) return val.toFixed(4);
  if (val >= 0.0001) return val.toFixed(6);
  return val.toExponential(2);
}

// Helper: shorten address
function shortenAddr(addr: string): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
