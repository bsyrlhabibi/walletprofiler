import { NextRequest, NextResponse } from "next/server";
import { getAlchemy, AssetTransfersCategory, SortingOrder } from "@/lib/alchemy";
import { analyzeTransactions } from "@/lib/analysis";
import { Transaction, TokenBalance } from "@/lib/types";
import { ethers } from "ethers";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    const chain = req.nextUrl.searchParams.get("chain") || "eth";

    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const alchemy = getAlchemy(chain);
    const categories = [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.ERC1155,
    ];

    const [outgoing, incoming, tokens] = await Promise.all([
      alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: categories,
        maxCount: 200,
        order: SortingOrder.DESCENDING,
      }).catch(() => ({ transfers: [] })),
      alchemy.core.getAssetTransfers({
        toAddress: address,
        category: categories,
        maxCount: 200,
        order: SortingOrder.DESCENDING,
      }).catch(() => ({ transfers: [] })),
      alchemy.core.getTokensForOwner(address).catch(() => ({ tokens: [] })),
    ]);

    const allTransfers: any[] = [
      ...((outgoing.transfers || []) as any[]),
      ...((incoming.transfers || []) as any[]),
    ];

    // Deduplicate
    const seen = new Set<string>();
    const unique = allTransfers.filter((t: Record<string, unknown>) => {
      if (seen.has(t.hash as string)) return false;
      seen.add(t.hash as string);
      return true;
    });

    unique.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      parseInt((b.blockNum as string) || "0", 16) - parseInt((a.blockNum as string) || "0", 16)
    );

    const addr = address.toLowerCase();

    const transactions: Transaction[] = unique.map((t: Record<string, unknown>) => {
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
        method: direction === "in" ? "Receive" : "Send",
        status: "success" as const,
        gasUsed: "0",
        gasPrice: "0",
        direction,
        category: (t.category as string) || "external",
      };
    });

    // Get timestamps
    const blockNumSet = new Set<number>();
    for (const t of unique.slice(0, 30)) {
      const bn = parseInt((t.blockNum as string) || "0x0", 16);
      if (bn > 0) blockNumSet.add(bn);
    }
    const blockNums = Array.from(blockNumSet);

    const tsMap: Record<number, number> = {};
    for (const bn of blockNums.slice(0, 15)) {
      try {
        const block = await alchemy.core.getBlock(bn);
        if (block) tsMap[bn] = block.timestamp;
      } catch {
        // skip
      }
    }

    for (let i = 0; i < transactions.length; i++) {
      const bn = parseInt((unique[i]?.blockNum as string) || "0x0", 16);
      transactions[i].timestamp = tsMap[bn] || 0;
    }

    const tokenBalances: TokenBalance[] = ((tokens.tokens || []) as any[]).map((t: any) => ({
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

    const pattern = analyzeTransactions(transactions, tokenBalances);

    return NextResponse.json(pattern);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
