# WalletProfiler — Developer Setup Guide

Step-by-step guide for setting up WalletProfiler locally for development.

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9+ (or yarn/pnpm)
- **Alchemy API Key** — free tier at [alchemy.com](https://www.alchemy.com/)

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/bsyrlhabibi/walletprofiler.git
cd walletprofiler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

> Get a free API key at [alchemy.com](https://www.alchemy.com/) — supports Ethereum, Polygon, Arbitrum, Optimism, Base, and BNB Chain.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

```bash
npm run build
npm start
```

---

## Linting

```bash
npm run lint
```

---

## Project Structure

```
src/
├── app/
│   ├── api/wallet/
│   │   ├── route.ts              # Main wallet analysis API
│   │   └── pattern/route.ts      # Pattern analysis API
│   ├── globals.css               # Global styles + CSS variables
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page
├── components/
│   ├── search-bar.tsx            # Address input + chain dropdown
│   ├── chain-tabs.tsx            # Chain selector tabs (result page)
│   ├── chain-dropdown.tsx        # Chain dropdown (home page)
│   ├── persona-card.tsx          # Wallet persona + activity score
│   ├── trust-activity-panel.tsx  # Trust + activity dual scoring
│   ├── token-holdings.tsx        # Token list with USD values
│   ├── tx-timeline.tsx           # Transaction table with pagination
│   ├── activity-heatmap.tsx      # Activity visualization
│   ├── portfolio-pie-chart.tsx   # Portfolio donut chart
│   └── index.ts                  # Barrel export
├── hooks/
│   ├── use-wallet-profile.ts     # Wallet data fetching + caching
│   └── use-chain-state.ts        # Chain state management
├── lib/
│   ├── alchemy.ts                # Alchemy JSON-RPC helpers
│   ├── persona.ts                # Persona detection logic
│   ├── trust.ts                  # Trust score calculation
│   ├── analysis.ts               # Activity analysis
│   ├── known-wallets.ts          # Known wallet labels database
│   ├── token-categories.ts       # Token categorization
│   └── token-logos.ts            # Token logo URL mapping
├── types/
│   └── wallet.ts                 # TypeScript interfaces
├── constants/
│   └── chains.ts                 # Chain configs, explorers, currencies
└── utils/
    └── format.ts                 # Formatting utilities
```

---

## Adding a New Chain

1. Add chain config to `src/constants/chains.ts`
2. Add Alchemy endpoint to `src/lib/alchemy.ts`
3. Add explorer URL pattern to `src/constants/chains.ts`
4. Add chain to the `CHAINS` array in `src/components/chain-tabs.tsx`
5. Update the API route to handle the new chain

---

## Adding Token Logos

Add token logo URLs to `src/lib/token-logos.ts`:

```ts
export const TOKEN_LOGOS: Record<string, string> = {
  "ETH": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  // Add more...
};
```

Logo URLs are from CoinGecko CDN. Find them at [coingecko.com](https://www.coingecko.com/).

---

## Common Issues

### "ALCHEMY_API_KEY is not defined"
- Make sure `.env.local` exists with your Alchemy API key
- Restart the dev server after adding the env file

### Build fails with TypeScript errors
- Run `npm run build` to see specific errors
- Ensure Node.js version is 18+

### API returns empty data
- Check if the wallet address is valid (starts with 0x)
- Verify your Alchemy API key has the correct chain enabled
- Some chains may have rate limits on free tier

### Styles not loading
- Clear `.next` cache: `rm -rf .next`
- Restart dev server

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first CSS |
| Alchemy | Blockchain data (JSON-RPC) |
| CoinGecko | Token USD prices |
| Recharts | Charts and visualizations |

---

Built by **KOIDRAGON** — Hermes Agent
