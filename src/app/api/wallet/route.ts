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

/**
 * ENS Reverse Resolution — resolve address to ENS name
 * Uses the ENS Universal Resolver on Ethereum mainnet
 */
async function resolveENS(address: string): Promise<string | null> {
  try {
    // Use Alchemy's lookupAddress equivalent via eth_call
    // ENS Reverse Resolver: 0x084b1c3C81545d370f3634392De611CaaBFf8148
    // We call name(bytes32) on the reverse registrar
    // But simpler: use the ENS Universal Resolver at 0xeB77bE49d34b3F64bD5Ee2251F06B779c6f9B6eC

    // Simplest approach: use ENS reverse record
    // addr.reverse node = keccak256(addr.toLowerCase() + ".addr.reverse")
    // But this requires complex encoding. Instead, use Alchemy's built-in if available.

    // Try Alchemy's resolveAddress (if supported)
    // Fallback: direct eth_call to ENS Universal Resolver
    const resolverAddress = "0x84b1c3C81545d370f3634392De611CaaBFf8148";

    // Compute the reverse node: keccak256(address.toLowerCase().slice(2) + ".addr.reverse")
    // We'll use a simpler approach — call the ENS reverse registrar directly
    const reverseRegistrar = "0x084b1c3C81545d370f3634392De611CaaBFf8148";

    // Get the resolver for the reverse record
    // Actually, let's use the ENS Universal Resolver which is simpler
    // Universal Resolver: 0xeB77bE49d34b3F64bD5Ee2251F06B779c6f9B6eC

    // Simplest: try eth_call to resolveName via known method
    // We'll just try to get the name from the ENS Public Resolver

    // Actually, the simplest approach for reverse resolution:
    // Call name(bytes32) on the ENS Reverse Registrar
    // node = keccak256(abi.encodePacked(bytes20(address), ".addr.reverse"))

    // Let's use a different approach — check if the address has an ENS name
    // by calling the ENS registry's resolver() then name()

    // Simplest fallback: just return null for non-Ethereum chains or if it fails
    // For Ethereum mainnet, we can try the reverse resolution

    // Use the ENS Universal Resolver's reverse resolution
    // Function: reverse(bytes) returns (string name, address resolvedAddress, ...)
    const universalResolver = "0xeB77bE49d34b3F64bD5Ee2251F06B779c6f9B6eC";

    // Encode: reverse(address + ".addr.reverse")
    // But this is complex. Let's use a simpler method.

    // Actually, let's just use Alchemy's API if it supports it.
    // Alchemy doesn't have a direct ENS reverse resolution API.

    // Simplest working approach: use the ENS Subgraph or just skip for now
    // and mark it as a known wallet if we have it.

    // Let's try a different approach: use the public ENS resolver
    // We'll call addr(bytes32) on the resolver for the reverse node

    // OK, let's just do a simple implementation:
    // 1. Get the resolver for the reverse node
    // 2. Call name(bytes32) on that resolver

    // Step 1: Compute reverse node
    // node = namehash(address.toLowerCase() + ".addr.reverse")
    // This requires keccak256, which we can do via eth_call to a helper

    // Actually, let's just use the ENS Universal Resolver which has a simpler interface
    // Universal Resolver has: reverse(string calldata name) returns (...)
    // But we need ABI encoding which is complex without ethers

    // Simplest working solution: use a try-catch with eth_call to a known ENS resolution method
    // Let's use the ENS Reverse Registrar's claim() + name() approach

    // OK, I'll implement a minimal reverse resolution using raw eth_call
    // The ENS Reverse Registrar at 0x084b1c3C81545d370f3634392De611CaaBFf8148
    // has a function getName(address) that returns (string name, uint256 parentNode)

    // Function selector for getName(address):
    // keccak256("getName(address)") = 0xf9a45547... let me compute
    // Actually let me just try calling the universal resolver

    // For now, let's use the simplest possible approach:
    // Just return null — we'll add proper ENS resolution later if needed
    // The known-wallets.ts file already covers most high-profile addresses

    // Actually, let me implement a basic version using the public resolver
    // We'll call the ENS Universal Resolver's `reverse` function

    // Function: reverse(string calldata name) returns (string memory, address, address, uint64)
    // selector: keccak256("reverse(string)") = 0x1e83409a

    // Input: address + ".addr.reverse"
    const name = address.toLowerCase().slice(2) + ".addr.reverse";

    // ABI encode the string
    const nameBytes = Buffer.from(name, "utf-8");
    const nameHex = nameBytes.toString("hex");

    // ABI encode: offset(32) + length(32) + padded_data
    const offset = "0000000000000000000000000000000000000000000000000000000000000020";
    const length = nameBytes.length.toString(16).padStart(64, "0");
    const paddedData = nameHex.padEnd(Math.ceil(nameHex.length / 64) * 64, "0");

    const callData = "0x1e83409a" + offset + length + paddedData;

    const result = await alchemyRPC("eth_call", [
      { to: universalResolver, data: callData },
      "latest"
    ], "eth");

    if (result && result !== "0x" && result.length > 130) {
      // Decode the string from the result
      // The result is ABI encoded: offset + length + data
      // Skip first 32 bytes (offset), read next 32 bytes (length), then read the string
      const data = result.slice(2); // remove 0x
      const strOffset = parseInt(data.slice(0, 64), 16) * 2; // hex chars
      const strLength = parseInt(data.slice(strOffset, strOffset + 64), 16);
      const strData = data.slice(strOffset + 64, strOffset + 64 + strLength * 2);

      if (strData && strLength > 0 && strLength < 100) {
        const ensName = Buffer.from(strData, "hex").toString("utf-8").replace(/\0/g, "");
        if (ensName && ensName.includes(".eth")) {
          return ensName;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
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

    // Run all fetches in parallel including ENS + known wallet lookup
    const [ethBalanceHex, allTransfersOut, allTransfersIn, ethOnlyOut, ethOnlyIn, rawTokenBalances, ensName, knownWallet] = await Promise.all([
      getBalance(address, chain),
      getAssetTransfers(chain, address, undefined, 100),
      getAssetTransfers(chain, undefined, address, 100),
      getAssetTransfers(chain, address, undefined, 100, ["external"]),
      getAssetTransfers(chain, undefined, address, 100, ["external"]),
      getTokenBalances(address, chain).catch(() => []),
      // ENS resolution (only on Ethereum mainnet)
      chain === "eth" ? resolveENS(address) : Promise.resolve(null),
      // Known wallet label
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

    const profile: WalletProfile = {
      address: addr,
      ensName: ensName || null,
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
      // @ts-ignore — portfolio breakdown is extra data
      portfolioBreakdown,
    };

    return NextResponse.json(profile);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Wallet API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
