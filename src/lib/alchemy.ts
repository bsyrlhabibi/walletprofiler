const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

const CHAIN_ENDPOINTS: Record<string, string> = {
  eth: "eth-mainnet",
  polygon: "polygon-mainnet",
  arbitrum: "arb-mainnet",
  optimism: "opt-mainnet",
  base: "base-mainnet",
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

export function isAlchemyConfigured(): boolean {
  return !!ALCHEMY_API_KEY && ALCHEMY_API_KEY.length > 5;
}

export function getSupportedChains(): string[] {
  return Object.keys(CHAIN_ENDPOINTS);
}

export function getChainLabel(chain: string): string {
  const labels: Record<string, string> = {
    eth: "Ethereum",
    polygon: "Polygon",
    arbitrum: "Arbitrum",
    optimism: "Optimism",
    base: "Base",
  };
  return labels[chain] || chain;
}

export function getChainCurrency(chain: string): string {
  const currencies: Record<string, string> = {
    eth: "ETH",
    polygon: "MATIC",
    arbitrum: "ETH",
    optimism: "ETH",
    base: "ETH",
  };
  return currencies[chain] || "ETH";
}
