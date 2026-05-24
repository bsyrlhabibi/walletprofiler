import { Network, Alchemy, AssetTransfersCategory, SortingOrder } from "alchemy-sdk";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

export function getAlchemy(network: string = "eth"): Alchemy {
  const networkMap: Record<string, Network> = {
    eth: Network.ETH_MAINNET,
    polygon: Network.MATIC_MAINNET,
    arbitrum: Network.ARB_MAINNET,
    optimism: Network.OPT_MAINNET,
    base: Network.BASE_MAINNET,
  };

  return new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: networkMap[network] || Network.ETH_MAINNET,
    maxRetries: 3,
  });
}

export function getRpcUrl(network: string = "eth"): string {
  const rpcMap: Record<string, string> = {
    eth: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    polygon: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    optimism: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    base: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  };
  return rpcMap[network] || rpcMap.eth;
}

export const PUBLIC_RPCS: Record<string, string[]> = {
  eth: [
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
    "https://cloudflare-eth.com",
    "https://1rpc.io/eth",
  ],
  polygon: [
    "https://polygon.llamarpc.com",
    "https://rpc.ankr.com/polygon",
  ],
  arbitrum: [
    "https://arb1.arbitrum.io/rpc",
    "https://rpc.ankr.com/arbitrum",
  ],
};

export { AssetTransfersCategory, SortingOrder };
