/**
 * Alchemy JSON-RPC client for multi-chain blockchain data.
 * Provides methods to fetch balances, token data, transfers, and prices.
 * @module lib/alchemy
 */

import type { ChainId } from "@/constants/chains";
import { CHAIN_ENDPOINTS, CHAIN_EXPLORER, CHAIN_CURRENCY, CHAIN_NAMES, CHAIN_COINGECKO_ID } from "@/constants/chains";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

/**
 * Construct the Alchemy JSON-RPC URL for a given chain.
 * @param chain - Chain identifier
 * @returns Full Alchemy RPC endpoint URL
 */
function getBaseUrl(chain: string): string {
  const subdomain = CHAIN_ENDPOINTS[chain as ChainId] || CHAIN_ENDPOINTS.eth;
  return `https://${subdomain}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
}

/**
 * Execute a raw JSON-RPC call to Alchemy.
 * @param method - RPC method name (e.g. "eth_getBalance")
 * @param params - Array of method parameters
 * @param chain - Target chain identifier
 * @returns The `result` field from the JSON-RPC response
 */
export async function alchemyRPC(method: string, params: unknown[] = [], chain = "eth") {
  const res = await fetch(getBaseUrl(chain), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.result;
}

/**
 * Fetch the native token balance for an address.
 * @param address - Hex wallet address
 * @param chain - Chain identifier
 * @returns Balance as a hex string
 */
export async function getBalance(address: string, chain = "eth"): Promise<string> {
  return await alchemyRPC("eth_getBalance", [address, "latest"], chain);
}

/**
 * Fetch a block's header by number.
 * @param blockNumber - Block number (integer)
 * @param chain - Chain identifier
 * @returns Object with `timestamp` as a Unix timestamp (seconds)
 */
export async function getBlock(blockNumber: number, chain = "eth"): Promise<{ timestamp: number }> {
  const hex = "0x" + blockNumber.toString(16);
  const result = await alchemyRPC("eth_getBlockByNumber", [hex, false], chain);
  return { timestamp: parseInt(result.timestamp, 16) };
}

/**
 * Fetch asset transfers using Alchemy's enhanced API.
 * @param chain - Chain identifier
 * @param fromAddress - Filter by sender (optional)
 * @param toAddress - Filter by recipient (optional)
 * @param maxCount - Maximum number of transfers to return
 * @param categories - Transfer categories to include (default: all)
 * @returns Array of transfer objects
 */
export async function getAssetTransfers(
  chain = "eth",
  fromAddress?: string,
  toAddress?: string,
  maxCount = 100,
  categories?: string[]
) {
  const params: Record<string, unknown> = {
    category: categories || ["external", "erc20", "erc721", "erc1155"],
    maxCount: "0x" + maxCount.toString(16),
    order: "desc",
  };
  if (fromAddress) params.fromAddress = fromAddress;
  if (toAddress) params.toAddress = toAddress;

  const result = await alchemyRPC("alchemy_getAssetTransfers", [params], chain);
  return result?.transfers || [];
}

/**
 * Fetch ERC-20 token balances for an address.
 * @param address - Hex wallet address
 * @param chain - Chain identifier
 * @returns Array of token balance objects
 */
export async function getTokenBalances(address: string, chain = "eth") {
  const result = await alchemyRPC("alchemy_getTokenBalances", [address, "erc20"], chain);
  return result?.tokenBalances || [];
}

/**
 * Fetch metadata (name, symbol, decimals, logo) for an ERC-20 token.
 * @param contractAddress - Token contract address
 * @param chain - Chain identifier
 * @returns Token metadata object
 */
export async function getTokenMetadata(contractAddress: string, chain = "eth") {
  return await alchemyRPC("alchemy_getTokenMetadata", [contractAddress], chain);
}

/**
 * Fetch USD prices for a list of CoinGecko coin IDs.
 * Uses the free CoinGecko API (no key required).
 * @param coinIds - Array of CoinGecko coin identifiers
 * @returns Map of coin ID to USD price
 */
export async function getPrices(coinIds: string[]): Promise<Record<string, number>> {
  if (coinIds.length === 0) return {};
  try {
    const ids = Array.from(new Set(coinIds)).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(10000) }
    );
    const data = await res.json();
    const prices: Record<string, number> = {};
    for (const [id, val] of Object.entries(data)) {
      prices[id] = (val as Record<string, number>)?.usd || 0;
    }
    return prices;
  } catch {
    return {};
  }
}

/** Map of common token symbols to their CoinGecko identifiers. */
const TOKEN_COINGECKO_MAP: Record<string, string> = {
  ETH: "ethereum", WETH: "ethereum", MATIC: "matic-network", WMATIC: "matic-network",
  USDC: "usd-coin", USDT: "tether", DAI: "dai", WBTC: "wrapped-bitcoin",
  LINK: "chainlink", UNI: "uniswap", AAVE: "aave", COMP: "compound-governance-token",
  MKR: "maker", SNX: "havven", CRV: "curve-dao-token", LDO: "lido-dao",
  PEPE: "pepe", SHIB: "shiba-inu", ENS: "ethereum-name-service", LRC: "loopring",
  SUSHI: "sushi", YFI: "yearn-finance", GRT: "the-graph", BAL: "balancer",
  RPL: "rocket-pool", ARB: "arbitrum", OP: "optimism", BNB: "binancecoin",
  WBNB: "binancecoin", CAKE: "pancakeswap-token", XVS: "venus", BUSD: "binance-usd",
};

/**
 * Look up a CoinGecko ID from a token symbol.
 * @param symbol - Token ticker symbol (e.g. "USDC")
 * @returns CoinGecko ID string, or null if not found
 */
export function getCoinGeckoId(symbol: string): string | null {
  return TOKEN_COINGECKO_MAP[symbol.toUpperCase()] || null;
}

/**
 * Check whether the Alchemy API key is configured.
 * @returns True if the key exists and is longer than 5 characters
 */
export function isAlchemyConfigured(): boolean {
  return !!ALCHEMY_API_KEY && ALCHEMY_API_KEY.length > 5;
}

/**
 * Get the list of all supported chain identifiers.
 * @returns Array of chain ID strings
 */
export function getSupportedChains(): string[] {
  return Object.keys(CHAIN_ENDPOINTS);
}

/**
 * Get a human-readable label for a chain.
 * @param chain - Chain identifier
 * @returns Display name (e.g. "Ethereum")
 */
export function getChainLabel(chain: string): string {
  return CHAIN_NAMES[chain as ChainId] || chain;
}

/**
 * Get the native currency symbol for a chain.
 * @param chain - Chain identifier
 * @returns Currency symbol (e.g. "ETH", "MATIC")
 */
export function getChainCurrency(chain: string): string {
  return CHAIN_CURRENCY[chain as ChainId] || "ETH";
}

/**
 * Get the block explorer domain for a chain.
 * @param chain - Chain identifier
 * @returns Explorer domain (e.g. "etherscan.io")
 */
export function getExplorerUrl(chain: string): string {
  return CHAIN_EXPLORER[chain as ChainId] || CHAIN_EXPLORER.eth;
}

/**
 * Get the CoinGecko ID for a chain's native token.
 * @param chain - Chain identifier
 * @returns CoinGecko ID (e.g. "ethereum")
 */
export function getChainCoinGeckoId(chain: string): string {
  return CHAIN_COINGECKO_ID[chain as ChainId] || "ethereum";
}
