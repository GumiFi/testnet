"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ImageIcon, GlobeIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { registerLiveLaunchpadCoins } from "@/lib/launchpad-data";
import { buildLaunchpadCoinFromRecord, type LaunchpadCoinRecord } from "@/lib/launchpad-realtime";
import { uploadImageToPinata } from "@/lib/pinata";
import {
  createCoinCalldata,
  extractCreatedCoinAddress,
  parseEtherToWei,
  sendLaunchpadTransaction,
  waitForTransactionReceipt,
} from "@/lib/launchpad-onchain";
import { createProviderCaller } from "@/lib/nft-onchain";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import LiquiditySuccessModal from "@/components/liquidity/LiquiditySuccessModal";
import CreateCoinHeader from "./CreateCoinHeader";
import ImageUploadField from "./ImageUploadField";
import CollapsibleSection from "./CollapsibleSection";
import SocialLinksFields from "./SocialLinksFields";
import PairWithGumiRow from "./PairWithGumiRow";
import BuyAtLaunchRow from "./BuyAtLaunchRow";
import InitialBuyModal from "./InitialBuyModal";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";

const ImageCropModal = dynamic(() => import("./ImageCropModal"), {
  loading: () => <ModalSkeleton />,
});

type CropTarget = "token" | "banner";

type CropRequest = {
  target: CropTarget;
  src: string;
};

type LaunchStage =
  | "idle"
  | "switching-network"
  | "uploading-images"
  | "awaiting-signature"
  | "confirming"
  | "saving-record";

const STAGE_LABELS: Record<LaunchStage, string> = {
  idle: "",
  "switching-network": "Switching To Giwa Sepolia...",
  "uploading-images": "Uploading Images To Ipfs...",
  "awaiting-signature": "Confirm In Your Wallet...",
  confirming: "Waiting For Confirmation...",
  "saving-record": "Saving Coin Record...",
};

export default function CreateCoinApp() {
  const router = useRouter();
  const { isConnected, connect, address, provider, chainId } = useWallet();

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [buyInEth, setBuyInEth] = useState("0.5");
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [cropRequest, setCropRequest] = useState<CropRequest | null>(null);
  const [launched, setLaunched] = useState<{ symbol: string; address: string } | null>(null);
  const [stage, setStage] = useState<LaunchStage>("idle");
  const [launchError, setLaunchError] = useState<string | null>(null);

  function handleCropConfirm(result: string) {
    if (!cropRequest) return;
    if (cropRequest.target === "token") {
      setTokenImage(result);
    } else {
      setBannerImage(result);
    }
    setCropRequest(null);
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

  async function handleLaunch() {
    if (!provider || !address) {
      connect();
      return;
    }

    setLaunchError(null);

    try {
      await ensureGiwaNetwork();

      setStage("uploading-images");
      const uploadedImage = tokenImage ? await uploadImageToPinata(tokenImage, "token.png") : null;
      const uploadedBanner = bannerImage ? await uploadImageToPinata(bannerImage, "banner.png") : null;

      setStage("awaiting-signature");
      const trimmedName = tokenName.trim();
      const trimmedSymbol = tokenSymbol.trim().toUpperCase();
      const data = createCoinCalldata(trimmedName, trimmedSymbol);
      const valueWei = parseEtherToWei(buyInEth);

      const txHash = await sendLaunchpadTransaction(
        provider,
        address,
        CONTRACT_ADDRESSES.launchpadFactory,
        data,
        valueWei
      );

      setStage("confirming");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Transaction failed or timed out");
      }

      const tokenAddress = extractCreatedCoinAddress(receipt, CONTRACT_ADDRESSES.launchpadFactory);
      if (!tokenAddress) {
        throw new Error("Could not determine the created token address");
      }

      setStage("saving-record");
      const createResponse = await fetch("/api/launchpad/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: tokenAddress,
          creator: address,
          name: trimmedName,
          symbol: trimmedSymbol,
          description,
          image: uploadedImage?.url ?? null,
          bannerImage: uploadedBanner?.url ?? null,
          website: website || null,
          twitter: twitter || null,
          telegram: telegram || null,
          txHash,
        }),
      });

      if (!createResponse.ok) {
        const errorPayload = await createResponse.json().catch(() => null);
        throw new Error(errorPayload?.error ?? "Failed to save coin record");
      }

      const { record } = (await createResponse.json()) as { record: LaunchpadCoinRecord };
      const liveCoin = await buildLaunchpadCoinFromRecord(record, createProviderCaller(provider));
      registerLiveLaunchpadCoins([liveCoin]);

      setStage("idle");
      setLaunched({ symbol: trimmedSymbol, address: tokenAddress });
    } catch (caughtError) {
      setStage("idle");
      setLaunchError(caughtError instanceof Error ? caughtError.message : "Failed to launch token");
    }
  }

  const buyInEthNum = parseFloat(buyInEth) || 0;
  const isBusy = stage !== "idle";

  let ctaLabel = "Launch Token";
  let ctaDisabled = false;
  let ctaAction: () => void = handleLaunch;

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
  } else if (buyInEthNum <= 0) {
    ctaLabel = "Enter Buy Amount";
    ctaDisabled = true;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <CreateCoinHeader />

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
            onFileSelected={(src) => setCropRequest({ target: "token", src })}
            onRemove={() => setTokenImage(null)}
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

        <CollapsibleSection icon={ImageIcon} label="Add Banner">
          <ImageUploadField
            label="Banner Image"
            ratioLabel="3:1"
            aspectClassName="aspect-[3/1] w-full"
            image={bannerImage}
            onFileSelected={(src) => setCropRequest({ target: "banner", src })}
            onRemove={() => setBannerImage(null)}
          />
        </CollapsibleSection>

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

        <PairWithGumiRow />
        <BuyAtLaunchRow amount={buyInEth} onOpen={() => setBuyModalOpen(true)} />

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
        {launchError && (
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider2 text-garnetLight">
            {launchError}
          </p>
        )}
        <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          Deploys On Giwa Chain • Takes A Few Seconds
        </p>
      </div>

      {buyModalOpen && (
        <InitialBuyModal
          value={buyInEth}
          onConfirm={setBuyInEth}
          onClose={() => setBuyModalOpen(false)}
        />
      )}

      {cropRequest && (
        <ImageCropModal
          src={cropRequest.src}
          aspect={cropRequest.target === "token" ? 1 : 3}
          title={cropRequest.target === "token" ? "Crop Token Image" : "Crop Banner Image"}
          onCancel={() => setCropRequest(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      {launched && (
        <LiquiditySuccessModal
          title="Token Launched"
          message={`$${launched.symbol} is live on-chain with its bonding curve seeded.`}
          primaryLabel="View Your Coin"
          onPrimary={() => router.push(`/launchpad/coin/${launched.address}`)}
          onClose={() => setLaunched(null)}
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
