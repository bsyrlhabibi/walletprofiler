/**
 * Static token logo URL mappings for popular tokens.
 * Used as a fallback when Alchemy doesn't return a logo URL.
 * @module lib/token-logos
 */

/** Map of token symbols to CoinGecko CDN logo URLs. */
export const TOKEN_LOGOS: Record<string, string> = {
  // Major L1s
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  WETH: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  WBNB: "https://assets.coingecko.com/coins/images/12591/small/binance-coin-logo.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  WMATIC: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  ARB: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  OP: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",

  // Stablecoins
  USDC: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  DAI: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
  BUSD: "https://assets.coingecko.com/coins/images/9576/small/BUSD.png",
  FRAX: "https://assets.coingecko.com/coins/images/13422/small/FRAX_icon.png",
  TUSD: "https://assets.coingecko.com/coins/images/3449/small/tusd.png",
  LUSD: "https://assets.coingecko.com/coins/images/14666/small/lusd-logo.png",

  // DeFi
  UNI: "https://assets.coingecko.com/coins/images/12504/small/uniswap-logo.png",
  AAVE: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  COMP: "https://assets.coingecko.com/coins/images/10775/small/COMP.png",
  MKR: "https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png",
  SNX: "https://assets.coingecko.com/coins/images/3406/small/SNX.png",
  CRV: "https://assets.coingecko.com/coins/images/12124/small/Curve.png",
  LDO: "https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png",
  SUSHI: "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png",
  YFI: "https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png",
  GRT: "https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png",
  BAL: "https://assets.coingecko.com/coins/images/11683/small/Balancer.png",
  RPL: "https://assets.coingecko.com/coins/images/2090/small/rocket_pool.png",
  CAKE: "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo.png",
  XVS: "https://assets.coingecko.com/coins/images/12677/small/venus.png",
  ENS: "https://assets.coingecko.com/coins/images/19785/small/ENS.jpg",

  // Wrapped BTC
  WBTC: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
  renBTC: "https://assets.coingecko.com/coins/images/11370/small/Bitcoin.png",

  // Meme
  PEPE: "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  FLOKI: "https://assets.coingecko.com/coins/images/16746/small/PNG_image.png",

  // Others
  LRC: "https://assets.coingecko.com/coins/images/913/small/LRC.png",
  SAND: "https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg",
  MANA: "https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png",
  APE: "https://assets.coingecko.com/coins/images/24383/small/apecoin.jpg",
  DYDX: "https://assets.coingecko.com/coins/images/17500/small/dydx.png",
  GMX: "https://assets.coingecko.com/coins/images/18323/small/arbit.png",
  PENDLE: "https://assets.coingecko.com/coins/images/15069/small/Pendle_Logo_Normal-03.png",
  STG: "https://assets.coingecko.com/coins/images/24434/small/STG_LOGO.png",
  RDNT: "https://assets.coingecko.com/coins/images/26536/small/RadiantCapitalLogo.jpg",
};

/** Chain-native token logo URLs. */
export const CHAIN_NATIVE_LOGOS: Record<string, string> = {
  eth: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  polygon: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  arbitrum: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  optimism: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  base: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  bnb: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
};

/**
 * Get the logo URL for a token, preferring Alchemy's URL over static mapping.
 * @param symbol - Token ticker symbol
 * @param alchemyLogo - Logo URL from Alchemy's token metadata (takes priority)
 * @returns Logo URL string, or null if no logo is available
 */
export function getTokenLogo(symbol: string, alchemyLogo?: string | null): string | null {
  if (alchemyLogo) return alchemyLogo;
  return TOKEN_LOGOS[symbol.toUpperCase()] || null;
}
