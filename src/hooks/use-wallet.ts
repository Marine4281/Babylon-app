// src/hooks/use-wallet.ts
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { fetchWallet } from "@/api/endpoints";

export function useWallet() {
  const [balance, setBalance] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchWallet();
      setBalance(data.balance);
    } catch {
      // keep the last known balance if the request fails
    }
  }, []);

  // Re-fetch whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  return { balance, refresh };
}
