/**
 * Known wallet database for labeling well-known addresses.
 * Covers individuals, exchanges, protocols, DAOs, and bots.
 * @module lib/known-wallets
 */

/** Metadata for a known wallet address. */
export interface KnownWallet {
  name: string;
  type: "individual" | "exchange" | "protocol" | "dao" | "whale" | "bot";
  tag?: string;
}

/** Map of lowercase addresses to known wallet metadata. */
const KNOWN_WALLETS: Record<string, KnownWallet> = {
  // === Individuals ===
  "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": { name: "Vitalik Buterin", type: "individual", tag: "ETH Co-Founder" },
  "0x1919191919191919191919191919191919191919": { name: "Vitalik (Old)", type: "individual", tag: "ETH Co-Founder" },
  "0x5fe46ed57fd8974c86e4b5a2e6ba7c75c44b0c76": { name: "Hayden Adams", type: "individual", tag: "Uniswap Creator" },
  "0x220866b1a2219f40e72f5c628b65d54268ca3a9d": { name: "Vitalik (ENS)", type: "individual", tag: "ETH Co-Founder" },
  "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": { name: "Justin Sun", type: "individual", tag: "TRON Founder" },
  "0x28c6c06298d514db089934071355e5743bf21d60": { name: "Binance Hot Wallet", type: "exchange", tag: "CEX" },
  "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0": { name: "Coinbase Prime", type: "exchange", tag: "CEX" },
  "0x176f3dab24a159341c0509bb36b833e7fdd0a132": { name: "Su Zhu", type: "individual", tag: "3AC Co-Founder" },

  // === Exchanges ===
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549": { name: "Binance Hot Wallet 2", type: "exchange", tag: "CEX" },
  "0xdfd5293d8e347dfe59e90efd55b2956a1343963d": { name: "Binance Cold Wallet", type: "exchange", tag: "CEX" },
  "0x56eddb7aa87536c09ccc2793473599fd21a8b17f": { name: "Binance Cold Wallet 2", type: "exchange", tag: "CEX" },
  "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2": { name: "FTX Exchange", type: "exchange", tag: "CEX (Bankrupt)" },
  "0xc098b2a3aa256d2140208c3de6543aaef5cd3a94": { name: "FTX Cold Wallet", type: "exchange", tag: "CEX (Bankrupt)" },
  "0x1151314c646ce4e0efd76d1af4760ae66a9fe30f": { name: "Bitfinex Hot Wallet", type: "exchange", tag: "CEX" },
  "0x742d35cc6634c0532925a3b844bc9e7595f2bd3e": { name: "Bitfinex Cold Wallet", type: "exchange", tag: "CEX" },
  "0xd24400ae8bfebb18ca49be86258a3c749cf46853": { name: "Gemini Hot Wallet", type: "exchange", tag: "CEX" },
  "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b": { name: "OKX Hot Wallet", type: "exchange", tag: "CEX" },
  "0x236f9f97e0e62388479bf9e5ba4889e46b0273c3": { name: "Kraken Hot Wallet", type: "exchange", tag: "CEX" },
  "0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43": { name: "Coinbase Commerce", type: "exchange", tag: "CEX" },
  "0x71660c4005ba85c37ccec55d0c4493e66fe775d3": { name: "Coinbase Hot Wallet", type: "exchange", tag: "CEX" },
  "0x503828976d22510aad0201ac7ec88293211d23da": { name: "Mexc Hot Wallet", type: "exchange", tag: "CEX" },
  "0xf89d7b9c864f589bbf53a82105107622b35eaa40": { name: "Gate.io Hot Wallet", type: "exchange", tag: "CEX" },

  // === DeFi Protocols ===
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": { name: "Uniswap V2 Router", type: "protocol", tag: "DEX" },
  "0xe592427a0aece92de3edee1f18e0157c05861564": { name: "Uniswap V3 Router", type: "protocol", tag: "DEX" },
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": { name: "Uniswap V3 Router 2", type: "protocol", tag: "DEX" },
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff": { name: "0x Exchange Proxy", type: "protocol", tag: "DEX Aggregator" },
  "0x1111111254eeb25477b68fb85ed929f73a960582": { name: "1inch Router", type: "protocol", tag: "DEX Aggregator" },
  "0x1111111254fb6c44bac0bed2854e76f90643097d": { name: "1inch Router V4", type: "protocol", tag: "DEX Aggregator" },
  "0x881d40237659c251811cec9c364ef91dc08d300c": { name: "MetaMask Swap Router", type: "protocol", tag: "Aggregator" },
  "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": { name: "Aave V2 Lending Pool", type: "protocol", tag: "Lending" },
  "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": { name: "Aave V3 Pool", type: "protocol", tag: "Lending" },
  "0x3dfd23a6c5e8bbcfc9581d2e864a68feb6a076d3": { name: "Aave V1 Lending Pool", type: "protocol", tag: "Lending" },
  "0xc3d688b66703497daa19211eedff47f25384cdc3": { name: "Compound V3 (USDC)", type: "protocol", tag: "Lending" },
  "0x39aa39c021dfbae8fac545936693ac917d5e7563": { name: "Compound cUSDC", type: "protocol", tag: "Lending" },
  "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5": { name: "Compound cETH", type: "protocol", tag: "Lending" },
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": { name: "Lido (stETH)", type: "protocol", tag: "Liquid Staking" },
  "0x4facf4b60d29c1c4282dab15a61b3a4f715d1b1e": { name: "Stargate Router", type: "protocol", tag: "Bridge" },
  "0x3154cf16ccdb4c6d922629664174b904d80f2c35": { name: "Across Protocol", type: "protocol", tag: "Bridge" },
  "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1": { name: "Optimism Bridge", type: "protocol", tag: "Bridge" },
  "0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f": { name: "Arbitrum Inbox", type: "protocol", tag: "Bridge" },
  "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f": { name: "Uniswap V2 Factory", type: "protocol", tag: "DEX" },
  "0x1f98431c8ad98523631ae4a59f267346ea31f984": { name: "Uniswap V3 Factory", type: "protocol", tag: "DEX" },
  "0x6b175474e89094c44da98b954eedeac495271d0f": { name: "DAI Stablecoin", type: "protocol", tag: "Stablecoin" },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { name: "USDC", type: "protocol", tag: "Stablecoin" },
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { name: "USDT", type: "protocol", tag: "Stablecoin" },

  // === DAOs & Treasuries ===
  "0x41a51cd30b1397f1f16562e0b762e4ce4a41e1d1": { name: "ENS DAO Treasury", type: "dao", tag: "DAO" },
  "0xf7753a50b0c1f22235c0a1e4871830c60d7f132a": { name: "Arbitrum DAO Treasury", type: "dao", tag: "DAO" },
  "0x40e9390a74c53e96b1510a93e174b43a5e3f1a81": { name: "Gitcoin Treasury", type: "dao", tag: "DAO" },

  // === Bots & MEV ===
  "0x0000000000000000000000000000000000000000": { name: "Null Address", type: "bot", tag: "Burn" },
  "0x000000000000000000000000000000000000dead": { name: "Burn Address", type: "bot", tag: "Burn" },

  // === NFT & Gaming ===
  "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb": { name: "CryptoPunks", type: "protocol", tag: "NFT" },
  "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d": { name: "Bored Ape YC", type: "protocol", tag: "NFT" },
  "0xed5af388653567af2f388e6224dc7c4b3241c544": { name: "Azuki", type: "protocol", tag: "NFT" },
  "0x60e4d786628fea6478f785a6d7e704777c86a7c6": { name: "Mutant Ape YC", type: "protocol", tag: "NFT" },
  "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258": { name: "Otherdeed", type: "protocol", tag: "NFT" },
};

/**
 * Look up a known wallet label by address.
 * @param address - Hex wallet address (case-insensitive)
 * @returns KnownWallet metadata or null if not recognized
 */
export function getKnownWalletLabel(address: string): KnownWallet | null {
  return KNOWN_WALLETS[address.toLowerCase()] || null;
}

/**
 * Check if an address is a known exchange.
 * @param address - Hex wallet address
 * @returns True if the address belongs to a known exchange
 */
export function isKnownExchange(address: string): boolean {
  return getKnownWalletLabel(address)?.type === "exchange";
}

/**
 * Check if an address is a known DeFi protocol.
 * @param address - Hex wallet address
 * @returns True if the address belongs to a known protocol
 */
export function isKnownProtocol(address: string): boolean {
  return getKnownWalletLabel(address)?.type === "protocol";
}

export default KNOWN_WALLETS;
