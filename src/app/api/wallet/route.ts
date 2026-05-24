import { NextRequest, NextResponse } from "next/server";
import {
  getBalance, getAssetTransfers, getTokenBalances, getTokenMetadata,
  getBlock, isAlchemyConfigured, getSupportedChains, getChainCurrency,
  getExplorerUrl, getChainCoinGeckoId, getPrices, getCoinGeckoId
} from "@/lib/alchemy";
import { analyzeTransactions } from "@/lib/analysis";
import { getKnownWalletLabel } from "@/lib/known-wallets";
import { buildPortfolioBreakdown } from "@/lib/token-categories";
import { Transaction, TokenBalance, WalletProfile } from "@/lib/types";

function isAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
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
    const nativeName = chain === "polygon" ? "Polygon" : chain === "base" ? "Base" : chain === "optimism" ? "Optimism" : chain === "arbitrum" ? "Arbitrum" : "Ethereum";
    const explorerUrl = getExplorerUrl(chain);

    const [ethBalanceHex, allTransfersOut, allTransfersIn, ethOnlyOut, ethOnlyIn, rawTokenBalances, knownWallet] = await Promise.all([
      getBalance(address, chain),
      getAssetTransfers(chain, address, undefined, 100),
      getAssetTransfers(chain, undefined, address, 100),
      getAssetTransfers(chain, address, undefined, 100, ["external"]),
      getAssetTransfers(chain, undefined, address, 100, ["external"]),
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

    // Calculate native token USD value
    const nativePriceId = getChainCoinGeckoId(chain);
    const nativePriceUsd = prices[nativePriceId] || 0;
    const ethBalanceUsd = ethBalance * nativePriceUsd;

    // Calculate token USD values
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

    // Build portfolio breakdown
    const portfolioBreakdown = buildPortfolioBreakdown(tokenBalances, ethBalanceUsd, currency);

    // Process ALL transfers for transaction analysis
    const allTransfers: any[] = [...(allTransfersOut || []), ...(allTransfersIn || [])];
    const seen = new Set<string>();
    const uniqueTransfers = allTransfers.filter((t: any) => {
      if (!t.hash || seen.has(t.hash)) return false;
      seen.add(t.hash);
      return true;
    });

    uniqueTransfers.sort((a: any, b: any) =>
      parseInt(b.blockNum || "0", 16) - parseInt(a.blockNum || "0", 16)
    );

    // Build transactions with correct asset info
    const transactions: Transaction[] = uniqueTransfers.map((t: any) => {
      const value = parseFloat(t.value || "0");
      const from = (t.from || "").toLowerCase();
      const to = (t.to || "").toLowerCase();

      let direction: "in" | "out" | "self" = "out";
      if (from === to) direction = "self";
      else if (to === addr) direction = "in";

      const isNative = t.category === "external";
      return {
        hash: t.hash || "",
        from, to,
        value: t.value?.toString() || "0",
        valueFormatted: value,
        timestamp: 0,
        method: direction === "in" ? "Receive" : direction === "out" ? "Send" : "Self",
        status: "success" as const,
        gasUsed: "0", gasPrice: "0",
        direction,
        category: t.category || "external",
        asset: isNative ? currency : (t.asset || "???"),
        tokenName: isNative ? nativeName : (t.asset || "Unknown"),
      };
    });

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
    for (const t of uniqueTransfers.slice(0, 20)) {
      const bn = parseInt(t.blockNum || "0x0", 16);
      if (bn > 0) blockNumSet.add(bn);
    }

    const blockTimestamps: Record<number, number> = {};
    for (const blockNum of Array.from(blockNumSet).slice(0, 10)) {
      try {
        const block = await getBlock(blockNum, chain);
        if (block) blockTimestamps[blockNum] = block.timestamp;
      } catch { /* skip */ }
    }

    for (let i = 0; i < transactions.length; i++) {
      const blockNum = parseInt(uniqueTransfers[i]?.blockNum || "0x0", 16);
      transactions[i].timestamp = blockTimestamps[blockNum] || 0;
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
