"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/discover/Avatar";
import BoosterBadge from "@/components/BoosterBadge";
import GumiTag from "@/components/GumiTag";
import WalletTag from "@/components/WalletTag";
import ComingSoonModal from "@/components/ComingSoonModal";
import Sparkline from "@/components/Sparkline";
import { ChevronLeftIcon, ClockIcon } from "@/components/icons";
import CoinStatBox from "./CoinStatBox";
import CoinActionsRow from "./CoinActionsRow";
import CoinMarketCapCard from "./CoinMarketCapCard";
import CoinTimeframeTabs from "./CoinTimeframeTabs";
import CoinExternalLinksRow from "./CoinExternalLinksRow";
import CoinDexLinksRow from "./CoinDexLinksRow";
import CoinActivityTabs, { type CoinActivityTab } from "./CoinActivityTabs";
import CoinTradeButtons from "./CoinTradeButtons";
import CoinTradeModal, { type CoinTradeMode } from "./CoinTradeModal";
import CoinGraduationCard from "./CoinGraduationCard";
import CoinTopHoldersCard from "./CoinTopHoldersCard";
import CoinSentimentBar from "./CoinSentimentBar";
import {
  getLaunchpadCoinDetail,
  getLaunchpadCoinChanges,
  getLaunchpadCoinSparkline,
  isGumiHandle,
  registerLiveLaunchpadCoins,
  type LaunchpadDetailTimeframe,
} from "@/lib/launchpad-data";
import { useLiveLaunchpadCoins } from "@/lib/launchpad-live";
import { fetchRealLaunchpadCoin } from "@/lib/launchpad-realtime";
import { formatCompactUsd, formatPrice } from "@/lib/format";
import { useWallet } from "@/lib/wallet-context";
import { useNotifications } from "@/lib/notification-context";
import { createProviderCaller } from "@/lib/nft-onchain";
import {
  buyCalldata,
  sellCalldata,
  previewBuyCalldata,
  previewSellCalldata,
  parseEtherToWei,
  decodeUint256,
  sendLaunchpadTransaction,
  waitForTransactionReceipt,
} from "@/lib/launchpad-onchain";
import {
  balanceOfCalldata,
  approveCalldata,
  fetchAllowance,
  fetchDecimals,
  parseAmountToBaseUnits,
  formatBaseUnitsToNumber,
  applySlippageToRaw,
} from "@/lib/swap-onchain";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

export default function CoinDetailApp({ id }: { id: string }) {
  const { connect, address, provider, chainId } = useWallet();
  const { addNotification } = useNotifications();
  const liveReady = useLiveLaunchpadCoins();
  const [detail, setDetail] = useState(() => getLaunchpadCoinDetail(id));
  const [timeframe, setTimeframe] = useState<LaunchpadDetailTimeframe>("24H");
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [watchlisted, setWatchlisted] = useState(false);
  const [activityTab, setActivityTab] = useState<CoinActivityTab>("Trades");
  const activityRef = useRef<HTMLDivElement>(null);

  const [tradeMode, setTradeMode] = useState<CoinTradeMode | null>(null);
  const [tradeStage, setTradeStage] = useState("");
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [quoteLabel, setQuoteLabel] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [sellBalanceRaw, setSellBalanceRaw] = useState<bigint>(0n);
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteRequestId = useRef(0);

  useEffect(() => {
    const existing = getLaunchpadCoinDetail(id);
    if (existing) {
      setDetail(existing);
      return;
    }
    if (!ADDRESS_PATTERN.test(id)) return;

    let cancelled = false;
    fetchRealLaunchpadCoin(id).then((coin) => {
      if (cancelled || !coin) return;
      registerLiveLaunchpadCoins([coin]);
      setDetail(getLaunchpadCoinDetail(id));
    });
    return () => {
      cancelled = true;
    };
  }, [id, liveReady]);

  const changes = useMemo(() => {
    if (!detail) {
      return { "5M": 0, "1H": 0, "6H": 0, "24H": 0 } as Record<LaunchpadDetailTimeframe, number>;
    }
    return getLaunchpadCoinChanges(detail);
  }, [detail]);

  const sparkline = useMemo(
    () => (detail ? getLaunchpadCoinSparkline(detail, timeframe) : []),
    [detail, timeframe]
  );

  if (!detail) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-display text-sm uppercase tracking-wider2 text-ivory">Coin Not Found</p>
        <Link
          href="/launchpad"
          className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-goldLight hover:text-goldLight"
        >
          <ChevronLeftIcon className="h-3 w-3" />
          Back to Launchpad
        </Link>
      </div>
    );
  }

  const activeChange = changes[timeframe];
  const bonded = Math.min(100, detail.bondingProgress);

  function focusActivity(tab: CoinActivityTab) {
    setActivityTab(tab);
    activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function ensureGiwaNetwork() {
    if (!provider) return;
    if (chainId === NETWORK.chainIdHex) return;
    setTradeStage("Switching To Giwa Sepolia...");
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainIdHex }],
      });
    } catch (switchError) {
      const code = (switchError as { code?: number })?.code;
      if (code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: NETWORK.chainIdHex,
              chainName: NETWORK.name,
              rpcUrls: [NETWORK.rpcUrl],
              blockExplorerUrls: [NETWORK.explorerUrl],
              nativeCurrency: NETWORK.nativeCurrency,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  function openTrade(mode: CoinTradeMode) {
    if (!detail) return;
    setTradeError(null);
    setQuoteLabel("");
    setTradeStage("");
    setTradeMode(mode);

    if (mode === "sell" && provider && address) {
      const call = createProviderCaller(provider);
      fetchDecimals(call, detail.contractAddress, false)
        .then((decimals) => {
          setTokenDecimals(decimals);
          return call(detail.contractAddress, balanceOfCalldata(address));
        })
        .then((raw) => setSellBalanceRaw(decodeUint256(raw)))
        .catch(() => setSellBalanceRaw(0n));
    }
  }

  function closeTrade() {
    if (tradeStage) return;
    setTradeMode(null);
    setTradeError(null);
    setQuoteLabel("");
    setSellBalanceRaw(0n);
  }

  function handleAmountChange(mode: CoinTradeMode, value: string) {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    const amountNum = parseFloat(value) || 0;
    if (!detail || amountNum <= 0 || !provider) {
      setQuoteLabel("");
      setQuoteLoading(false);
      return;
    }
    setQuoteLoading(true);
    const requestId = ++quoteRequestId.current;
    quoteTimer.current = setTimeout(async () => {
      try {
        const call = createProviderCaller(provider);
        if (mode === "buy") {
          const ethIn = parseEtherToWei(value);
          const raw = await call(CONTRACT_ADDRESSES.bondingCurveEngine, previewBuyCalldata(detail.contractAddress, ethIn));
          const tokensOut = decodeUint256(raw);
          if (requestId !== quoteRequestId.current) return;
          setQuoteLabel(`≈ ${formatBaseUnitsToNumber(tokensOut, 18).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${detail.symbol}`);
        } else {
          const tokensIn = parseAmountToBaseUnits(value, tokenDecimals);
          const raw = await call(CONTRACT_ADDRESSES.bondingCurveEngine, previewSellCalldata(detail.contractAddress, tokensIn));
          const ethOut = decodeUint256(raw);
          if (requestId !== quoteRequestId.current) return;
          setQuoteLabel(`≈ ${formatBaseUnitsToNumber(ethOut, 18).toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`);
        }
      } catch {
        if (requestId === quoteRequestId.current) setQuoteLabel("Quote unavailable");
      } finally {
        if (requestId === quoteRequestId.current) setQuoteLoading(false);
      }
    }, 400);
  }

  async function refreshDetailAfterTrade() {
    const updated = await fetchRealLaunchpadCoin(detail!.contractAddress).catch(() => null);
    if (updated) {
      registerLiveLaunchpadCoins([updated]);
      setDetail(getLaunchpadCoinDetail(id));
    }
  }

  async function handleConfirmTrade(amount: string) {
    if (!detail || !tradeMode) return;
    if (!provider || !address) {
      connect();
      return;
    }

    setTradeError(null);

    try {
      await ensureGiwaNetwork();
      const call = createProviderCaller(provider);
      const engine = CONTRACT_ADDRESSES.bondingCurveEngine;

      if (tradeMode === "buy") {
        const ethIn = parseEtherToWei(amount);
        if (ethIn <= 0n) throw new Error("Enter an amount to buy");

        const previewRaw = await call(engine, previewBuyCalldata(detail.contractAddress, ethIn));
        const expectedTokensOut = decodeUint256(previewRaw);
        if (expectedTokensOut <= 0n) throw new Error("This coin isn't tradeable on the curve right now");
        const minTokensOut = applySlippageToRaw(expectedTokensOut, 5);

        setTradeStage("Confirm In Your Wallet...");
        const data = buyCalldata(detail.contractAddress, minTokensOut, address);
        const txHash = await sendLaunchpadTransaction(provider, address, engine, data, ethIn);

        setTradeStage("Waiting For Confirmation...");
        const receipt = await waitForTransactionReceipt(provider, txHash);
        if (!receipt || receipt.status !== "0x1") throw new Error("Transaction failed or timed out");
      } else {
        const tokensIn = parseAmountToBaseUnits(amount, tokenDecimals);
        if (tokensIn <= 0n) throw new Error("Enter an amount to sell");
        if (tokensIn > sellBalanceRaw) throw new Error("Amount exceeds your balance");

        const allowance = await fetchAllowance(call, detail.contractAddress, address, engine);
        if (allowance < tokensIn) {
          setTradeStage("Approve Token Spend...");
          const approveData = approveCalldata(engine, tokensIn);
          const approveTxHash = await sendLaunchpadTransaction(provider, address, detail.contractAddress, approveData, 0n);
          setTradeStage("Confirming Approval...");
          const approveReceipt = await waitForTransactionReceipt(provider, approveTxHash);
          if (!approveReceipt || approveReceipt.status !== "0x1") throw new Error("Approval failed or timed out");
        }

        const previewRaw = await call(engine, previewSellCalldata(detail.contractAddress, tokensIn));
        const expectedEthOut = decodeUint256(previewRaw);
        if (expectedEthOut <= 0n) throw new Error("This coin isn't tradeable on the curve right now");
        const minEthOut = applySlippageToRaw(expectedEthOut, 5);

        setTradeStage("Confirm In Your Wallet...");
        const data = sellCalldata(detail.contractAddress, tokensIn, minEthOut, address);
        const txHash = await sendLaunchpadTransaction(provider, address, engine, data, 0n);

        setTradeStage("Waiting For Confirmation...");
        const receipt = await waitForTransactionReceipt(provider, txHash);
        if (!receipt || receipt.status !== "0x1") throw new Error("Transaction failed or timed out");
      }

      setTradeStage("Updating Coin Data...");
      await refreshDetailAfterTrade();
      setTradeStage("");
      setTradeMode(null);
      addNotification({
        category: "launch",
        title: tradeMode === "buy" ? "Buy Completed" : "Sell Completed",
        message: `${tradeMode === "buy" ? "Bought" : "Sold"} $${detail.symbol} on the bonding curve.`,
        href: `/launchpad/coin/${detail.id}`,
      });
    } catch (caughtError) {
      setTradeStage("");
      setTradeError(caughtError instanceof Error ? caughtError.message : "Transaction failed");
      addNotification({
        category: "launch",
        title: tradeMode === "buy" ? "Buy Failed" : "Sell Failed",
        message: `Your ${tradeMode} of $${detail.symbol} didn't go through.`,
        href: `/launchpad/coin/${detail.id}`,
      });
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-10 md:pt-10 md:pb-14">
      <Link
        href="/launchpad"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back to Launchpad
      </Link>

      <div className="mt-4 flex items-start gap-3">
        <Avatar
          label={detail.monogram}
          accent={detail.accent}
          shape="square"
          className="h-16 w-16 shrink-0 rounded-2xl text-lg"
          src={detail.image ?? undefined}
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="font-display text-base uppercase tracking-wider2 text-ivory">{detail.name}</h1>
            {detail.boost != null && <BoosterBadge value={detail.boost} />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">${detail.symbol}</span>
            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
              <ClockIcon className="h-2.5 w-2.5" />
              {detail.age} ago
            </span>
            <span className="border border-gold/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
              Gumifi Launchpad
            </span>
          </div>
          <div className="mt-1.5">
            {isGumiHandle(detail.creator) ? (
              <GumiTag handle={detail.creator} className="max-w-[160px]" />
            ) : (
              <WalletTag address={detail.creator} className="max-w-[160px]" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CoinActionsRow
          contractAddress={detail.contractAddress}
          watchlisted={watchlisted}
          onToggleWatchlist={() => setWatchlisted((value) => !value)}
          onShare={() => setComingSoon("Share")}
        />
      </div>

      <div className="mt-4">
        <CoinMarketCapCard
          marketCap={detail.marketCap}
          athMarketCap={detail.athMarketCap}
          change24h={detail.change24h}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <CoinStatBox label="Volume 24H">{formatCompactUsd(detail.volume24h)}</CoinStatBox>
        <CoinStatBox label="Price">{formatPrice(detail.priceUsd)}</CoinStatBox>
      </div>

      <div className="mt-4">
        <CoinTimeframeTabs active={timeframe} onChange={setTimeframe} changes={changes} />
      </div>

      <div className="mt-3 border border-line bg-panel p-4">
        <Sparkline values={sparkline} positive={activeChange >= 0} className="h-24 w-full" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1">
        <CoinStatBox label="Holders">{detail.holders.length}</CoinStatBox>
        <CoinStatBox label="Txns">{detail.trades.length}</CoinStatBox>
        <CoinStatBox label="Bonding">{bonded}%</CoinStatBox>
      </div>

      <div className="mt-4">
        <CoinExternalLinksRow onAction={setComingSoon} />
      </div>

      <div className="mt-4 border border-line bg-panel2 px-4 py-3">
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">Description</p>
        <p className="border-l-2 border-emeraldLight/50 pl-3 font-body text-xs leading-relaxed text-ivory/80">
          {detail.description}
        </p>
      </div>

      <div className="mt-4">
        {detail.graduated ? (
          <div className="rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-goldLight">
              Graduated — now trading on the DEX pool
            </p>
          </div>
        ) : (
          <CoinTradeButtons
            symbol={detail.symbol}
            onBuy={() => openTrade("buy")}
            onSell={() => openTrade("sell")}
          />
        )}
      </div>

      <div ref={activityRef} className="mt-4 scroll-mt-20">
        <CoinActivityTabs
          trades={detail.trades}
          holders={detail.holders}
          commentCount={detail.commentCount}
          symbol={detail.symbol}
          active={activityTab}
          onChange={setActivityTab}
          onAction={setComingSoon}
        />
      </div>

      <div className="mt-4">
        <CoinGraduationCard marketCap={detail.marketCap} />
      </div>

      <div className="mt-3">
        <CoinDexLinksRow onAction={setComingSoon} />
      </div>

      <div className="mt-3">
        <CoinTopHoldersCard holders={detail.holders} onViewAll={() => focusActivity("Holders")} />
      </div>

      <div className="mt-3">
        <CoinSentimentBar votesUp={detail.votesUp} votesDown={detail.votesDown} />
      </div>

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}

      {tradeMode && (
        <CoinTradeModal
          mode={tradeMode}
          symbol={detail.symbol}
          balanceLabel={
            tradeMode === "sell"
              ? `Max: ${formatBaseUnitsToNumber(sellBalanceRaw, tokenDecimals).toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}`
              : undefined
          }
          quoteLabel={quoteLabel}
          quoteLoading={quoteLoading}
          errorMessage={tradeError}
          stageLabel={tradeStage}
          onAmountChange={(value) => handleAmountChange(tradeMode, value)}
          onMax={
            tradeMode === "sell"
              ? () => formatBaseUnitsToNumber(sellBalanceRaw, tokenDecimals).toString()
              : undefined
          }
          onConfirm={handleConfirmTrade}
          onClose={closeTrade}
        />
      )}
    </div>
  );
}
