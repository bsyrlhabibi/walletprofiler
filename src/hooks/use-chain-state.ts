"use client";

import { useState, useCallback } from "react";

/**
 * Return type for the useChainState hook.
 */
export interface UseChainStateReturn {
  /** Currently selected chain in the UI. */
  currentChain: string;
  /** Set the current chain selection. */
  setCurrentChain: (chain: string) => void;
}

/**
 * Custom hook that manages chain selection state.
 * Used by the search bar to track which chain the user has selected
 * before initiating a search.
 *
 * @param initialChain - Starting chain ID (default: "eth")
 * @returns Object containing currentChain state and setter
 */
export function useChainState(initialChain = "eth"): UseChainStateReturn {
  const [currentChain, setCurrentChain] = useState(initialChain);

  const setChain = useCallback((chain: string) => {
    setCurrentChain(chain);
  }, []);

  return { currentChain, setCurrentChain: setChain };
}
