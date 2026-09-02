"use client";

import { ArrowDownIcon, GearIcon } from "@/components/icons";
import { formatBalance } from "@/lib/format";
import { useWallet } from "@/lib/wallet-context";
import {
  getSwapBalance,
  getSwapRoute,
  computeSwapQuote,
  type SwapToken,
} from "@/lib/swap-data";
import type { SwapSettings } from "./SwapSettingsModal";
import TokenSelectButton from "./TokenSelectButton";

export default function SwapCard({
  payToken,
  receiveToken,
  payAmount,
  onPayAmountChange,
  onFlip,
  onOpenTokenSearch,
  onOpenSettings,
  onSubmit,
  settings,
}: {
  payToken: SwapToken;
  receiveToken: SwapToken;
  payAmount: string;
  onPayAmountChange: (value: string) => void;
  onFlip: () => void;
  onOpenTokenSearch: (side: "pay" | "receive") => void;
  onOpenSettings: () => void;
  onSubmit: () => void;
  settings: SwapSettings;
}) {
  const { isConnected, connect } = useWallet();

  const payAmountNum = parseFloat(payAmount) || 0;
  const payBalance = isConnected ? getSwapBalance(payToken.id) : 0;
  const receiveBalance = isConnected ? getSwapBalance(receiveToken.id) : 0;

  const route = getSwapRoute(payToken, receiveToken);
  const quote = computeSwapQuote(payToken, receiveToken, payAmountNum, settings.slippagePct, route);

  const hasAmount = payAmountNum > 0;
  const insufficientBalance = isConnected && hasAmount && payAmountNum > payBalance;

  const impactColor =
    quote.priceImpactPct > 3
      ? "text-garnetLight"
      : quote.priceImpactPct > 1
        ? "text-goldLight"
        : "text-ivory";

  let ctaLabel = "Swap";
  let ctaDisabled = false;
  let ctaAction: () => void = onSubmit;

  if (!isConnected) {
    ctaLabel = "Connect Wallet";
    ctaAction = connect;
  } else if (!hasAmount) {
    ctaLabel = "Enter an Amount";
    ctaDisabled = true;
  } else if (insufficientBalance) {
    ctaLabel = `Insufficient ${payToken.symbol} Balance`;
    ctaDisabled = true;
  } else if (quote.unknownPrice) {
    ctaLabel = "Price Unavailable";
    ctaDisabled = true;
  }

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
              {hasAmount && !quote.unknownPrice ? formatBalance(quote.receiveAmount) : "0.0"}
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
            hasAmount && !quote.unknownPrice
              ? `1 ${payToken.symbol} = ${formatBalance(quote.rate)} ${receiveToken.symbol}`
              : "—"
          }
        />
        <DetailRow
          label="Price Impact"
          value={hasAmount && !quote.unknownPrice ? `${quote.priceImpactPct.toFixed(2)}%` : "—"}
          valueClassName={hasAmount && !quote.unknownPrice ? impactColor : "text-ivory"}
        />
        <DetailRow
          label="Minimum Received"
          value={
            hasAmount && !quote.unknownPrice
              ? `${formatBalance(quote.minimumReceived)} ${receiveToken.symbol}`
              : "—"
          }
        />
        <DetailRow
          label="Network Fee"
          value={hasAmount && !quote.unknownPrice ? `~$${quote.networkFeeUsd.toFixed(2)}` : "—"}
        />
      </div>

      {hasAmount && !quote.unknownPrice && route.via.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-panel2 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Route</p>
          <p className="mt-2 font-display text-xs uppercase tracking-wider2 text-ivory">
            {route.hops
              .map((id) => (id === payToken.id ? payToken.symbol : id === receiveToken.id ? receiveToken.symbol : id.toUpperCase()))
              .join(" → ")}
          </p>
          <p className="mt-1 font-mono text-[10px] text-bronze">Via {route.via.join(", ")}</p>
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
