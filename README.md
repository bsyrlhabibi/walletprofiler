# 🔍 WalletProfiler

**Multi-Chain Wallet Intelligence Platform**

Analyze any blockchain wallet to detect persona type, activity patterns, trustworthiness, and portfolio composition — powered by on-chain data from Alchemy and real-time pricing from CoinGecko.

🌐 **Live:** [walletprofiler.vercel.app](https://walletprofiler.vercel.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎭 **Persona Detection** | Classify wallets as Whale, Degen, Builder, Hodler, Trader, or Newcomer |
| 📊 **Activity Score** | Measure on-chain activity based on transaction frequency and patterns |
| 🛡️ **Trust Score** | Evaluate wallet trustworthiness based on age, consistency, and behavior |
| 💰 **Token Holdings** | View all ERC-20/BEP-20 tokens with real-time USD values |
| 📜 **Transaction Timeline** | Browse transactions with pagination, filtering (All/In/Out), and explorer links |
| 🗺️ **Activity Heatmap** | Visualize transaction patterns over time |
| 🥧 **Portfolio Chart** | Donut chart breakdown of token holdings by category |

---

## 🔍 Feature Deep Dive

### 🎭 Persona Detection

WalletProfiler analyzes on-chain behavior to classify wallets into distinct persona types:

- **🐋 Whale** — Large balance, high-value transactions, long history
- **🎰 Degen** — High frequency trading, many token interactions, DeFi-heavy
- **🏗️ Builder** — Contract deployments, consistent activity, development patterns
- **💎 Hodler** — Long holding periods, minimal transfers, diamond hands
- **📈 Trader** — Active trading, balanced in/out flows, moderate frequency
- **🌱 Newcomer** — Recent wallet, limited history, learning phase

Persona is determined by analyzing: transaction count, unique tokens interacted with, transaction frequency, holding patterns, and balance size.

### 📊 Activity Score

The Activity Score (0-100) measures how active a wallet is on-chain:

- **Transaction frequency** — How often the wallet transacts
- **Token diversity** — Number of unique tokens interacted with
- **Protocol interactions** — DeFi, NFT, and smart contract usage
- **Consistency** — Regular activity vs. sporadic bursts

**Score ranges:**
- 80-100: Very High (active trader/degen)
- 60-79: High (regular user)
- 40-59: Moderate (casual user)
- 20-39: Low (infrequent user)
- 0-19: Minimal (dormant wallet)

### 🛡️ Trust Score

The Trust Score (0-100) evaluates wallet reliability:

- **Wallet age** — Older wallets score higher
- **Transaction consistency** — Regular patterns vs. suspicious spikes
- **Known labels** — Recognized entities (exchanges, protocols) get bonus points
- **Behavior patterns** — Organic activity vs. bot-like patterns

**Interpretation:**
- 80-100: Highly trusted (established wallet)
- 60-79: Trusted (normal behavior)
- 40-59: Neutral (insufficient data)
- 20-39: Caution (unusual patterns)
- 0-19: High risk (suspicious activity)

### 💰 Token Holdings

Displays all ERC-20/BEP-20 tokens held by the wallet:

- Native token (ETH/MATIC/ARB/OP/BNB) shown at top with sticky positioning
- Token logos from CoinGecko CDN
- Real-time USD prices via CoinGecko API
- Sorted by USD value (descending)
- Tokens without price data shown with "—" indicator

### 📜 Transaction Timeline

Interactive transaction history table:

- **Filtering:** All / Incoming / Outgoing
- **Pagination:** Configurable rows per page (5/10/20/50)
- **Explorer links:** Direct links to Etherscan, Polygonscan, Arbiscan, etc.
- **Color coding:** Green for incoming, red for outgoing
- **Method detection:** Transfer, Approve, Swap, and more

### 🗺️ Activity Heatmap

Visual representation of transaction patterns:

- Time-based activity distribution
- Peak hours and dormant periods identified
- Helps identify bot behavior vs. organic usage

### 🥧 Portfolio Chart

Donut chart showing token portfolio breakdown:

- Categorized by token type (Stablecoins, DeFi, L1/L2, etc.)
- Percentage allocation per category
- Interactive hover for details

---

## ⛓️ Supported Chains

| Chain | Explorer | Native Token |
|-------|----------|-------------|
| Ethereum | [Etherscan](https://etherscan.io) | ETH |
| Polygon | [Polygonscan](https://polygonscan.com) | MATIC |
| Arbitrum | [Arbiscan](https://arbiscan.io) | ETH |
| Optimism | [Optimistic Etherscan](https://optimistic.etherscan.io) | ETH |
| Base | [BaseScan](https://basescan.org) | ETH |
| BNB Chain | [BSCScan](https://bscscan.com) | BNB |

---

## 🔄 Application Flow

```
1. Enter Wallet Address
   └── User inputs 0x... address on homepage

2. Select Chain
   └── Choose from Ethereum, Polygon, Arbitrum, Optimism, Base, or BNB

3. Analyze
   └── System fetches data from Alchemy JSON-RPC + CoinGecko

4. Process & Score
   └── Calculate persona, activity score, trust score, categorize tokens

5. Display Dashboard
   └── Render persona card, scores, holdings, transactions, heatmap, chart
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Alchemy** | Blockchain data via JSON-RPC |
| **CoinGecko** | Real-time token USD prices |
| **Recharts** | Charts and visualizations |

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/bsyrlhabibi/walletprofiler.git
cd walletprofiler

# Install
npm install

# Environment
echo "ALCHEMY_API_KEY=your_key_here" > .env.local

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router (pages + API)
├── components/           # React components
├── hooks/                # Custom React hooks
├── lib/                  # Core logic (Alchemy, persona, trust)
├── types/                # TypeScript interfaces
├── constants/            # Chain configs, explorers
└── utils/                # Formatting utilities
```

See [GUIDE.md](./GUIDE.md) for detailed developer setup.

---

## 📄 License

MIT

---

Built by **KOIDRAGON** 🐉 — Hermes Agent
