import { NextRequest, NextResponse } from "next/server";
import { getAlchemy, AssetTransfersCategory, SortingOrder } from "@/lib/alchemy";
import { analyzeTransactions } from "@/lib/analysis";
import { Transaction, TokenBalance, WalletProfile } from "@/lib/types";
import { ethers } from "ethers";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    const chain = req.nextUrl.searchParams.get("chain") || "eth";

    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
    }

    const alchemy = getAlchemy(chain);
    const categories = [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.ERC1155,
    ];

    // Parallel fetch
    const [ethBalanceRaw, tokenBalancesRaw, transfersRaw, incomingRaw] = await Promise.all([
      alchemy.core.getBalance(address),
      alchemy.core.getTokensForOwner(address).catch(() => ({ tokens: [] })),
      alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: categories,
        maxCount: 100,
        order: SortingOrder.DESCENDING,
      }).catch(() => ({ transfers: [] })),
      alchemy.core.getAssetTransfers({
        toAddress: address,
        category: categories,
        maxCount: 100,
        order: SortingOrder.DESCENDING,
      }).catch(() => ({ transfers: [] })),
    ]);

    const ethBalance = parseFloat(ethers.formatEther(ethBalanceRaw.toString()));

    // Process token balances
    const tokenBalances: TokenBalance[] = ((tokenBalancesRaw.tokens || []) as any[]).map((t: any) => ({
      contractAddress: t.contractAddress as string,
      name: (t.name as string) || "Unknown",
      symbol: (t.symbol as string) || "???",
      logo: t.logo as string | null,
      balance: t.balance as string,
      balanceFormatted: parseFloat((t.balance as string) || "0"),
      decimals: (t.decimals as number) || 18,
      priceUsd: null,
      valueUsd: null,
    }));

    // Process transactions - deduplicate by hash
    const allTransfers: any[] = [
      ...((transfersRaw.transfers || []) as any[]),
      ...((incomingRaw.transfers || []) as any[]),
    ];

    const seen = new Set<string>();
    const uniqueTransfers = allTransfers.filter((t: Record<string, unknown>) => {
      if (seen.has(t.hash as string)) return false;
      seen.add(t.hash as string);
      return true;
    });

    uniqueTransfers.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      return parseInt((b.blockNum as string) || "0", 16) - parseInt((a.blockNum as string) || "0", 16);
    });

    const addr = address.toLowerCase();

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

    // Get timestamps via block numbers
    const blockNumSet = new Set<number>();
    for (const t of uniqueTransfers.slice(0, 20)) {
      const bn = parseInt((t.blockNum as string) || "0x0", 16);
      if (bn > 0) blockNumSet.add(bn);
    }
    const blockNumbers = Array.from(blockNumSet);

    const blockTimestamps: Record<number, number> = {};
    for (const blockNum of blockNumbers.slice(0, 10)) {
      try {
        const block = await alchemy.core.getBlock(blockNum);
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
