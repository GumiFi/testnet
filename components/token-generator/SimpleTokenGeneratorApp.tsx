"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { GlobeIcon, BoltIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import ImageUploadField from "@/components/launchpad/ImageUploadField";
import CollapsibleSection from "@/components/launchpad/CollapsibleSection";
import SocialLinksFields from "@/components/launchpad/SocialLinksFields";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";
import SimpleTokenGeneratorHeader from "./SimpleTokenGeneratorHeader";
import TokenDeploySuccessModal from "./TokenDeploySuccessModal";
import {
  createSimpleTokenCalldata,
  extractCreatedSimpleTokenAddress,
  parseWholeUnitsToBaseUnits,
} from "@/lib/token-onchain";
import { sendLaunchpadTransaction, waitForTransactionReceipt } from "@/lib/launchpad-onchain";
import { CONTRACT_ADDRESSES, NETWORK, getExplorerAddressUrl } from "@/config/contracts.config";

const ImageCropModal = dynamic(() => import("@/components/launchpad/ImageCropModal"), {
  loading: () => <ModalSkeleton />,
});

const SIMPLE_TOKEN_DECIMALS = 18;

type DeployStage = "idle" | "switching-network" | "awaiting-signature" | "confirming";

const STAGE_LABELS: Record<DeployStage, string> = {
  idle: "",
  "switching-network": "Switching To Giwa Sepolia...",
  "awaiting-signature": "Confirm In Your Wallet...",
  confirming: "Waiting For Confirmation...",
};

export default function SimpleTokenGeneratorApp() {
  const router = useRouter();
  const { isConnected, connect, address, provider, chainId } = useWallet();

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("1000000");
  const [description, setDescription] = useState("");
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [deployed, setDeployed] = useState<{ symbol: string; address: string } | null>(null);
  const [stage, setStage] = useState<DeployStage>("idle");
  const [generateError, setGenerateError] = useState<string | null>(null);

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

  async function handleGenerate() {
    if (!provider || !address) {
      connect();
      return;
    }

    setGenerateError(null);

    try {
      await ensureGiwaNetwork();

      setStage("awaiting-signature");
      const trimmedName = tokenName.trim();
      const trimmedSymbol = tokenSymbol.trim().toUpperCase();
      const totalSupplyBaseUnits = parseWholeUnitsToBaseUnits(totalSupply, SIMPLE_TOKEN_DECIMALS);
      const data = createSimpleTokenCalldata(trimmedName, trimmedSymbol, totalSupplyBaseUnits);

      const txHash = await sendLaunchpadTransaction(
        provider,
        address,
        CONTRACT_ADDRESSES.simpleTokenFactory,
        data,
        0n
      );

      setStage("confirming");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Transaction failed or timed out");
      }

      const tokenAddress = extractCreatedSimpleTokenAddress(receipt, CONTRACT_ADDRESSES.simpleTokenFactory);
      if (!tokenAddress) {
        throw new Error("Could not determine the created token address");
      }

      setStage("idle");
      setDeployed({ symbol: trimmedSymbol, address: tokenAddress });
    } catch (caughtError) {
      setStage("idle");
      setGenerateError(caughtError instanceof Error ? caughtError.message : "Failed to generate token");
    }
  }

  const supplyNum = parseFloat(totalSupply.replace(/,/g, "")) || 0;
  const isBusy = stage !== "idle";

  let ctaLabel = "Generate Token";
  let ctaDisabled = false;
  let ctaAction: () => void = handleGenerate;

  if (isBusy) {
    ctaLabel = STAGE_LABELS[stage];
    ctaDisabled = true;
  } else if (!isConnected) {
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
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <SimpleTokenGeneratorHeader />

      <div className="mb-6 flex items-start gap-3 border border-gold/30 bg-panel2 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/40 text-goldLight">
          <BoltIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Live On-Chain Deploy</p>
          <p className="mt-1 font-body text-xs text-bronze">
            Deploys a real ERC-20 contract on {NETWORK.name} via the Gumifi Simple Token Factory. Supply is
            minted once to your wallet at generation — fixed at 18 decimals, no mint or burn functions.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/40 bg-panel px-5 py-6 md:px-6">
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

        <div className="mt-5">
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

        <div className="mt-5">
          <ImageUploadField
            label="Token Image"
            ratioLabel="1:1"
            aspectClassName="aspect-square w-full"
            image={tokenImage}
            onFileSelected={setCropSrc}
            onRemove={() => setTokenImage(null)}
          />
        </div>

        <div className="mt-5">
          <FieldHeader label="Total Supply" counter="Units" />
          <input
            value={totalSupply}
            onChange={(event) => setTotalSupply(event.target.value.replace(/[^0-9]/g, ""))}
            type="text"
            inputMode="numeric"
            placeholder="1000000"
            className="mt-2 w-full border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <div className="mt-5">
          <FieldHeader label="Description (Optional)" counter={`${description.length}/300`} />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 300))}
            maxLength={300}
            rows={3}
            placeholder="Tell the world about your token..."
            className="mt-2 w-full resize-none border border-line bg-panel2 px-4 py-3 font-body text-sm text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <CollapsibleSection icon={GlobeIcon} label="Add Social Links">
          <SocialLinksFields
            website={website}
            onWebsiteChange={setWebsite}
            twitter={twitter}
            onTwitterChange={setTwitter}
            telegram={telegram}
            onTelegramChange={setTelegram}
          />
        </CollapsibleSection>

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
        {generateError && (
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider2 text-garnetLight">
            {generateError}
          </p>
        )}
        <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          Deploys On {NETWORK.name} • Takes A Few Seconds
        </p>
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
          title="Token Generated"
          message={`$${deployed.symbol} was deployed on-chain and the full supply was minted to your wallet.`}
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
