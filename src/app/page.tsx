"use client";

import { useState } from "react";
import SearchBar from "@/components/search-bar";
import ChainTabs from "@/components/chain-tabs";
import PersonaCard from "@/components/persona-card";
import ActivityHeatmap from "@/components/activity-heatmap";
import TokenHoldings from "@/components/token-holdings";
import TxTimeline from "@/components/tx-timeline";
import TrustActivityPanel from "@/components/trust-activity-panel";
import PortfolioPieChart from "@/components/portfolio-pie-chart";
import { useWalletProfile } from "@/hooks/use-wallet-profile";
import { useChainState } from "@/hooks/use-chain-state";
import { CHAIN_CURRENCY } from "@/constants/chains";
import type { ChainId } from "@/constants/chains";
import { Sparkles, Zap, Shield, BarChart3, AlertTriangle, ArrowLeft, Wallet } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Wallet logo icon used in the header and hero section. */
function WalletLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-200/50"
      style={{ width: size, height: size }}
    >
      <Wallet className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
    </div>
  );
}

export default function Home() {
  const {
    profile, loading, error, analyzedChain, analyzedAddress,
    handleSearch, handleChainSwitch, goHome,
  } = useWalletProfile();

  const { currentChain, setCurrentChain } = useChainState("eth");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-2.5 hover:opacity-80 transition">
            <WalletLogo size={34} />
            <div className="flex flex-col">
              <span className="text-lg font-black gradient-text leading-tight">
                WalletProfiler
              </span>
              <span className="text-[10px] text-gray-400 leading-none">On-Chain Intelligence</span>
            </div>
          </button>

          <nav className="hidden sm:flex items-center gap-1">
            {profile && (
              <button
                onClick={goHome}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-fuchsia-600 px-3 py-1.5 rounded-lg hover:bg-fuchsia-50 transition font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Home
              </button>
            )}
            <a
              href="https://etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-fuchsia-600 px-2.5 py-1.5 rounded-lg hover:bg-fuchsia-50 transition font-medium"
              title="Etherscan"
            >
              <img src="https://etherscan.io/images/favicon3.ico" alt="ETH" className="w-4 h-4 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-xs">Etherscan</span>
            </a>
            <a
              href="https://bscscan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-fuchsia-600 px-2.5 py-1.5 rounded-lg hover:bg-fuchsia-50 transition font-medium"
              title="BscScan"
            >
              <img src="https://bscscan.com/images/favicon.ico" alt="BNB" className="w-4 h-4 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-xs">BscScan</span>
            </a>
            <a
              href="https://basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-fuchsia-600 px-2.5 py-1.5 rounded-lg hover:bg-fuchsia-50 transition font-medium"
              title="BaseScan"
            >
              <img src="https://basescan.org/assets/base/images/favicon.ico" alt="BASE" className="w-4 h-4 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-xs">BaseScan</span>
            </a>
          </nav>

          {/* Mobile back button */}
          {profile && (
            <button
              onClick={goHome}
              className="sm:hidden flex items-center gap-1 text-sm text-fuchsia-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero / Search */}
        {!profile && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[65vh]">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-5">
                <WalletLogo size={56} />
              </div>
              <h1 className="text-3xl sm:text-5xl font-black mb-3">
                <span className="gradient-text">WalletProfiler</span>
              </h1>
              <p className="text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
                Paste any EVM address to get a full on-chain intelligence report — persona, activity score, trading patterns, and more.
              </p>
            </div>

            <SearchBar onSearch={handleSearch} loading={loading} chain={currentChain} onChainChange={setCurrentChain} showChainSelector={true} />

            <div className="mt-10 text-center">
              <p className="text-xs text-gray-400 mb-3 font-medium">Try an example:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: "🟣 Ethereum Wallet", addr: "0xEF98b44533d97C59171C9FC58F2e0E6d12a25204", chain: "eth" },
                  { label: "🔴 Arbitrum DAO", addr: "0xf7753A50B0C1f22235C0A1E4871830C60D7f132a", chain: "arbitrum" },
                  { label: "🔵 Base Wallet", addr: "0x4c80E281196C0F65E6A820D90600E0721aB7946c", chain: "base" },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => handleSearch(ex.addr, ex.chain)}
                    className="text-sm text-fuchsia-600 hover:text-fuchsia-700 bg-white hover:bg-fuchsia-50 px-4 py-2 rounded-xl transition font-medium border border-fuchsia-100 hover:border-fuchsia-200 shadow-sm hover:shadow-md"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 max-w-3xl w-full">
              {[
                { icon: <Zap className="w-5 h-5" />, label: "Degen Score", desc: "0-100 rating", color: "text-amber-500 bg-amber-50" },
                { icon: <Shield className="w-5 h-5" />, label: "Risk Analysis", desc: "Auto insights", color: "text-emerald-500 bg-emerald-50" },
                { icon: <BarChart3 className="w-5 h-5" />, label: "Activity Map", desc: "Hourly heatmap", color: "text-indigo-500 bg-indigo-50" },
                { icon: <Sparkles className="w-5 h-5" />, label: "Persona", desc: "Wallet identity", color: "text-fuchsia-500 bg-fuchsia-50" },
              ].map((f, i) => (
                <div key={i} className="glass-card p-4 text-center glass-card-hover animate-fade-in" style={{ animationDelay: `${i * 0.1 + 0.3}s`, opacity: 0 }}>
                  <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mx-auto mb-2`}>
                    {f.icon}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">{f.label}</div>
                  <div className="text-xs text-gray-400">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-fuchsia-100 border-t-fuchsia-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-pink-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            </div>
            <p className="text-gray-600 font-medium">Analyzing wallet on-chain...</p>
            <p className="text-gray-400 text-sm mt-1">Fetching balances, tokens, and transaction history</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="glass-card p-8 max-w-md text-center border-rose-100">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-rose-500" />
              </div>
              <p className="text-rose-600 font-bold text-lg mb-2">Analysis Failed</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={goHome}
                className="mt-5 text-sm text-fuchsia-600 hover:text-fuchsia-700 font-semibold bg-fuchsia-50 px-4 py-2 rounded-xl transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* Profile Dashboard */}
        {profile && !loading && (
          <div className="space-y-5">
            <div className="space-y-4 pt-2">
              <SearchBar onSearch={handleSearch} loading={loading} chain={analyzedChain} showChainSelector={false} />
              <div className="pt-1">
                <ChainTabs activeChain={analyzedChain} onChainChange={handleChainSwitch} loading={loading} />
              </div>
            </div>

            <PersonaCard
              pattern={profile.pattern}
              address={profile.address}
              ethBalance={profile.ethBalance}
              totalTokens={profile.tokenBalances.length}
              chain={analyzedChain}
              totalValueUsd={profile.totalValueUsd}
              ethBalanceUsd={profile.ethBalanceUsd}
              explorerUrl={profile.explorerUrl}
              walletLabel={profile.walletLabel}
              walletType={profile.walletType}
              walletTag={profile.walletTag}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ActivityHeatmap
                data={profile.pattern.activityByHour}
                labels={[]}
                title="Activity by Hour (UTC)"
                type="hourly"
              />
              <ActivityHeatmap
                data={profile.pattern.activityByDay}
                labels={DAYS}
                title="Activity by Day"
                type="daily"
              />
              <TrustActivityPanel pattern={profile.pattern} />
            </div>

            {profile.portfolioBreakdown && (
              <PortfolioPieChart
                slices={profile.portfolioBreakdown}
                totalValueUsd={profile.totalValueUsd}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4 items-start">
              <TokenHoldings
                tokens={profile.tokenBalances}
                ethBalance={profile.ethBalance}
                chain={analyzedChain}
                explorerUrl={profile.explorerUrl}
                nativePriceUsd={profile.ethBalanceUsd / profile.ethBalance || 0}
              />
              <TxTimeline transactions={profile.transactions} currency={CHAIN_CURRENCY[(analyzedChain as ChainId)] || "ETH"} explorerUrl={profile.explorerUrl} />
            </div>
          </div>
        )}

        {/* Universal Footer */}
        <footer className="border-t border-gray-200 mt-6 py-8 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="bg-white/60 px-4 py-2 rounded-full border border-gray-100">
              Powered by Alchemy{profile ? ` • ${analyzedChain === "eth" ? "Ethereum" : analyzedChain === "polygon" ? "Polygon" : analyzedChain === "arbitrum" ? "Arbitrum" : analyzedChain === "optimism" ? "Optimism" : analyzedChain === "bnb" ? "BNB Chain" : "Base"} mainnet • ${profile.pattern.totalTransactions} transactions analyzed` : " • On-Chain Intelligence"}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">🐉</span>
            <span className="text-xs font-medium text-gray-400 tracking-wide">
              Built by <span className="font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">KOIDRAGON</span> — <span className="text-gray-500">Hermes Agent</span>
            </span>
            <span className="text-sm">🐉</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
