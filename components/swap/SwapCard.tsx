"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDownIcon, GearIcon } from "@/components/icons";
import { formatBalance } from "@/lib/format";
import { useWallet } from "@/lib/wallet-context";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { createProviderCaller, createRpcCaller, type EthCaller } from "@/lib/nft-onchain";
import { fetchErc20Balance, fetchNativeBalance } from "@/lib/token-onchain";
import { sendLaunchpadTransaction as sendOnchainTransaction, waitForTransactionReceipt } from "@/lib/launchpad-onchain";
import {
  applySlippageToRaw,
  approveCalldata,
  fetchAllowance,
  fetchDecimals,
  fetchGasPriceWei,
  fetchSwapQuote,
  formatBaseUnitsToNumber,
  FALLBACK_GAS_UNITS_DIRECT,
  FALLBACK_GAS_UNITS_MULTIHOP,
  getDeadlineTimestamp,
  getWethAddress,
  parseAmountToBaseUnits,
  resolveTokenContract,
  swapExactETHForTokensCalldata,
  swapExactTokensForETHCalldata,
  swapExactTokensForTokensCalldata,
  type SwapQuote,
} from "@/lib/swap-onchain";
import type { SwapToken } from "@/lib/swap-data";
import type { SwapSettings } from "./SwapSettingsModal";
import TokenSelectButton from "./TokenSelectButton";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";

const SwapSuccessModal = dynamic(() => import("./SwapSuccessModal"), {
  loading: () => <ModalSkeleton />,
});

type SwapStage =
  | "idle"
  | "switching-network"
  | "awaiting-approval-signature"
  | "approval-confirming"
  | "awaiting-signature"
  | "confirming";

const STAGE_LABELS: Record<SwapStage, string> = {
  idle: "",
  "switching-network": "Switching To Giwa Sepolia...",
  "awaiting-approval-signature": "Confirm Approval In Wallet...",
  "approval-confirming": "Approving...",
  "awaiting-signature": "Confirm In Your Wallet...",
  confirming: "Confirming Swap...",
};

function describeHop(index: number, path: string[], payToken: SwapToken, receiveToken: SwapToken): string {
  if (index === 0) return payToken.symbol;
  if (index === path.length - 1) return receiveToken.symbol;
  return "WETH";
}

export default function SwapCard({
  payToken,
  receiveToken,
  payAmount,
  onPayAmountChange,
  onFlip,
  onOpenTokenSearch,
  onOpenSettings,
  settings,
}: {
  payToken: SwapToken;
  receiveToken: SwapToken;
  payAmount: string;
  onPayAmountChange: (value: string) => void;
  onFlip: () => void;
  onOpenTokenSearch: (side: "pay" | "receive") => void;
  onOpenSettings: () => void;
  settings: SwapSettings;
}) {
  const { isConnected, connect, address, provider, chainId } = useWallet();

  const [payBalance, setPayBalance] = useState(0);
  const [receiveBalance, setReceiveBalance] = useState(0);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [payDecimals, setPayDecimals] = useState(18);
  const [receiveDecimals, setReceiveDecimals] = useState(18);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [gasFeeEth, setGasFeeEth] = useState<number | null>(null);
  const [stage, setStage] = useState<SwapStage>("idle");
  const [actionError, setActionError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<{ txHash: string; message: string } | null>(null);

  const payAmountNum = parseFloat(payAmount) || 0;
  const hasAmount = payAmountNum > 0;
  const payResolved = resolveTokenContract(payToken);
  const receiveResolved = resolveTokenContract(receiveToken);
  const pairResolvable = !!payResolved && !!receiveResolved && payToken.id !== receiveToken.id;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const call: EthCaller = provider ? createProviderCaller(provider) : createRpcCaller(NETWORK.rpcUrl);

      if (isConnected && address) {
        setBalancesLoading(true);
        const [pb, rb] = await Promise.all([
          payResolved
            ? payResolved.isNative
              ? fetchNativeBalance(provider, NETWORK.rpcUrl, address)
              : fetchErc20Balance(call, payResolved.address, address)
            : Promise.resolve(0),
          receiveResolved
            ? receiveResolved.isNative
              ? fetchNativeBalance(provider, NETWORK.rpcUrl, address)
              : fetchErc20Balance(call, receiveResolved.address, address)
            : Promise.resolve(0),
        ]);
        if (!cancelled) {
          setPayBalance(pb);
          setReceiveBalance(rb);
          setBalancesLoading(false);
        }
      } else if (!cancelled) {
        setPayBalance(0);
        setReceiveBalance(0);
        setBalancesLoading(false);
      }

      if (!payResolved || !receiveResolved || payToken.id === receiveToken.id || !hasAmount) {
        if (!cancelled) {
          setQuote(null);
          setNeedsApproval(false);
          setQuoteLoading(false);
          setGasFeeEth(null);
        }
        return;
      }

      setQuoteLoading(true);
      const [payDec, receiveDec] = await Promise.all([
        fetchDecimals(call, payResolved.address, payResolved.isNative),
        fetchDecimals(call, receiveResolved.address, receiveResolved.isNative),
      ]);
      if (cancelled) return;
      setPayDecimals(payDec);
      setReceiveDecimals(receiveDec);

      const payAmountRaw = parseAmountToBaseUnits(payAmount, payDec);
      const wethAddress = await getWethAddress(call);
      if (!wethAddress) {
        if (!cancelled) {
          setQuote(null);
          setQuoteLoading(false);
          setGasFeeEth(null);
        }
        return;
      }

      const [result, gasPriceWei] = await Promise.all([
        fetchSwapQuote({
          call,
          wethAddress,
          payResolved,
          receiveResolved,
          payAmountRaw,
          payDecimals: payDec,
          receiveDecimals: receiveDec,
        }),
        fetchGasPriceWei(NETWORK.rpcUrl),
      ]);
      if (cancelled) return;
      setQuote(result);
      setQuoteLoading(false);
      if (result && gasPriceWei) {
        const gasUnits = result.path.length > 2 ? FALLBACK_GAS_UNITS_MULTIHOP : FALLBACK_GAS_UNITS_DIRECT;
        setGasFeeEth(Number(gasPriceWei * gasUnits) / 1e18);
      } else {
        setGasFeeEth(null);
      }

      if (isConnected && address && !payResolved.isNative) {
        const allowance = await fetchAllowance(call, payResolved.address, address, CONTRACT_ADDRESSES.gumiRouter);
        if (!cancelled) setNeedsApproval(allowance < payAmountRaw);
      } else if (!cancelled) {
        setNeedsApproval(false);
      }
    }

    const timer = window.setTimeout(run, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [payToken.id, receiveToken.id, payAmount, isConnected, address, provider]);

  async function ensureGiwaNetwork() {
    if (!provider) return;
    if (chainId === NETWORK.chainIdHex) return;
    setStage("switching-network");
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

  async function handleApprove() {
    if (!provider || !address || !payResolved || payResolved.isNative) return;
    setActionError(null);
    try {
      await ensureGiwaNetwork();
      const amountRaw = parseAmountToBaseUnits(payAmount, payDecimals);
      setStage("awaiting-approval-signature");
      const txHash = await sendOnchainTransaction(
        provider,
        address,
        payResolved.address,
        approveCalldata(CONTRACT_ADDRESSES.gumiRouter, amountRaw),
        0n
      );
      setStage("approval-confirming");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Approval failed or timed out");
      }
      setNeedsApproval(false);
      setStage("idle");
    } catch (caughtError) {
      setStage("idle");
      setActionError(caughtError instanceof Error ? caughtError.message : "Failed to approve token");
    }
  }

  async function handleSwap() {
    if (!provider || !address || !payResolved || !receiveResolved || !quote || quote.amountOutRaw <= 0n) return;
    setActionError(null);
    try {
      await ensureGiwaNetwork();
      const amountOutMinRaw = applySlippageToRaw(quote.amountOutRaw, settings.slippagePct);
      const deadline = getDeadlineTimestamp(settings.deadlineMinutes);
      const payAmountRaw = parseAmountToBaseUnits(payAmount, payDecimals);

      let data: string;
      let valueWei = 0n;
      if (payResolved.isNative) {
        data = swapExactETHForTokensCalldata(amountOutMinRaw, quote.path, address, deadline);
        valueWei = payAmountRaw;
      } else if (receiveResolved.isNative) {
        data = swapExactTokensForETHCalldata(payAmountRaw, amountOutMinRaw, quote.path, address, deadline);
      } else {
        data = swapExactTokensForTokensCalldata(payAmountRaw, amountOutMinRaw, quote.path, address, deadline);
      }

      setStage("awaiting-signature");
      const txHash = await sendOnchainTransaction(provider, address, CONTRACT_ADDRESSES.gumiRouter, data, valueWei);

      setStage("confirming");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Swap failed or timed out");
      }

      const receiveAmountLabel = formatBalance(quote.receiveAmount);
      const swappedAmountLabel = payAmount;
      const paySymbol = payToken.symbol;
      const receiveSymbol = receiveToken.symbol;

      setStage("idle");
      onPayAmountChange("");
      setSuccessTx({
        txHash,
        message: `Swapped ${swappedAmountLabel} ${paySymbol} for approximately ${receiveAmountLabel} ${receiveSymbol}.`,
      });
    } catch (caughtError) {
      setStage("idle");
      setActionError(caughtError instanceof Error ? caughtError.message : "Swap failed");
    }
  }

  const insufficientBalance = isConnected && hasAmount && !balancesLoading && payAmountNum > payBalance;
  const busy = stage !== "idle";

  const impactColor =
    quote && quote.priceImpactPct !== null
      ? quote.priceImpactPct > 3
        ? "text-garnetLight"
        : quote.priceImpactPct > 1
          ? "text-goldLight"
          : "text-ivory"
      : "text-ivory";

  let ctaLabel = "Swap";
  let ctaDisabled = false;
  let ctaAction: () => void = handleSwap;

  if (busy) {
    ctaLabel = STAGE_LABELS[stage];
    ctaDisabled = true;
  } else if (!isConnected) {
    ctaLabel = "Connect Wallet";
    ctaAction = connect;
  } else if (!hasAmount) {
    ctaLabel = "Enter an Amount";
    ctaDisabled = true;
  } else if (!pairResolvable) {
    ctaLabel = "Pair Not Available On-Chain";
    ctaDisabled = true;
  } else if (insufficientBalance) {
    ctaLabel = `Insufficient ${payToken.symbol} Balance`;
    ctaDisabled = true;
  } else if (quoteLoading) {
    ctaLabel = "Fetching Quote...";
    ctaDisabled = true;
  } else if (!quote || quote.amountOutRaw <= 0n) {
    ctaLabel = "Price Unavailable";
    ctaDisabled = true;
  } else if (needsApproval) {
    ctaLabel = `Approve ${payToken.symbol}`;
    ctaAction = handleApprove;
  }

  const minimumReceivedLabel =
    hasAmount && quote
      ? `${formatBalance(
          formatBaseUnitsToNumber(applySlippageToRaw(quote.amountOutRaw, settings.slippagePct), receiveDecimals)
        )} ${receiveToken.symbol}`
      : "—";

  return (
    <div className="rounded-2xl border border-gold/40 bg-panel px-5 py-6 md:px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">Swap</h2>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
          aria-label="Swap settings"
        >
          <GearIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">You Pay</p>
        <div className="mt-2 rounded-xl border border-line bg-panel2 px-4 py-3 transition-colors focus-within:border-gold/60">
          <div className="flex items-center gap-3">
            <input
              value={payAmount}
              onChange={(event) => onPayAmountChange(event.target.value)}
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-bronze/50 focus:outline-none"
            />
            <TokenSelectButton token={payToken} onClick={() => onOpenTokenSearch("pay")} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-mono text-[10px] text-bronze">
              Balance: {formatBalance(payBalance)} {payToken.symbol}
            </p>
            {isConnected && payBalance > 0 && (
              <button
                type="button"
                onClick={() => onPayAmountChange(payBalance.toString())}
                className="font-mono text-[10px] uppercase tracking-wider2 text-goldLight hover:text-gold"
              >
                Max
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 -my-3 flex justify-center">
        <button
          type="button"
          onClick={onFlip}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/50 bg-panel2 text-goldLight transition-colors hover:border-gold hover:bg-gold/10"
          aria-label="Reverse swap direction"
        >
          <ArrowDownIcon className="h-4 w-4" />
        </button>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">You Receive</p>
        <div className="mt-2 rounded-xl border border-line bg-panel2 px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="w-full min-w-0 truncate font-display text-2xl text-ivory">
              {hasAmount && quote ? formatBalance(quote.receiveAmount) : "0.0"}
            </p>
            <TokenSelectButton token={receiveToken} onClick={() => onOpenTokenSearch("receive")} />
          </div>
          <p className="mt-2 font-mono text-[10px] text-bronze">
            Balance: {formatBalance(receiveBalance)} {receiveToken.symbol}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t border-line pt-4">
        <DetailRow
          label="Rate"
          value={
            hasAmount && quote
              ? `1 ${payToken.symbol} = ${formatBalance(quote.rate)} ${receiveToken.symbol}`
              : "—"
          }
        />
        <DetailRow
          label="Price Impact"
          value={hasAmount && quote && quote.priceImpactPct !== null ? `${quote.priceImpactPct.toFixed(2)}%` : "—"}
          valueClassName={hasAmount && quote ? impactColor : "text-ivory"}
        />
        <DetailRow label="Minimum Received" value={minimumReceivedLabel} />
        <DetailRow label="Network Fee" value={hasAmount && quote && gasFeeEth !== null ? `~${gasFeeEth.toFixed(6)} ETH` : "—"} />
      </div>

      {hasAmount && quote && (
        <div className="mt-4 rounded-xl border border-line bg-panel2 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Route</p>
          <p className="mt-2 font-display text-xs uppercase tracking-wider2 text-ivory">
            {quote.path.map((_, index) => describeHop(index, quote.path, payToken, receiveToken)).join(" → ")}
          </p>
          {quote.path.length > 2 && <p className="mt-1 font-mono text-[10px] text-bronze">Via WETH</p>}
        </div>
      )}

      <button
        type="button"
        disabled={ctaDisabled}
        onClick={ctaAction}
        className={`mt-6 w-full rounded-lg border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
          ctaDisabled
            ? "cursor-not-allowed border-line bg-panel2 text-bronze"
            : "border-gold text-goldLight hover:bg-gold hover:text-void"
        }`}
      >
        {ctaLabel}
      </button>

      {actionError && (
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider2 text-garnetLight">
          {actionError}
        </p>
      )}

      {successTx && (
        <SwapSuccessModal
          message={successTx.message}
          txHash={successTx.txHash}
          explorerUrl={`${NETWORK.explorerUrl}/tx/${successTx.txHash}`}
          onClose={() => setSuccessTx(null)}
        />
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClassName = "text-ivory",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">{label}</p>
      <p className={`font-mono text-xs ${valueClassName}`}>{value}</p>
    </div>
  );
}
