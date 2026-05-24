"use client";

import { useState, useEffect, useRef } from "react";
import SearchBar from "@/components/search-bar";
import ChainTabs from "@/components/chain-tabs";
import PersonaCard from "@/components/persona-card";
import ActivityHeatmap from "@/components/activity-heatmap";
import TokenHoldings from "@/components/token-holdings";
import TxTimeline from "@/components/tx-timeline";
import TrustActivityPanel from "@/components/trust-activity-panel";
import PortfolioPieChart from "@/components/portfolio-pie-chart";
import { WalletProfile } from "@/lib/types";
import { Sparkles, Zap, Shield, BarChart3, AlertTriangle, ArrowLeft, Wallet, Globe } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChain, setCurrentChain] = useState("eth");
  const [analyzedChain, setAnalyzedChain] = useState("eth");
  const [analyzedAddress, setAnalyzedAddress] = useState<string | null>(null);
  const chainCurrency: Record<string, string> = { eth: "ETH", polygon: "MATIC", arbitrum: "ETH", optimism: "ETH", base: "ETH" };
  const cacheRef = useRef<Map<string, WalletProfile>>(new Map());
  // Go to home state
  const goHome = () => {
    setProfile(null);
    setError(null);
    setLoading(false);
    setAnalyzedAddress(null);
  };

  // Core fetch — no history manipulation
  const fetchWallet = async (address: string, chain: string) => {
    setLoading(true);
    setError(null);
    setProfile(null);
    setCurrentChain(chain);
    setAnalyzedChain(chain);
    setAnalyzedAddress(address);

    try {
      const res = await fetch(`/api/wallet?address=${address}&chain=${chain}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: WalletProfile = await res.json();
      setProfile(data);
      cacheRef.current.set(`${address}-${chain}`, data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze wallet";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // User-initiated search — push history + fetch
  const handleSearch = async (address: string, chain: string = "eth") => {
    history.pushState({ address, chain }, "", `/?address=${address}&chain=${chain}`);
    await fetchWallet(address, chain);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (e.state?.address) {
        // Forward/redo — restore from cache or fetch
        const key = `${e.state.address}-${e.state.chain || "eth"}`;
        const cached = cacheRef.current.get(key);
        if (cached) {
          setProfile(cached);
          setAnalyzedChain(e.state.chain || "eth");
          setAnalyzedAddress(e.state.address);
          setCurrentChain(e.state.chain || "eth");
          setError(null);
          setLoading(false);
        } else {
          fetchWallet(e.state.address, e.state.chain || "eth");
        }
      } else {
        // Back — return to home
        goHome();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Switch chain and auto-re-analyze same address
  const handleChainSwitch = (chain: string) => {
    if (chain === analyzedChain) return;
    if (analyzedAddress) {
      handleSearch(analyzedAddress, chain);
    } else {
      setCurrentChain(chain);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-fuchsia-100/50 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
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
              href={`https://${profile?.explorerUrl || "etherscan.io"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-fuchsia-600 px-3 py-1.5 rounded-lg hover:bg-fuchsia-50 transition font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              Etherscan
            </a>
            <a
              href="https://github.com/bsyrlhabibi/walletprofiler"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-fuchsia-600 px-3 py-1.5 rounded-lg hover:bg-fuchsia-50 transition font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
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
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-5">
                <WalletLogo size={56} />
              </div>
              <h1 className="text-5xl font-black mb-3">
                <span className="gradient-text">WalletProfiler</span>
              </h1>
              <p className="text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
                Paste any EVM address to get a full on-chain intelligence report — persona, activity score, trading patterns, and more.
              </p>
            </div>

            {/* Search with chain dropdown */}
            <SearchBar onSearch={handleSearch} loading={loading} chain={currentChain} onChainChange={setCurrentChain} showChainSelector={true} />

            {/* Example wallets */}
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

            {/* Features */}
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
            {/* Search bar (no dropdown) + Chain tabs */}
            <div className="space-y-3">
              <SearchBar onSearch={handleSearch} loading={loading} chain={analyzedChain} showChainSelector={false} />
              <ChainTabs activeChain={analyzedChain} onChainChange={handleChainSwitch} loading={loading} />
            </div>

            {/* Persona Card */}
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

            {/* Grid: Heatmaps + Risk */}
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

            {/* Portfolio Breakdown */}
            {(profile as any).portfolioBreakdown && (
              <PortfolioPieChart
                slices={(profile as any).portfolioBreakdown}
                totalValueUsd={profile.totalValueUsd}
              />
            )}

            {/* Grid: Tokens + Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4">
              <TokenHoldings
                tokens={profile.tokenBalances}
                ethBalance={profile.ethBalance}
                chain={analyzedChain}
                explorerUrl={profile.explorerUrl}
                nativePriceUsd={profile.ethBalanceUsd / profile.ethBalance || 0}
              />
              <TxTimeline transactions={profile.transactions} currency={chainCurrency[analyzedChain] || "ETH"} explorerUrl={profile.explorerUrl} />
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 py-6">
              <span className="bg-white/60 px-4 py-2 rounded-full border border-gray-100">
                Powered by Alchemy • {analyzedChain === "eth" ? "Ethereum" : analyzedChain === "polygon" ? "Polygon" : analyzedChain === "arbitrum" ? "Arbitrum" : analyzedChain === "optimism" ? "Optimism" : "Base"} mainnet • {profile.pattern.totalTransactions} transactions analyzed
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
