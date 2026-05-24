const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const BASE_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export async function alchemyRPC(method: string, params: unknown[] = []) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.result;
}

export async function getBalance(address: string): Promise<string> {
  const result = await alchemyRPC("eth_getBalance", [address, "latest"]);
  return result; // hex string
}

export async function getBlock(blockNumber: number): Promise<{ timestamp: number }> {
  const hex = "0x" + blockNumber.toString(16);
  const result = await alchemyRPC("eth_getBlockByNumber", [hex, false]);
  return { timestamp: parseInt(result.timestamp, 16) };
}

export async function getAssetTransfers(
  fromAddress?: string,
  toAddress?: string,
  maxCount = 100
) {
  const params: Record<string, unknown> = {
    category: ["external", "erc20", "erc721", "erc1155"],
    maxCount: "0x" + maxCount.toString(16),
    order: "desc",
  };
  if (fromAddress) params.fromAddress = fromAddress;
  if (toAddress) params.toAddress = toAddress;

  const result = await alchemyRPC("alchemy_getAssetTransfers", [params]);
  return result?.transfers || [];
}

export async function getTokenBalances(address: string) {
  const result = await alchemyRPC("alchemy_getTokenBalances", [address, "erc20"]);
  return result?.tokenBalances || [];
}

export async function getTokenMetadata(contractAddress: string) {
  return await alchemyRPC("alchemy_getTokenMetadata", [contractAddress]);
}

export function isAlchemyConfigured(): boolean {
  return !!ALCHEMY_API_KEY && ALCHEMY_API_KEY.length > 5;
}
