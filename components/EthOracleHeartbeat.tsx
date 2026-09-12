"use client";

import { useEffect } from "react";
import { ETH_ORACLE_UPDATE_INTERVAL_MS } from "@/lib/eth-oracle";

export default function EthOracleHeartbeat() {
  useEffect(() => {
    let cancelled = false;

    function ping() {
      fetch("/api/oracle/eth-usd", { cache: "no-store" }).catch(() => {});
    }

    if (!cancelled) ping();
    const interval = window.setInterval(ping, ETH_ORACLE_UPDATE_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
