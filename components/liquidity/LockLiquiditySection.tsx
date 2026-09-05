"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { LockIcon, CheckIcon, ClockIcon, BoltIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { useLiquidity } from "@/lib/liquidity-context";
import { swapTokens, type SwapToken } from "@/lib/swap-data";
import { formatBalance } from "@/lib/format";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { createProviderCaller, createRpcCaller, type EthCaller } from "@/lib/nft-onchain";
import {
  approveCalldata,
  balanceOfCalldata,
  decodeUint256,
  fetchAllowance,
  fetchDecimals,
  formatBaseUnitsToNumber,
  getWethAddress,
  parseAmountToBaseUnits,
  resolveTokenContract,
  type ResolvedToken,
} from "@/lib/swap-onchain";
import { fetchPairReserves } from "@/lib/liquidity-onchain";
import {
  sendLaunchpadTransaction as sendOnchainTransaction,
  waitForTransactionReceipt,
} from "@/lib/launchpad-onchain";
import {
  lockCalldata,
  registerBoostCalldata,
  fetchBoostTiers,
  fetchObservationReadyAt,
  fetchPairSides,
  extractLockId,
  extractBoostOutcome,
  type BoostTier,
  type BoostOutcome,
} from "@/lib/lock-liquidity-onchain";
import TokenSelectButton from "@/components/swap/TokenSelectButton";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";

const TokenSearchModal = dynamic(() => import("@/components/swap/TokenSearchModal"), {
  loading: () => <ModalSkeleton />,
});

const DEFAULT_TIERS: BoostTier[] = [
  { minDays: 30, multiplier: 1 },
  { minDays: 90, multiplier: 1.25 },
  { minDays: 180, multiplier: 1.5 },
  { minDays: 365, multiplier: 2 },
];

type LockStage =
  | "idle"
  | "switching-network"
  | "awaiting-approval-signature"
  | "approving"
  | "awaiting-lock-signature"
  | "locking"
  | "awaiting-boost-signature"
  | "registering-boost";

const STAGE_LABELS: Record<LockStage, string> = {
  idle: "",
  "switching-network": "Switching To Giwa Sepolia...",
  "awaiting-approval-signature": "Confirm Approval In Wallet...",
  approving: "Approving LP Token...",
  "awaiting-lock-signature": "Confirm Lock In Wallet...",
  locking: "Locking Liquidity...",
  "awaiting-boost-signature": "Confirm In Your Wallet...",
  "registering-boost": "Registering Boost...",
};

function formatAmountInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  const fixed = value.toFixed(8);
  return fixed.replace(/0+$/, "").replace(/\.$/, "");
}

function getUnlockDateLabel(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "Ready now";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `Ready in ~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `Ready in ~${hours}h ${remMinutes}m`;
}

export default function LockLiquiditySection({
  onExplore,
  onLocked,
}: {
  onExplore: () => void;
  onLocked: (unlockDateLabel: string) => void;
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
  const [searchSide, setSearchSide] = useState<"a" | "b" | null>(null);
  const [amount, setAmount] = useState("");

  const [lpDecimals, setLpDecimals] = useState(18);
  const [lpBalanceRaw, setLpBalanceRaw] = useState(0n);
  const [allowanceRaw, setAllowanceRaw] = useState(0n);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [pairAddress, setPairAddress] = useState<string | null>(null);
  const [pairExists, setPairExists] = useState(false);
  const [isWethPaired, setIsWethPaired] = useState(false);
  const [tiers, setTiers] = useState<BoostTier[]>(DEFAULT_TIERS);
  const [selectedTierIndex, setSelectedTierIndex] = useState(1);
  const [refreshTick, setRefreshTick] = useState(0);

  const [stage, setStage] = useState<LockStage>("idle");
  const [actionError, setActionError] = useState<string | null>(null);
  const [lockResult, setLockResult] = useState<{ hash: string; lockId: bigint | null } | null>(null);

  const [boostStatus, setBoostStatus] = useState<"idle" | "checkpoint-pending" | "active">("idle");
  const [boostReadyAt, setBoostReadyAt] = useState<bigint | null>(null);
  const [boostError, setBoostError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const tokenA = allTokens.find((token) => token.id === tokenAId)!;
  const tokenB = allTokens.find((token) => token.id === tokenBId)!;
  const resolvedA: ResolvedToken | null = useMemo(() => resolveTokenContract(tokenA), [tokenA]);
  const resolvedB: ResolvedToken | null = useMemo(() => resolveTokenContract(tokenB), [tokenB]);
  const pairResolvable = !!resolvedA && !!resolvedB && tokenAId !== tokenBId;

  // Tick every 20s while waiting on the boost TWAP checkpoint, so the countdown/button updates itself.
  useEffect(() => {
    if (boostStatus !== "checkpoint-pending") return;
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 20000);
    return () => clearInterval(interval);
  }, [boostStatus]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const call: EthCaller = provider ? createProviderCaller(provider) : createRpcCaller(NETWORK.rpcUrl);

      if (!resolvedA || !resolvedB || tokenAId === tokenBId) {
        if (!cancelled) {
          setPairAddress(null);
          setPairExists(false);
          setIsWethPaired(false);
          setLpBalanceRaw(0n);
          setAllowanceRaw(0n);
          setTiers(DEFAULT_TIERS);
          setBalancesLoading(false);
        }
        return;
      }

      const wethAddress = await getWethAddress(call);
      if (cancelled) return;
      const pairTokenA = resolvedA.isNative ? wethAddress ?? resolvedA.address : resolvedA.address;
      const pairTokenB = resolvedB.isNative ? wethAddress ?? resolvedB.address : resolvedB.address;

      const reserves = await fetchPairReserves(call, pairTokenA, pairTokenB);
      if (cancelled) return;
      setPairAddress(reserves.pairAddress);
      setPairExists(reserves.exists);

      if (!reserves.exists || !reserves.pairAddress) {
        setIsWethPaired(false);
        setLpBalanceRaw(0n);
        setAllowanceRaw(0n);
        setBalancesLoading(false);
        return;
      }

      setBalancesLoading(true);
      const [decimals, sides, fetchedTiers] = await Promise.all([
        fetchDecimals(call, reserves.pairAddress, false),
        fetchPairSides(call, reserves.pairAddress),
        fetchBoostTiers(call, CONTRACT_ADDRESSES.liquidityBoostVault),
      ]);
      if (cancelled) return;
      setLpDecimals(decimals);
      setTiers(fetchedTiers.length > 0 ? fetchedTiers : DEFAULT_TIERS);
      const wethLower = wethAddress?.toLowerCase();
      setIsWethPaired(
        !!wethLower && (sides.token0?.toLowerCase() === wethLower || sides.token1?.toLowerCase() === wethLower)
      );

      if (isConnected && address) {
        const [balanceRaw, allowRaw] = await Promise.all([
          call(reserves.pairAddress, balanceOfCalldata(address)),
          fetchAllowance(call, reserves.pairAddress, address, CONTRACT_ADDRESSES.liquidityLocker),
        ]);
        if (!cancelled) {
          setLpBalanceRaw(decodeUint256(balanceRaw));
          setAllowanceRaw(allowRaw);
        }
      } else if (!cancelled) {
        setLpBalanceRaw(0n);
        setAllowanceRaw(0n);
      }
      if (!cancelled) setBalancesLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [tokenAId, tokenBId, isConnected, address, provider, resolvedA, resolvedB, refreshTick]);

  function resetActionState() {
    setActionError(null);
    setLockResult(null);
    setBoostStatus("idle");
    setBoostReadyAt(null);
    setBoostError(null);
  }

  function handleSelectToken(tokenId: string) {
    if (searchSide === "a") {
      if (tokenId === tokenBId) setTokenBId(tokenAId);
      setTokenAId(tokenId);
    } else if (searchSide === "b") {
      if (tokenId === tokenAId) setTokenAId(tokenBId);
      setTokenBId(tokenId);
    }
    setAmount("");
    resetActionState();
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

  async function handleApprove() {
    if (!provider || !address || !pairAddress) return;
    setActionError(null);
    try {
      await ensureGiwaNetwork();
      const amountRaw = parseAmountToBaseUnits(amount, lpDecimals);
      setStage("awaiting-approval-signature");
      const txHash = await sendOnchainTransaction(
        provider,
        address,
        pairAddress,
        approveCalldata(CONTRACT_ADDRESSES.liquidityLocker, amountRaw),
        0n
      );
      setStage("approving");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Approval failed or timed out");
      }
      setAllowanceRaw(amountRaw);
      setStage("idle");
    } catch (caughtError) {
      setStage("idle");
      setActionError(caughtError instanceof Error ? caughtError.message : "Failed to approve LP token");
    }
  }

  async function handleLock() {
    if (!provider || !address || !pairAddress) return;
    resetActionState();
    try {
      await ensureGiwaNetwork();
      const amountRaw = parseAmountToBaseUnits(amount, lpDecimals);
      const tier = tiers[selectedTierIndex] ?? tiers[0];
      const unlockTime = BigInt(Math.floor(Date.now() / 1000) + tier.minDays * 86400);

      setStage("awaiting-lock-signature");
      const txHash = await sendOnchainTransaction(
        provider,
        address,
        CONTRACT_ADDRESSES.liquidityLocker,
        lockCalldata(pairAddress, amountRaw, unlockTime, address),
        0n
      );

      setStage("locking");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Lock transaction failed or timed out");
      }

      const lockId = extractLockId(receipt, CONTRACT_ADDRESSES.liquidityLocker);
      setStage("idle");
      setLockResult({ hash: txHash, lockId });
      setAmount("");
      setRefreshTick((tick) => tick + 1);
      onLocked(getUnlockDateLabel(tier.minDays));
    } catch (caughtError) {
      setStage("idle");
      setActionError(caughtError instanceof Error ? caughtError.message : "Failed to lock liquidity");
    }
  }

  async function handleRegisterBoost(lockId: bigint) {
    if (!provider || !address || !pairAddress) return;
    setBoostError(null);
    try {
      await ensureGiwaNetwork();
      setStage("awaiting-boost-signature");
      const txHash = await sendOnchainTransaction(
        provider,
        address,
        CONTRACT_ADDRESSES.liquidityBoostVault,
        registerBoostCalldata(lockId),
        0n
      );
      setStage("registering-boost");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Boost registration failed or timed out");
      }
      const outcome: BoostOutcome = extractBoostOutcome(receipt, CONTRACT_ADDRESSES.liquidityBoostVault);
      setStage("idle");

      if (outcome === "activated") {
        setBoostStatus("active");
        setBoostReadyAt(null);
        return;
      }

      if (outcome === "checkpointed") {
        const call: EthCaller = provider ? createProviderCaller(provider) : createRpcCaller(NETWORK.rpcUrl);
        const readyAt = await fetchObservationReadyAt(call, CONTRACT_ADDRESSES.liquidityBoostVault, pairAddress);
        setBoostReadyAt(readyAt);
        setBoostStatus("checkpoint-pending");
        setNow(Math.floor(Date.now() / 1000));
        return;
      }

      setBoostError("Boost call succeeded but no boost event was found. Please try again.");
    } catch (caughtError) {
      setStage("idle");
      setBoostError(caughtError instanceof Error ? caughtError.message : "Failed to register boost");
    }
  }

  const amountNum = parseFloat(amount) || 0;
  const hasAmount = amountNum > 0;
  const amountRawCurrent = parseAmountToBaseUnits(amount, lpDecimals);
  const lpBalance = formatBaseUnitsToNumber(lpBalanceRaw, lpDecimals);
  const insufficientLp = isConnected && amountRawCurrent > 0n && !balancesLoading && amountRawCurrent > lpBalanceRaw;
  const needsApproval = !!pairAddress && amountRawCurrent > 0n && allowanceRaw < amountRawCurrent;
  const busy = stage !== "idle";
  const selectedTier = tiers[selectedTierIndex] ?? tiers[0];
  const boostReadySeconds = boostReadyAt !== null ? Number(boostReadyAt) - now : 0;
  const isBoostReady = boostReadyAt !== null && boostReadySeconds <= 0;

  let ctaLabel = "Lock Liquidity";
  let ctaDisabled = false;
  let ctaAction: () => void = handleLock;

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
  } else if (!pairExists) {
    ctaLabel = "Pool Does Not Exist Yet";
    ctaDisabled = true;
  } else if (!hasAmount) {
    ctaLabel = "Enter an Amount";
    ctaDisabled = true;
  } else if (insufficientLp) {
    ctaLabel = "Insufficient LP Balance";
    ctaDisabled = true;
  } else if (needsApproval) {
    ctaLabel = "Approve LP Token";
    ctaAction = handleApprove;
  }

  if (!isConnected) {
    return (
      <section className="border-b border-line px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center border border-line bg-panel px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
              <LockIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-lg uppercase tracking-wider2 text-ivory">
              Lock Liquidity
            </h2>
            <p className="mt-2 max-w-xs font-body text-sm text-bronze">
              Connect your wallet to lock your LP position on-chain and unlock APR boost eligibility.
            </p>
            <button
              type="button"
              onClick={connect}
              className="mt-6 border border-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div className="border border-gold/40 bg-panel px-5 py-6 md:px-6">
          <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">Lock Liquidity</h2>
          <p className="mt-1 font-body text-xs text-bronze">
            Lock LP tokens in the LiquidityLocker contract for a fixed term. ETH-paired pools can also
            register a reward-weight boost once locked.
          </p>

          <div className="mt-6 space-y-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Pool</p>
              <div className="mt-2 flex items-center gap-2 border border-line bg-panel2 px-3 py-2.5">
                <TokenSelectButton token={tokenA} onClick={() => setSearchSide("a")} />
                <span className="font-mono text-xs text-bronze">/</span>
                <TokenSelectButton token={tokenB} onClick={() => setSearchSide("b")} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                  LP Amount To Lock
                </p>
                {pairExists && lpBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(formatAmountInput(lpBalance))}
                    className="font-mono text-[10px] uppercase tracking-wider2 text-goldLight hover:text-gold"
                  >
                    Max
                  </button>
                )}
              </div>
              <div className="mt-2 border border-line bg-panel2 px-4 py-3 transition-colors focus-within:border-gold/60">
                <input
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    resetActionState();
                  }}
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  disabled={!pairExists}
                  className="w-full min-w-0 bg-transparent font-display text-2xl text-ivory placeholder:text-bronze/50 focus:outline-none disabled:opacity-40"
                />
                <p className="mt-2 font-mono text-[10px] text-bronze">
                  LP Balance: {pairExists ? (balancesLoading ? "—" : formatBalance(lpBalance)) : "No pool yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Lock Duration</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {tiers.map((tier, index) => (
                <button
                  key={tier.minDays}
                  type="button"
                  onClick={() => setSelectedTierIndex(index)}
                  className={`border px-2 py-2.5 text-center transition-colors ${
                    selectedTierIndex === index
                      ? "border-gold bg-gold/10 text-goldLight"
                      : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
                  }`}
                >
                  <p className="font-display text-xs uppercase tracking-wider2">{tier.minDays} Days</p>
                  <p className="mt-1 font-mono text-[9px] text-bronze">{tier.multiplier}x weight</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Pool</span>
              <span className="text-ivory">{pairExists ? "Existing Pool" : !pairResolvable ? "Unavailable" : "No Pool Yet"}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Boost Eligibility</span>
              <span className={isWethPaired ? "text-goldLight" : "text-bronze"}>
                {pairExists ? (isWethPaired ? "ETH-Paired · Eligible" : "Not ETH-Paired") : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Reward Weight</span>
              <span className="text-goldLight">{selectedTier.multiplier}x</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2">
              <span className="text-bronze">Unlock Date</span>
              <span className="text-ivory">{getUnlockDateLabel(selectedTier.minDays)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={ctaDisabled}
            onClick={ctaAction}
            className={`mt-6 flex w-full items-center justify-center gap-2 border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
              ctaDisabled
                ? "cursor-not-allowed border-line bg-panel2 text-bronze"
                : "border-gold text-goldLight hover:bg-gold hover:text-void"
            }`}
          >
            <LockIcon className="h-3.5 w-3.5" />
            {ctaLabel}
          </button>

          {actionError && (
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider2 text-garnetLight">
              {actionError}
            </p>
          )}

          {!pairExists && pairResolvable && (
            <button
              type="button"
              onClick={onExplore}
              className="mt-3 w-full text-center font-mono text-[10px] uppercase tracking-wider2 text-bronze hover:text-ivory"
            >
              Explore Pools →
            </button>
          )}

          {lockResult && (
            <div className="mt-3 border border-gold/40 bg-panel2 px-4 py-3">
              <div className="flex items-center gap-2 text-goldLight">
                <CheckIcon className="h-4 w-4" />
                <span className="font-display text-xs uppercase tracking-wider2">Liquidity Locked</span>
              </div>
              <a
                href={`${NETWORK.explorerUrl}/tx/${lockResult.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block truncate font-mono text-[10px] text-bronze hover:text-ivory"
              >
                {lockResult.hash}
              </a>
              {lockResult.lockId !== null && (
                <p className="mt-1 font-mono text-[10px] text-bronze">Lock ID #{lockResult.lockId.toString()}</p>
              )}
            </div>
          )}

          {lockResult && lockResult.lockId !== null && isWethPaired && boostStatus !== "active" && (
            <div className="mt-3 border border-gold/40 bg-panel2 px-4 py-3">
              <div className="flex items-center gap-2 text-goldLight">
                <BoltIcon className="h-4 w-4" />
                <span className="font-display text-xs uppercase tracking-wider2">APR Boost Available</span>
              </div>
              {boostStatus === "checkpoint-pending" ? (
                <>
                  <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-bronze">
                    <ClockIcon className="h-3 w-3" />
                    Checkpoint recorded — {formatCountdown(boostReadySeconds)}
                  </p>
                  <button
                    type="button"
                    disabled={busy || !isBoostReady}
                    onClick={() => handleRegisterBoost(lockResult!.lockId!)}
                    className={`mt-2 w-full border px-3 py-2 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
                      !isBoostReady || busy
                        ? "cursor-not-allowed border-line text-bronze"
                        : "border-gold text-goldLight hover:bg-gold hover:text-void"
                    }`}
                  >
                    {busy ? STAGE_LABELS[stage] : isBoostReady ? "Activate Boost" : "Waiting For TWAP Window"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleRegisterBoost(lockResult!.lockId!)}
                  className="mt-2 w-full border border-gold px-3 py-2 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? STAGE_LABELS[stage] : "Activate APR Boost"}
                </button>
              )}
              {boostError && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider2 text-garnetLight">{boostError}</p>
              )}
            </div>
          )}

          {boostStatus === "active" && (
            <div className="mt-3 flex items-center gap-2 border border-gold/40 bg-panel2 px-4 py-3 text-goldLight">
              <CheckIcon className="h-4 w-4" />
              <span className="font-display text-xs uppercase tracking-wider2">Boost Registered</span>
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
