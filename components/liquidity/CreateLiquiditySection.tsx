"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon, CheckIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { useLiquidity } from "@/lib/liquidity-context";
import { swapTokens, type SwapToken } from "@/lib/swap-data";
import { formatCompactUsd, formatBalance } from "@/lib/format";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { createProviderCaller, createRpcCaller, type EthCaller } from "@/lib/nft-onchain";
import { fetchErc20Balance, fetchNativeBalance } from "@/lib/token-onchain";
import { sendLaunchpadTransaction as sendOnchainTransaction, waitForTransactionReceipt } from "@/lib/launchpad-onchain";
import {
  applySlippageToRaw,
  approveCalldata,
  fetchAllowance,
  fetchDecimals,
  formatBaseUnitsToNumber,
  getDeadlineTimestamp,
  getWethAddress,
  parseAmountToBaseUnits,
  resolveTokenContract,
  type ResolvedToken,
} from "@/lib/swap-onchain";
import { addLiquidityCalldata, addLiquidityEthCalldata, fetchPairReserves, quoteOptimalAmount } from "@/lib/liquidity-onchain";
import TokenSelectButton from "@/components/swap/TokenSelectButton";
import dynamic from "next/dynamic";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";

const TokenSearchModal = dynamic(() => import("@/components/swap/TokenSearchModal"), {
  loading: () => <ModalSkeleton />,
});

const DEFAULT_SLIPPAGE_PCT = 0.5;
const DEFAULT_DEADLINE_MINUTES = 20;

type CreateStage =
  | "idle"
  | "switching-network"
  | "awaiting-approval-a-signature"
  | "approving-a"
  | "awaiting-approval-b-signature"
  | "approving-b"
  | "awaiting-signature"
  | "confirming";

const STAGE_LABELS: Record<CreateStage, string> = {
  idle: "",
  "switching-network": "Switching To Giwa Sepolia...",
  "awaiting-approval-a-signature": "Confirm Approval In Wallet...",
  "approving-a": "Approving...",
  "awaiting-approval-b-signature": "Confirm Approval In Wallet...",
  "approving-b": "Approving...",
  "awaiting-signature": "Confirm In Your Wallet...",
  confirming: "Confirming...",
};

function formatAmountInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  const fixed = value.toFixed(8);
  return fixed.replace(/0+$/, "").replace(/\.$/, "");
}

export default function CreateLiquiditySection({
  onCreated,
}: {
  onCreated: (result: { poolId: string; positionId: string }) => void;
}) {
  const { isConnected, connect, address, provider, chainId } = useWallet();
  const { tokens } = useLiquidity();

  const [customImportedTokens, setCustomImportedTokens] = useState<SwapToken[]>([]);

  const myTokens = useMemo(
    () => tokens.filter((token) => !swapTokens.some((base) => base.id === token.id)),
    [tokens]
  );
  const allTokens = useMemo(() => {
    const merged = [...swapTokens, ...myTokens];
    customImportedTokens.forEach((token) => {
      if (!merged.some((item) => item.id === token.id)) merged.push(token);
    });
    return merged;
  }, [myTokens, customImportedTokens]);

  const [tokenAId, setTokenAId] = useState("eth");
  const [tokenBId, setTokenBId] = useState("gumi");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [searchSide, setSearchSide] = useState<"a" | "b" | null>(null);

  const [decimalsA, setDecimalsA] = useState(18);
  const [decimalsB, setDecimalsB] = useState(18);
  const [balanceA, setBalanceA] = useState(0);
  const [balanceB, setBalanceB] = useState(0);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [allowanceARaw, setAllowanceARaw] = useState(0n);
  const [allowanceBRaw, setAllowanceBRaw] = useState(0n);
  const [pairExists, setPairExists] = useState(false);
  const [reserveA, setReserveA] = useState(0n);
  const [reserveB, setReserveB] = useState(0n);

  const [stage, setStage] = useState<CreateStage>("idle");
  const [actionError, setActionError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<{ hash: string } | null>(null);

  const tokenA = allTokens.find((token) => token.id === tokenAId)!;
  const tokenB = allTokens.find((token) => token.id === tokenBId)!;

  const resolvedA: ResolvedToken | null = useMemo(() => resolveTokenContract(tokenA), [tokenA]);
  const resolvedB: ResolvedToken | null = useMemo(() => resolveTokenContract(tokenB), [tokenB]);
  const pairResolvable = !!resolvedA && !!resolvedB && tokenAId !== tokenBId;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const call: EthCaller = provider ? createProviderCaller(provider) : createRpcCaller(NETWORK.rpcUrl);

      if (isConnected && address) {
        setBalancesLoading(true);
        const [balA, balB] = await Promise.all([
          resolvedA
            ? resolvedA.isNative
              ? fetchNativeBalance(provider, NETWORK.rpcUrl, address)
              : fetchErc20Balance(call, resolvedA.address, address)
            : Promise.resolve(0),
          resolvedB
            ? resolvedB.isNative
              ? fetchNativeBalance(provider, NETWORK.rpcUrl, address)
              : fetchErc20Balance(call, resolvedB.address, address)
            : Promise.resolve(0),
        ]);
        if (!cancelled) {
          setBalanceA(balA);
          setBalanceB(balB);
          setBalancesLoading(false);
        }
      } else if (!cancelled) {
        setBalanceA(0);
        setBalanceB(0);
        setBalancesLoading(false);
      }

      if (!resolvedA || !resolvedB || tokenAId === tokenBId) {
        if (!cancelled) {
          setPairExists(false);
          setReserveA(0n);
          setReserveB(0n);
          setAllowanceARaw(0n);
          setAllowanceBRaw(0n);
        }
        return;
      }

      const [decA, decB] = await Promise.all([
        fetchDecimals(call, resolvedA.address, resolvedA.isNative),
        fetchDecimals(call, resolvedB.address, resolvedB.isNative),
      ]);
      if (cancelled) return;
      setDecimalsA(decA);
      setDecimalsB(decB);

      const wethAddress = await getWethAddress(call);
      if (cancelled) return;
      const pairTokenA = resolvedA.isNative ? wethAddress : resolvedA.address;
      const pairTokenB = resolvedB.isNative ? wethAddress : resolvedB.address;
      if (pairTokenA && pairTokenB) {
        const reserves = await fetchPairReserves(call, pairTokenA, pairTokenB);
        if (!cancelled) {
          setPairExists(reserves.exists);
          setReserveA(reserves.reserveA);
          setReserveB(reserves.reserveB);
        }
      } else if (!cancelled) {
        setPairExists(false);
        setReserveA(0n);
        setReserveB(0n);
      }

      if (isConnected && address) {
        const [allowA, allowB] = await Promise.all([
          resolvedA.isNative ? Promise.resolve(0n) : fetchAllowance(call, resolvedA.address, address, CONTRACT_ADDRESSES.gumiRouter),
          resolvedB.isNative ? Promise.resolve(0n) : fetchAllowance(call, resolvedB.address, address, CONTRACT_ADDRESSES.gumiRouter),
        ]);
        if (!cancelled) {
          setAllowanceARaw(allowA);
          setAllowanceBRaw(allowB);
        }
      } else if (!cancelled) {
        setAllowanceARaw(0n);
        setAllowanceBRaw(0n);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [tokenAId, tokenBId, isConnected, address, provider, resolvedA, resolvedB]);

  function handleAmountAChange(value: string) {
    setAmountA(value);
    setActionError(null);
    setTxResult(null);
    if (pairExists && reserveA > 0n && reserveB > 0n) {
      const raw = parseAmountToBaseUnits(value, decimalsA);
      if (raw > 0n) {
        const optimalB = quoteOptimalAmount(raw, reserveA, reserveB);
        setAmountB(formatAmountInput(formatBaseUnitsToNumber(optimalB, decimalsB)));
      } else {
        setAmountB("");
      }
    }
  }

  function handleAmountBChange(value: string) {
    setAmountB(value);
    setActionError(null);
    setTxResult(null);
    if (pairExists && reserveA > 0n && reserveB > 0n) {
      const raw = parseAmountToBaseUnits(value, decimalsB);
      if (raw > 0n) {
        const optimalA = quoteOptimalAmount(raw, reserveB, reserveA);
        setAmountA(formatAmountInput(formatBaseUnitsToNumber(optimalA, decimalsA)));
      } else {
        setAmountA("");
      }
    }
  }

  function handleSelectToken(tokenId: string) {
    if (searchSide === "a") {
      if (tokenId === tokenBId) setTokenBId(tokenAId);
      setTokenAId(tokenId);
    } else if (searchSide === "b") {
      if (tokenId === tokenAId) setTokenAId(tokenBId);
      setTokenBId(tokenId);
    }
    setAmountA("");
    setAmountB("");
    setActionError(null);
    setTxResult(null);
    setSearchSide(null);
  }

  function handleImportToken(token: SwapToken) {
    setCustomImportedTokens((prev) => (prev.some((item) => item.id === token.id) ? prev : [...prev, token]));
  }

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

  async function handleApproveA() {
    if (!provider || !address || !resolvedA || resolvedA.isNative) return;
    setActionError(null);
    try {
      await ensureGiwaNetwork();
      const amountRaw = parseAmountToBaseUnits(amountA, decimalsA);
      setStage("awaiting-approval-a-signature");
      const txHash = await sendOnchainTransaction(
        provider,
        address,
        resolvedA.address,
        approveCalldata(CONTRACT_ADDRESSES.gumiRouter, amountRaw),
        0n
      );
      setStage("approving-a");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Approval failed or timed out");
      }
      setAllowanceARaw(amountRaw);
      setStage("idle");
    } catch (caughtError) {
      setStage("idle");
      setActionError(caughtError instanceof Error ? caughtError.message : "Failed to approve token");
    }
  }

  async function handleApproveB() {
    if (!provider || !address || !resolvedB || resolvedB.isNative) return;
    setActionError(null);
    try {
      await ensureGiwaNetwork();
      const amountRaw = parseAmountToBaseUnits(amountB, decimalsB);
      setStage("awaiting-approval-b-signature");
      const txHash = await sendOnchainTransaction(
        provider,
        address,
        resolvedB.address,
        approveCalldata(CONTRACT_ADDRESSES.gumiRouter, amountRaw),
        0n
      );
      setStage("approving-b");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Approval failed or timed out");
      }
      setAllowanceBRaw(amountRaw);
      setStage("idle");
    } catch (caughtError) {
      setStage("idle");
      setActionError(caughtError instanceof Error ? caughtError.message : "Failed to approve token");
    }
  }

  async function handleCreateLiquidity() {
    if (!provider || !address || !resolvedA || !resolvedB) return;
    setActionError(null);
    try {
      await ensureGiwaNetwork();
      const amountARaw = parseAmountToBaseUnits(amountA, decimalsA);
      const amountBRaw = parseAmountToBaseUnits(amountB, decimalsB);
      const amountAMin = applySlippageToRaw(amountARaw, DEFAULT_SLIPPAGE_PCT);
      const amountBMin = applySlippageToRaw(amountBRaw, DEFAULT_SLIPPAGE_PCT);
      const deadline = getDeadlineTimestamp(DEFAULT_DEADLINE_MINUTES);

      let data: string;
      let valueWei = 0n;
      if (resolvedA.isNative) {
        data = addLiquidityEthCalldata(resolvedB.address, amountBRaw, amountBMin, amountAMin, address, deadline);
        valueWei = amountARaw;
      } else if (resolvedB.isNative) {
        data = addLiquidityEthCalldata(resolvedA.address, amountARaw, amountAMin, amountBMin, address, deadline);
        valueWei = amountBRaw;
      } else {
        data = addLiquidityCalldata(
          resolvedA.address,
          resolvedB.address,
          amountARaw,
          amountBRaw,
          amountAMin,
          amountBMin,
          address,
          deadline
        );
      }

      setStage("awaiting-signature");
      const txHash = await sendOnchainTransaction(provider, address, CONTRACT_ADDRESSES.gumiRouter, data, valueWei);

      setStage("confirming");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Add liquidity failed or timed out");
      }

      const call = createProviderCaller(provider);
      const wethAddress = await getWethAddress(call);
      const pairTokenA = resolvedA.isNative ? wethAddress ?? resolvedA.address : resolvedA.address;
      const pairTokenB = resolvedB.isNative ? wethAddress ?? resolvedB.address : resolvedB.address;
      const finalPair = await fetchPairReserves(call, pairTokenA, pairTokenB);
      const poolId = finalPair.pairAddress ?? `${pairTokenA}-${pairTokenB}`;

      setStage("idle");
      setAmountA("");
      setAmountB("");
      setTxResult({ hash: txHash });
      onCreated({ poolId, positionId: poolId });
    } catch (caughtError) {
      setStage("idle");
      setActionError(caughtError instanceof Error ? caughtError.message : "Failed to create liquidity");
    }
  }

  const amountANum = parseFloat(amountA) || 0;
  const amountBNum = parseFloat(amountB) || 0;
  const hasAmounts = amountANum > 0 && amountBNum > 0;
  const depositUsd = amountANum * tokenA.priceUsd + amountBNum * tokenB.priceUsd;
  const existingTvlUsd =
    pairExists && decimalsA > 0 && decimalsB > 0
      ? formatBaseUnitsToNumber(reserveA, decimalsA) * tokenA.priceUsd +
        formatBaseUnitsToNumber(reserveB, decimalsB) * tokenB.priceUsd
      : 0;
  const poolSharePct = pairExists
    ? Math.min(100, (depositUsd / Math.max(existingTvlUsd + depositUsd, 0.000001)) * 100)
    : 100;

  const insufficientBalanceA = isConnected && amountANum > 0 && !balancesLoading && amountANum > balanceA;
  const insufficientBalanceB = isConnected && amountBNum > 0 && !balancesLoading && amountBNum > balanceB;
  const amountARawCurrent = parseAmountToBaseUnits(amountA, decimalsA);
  const amountBRawCurrent = parseAmountToBaseUnits(amountB, decimalsB);
  const needsApprovalA = !!resolvedA && !resolvedA.isNative && amountARawCurrent > 0n && allowanceARaw < amountARawCurrent;
  const needsApprovalB = !!resolvedB && !resolvedB.isNative && amountBRawCurrent > 0n && allowanceBRaw < amountBRawCurrent;
  const busy = stage !== "idle";

  let ctaLabel = "Create Liquidity Pool";
  let ctaDisabled = false;
  let ctaAction: () => void = handleCreateLiquidity;

  if (busy) {
    ctaLabel = STAGE_LABELS[stage];
    ctaDisabled = true;
  } else if (!isConnected) {
    ctaLabel = "Connect Wallet";
    ctaAction = connect;
  } else if (tokenAId === tokenBId) {
    ctaLabel = "Choose Different Tokens";
    ctaDisabled = true;
  } else if (!pairResolvable) {
    ctaLabel = "Pair Not Available On-Chain";
    ctaDisabled = true;
  } else if (!hasAmounts) {
    ctaLabel = "Enter an Amount";
    ctaDisabled = true;
  } else if (insufficientBalanceA) {
    ctaLabel = `Insufficient ${tokenA.symbol} Balance`;
    ctaDisabled = true;
  } else if (insufficientBalanceB) {
    ctaLabel = `Insufficient ${tokenB.symbol} Balance`;
    ctaDisabled = true;
  } else if (needsApprovalA) {
    ctaLabel = `Approve ${tokenA.symbol}`;
    ctaAction = handleApproveA;
  } else if (needsApprovalB) {
    ctaLabel = `Approve ${tokenB.symbol}`;
    ctaAction = handleApproveB;
  }

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div className="border border-gold/40 bg-panel px-5 py-6 md:px-6">
          <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">
            Create Liquidity Pool
          </h2>
          <p className="mt-1 font-body text-xs text-bronze">
            Deposit two tokens to seed or add to a pool and start earning fees on-chain. Paste any
            token contract address to pair it once liquidity is live.
          </p>

          <div className="mt-6 space-y-3">
            <AmountField
              label="Token A"
              token={tokenA}
              amount={amountA}
              onAmountChange={handleAmountAChange}
              onSelectToken={() => setSearchSide("a")}
              balance={balanceA}
              balancesLoading={balancesLoading}
              isConnected={isConnected}
              onMax={() => handleAmountAChange(balanceA.toString())}
            />
            <div className="relative z-10 -my-3 flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center border border-gold/50 bg-panel2 text-goldLight">
                <PlusIcon className="h-4 w-4" />
              </div>
            </div>
            <AmountField
              label="Token B"
              token={tokenB}
              amount={amountB}
              onAmountChange={handleAmountBChange}
              onSelectToken={() => setSearchSide("b")}
              balance={balanceB}
              balancesLoading={balancesLoading}
              isConnected={isConnected}
              onMax={() => handleAmountBChange(balanceB.toString())}
            />
          </div>

          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Pool</span>
              <span className="text-ivory">
                {!pairResolvable ? "Unavailable" : pairExists ? "Existing Pool" : "New Pool"}
              </span>
            </div>
            {pairExists && (
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
                <span className="text-bronze">Current Liquidity</span>
                <span className="text-ivory">{formatCompactUsd(existingTvlUsd)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Deposit Value</span>
              <span className="text-ivory">{hasAmounts ? formatCompactUsd(depositUsd) : "—"}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Est. Pool Share</span>
              <span className="text-goldLight">{hasAmounts ? `${poolSharePct.toFixed(2)}%` : "—"}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={ctaDisabled}
            onClick={ctaAction}
            className={`mt-6 w-full border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
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

          {txResult && (
            <div className="mt-3 border border-gold/40 bg-panel2 px-4 py-3">
              <div className="flex items-center gap-2 text-goldLight">
                <CheckIcon className="h-4 w-4" />
                <span className="font-display text-xs uppercase tracking-wider2">Liquidity Added</span>
              </div>
              <a
                href={`${NETWORK.explorerUrl}/tx/${txResult.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block truncate font-mono text-[10px] text-bronze hover:text-ivory"
              >
                {txResult.hash}
              </a>
            </div>
          )}
        </div>
      </div>

      {searchSide && (
        <TokenSearchModal
          title={searchSide === "a" ? "Select Token A" : "Select Token B"}
          excludeId={searchSide === "a" ? tokenBId : tokenAId}
          extraTokens={[...myTokens, ...customImportedTokens]}
          onSelect={handleSelectToken}
          onImportToken={handleImportToken}
          onClose={() => setSearchSide(null)}
        />
      )}
    </section>
  );
}

function AmountField({
  label,
  token,
  amount,
  onAmountChange,
  onSelectToken,
  balance,
  balancesLoading,
  isConnected,
  onMax,
}: {
  label: string;
  token: SwapToken;
  amount: string;
  onAmountChange: (value: string) => void;
  onSelectToken: () => void;
  balance: number;
  balancesLoading: boolean;
  isConnected: boolean;
  onMax: () => void;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">{label}</p>
      <div className="mt-2 border border-line bg-panel2 px-4 py-3 transition-colors focus-within:border-gold/60">
        <div className="flex items-center gap-3">
          <input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-bronze/50 focus:outline-none"
          />
          <TokenSelectButton token={token} onClick={onSelectToken} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-mono text-[10px] text-bronze">
            Balance: {balancesLoading ? "—" : formatBalance(balance)} {token.symbol}
          </p>
          {isConnected && balance > 0 && (
            <button
              type="button"
              onClick={onMax}
              className="font-mono text-[10px] uppercase tracking-wider2 text-goldLight hover:text-gold"
            >
              Max
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
