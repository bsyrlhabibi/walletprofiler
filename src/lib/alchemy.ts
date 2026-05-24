const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

const CHAIN_ENDPOINTS: Record<string, string> = {
  eth: "eth-mainnet",
  polygon: "polygon-mainnet",
  arbitrum: "arb-mainnet",
  optimism: "opt-mainnet",
  base: "base-mainnet",
};

const CHAIN_EXPLORER: Record<string, string> = {
  eth: "etherscan.io",
  polygon: "polygonscan.com",
  arbitrum: "arbiscan.io",
  optimism: "optimistic.etherscan.io",
  base: "basescan.org",
};

const CHAIN_CURRENCY: Record<string, string> = {
  eth: "ETH",
  polygon: "MATIC",
  arbitrum: "ETH",
  optimism: "ETH",
  base: "ETH",
};

const CHAIN_NAMES: Record<string, string> = {
  eth: "Ethereum",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  base: "Base",
};

// CoinGecko IDs for native tokens
const CHAIN_COINGECKO_ID: Record<string, string> = {
  eth: "ethereum",
  polygon: "matic-network",
  arbitrum: "ethereum",
  optimism: "ethereum",
  base: "ethereum",
};

function getBaseUrl(chain: string): string {
  const subdomain = CHAIN_ENDPOINTS[chain] || CHAIN_ENDPOINTS.eth;
  return `https://${subdomain}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
}

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

export async function getBalance(address: string, chain = "eth"): Promise<string> {
  return await alchemyRPC("eth_getBalance", [address, "latest"], chain);
}

export async function getBlock(blockNumber: number, chain = "eth"): Promise<{ timestamp: number }> {
  const hex = "0x" + blockNumber.toString(16);
  const result = await alchemyRPC("eth_getBlockByNumber", [hex, false], chain);
  return { timestamp: parseInt(result.timestamp, 16) };
}

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

export async function getTokenBalances(address: string, chain = "eth") {
  const result = await alchemyRPC("alchemy_getTokenBalances", [address, "erc20"], chain);
  return result?.tokenBalances || [];
}

export async function getTokenMetadata(contractAddress: string, chain = "eth") {
  return await alchemyRPC("alchemy_getTokenMetadata", [contractAddress], chain);
}

// Fetch prices from CoinGecko (free, no API key)
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

// Map common token symbols to CoinGecko IDs
const TOKEN_COINGECKO_MAP: Record<string, string> = {
  ETH: "ethereum",
  WETH: "ethereum",
  MATIC: "matic-network",
  WMATIC: "matic-network",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  WBTC: "wrapped-bitcoin",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
  COMP: "compound-governance-token",
  MKR: "maker",
  SNX: "havven",
  CRV: "curve-dao-token",
  LDO: "lido-dao",
  PEPE: "pepe",
  SHIB: "shiba-inu",
  ENS: "ethereum-name-service",
  LRC: "loopring",
  SUSHI: "sushi",
  YFI: "yearn-finance",
  GRT: "the-graph",
  BAL: "balancer",
  RPL: "rocket-pool",
  ARB: "arbitrum",
  OP: "optimism",
};

export function getCoinGeckoId(symbol: string): string | null {
  return TOKEN_COINGECKO_MAP[symbol.toUpperCase()] || null;
}

export function isAlchemyConfigured(): boolean {
  return !!ALCHEMY_API_KEY && ALCHEMY_API_KEY.length > 5;
}

export function getSupportedChains(): string[] {
  return Object.keys(CHAIN_ENDPOINTS);
}

export function getChainLabel(chain: string): string {
  return CHAIN_NAMES[chain] || chain;
}

export function getChainCurrency(chain: string): string {
  return CHAIN_CURRENCY[chain] || "ETH";
}

export function getExplorerUrl(chain: string): string {
  return CHAIN_EXPLORER[chain] || CHAIN_EXPLORER.eth;
}

export function getChainCoinGeckoId(chain: string): string {
  return CHAIN_COINGECKO_ID[chain] || "ethereum";
}
