import { NextRequest, NextResponse } from "next/server";
import { getAssetTransfers, getTokenBalances, getBlock, isAlchemyConfigured } from "@/lib/alchemy";
import { analyzeTransactions } from "@/lib/analysis";
import { Transaction, TokenBalance } from "@/lib/types";

function isAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    if (!isAlchemyConfigured()) {
      return NextResponse.json({ error: "Alchemy API key not configured" }, { status: 500 });
    }

    const addr = address.toLowerCase();

    const [outgoing, incoming, rawTokenBalances] = await Promise.all([
      getAssetTransfers(address, undefined, 200),
      getAssetTransfers(undefined, address, 200),
      getTokenBalances(address),
    ]);

    const allTransfers = [...outgoing, ...incoming];
    const seen = new Set<string>();
    const unique = allTransfers.filter((t: Record<string, unknown>) => {
      const hash = t.hash as string;
      if (!hash || seen.has(hash)) return false;
      seen.add(hash);
      return true;
    });

    unique.sort((a, b) =>
      parseInt((b.blockNum as string) || "0", 16) - parseInt((a.blockNum as string) || "0", 16)
    );

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

    const tsMap: Record<number, number> = {};
    for (const bn of Array.from(blockNumSet).slice(0, 15)) {
      try {
        const block = await getBlock(bn);
        if (block) tsMap[bn] = block.timestamp;
      } catch { /* skip */ }
    }

    for (let i = 0; i < transactions.length; i++) {
      const bn = parseInt((unique[i]?.blockNum as string) || "0x0", 16);
      transactions[i].timestamp = tsMap[bn] || 0;
    }

    const tokenBalances: TokenBalance[] = rawTokenBalances
      .filter((tb: Record<string, unknown>) => parseInt((tb.tokenBalance as string) || "0x0", 16) > 0)
      .map((tb: Record<string, unknown>) => {
        const raw = parseInt((tb.tokenBalance as string) || "0x0", 16);
        return {
          contractAddress: tb.contractAddress as string,
          name: "Unknown",
          symbol: "???",
          logo: null,
          balance: tb.tokenBalance as string,
          balanceFormatted: raw / 1e18,
          decimals: 18,
          priceUsd: null,
          valueUsd: null,
        };
      });

    const pattern = analyzeTransactions(transactions, tokenBalances);

    return NextResponse.json(pattern);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
