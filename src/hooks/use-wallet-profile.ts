"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { WalletProfile } from "@/types/wallet";

/**
 * Return type for the useWalletProfile hook.
 */
export interface UseWalletProfileReturn {
  /** Current wallet profile data, or null if not loaded. */
  profile: WalletProfile | null;
  /** Whether a fetch is in progress. */
  loading: boolean;
  /** Error message, or null if no error. */
  error: string | null;
  /** The chain that was analyzed. */
  analyzedChain: string;
  /** The address that was analyzed. */
  analyzedAddress: string | null;
  /** Initiate a wallet search (pushes browser history). */
  handleSearch: (address: string, chain?: string) => Promise<void>;
  /** Switch chain and re-analyze the current address. */
  handleChainSwitch: (chain: string) => void;
  /** Reset to home state. */
  goHome: () => void;
}

/**
 * Custom hook that manages wallet profile data fetching, caching,
 * and browser history for back/forward navigation.
 *
 * @returns Object containing profile data, loading/error states, and action handlers
 */
export function useWalletProfile(): UseWalletProfileReturn {
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedChain, setAnalyzedChain] = useState("eth");
  const [analyzedAddress, setAnalyzedAddress] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, WalletProfile>>(new Map());

  const goHome = useCallback(() => {
    setProfile(null);
    setError(null);
    setLoading(false);
    setAnalyzedAddress(null);
  }, []);

  /** Core fetch — no history manipulation. */
  const fetchWallet = useCallback(async (address: string, chain: string) => {
    setLoading(true);
    setError(null);
    setProfile(null);
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
  }, []);

  /** User-initiated search — push history + fetch. */
  const handleSearch = useCallback(async (address: string, chain: string = "eth") => {
    history.pushState({ address, chain }, "", `/?address=${address}&chain=${chain}`);
    await fetchWallet(address, chain);
  }, [fetchWallet]);

  /** Switch chain and auto-re-analyze same address. */
  const handleChainSwitch = useCallback((chain: string) => {
    if (chain === analyzedChain) return;
    if (analyzedAddress) {
      handleSearch(analyzedAddress, chain);
    }
  }, [analyzedChain, analyzedAddress, handleSearch]);

  /** Handle browser back/forward buttons. */
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (e.state?.address) {
        const key = `${e.state.address}-${e.state.chain || "eth"}`;
        const cached = cacheRef.current.get(key);
        if (cached) {
          setProfile(cached);
          setAnalyzedChain(e.state.chain || "eth");
          setAnalyzedAddress(e.state.address);
          setError(null);
          setLoading(false);
        } else {
          fetchWallet(e.state.address, e.state.chain || "eth");
        }
      } else {
        goHome();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [fetchWallet, goHome]);

  return {
    profile, loading, error, analyzedChain, analyzedAddress,
    handleSearch, handleChainSwitch, goHome,
  };
}
