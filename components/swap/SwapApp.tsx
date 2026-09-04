"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ComingSoonModal from "@/components/ComingSoonModal";
import { getSwapTokenById, type SwapToken } from "@/lib/swap-data";
import SwapHeader from "./SwapHeader";
import SwapCard from "./SwapCard";
import type { SwapSettings } from "./SwapSettingsModal";
import TokenInfoSection from "./TokenInfoSection";
import RecentSwapsSection from "./RecentSwapsSection";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";

const TokenSearchModal = dynamic(() => import("./TokenSearchModal"), {
  loading: () => <ModalSkeleton />,
});
const SwapSettingsModal = dynamic(() => import("./SwapSettingsModal"), {
  loading: () => <ModalSkeleton />,
});

const DEFAULT_SETTINGS: SwapSettings = {
  slippagePct: 0.5,
  deadlineMinutes: 20,
  mevProtection: false,
};

export default function SwapApp() {
  const [payTokenId, setPayTokenId] = useState("eth");
  const [receiveTokenId, setReceiveTokenId] = useState("gumi");
  const [payAmount, setPayAmount] = useState("");
  const [customTokens, setCustomTokens] = useState<SwapToken[]>([]);
  const [tokenSearchSide, setTokenSearchSide] = useState<"pay" | "receive" | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SwapSettings>(DEFAULT_SETTINGS);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const payToken = getSwapTokenById(payTokenId, customTokens)!;
  const receiveToken = getSwapTokenById(receiveTokenId, customTokens)!;

  function handleFlip() {
    setPayTokenId(receiveTokenId);
    setReceiveTokenId(payTokenId);
  }

  function handleImportToken(token: SwapToken) {
    setCustomTokens((prev) => (prev.some((item) => item.id === token.id) ? prev : [...prev, token]));
  }

  function handleSelectToken(tokenId: string) {
    if (tokenSearchSide === "pay") setPayTokenId(tokenId);
    if (tokenSearchSide === "receive") setReceiveTokenId(tokenId);
    setTokenSearchSide(null);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8 md:py-12">
      <SwapHeader />

      <div className="w-full">
        <SwapCard
          payToken={payToken}
          receiveToken={receiveToken}
          payAmount={payAmount}
          onPayAmountChange={setPayAmount}
          onFlip={handleFlip}
          onOpenTokenSearch={setTokenSearchSide}
          onOpenSettings={() => setSettingsOpen(true)}
          settings={settings}
        />
      </div>

      <TokenInfoSection token={receiveToken} onViewChart={() => setComingSoon("Dex Screener")} />
      <RecentSwapsSection />

      {tokenSearchSide && (
        <TokenSearchModal
          title={tokenSearchSide === "pay" ? "Select Token to Pay" : "Select Token to Receive"}
          excludeId={tokenSearchSide === "pay" ? receiveTokenId : payTokenId}
          extraTokens={customTokens}
          onSelect={handleSelectToken}
          onImportToken={handleImportToken}
          onClose={() => setTokenSearchSide(null)}
        />
      )}

      {settingsOpen && (
        <SwapSettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
    </div>
  );
}
