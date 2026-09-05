"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  GlobeIcon,
  BoltIcon,
  GearIcon,
  FlagIcon,
  LockIcon,
  DropletIcon,
  TableIcon,
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import ImageUploadField from "@/components/launchpad/ImageUploadField";
import SocialLinksFields from "@/components/launchpad/SocialLinksFields";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";
import AdvancedTokenGeneratorHeader from "./AdvancedTokenGeneratorHeader";
import StepProgress from "./StepProgress";
import SectionCard from "./SectionCard";
import TokenStandardSelector from "./TokenStandardSelector";
import SupplyAllocationFields from "./SupplyAllocationFields";
import SupplyControlsFields from "./SupplyControlsFields";
import TransactionLimitsFields from "./TransactionLimitsFields";
import TaxFeesFields from "./TaxFeesFields";
import AntiBotFields from "./AntiBotFields";
import OwnershipSecurityFields from "./OwnershipSecurityFields";
import LiquiditySettingsFields from "./LiquiditySettingsFields";
import TeamAllocationFields from "./TeamAllocationFields";
import TokenDeploySuccessModal from "./TokenDeploySuccessModal";
import {
  DEFAULT_ADVANCED_TOKEN,
  teamAllocationTotalPct,
  type AdvancedTokenGeneratorValue,
} from "@/lib/token-generator-data";
import {
  ADVANCED_TOKEN_DECIMALS,
  ADVANCED_VARIANT_INDEX,
  isValidAddress,
  pctToBps,
  parseWholeUnitsToBaseUnits,
  createAdvancedTokenCalldata,
  extractCreatedAdvancedTokenAddress,
  fetchAdvancedFactoryDefaults,
  secondsToDaysLabel,
  secondsToHoursLabel,
  type AdvancedFactoryDefaults,
} from "@/lib/advanced-token-onchain";
import { createRpcCaller } from "@/lib/nft-onchain";
import { sendLaunchpadTransaction, waitForTransactionReceipt, parseEtherToWei } from "@/lib/launchpad-onchain";
import { CONTRACT_ADDRESSES, NETWORK, getExplorerAddressUrl } from "@/config/contracts.config";

const ImageCropModal = dynamic(() => import("@/components/launchpad/ImageCropModal"), {
  loading: () => <ModalSkeleton />,
});

const TOTAL_STEPS = 4;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const TREASURY_VARIANTS = new Set(["standard", "antiWhale", "liquidityGenerator"]);

type DeployStage = "idle" | "switching-network" | "awaiting-signature" | "confirming";

const STAGE_LABELS: Record<DeployStage, string> = {
  idle: "",
  "switching-network": "Switching To Giwa Sepolia...",
  "awaiting-signature": "Confirm In Your Wallet...",
  confirming: "Waiting For Confirmation...",
};

export default function AdvancedTokenGeneratorApp() {
  const router = useRouter();
  const { isConnected, connect, address, provider, chainId } = useWallet();

  const [step, setStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("1000000000");
  const [description, setDescription] = useState("");
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [advanced, setAdvanced] = useState<AdvancedTokenGeneratorValue>(DEFAULT_ADVANCED_TOKEN);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [deployed, setDeployed] = useState<{ symbol: string; address: string } | null>(null);
  const [stage, setStage] = useState<DeployStage>("idle");
  const [deployError, setDeployError] = useState<string | null>(null);
  const [factoryDefaults, setFactoryDefaults] = useState<AdvancedFactoryDefaults | null>(null);

  useEffect(() => {
    let cancelled = false;
    const call = createRpcCaller(NETWORK.rpcUrl);
    fetchAdvancedFactoryDefaults(call, CONTRACT_ADDRESSES.advancedTokenFactory)
      .then((defaults) => {
        if (!cancelled) setFactoryDefaults(defaults);
      })
      .catch(() => {
        /* leave as null — UI shows a fallback label */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function setAdvancedField<K extends keyof AdvancedTokenGeneratorValue>(
    key: K,
    next: AdvancedTokenGeneratorValue[K]
  ) {
    setAdvanced((current) => ({ ...current, [key]: next }));
  }

  function handleCropConfirm(result: string) {
    setTokenImage(result);
    setCropSrc(null);
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

  const supplyNum = parseFloat(totalSupply.replace(/,/g, "")) || 0;
  const teamTotalPct = teamAllocationTotalPct(advanced.team);
  const founderRow = advanced.supplyAllocation.find((row) => row.id === "founder");
  const liquidityRow = advanced.supplyAllocation.find((row) => row.id === "liquidity");
  const isAntiWhaleStandard = advanced.tokenStandard === "antiWhale";
  const treasuryApplies = TREASURY_VARIANTS.has(advanced.tokenStandard);
  const team0 = advanced.team[0];
  const team0PercentNum = team0 ? parseFloat(team0.percent) || 0 : 0;
  const hasTeamAllocation = !!team0 && team0PercentNum > 0;

  const step1Valid = tokenName.trim() !== "" && tokenSymbol.trim() !== "" && !!tokenImage && supplyNum > 0;
  const step2Valid = true;
  const step3Valid = true;

  function getDeployBlocker(): string | null {
    if (!tokenName.trim()) return "Enter Token Name";
    if (!tokenSymbol.trim()) return "Enter Token Symbol";
    if (!tokenImage) return "Upload Token Image";
    if (supplyNum <= 0) return "Enter Total Supply";
    if (isAntiWhaleStandard && (advanced.maxTxPct <= 0 || advanced.maxWalletPct <= 0)) {
      return "Set Anti-Whale Limits Above 0%";
    }
    if (treasuryApplies && advanced.treasuryWallet.trim() && !isValidAddress(advanced.treasuryWallet)) {
      return "Fix Treasury Wallet Address";
    }
    if (teamTotalPct > 100) return "Fix Team Allocation";
    if (hasTeamAllocation) {
      if (!team0!.wallet.trim() || !isValidAddress(team0!.wallet)) return "Enter A Valid Team Wallet";
      if (team0PercentNum > 100) return "Fix Team Wallet Percent";
      const vestingDaysNum = parseInt(team0!.vestingDays || "0", 10) || 0;
      if (vestingDaysNum <= 0) return "Set Team Vesting Days Above 0";
    }
    if (advanced.timelockEnabled) {
      const cliffDaysNum = team0 ? parseInt(team0.cliffDays || "0", 10) || 0 : 0;
      const vestingDaysNum = team0 ? parseInt(team0.vestingDays || "0", 10) || 0 : 0;
      if (!hasTeamAllocation || (cliffDaysNum <= 0 && vestingDaysNum <= 0)) {
        return "Timelock Needs A Team Cliff Or Vesting Period";
      }
    }
    if (advanced.autoLiquidity && (liquidityRow?.pct ?? 0) <= 0) {
      return "Set A Liquidity Pool Share Above 0%";
    }
    return null;
  }

  async function handleDeploy() {
    if (!provider || !address) {
      connect();
      return;
    }

    setDeployError(null);

    const blocker = getDeployBlocker();
    if (blocker) {
      setDeployError(blocker);
      return;
    }

    try {
      await ensureGiwaNetwork();

      setStage("awaiting-signature");

      const trimmedName = tokenName.trim();
      const trimmedSymbol = tokenSymbol.trim().toUpperCase();
      const totalSupplyBaseUnits = parseWholeUnitsToBaseUnits(totalSupply, ADVANCED_TOKEN_DECIMALS);

      const cliffDaysNum = team0 ? parseInt(team0.cliffDays || "0", 10) || 0 : 0;
      const vestingDaysNum = hasTeamAllocation ? parseInt(team0!.vestingDays || "0", 10) || 0 : 0;
      const teamAllocationBps = hasTeamAllocation ? pctToBps(team0PercentNum) : 0n;

      const liquidityPct = advanced.autoLiquidity ? liquidityRow?.pct ?? 0 : 0;
      const liquidityTokenAmount = (totalSupplyBaseUnits * BigInt(Math.round(liquidityPct * 100))) / 10000n;

      const treasuryAddress =
        treasuryApplies && advanced.treasuryWallet.trim() ? advanced.treasuryWallet.trim() : address;

      const params = {
        variant: ADVANCED_VARIANT_INDEX[advanced.tokenStandard],
        name: trimmedName,
        symbol: trimmedSymbol,
        totalSupply: totalSupplyBaseUnits,
        config: {
          buyTaxBps: pctToBps(advanced.buyTaxPct),
          sellTaxBps: pctToBps(advanced.sellTaxPct),
          maxWalletBps: advanced.limitsEnabled || isAntiWhaleStandard ? pctToBps(advanced.maxWalletPct) : 0n,
          maxTxBps: advanced.limitsEnabled || isAntiWhaleStandard ? pctToBps(advanced.maxTxPct) : 0n,
          cooldownSeconds: advanced.antiBotEnabled ? BigInt(advanced.cooldownSeconds) : 0n,
          launchProtectionBlocks: advanced.antiBotEnabled ? BigInt(advanced.launchProtectionBlocks) : 0n,
          blacklistEnabled: advanced.blacklistFunction,
          timelockEnabled: advanced.timelockEnabled,
          cliffDays: BigInt(cliffDaysNum),
          vestingDays: BigInt(vestingDaysNum),
          teamAllocationBps,
        },
        treasury: treasuryApplies ? treasuryAddress : ZERO_ADDRESS,
        teamBeneficiary: hasTeamAllocation ? team0!.wallet.trim() : ZERO_ADDRESS,
        teamRevocable: advanced.teamRevocable,
        autoLiquidity: advanced.autoLiquidity,
        liquidityTokenAmount,
        liquidityTokenMin: 0n,
        liquidityEthMin: 0n,
      };

      const data = createAdvancedTokenCalldata(params);
      const valueWei = advanced.autoLiquidity && liquidityTokenAmount > 0n ? parseEtherToWei(advanced.initialLiquidityEth) : 0n;

      const txHash = await sendLaunchpadTransaction(
        provider,
        address,
        CONTRACT_ADDRESSES.advancedTokenFactory,
        data,
        valueWei
      );

      setStage("confirming");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Transaction failed or timed out");
      }

      const tokenAddress = extractCreatedAdvancedTokenAddress(receipt, CONTRACT_ADDRESSES.advancedTokenFactory);
      if (!tokenAddress) {
        throw new Error("Could not determine the created token address");
      }

      setStage("idle");
      setDeployed({ symbol: trimmedSymbol, address: tokenAddress });
    } catch (caughtError) {
      setStage("idle");
      setDeployError(caughtError instanceof Error ? caughtError.message : "Failed to deploy token");
    }
  }

  function goToStep(target: number) {
    if (target <= furthestStep) setStep(target);
  }

  function goNext() {
    const next = Math.min(TOTAL_STEPS, step + 1);
    setStep(next);
    setFurthestStep((current) => Math.max(current, next));
  }

  function goBack() {
    setStep((current) => Math.max(1, current - 1));
  }

  const isBusy = stage !== "idle";
  let ctaLabel = "Deploy Token";
  let ctaDisabled = false;
  let ctaAction: () => void = handleDeploy;

  if (isBusy) {
    ctaLabel = STAGE_LABELS[stage];
    ctaDisabled = true;
  } else if (!isConnected) {
    ctaLabel = "Connect Wallet";
    ctaAction = connect;
  } else {
    const blocker = getDeployBlocker();
    if (blocker) {
      ctaLabel = blocker;
      ctaDisabled = true;
    }
  }

  const timelockMinDelayLabel = factoryDefaults
    ? `${secondsToHoursLabel(factoryDefaults.timelockMinDelaySeconds)} Minimum Delay`
    : undefined;
  const autoLiquidityLockDurationLabel = factoryDefaults
    ? secondsToDaysLabel(factoryDefaults.autoLiquidityLockDurationSeconds)
    : undefined;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <AdvancedTokenGeneratorHeader />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold/30 bg-panel2 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/40 text-goldLight">
          <BoltIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Live On-Chain Deploy</p>
          <p className="mt-1 font-body text-xs text-bronze">
            Deploys a real ERC-20 contract on {NETWORK.name} via the Gumifi Advanced Token Factory. Fields
            marked <span className="text-bronze">Soon</span> aren&apos;t supported by any deployed Advanced
            token contract yet and won&apos;t be sent on-chain.
          </p>
        </div>
      </div>

      <StepProgress current={step} furthest={furthestStep} onStepClick={goToStep} />

      <div key={step} className="animate-fadeUp rounded-2xl border border-gold/40 bg-panel px-5 py-6 md:px-6">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <FieldHeader label="Token Name" counter={`${tokenName.length}/32`} />
              <input
                value={tokenName}
                onChange={(event) => setTokenName(event.target.value.slice(0, 32))}
                type="text"
                maxLength={32}
                placeholder="e.g. Moon Gumi"
                className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
              />
            </div>

            <div>
              <FieldHeader label="Token Symbol" counter={`${tokenSymbol.length}/10`} />
              <input
                value={tokenSymbol}
                onChange={(event) => setTokenSymbol(event.target.value.slice(0, 10))}
                type="text"
                maxLength={10}
                placeholder="e.g. GUMI"
                className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
              />
            </div>

            <ImageUploadField
              label="Token Image"
              ratioLabel="1:1"
              aspectClassName="aspect-square w-full"
              image={tokenImage}
              onFileSelected={setCropSrc}
              onRemove={() => setTokenImage(null)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="flex items-center gap-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Decimals</p>
                </span>
                <div className="mt-2 flex h-11 items-center rounded-lg border border-line bg-panel2 px-4 font-display text-base text-ivory">
                  {ADVANCED_TOKEN_DECIMALS}
                </div>
                <p className="mt-1 font-body text-[10px] text-bronze">Fixed on-chain, not adjustable.</p>
              </div>
              <div>
                <FieldHeader label="Total Supply" counter="Units" />
                <input
                  value={totalSupply}
                  onChange={(event) => setTotalSupply(event.target.value.replace(/[^0-9]/g, ""))}
                  type="text"
                  inputMode="numeric"
                  placeholder="1000000000"
                  className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <FieldHeader label="Description (Optional)" counter={`${description.length}/300`} />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 300))}
                maxLength={300}
                rows={3}
                placeholder="Tell the world about your token..."
                className="mt-2 w-full resize-none rounded-lg border border-line bg-panel2 px-4 py-3 font-body text-sm text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
              />
            </div>

            <div className="border-t border-line pt-4">
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Token Standard</p>
              <div className="mt-2">
                <TokenStandardSelector
                  value={advanced.tokenStandard}
                  onChange={(next) => setAdvancedField("tokenStandard", next)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <SupplyAllocationFields
              rows={advanced.supplyAllocation}
              onChange={(next) => setAdvancedField("supplyAllocation", next)}
            />
            <div className="border-t border-line pt-5">
              <TaxFeesFields value={advanced} onChange={setAdvanced} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <SectionCard icon={GearIcon} label="Supply & Mint Controls">
              <SupplyControlsFields value={advanced} onChange={setAdvanced} />
            </SectionCard>
            <SectionCard icon={ActivityIcon} label="Transaction Limits" optional>
              <TransactionLimitsFields value={advanced} onChange={setAdvanced} />
            </SectionCard>
            <SectionCard icon={FlagIcon} label="Anti-Bot & Launch Protection" optional>
              <AntiBotFields value={advanced} onChange={setAdvanced} />
            </SectionCard>
            <SectionCard icon={LockIcon} label="Ownership & Security" optional>
              <OwnershipSecurityFields
                value={advanced}
                onChange={setAdvanced}
                timelockMinDelayLabel={timelockMinDelayLabel}
              />
            </SectionCard>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <SectionCard icon={DropletIcon} label="Liquidity & Launch">
              <LiquiditySettingsFields
                value={advanced}
                onChange={setAdvanced}
                autoLiquidityLockDurationLabel={autoLiquidityLockDurationLabel}
              />
            </SectionCard>
            <SectionCard icon={TableIcon} label="Team & Vesting Allocation" optional>
              <TeamAllocationFields
                team={advanced.team}
                onChange={(next) => setAdvancedField("team", next)}
                founderTargetPct={founderRow?.pct}
                teamRevocable={advanced.teamRevocable}
                onTeamRevocableChange={(next) => setAdvancedField("teamRevocable", next)}
              />
            </SectionCard>
            <SectionCard icon={GlobeIcon} label="Add Social Links" optional>
              <SocialLinksFields
                website={website}
                onWebsiteChange={setWebsite}
                twitter={twitter}
                onTwitterChange={setTwitter}
                telegram={telegram}
                onTelegramChange={setTelegram}
              />
            </SectionCard>

            <div className="rounded-xl border border-gold/30 bg-panel2 px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Review</p>
              <div className="mt-3 flex items-center gap-3">
                {tokenImage ? (
                  <img src={tokenImage} alt="" className="h-11 w-11 rounded-lg border border-gold/40 object-cover" />
                ) : (
                  <div className="h-11 w-11 rounded-lg border border-dashed border-line" />
                )}
                <div>
                  <p className="font-display text-sm text-ivory">{tokenName || "Untitled Token"}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                    ${tokenSymbol || "SYMBOL"} • {supplyNum.toLocaleString()} Supply
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-wider2">
                <span className="text-emeraldLight">Buy Tax {advanced.buyTaxPct.toFixed(1)}%</span>
                <span className="text-emeraldLight">Sell Tax {advanced.sellTaxPct.toFixed(1)}%</span>
                <span className={teamTotalPct <= 100 ? "text-emeraldLight" : "text-garnetLight"}>
                  Team {teamTotalPct.toFixed(1)}%
                </span>
                <span className="text-emeraldLight">
                  Liquidity {advanced.autoLiquidity ? `${(liquidityRow?.pct ?? 0).toFixed(1)}%` : "Off"}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={ctaDisabled}
              onClick={ctaAction}
              className={`w-full rounded-lg border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
                ctaDisabled
                  ? "cursor-not-allowed border-line bg-panel2 text-bronze"
                  : "border-gold text-goldLight hover:bg-gold hover:text-void"
              }`}
            >
              {ctaLabel}
            </button>
            {deployError && (
              <p className="text-center font-mono text-[10px] uppercase tracking-wider2 text-garnetLight">
                {deployError}
              </p>
            )}
            <p className="text-center font-mono text-[9px] uppercase tracking-wider2 text-bronze">
              Deploys On {NETWORK.name} • Takes A Few Seconds
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 rounded-lg border border-line px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-ivory"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          {step < TOTAL_STEPS && (
            <button
              type="button"
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)}
              onClick={goNext}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
                (step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)
                  ? "cursor-not-allowed border-line bg-panel2 text-bronze"
                  : "border-gold text-goldLight hover:bg-gold hover:text-void"
              }`}
            >
              Continue
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          aspect={1}
          title="Crop Token Image"
          onCancel={() => setCropSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      {deployed && (
        <TokenDeploySuccessModal
          title="Token Deployed"
          message={`$${deployed.symbol} was deployed on-chain with your Advanced tokenomics configuration.`}
          contractAddress={deployed.address}
          addressLabel="Contract Address"
          explorerUrl={getExplorerAddressUrl(deployed.address)}
          primaryLabel="View My Tokens"
          onPrimary={() => router.push("/profile")}
          onClose={() => setDeployed(null)}
        />
      )}
    </div>
  );
}

function FieldHeader({ label, counter }: { label: string; counter: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">{label}</p>
      <span className="font-mono text-[9px] text-bronze">{counter}</span>
    </div>
  );
}
