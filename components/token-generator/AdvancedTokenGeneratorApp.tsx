"use client";

import { useState } from "react";
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
import Stepper from "./Stepper";
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
  generateMockContractAddress,
  teamAllocationTotalPct,
  type AdvancedTokenGeneratorValue,
} from "@/lib/token-generator-data";

const ImageCropModal = dynamic(() => import("@/components/launchpad/ImageCropModal"), {
  loading: () => <ModalSkeleton />,
});

const TOTAL_STEPS = 4;

export default function AdvancedTokenGeneratorApp() {
  const router = useRouter();
  const { isConnected, connect } = useWallet();

  const [step, setStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);
  const [totalSupply, setTotalSupply] = useState("1000000000");
  const [description, setDescription] = useState("");
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [advanced, setAdvanced] = useState<AdvancedTokenGeneratorValue>(DEFAULT_ADVANCED_TOKEN);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [deployed, setDeployed] = useState<{ symbol: string; address: string } | null>(null);

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

  function handleDeploy() {
    const address = generateMockContractAddress(`${tokenSymbol}-${tokenName}`);
    setDeployed({ symbol: tokenSymbol.trim().toUpperCase(), address });
  }

  const supplyNum = parseFloat(totalSupply.replace(/,/g, "")) || 0;
  const feeShareTotal =
    advanced.liquidityFeeShare +
    advanced.marketingFeeShare +
    advanced.reflectionFeeShare +
    advanced.burnFeeShare +
    advanced.devFeeShare;
  const teamTotalPct = teamAllocationTotalPct(advanced.team);
  const founderRow = advanced.supplyAllocation.find((row) => row.id === "founder");

  const step1Valid = tokenName.trim() !== "" && tokenSymbol.trim() !== "" && !!tokenImage && supplyNum > 0;
  const step2Valid = feeShareTotal === 100;
  const step3Valid = true;

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

  let ctaLabel = "Deploy Token";
  let ctaDisabled = false;
  let ctaAction: () => void = handleDeploy;

  if (!isConnected) {
    ctaLabel = "Connect Wallet";
    ctaAction = connect;
  } else if (!tokenName.trim()) {
    ctaLabel = "Enter Token Name";
    ctaDisabled = true;
  } else if (!tokenSymbol.trim()) {
    ctaLabel = "Enter Token Symbol";
    ctaDisabled = true;
  } else if (!tokenImage) {
    ctaLabel = "Upload Token Image";
    ctaDisabled = true;
  } else if (supplyNum <= 0) {
    ctaLabel = "Enter Total Supply";
    ctaDisabled = true;
  } else if (feeShareTotal !== 100) {
    ctaLabel = "Fix Fee Allocation";
    ctaDisabled = true;
  } else if (teamTotalPct > 100) {
    ctaLabel = "Fix Team Allocation";
    ctaDisabled = true;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <AdvancedTokenGeneratorHeader />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold/30 bg-panel2 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/40 text-goldLight">
          <BoltIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Mock Preview</p>
          <p className="mt-1 font-body text-xs text-bronze">
            No smart contract is connected yet — this only builds a local mock of your token, nothing is
            deployed on-chain.
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
                <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Decimals</p>
                <div className="mt-2">
                  <Stepper value={decimals} min={0} max={18} step={1} onChange={setDecimals} />
                </div>
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
              <OwnershipSecurityFields value={advanced} onChange={setAdvanced} />
            </SectionCard>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <SectionCard icon={DropletIcon} label="Liquidity & Launch">
              <LiquiditySettingsFields value={advanced} onChange={setAdvanced} />
            </SectionCard>
            <SectionCard icon={TableIcon} label="Team & Vesting Allocation" optional>
              <TeamAllocationFields
                team={advanced.team}
                onChange={(next) => setAdvancedField("team", next)}
                founderTargetPct={founderRow?.pct}
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
                <span className={feeShareTotal === 100 ? "text-emeraldLight" : "text-garnetLight"}>
                  Fee Split {feeShareTotal.toFixed(0)}%
                </span>
                <span className={teamTotalPct <= 100 ? "text-emeraldLight" : "text-garnetLight"}>
                  Team {teamTotalPct.toFixed(1)}%
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
            <p className="text-center font-mono text-[9px] uppercase tracking-wider2 text-bronze">
              Mock Only • No Smart Contract Deployed
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
          message={`$${deployed.symbol} was generated as a local mock with your full tokenomics configuration. Connect a smart contract to deploy it for real.`}
          contractAddress={deployed.address}
          primaryLabel={advanced.lockLiquidity ? "View My Tokens" : "Lock Your Liquidity"}
          onPrimary={() => router.push(advanced.lockLiquidity ? "/profile" : "/liquidity?tab=lock")}
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
