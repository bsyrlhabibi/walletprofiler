import { NextRequest, NextResponse } from "next/server";
import { getAssetTransfers, getTokenBalances, getBlock, isAlchemyConfigured, getSupportedChains, getChainCurrency } from "@/lib/alchemy";
import { analyzeTransactions } from "@/lib/analysis";
import { Transaction, TokenBalance } from "@/lib/types";

function isAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    let chain = req.nextUrl.searchParams.get("chain") || "eth";

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    if (!getSupportedChains().includes(chain)) chain = "eth";
    if (!isAlchemyConfigured()) {
      return NextResponse.json({ error: "Alchemy API key not configured" }, { status: 500 });
    }

    const addr = address.toLowerCase();
    const currency = getChainCurrency(chain);

    const [outgoing, incoming, ethOnlyOut, ethOnlyIn, rawTokenBalances] = await Promise.all([
      getAssetTransfers(chain, address, undefined, 200),
      getAssetTransfers(chain, undefined, address, 200),
      getAssetTransfers(chain, address, undefined, 200, ["external"]),
      getAssetTransfers(chain, undefined, address, 200, ["external"]),
      getTokenBalances(address, chain).catch(() => []),
    ]);

    const allTransfers: any[] = [...(outgoing || []), ...(incoming || [])];
    const seen = new Set<string>();
    const unique = allTransfers.filter((t: any) => {
      if (!t.hash || seen.has(t.hash)) return false;
      seen.add(t.hash);
      return true;
    });

    unique.sort((a: any, b: any) =>
      parseInt(b.blockNum || "0", 16) - parseInt(a.blockNum || "0", 16)
    );

    const transactions: Transaction[] = unique.map((t: any) => {
      const value = parseFloat(t.value || "0");
      const from = (t.from || "").toLowerCase();
      const to = (t.to || "").toLowerCase();
      let direction: "in" | "out" | "self" = "out";
      if (from === to) direction = "self";
      else if (to === addr) direction = "in";

      const isNative = t.category === "external";
      return {
        hash: t.hash || "", from, to,
        value: t.value?.toString() || "0",
        valueFormatted: value,
        timestamp: 0,
        method: direction === "in" ? "Receive" : "Send",
        status: "success" as const,
        gasUsed: "0", gasPrice: "0",
        direction,
        category: t.category || "external",
        asset: isNative ? currency : (t.asset || "???"),
        tokenName: isNative ? currency : (t.asset || "Unknown"),
      };
    });

    // Get timestamps
    const blockNumSet = new Set<number>();
    for (const t of unique.slice(0, 30)) {
      const bn = parseInt(t.blockNum || "0x0", 16);
      if (bn > 0) blockNumSet.add(bn);
    }

    const tsMap: Record<number, number> = {};
    for (const bn of Array.from(blockNumSet).slice(0, 15)) {
      try {
        const block = await getBlock(bn, chain);
        if (block) tsMap[bn] = block.timestamp;
      } catch { /* skip */ }
    }

    for (let i = 0; i < transactions.length; i++) {
      const bn = parseInt(unique[i]?.blockNum || "0x0", 16);
      transactions[i].timestamp = tsMap[bn] || 0;
    }

    const tokenBalances: TokenBalance[] = rawTokenBalances
      .filter((tb: any) => parseInt(tb.tokenBalance || "0x0", 16) > 0)
      .map((tb: any) => {
        const raw = parseInt(tb.tokenBalance || "0x0", 16);
        return {
          contractAddress: tb.contractAddress,
          name: "Unknown", symbol: "???", logo: null,
          balance: tb.tokenBalance,
          balanceFormatted: raw / 1e18,
          decimals: 18, priceUsd: null, valueUsd: null,
        };
      });

    const pattern = analyzeTransactions(transactions, tokenBalances);

    const ethTransfers: any[] = [...(ethOnlyOut || []), ...(ethOnlyIn || [])];
    const ethSeen = new Set<string>();
    const uniqueEth = ethTransfers.filter((t: any) => {
      if (!t.hash || ethSeen.has(t.hash)) return false;
      ethSeen.add(t.hash);
      return true;
    });
    let ethVolume = 0;
    for (const t of uniqueEth) ethVolume += parseFloat(t.value || "0");
    pattern.totalVolume = +ethVolume.toFixed(4);
    pattern.avgTxValue = uniqueEth.length > 0 ? +(ethVolume / uniqueEth.length).toFixed(6) : 0;

    return NextResponse.json(pattern);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
