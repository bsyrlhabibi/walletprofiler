import { NextRequest, NextResponse } from "next/server";
import { getBalance, getAssetTransfers, getTokenBalances, getTokenMetadata, getBlock, isAlchemyConfigured } from "@/lib/alchemy";
import { analyzeTransactions } from "@/lib/analysis";
import { Transaction, TokenBalance, WalletProfile } from "@/lib/types";

function isAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    const chain = req.nextUrl.searchParams.get("chain") || "eth";

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    if (!isAlchemyConfigured()) {
      return NextResponse.json({ error: "Alchemy API key not configured" }, { status: 500 });
    }

    const addr = address.toLowerCase();

    // Parallel fetch
    const [ethBalanceHex, transfersOut, transfersIn, rawTokenBalances] = await Promise.all([
      getBalance(address),
      getAssetTransfers(address, undefined, 100),
      getAssetTransfers(undefined, address, 100),
      getTokenBalances(address),
    ]);

    const ethBalance = parseInt(ethBalanceHex, 16) / 1e18;

    // Process token balances with metadata
    const tokenBalances: TokenBalance[] = [];
    for (const tb of rawTokenBalances) {
      const rawBalance = parseInt(tb.tokenBalance || "0x0", 16);
      if (rawBalance === 0) continue;

      let meta: { name?: string; symbol?: string; logo?: string; decimals?: number } = {};
      try {
        meta = await getTokenMetadata(tb.contractAddress) || {};
      } catch {
        // skip
      }

      const decimals = meta.decimals || 18;
      tokenBalances.push({
        contractAddress: tb.contractAddress,
        name: meta.name || "Unknown",
        symbol: meta.symbol || "???",
        logo: meta.logo || null,
        balance: tb.tokenBalance,
        balanceFormatted: rawBalance / Math.pow(10, decimals),
        decimals,
        priceUsd: null,
        valueUsd: null,
      });
    }

    // Deduplicate transfers by hash
    const allTransfers = [...transfersOut, ...transfersIn];
    const seen = new Set<string>();
    const uniqueTransfers = allTransfers.filter((t: Record<string, unknown>) => {
      const hash = t.hash as string;
      if (!hash || seen.has(hash)) return false;
      seen.add(hash);
      return true;
    });

    // Sort by block number desc
    uniqueTransfers.sort((a, b) => {
      return parseInt((b.blockNum as string) || "0", 16) - parseInt((a.blockNum as string) || "0", 16);
    });

    // Build transactions
    const transactions: Transaction[] = uniqueTransfers.map((t: Record<string, unknown>) => {
      const value = parseFloat((t.value as string) || "0");
      const from = ((t.from as string) || "").toLowerCase();
      const to = ((t.to as string) || "").toLowerCase();

      let direction: "in" | "out" | "self" = "out";
      if (from === to) direction = "self";
      else if (to === addr) direction = "in";

      return {
        hash: (t.hash as string) || "",
        from,
        to,
        value: (t.value as string) || "0",
        valueFormatted: value,
        timestamp: 0,
        method: direction === "in" ? "Receive" : direction === "out" ? "Send" : "Self",
        status: "success" as const,
        gasUsed: "0",
        gasPrice: "0",
        direction,
        category: (t.category as string) || "external",
      };
    });

    // Get timestamps for recent txs
    const blockNumSet = new Set<number>();
    for (const t of uniqueTransfers.slice(0, 20)) {
      const bn = parseInt((t.blockNum as string) || "0x0", 16);
      if (bn > 0) blockNumSet.add(bn);
    }

    const blockTimestamps: Record<number, number> = {};
    for (const blockNum of Array.from(blockNumSet).slice(0, 10)) {
      try {
        const block = await getBlock(blockNum);
        if (block) blockTimestamps[blockNum] = block.timestamp;
      } catch {
        // skip
      }
    }

    for (let i = 0; i < transactions.length; i++) {
      const blockNum = parseInt((uniqueTransfers[i]?.blockNum as string) || "0x0", 16);
      transactions[i].timestamp = blockTimestamps[blockNum] || 0;
    }

    const pattern = analyzeTransactions(transactions, tokenBalances);

    const profile: WalletProfile = {
      address: addr,
      ensName: null,
      ethBalance,
      ethBalanceUsd: 0,
      tokenBalances: tokenBalances.slice(0, 50),
      totalValueUsd: 0,
      transactionCount: transactions.length,
      transactions: transactions.slice(0, 100),
      pattern,
      chain,
    };

    return NextResponse.json(profile);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Wallet API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
