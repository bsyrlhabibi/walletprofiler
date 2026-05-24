"use client";

import { useState } from "react";
import SearchBar from "@/components/search-bar";
import PersonaCard from "@/components/persona-card";
import ActivityHeatmap from "@/components/activity-heatmap";
import TokenHoldings from "@/components/token-holdings";
import TxTimeline from "@/components/tx-timeline";
import RiskMeter from "@/components/risk-meter";
import { WalletProfile } from "@/lib/types";
import { Activity, Sparkles } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Home() {
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (address: string) => {
    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const res = await fetch(`/api/wallet?address=${address}&chain=eth`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: WalletProfile = await res.json();
      setProfile(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze wallet";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              WalletProfiler
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">Ethereum</span>
            <a
              href="https://github.com/bsyrlhabibi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero / Search */}
        {!profile && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  WalletProfiler
                </h1>
              </div>
              <p className="text-gray-400 max-w-md mx-auto">
                Paste any Ethereum address to get a full on-chain intelligence report — persona, risk score, trading patterns, and more.
              </p>
            </div>
            <SearchBar onSearch={handleSearch} loading={loading} />
            {/* Example wallets */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-600 mb-2">Try an example:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: "Vitalik", addr: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
                  { label: "CZ Binance", addr: "0x28C6c06298d514Db089934071355E5743bf21d60" },
                  { label: "Base", addr: "0x4c80E281196C0F65E6A820D90600E0721aB7946c" },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => handleSearch(ex.addr)}
                    className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-full transition"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-800 border-t-purple-500 rounded-full animate-spin" />
            </div>
            <p className="text-gray-400 mt-4 text-sm">Analyzing wallet on-chain...</p>
            <p className="text-gray-600 text-xs mt-1">Fetching balances, tokens, and transaction history</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md text-center">
              <p className="text-red-400 font-semibold mb-2">Analysis Failed</p>
              <p className="text-gray-400 text-sm">{error}</p>
              <button
                onClick={() => { setError(null); setProfile(null); }}
                className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Profile Dashboard */}
        {profile && !loading && (
          <div className="space-y-6">
            {/* Search bar (persistent) */}
            <SearchBar onSearch={handleSearch} loading={loading} />

            {/* Persona Card */}
            <PersonaCard
              pattern={profile.pattern}
              address={profile.address}
              ethBalance={profile.ethBalance}
              totalTokens={profile.tokenBalances.length}
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
              <RiskMeter pattern={profile.pattern} />
            </div>

            {/* Grid: Tokens + Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TokenHoldings
                tokens={profile.tokenBalances}
                ethBalance={profile.ethBalance}
              />
              <TxTimeline transactions={profile.transactions} />
            </div>

            {/* Footer info */}
            <div className="text-center text-xs text-gray-600 py-4">
              Powered by Alchemy • Data from Ethereum mainnet • {profile.pattern.totalTransactions} transactions analyzed
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
