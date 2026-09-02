"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ImageIcon, GlobeIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { useLiquidity } from "@/lib/liquidity-context";
import LiquiditySuccessModal from "@/components/liquidity/LiquiditySuccessModal";
import CreateCoinHeader from "./CreateCoinHeader";
import ImageUploadField from "./ImageUploadField";
import CollapsibleSection from "./CollapsibleSection";
import SocialLinksFields from "./SocialLinksFields";
import PairWithGumiRow from "./PairWithGumiRow";
import BuyAtLaunchRow from "./BuyAtLaunchRow";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";

const ImageCropModal = dynamic(() => import("./ImageCropModal"), {
  loading: () => <ModalSkeleton />,
});

type CropTarget = "token" | "banner";

type CropRequest = {
  target: CropTarget;
  src: string;
};

export default function CreateCoinApp() {
  const router = useRouter();
  const { isConnected, connect } = useWallet();
  const { launchToken } = useLiquidity();

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [buyInEth, setBuyInEth] = useState("0.5");
  const [cropRequest, setCropRequest] = useState<CropRequest | null>(null);
  const [launched, setLaunched] = useState<{ symbol: string } | null>(null);

  function handleCropConfirm(result: string) {
    if (!cropRequest) return;
    if (cropRequest.target === "token") {
      setTokenImage(result);
    } else {
      setBannerImage(result);
    }
    setCropRequest(null);
  }

  function handleLaunch() {
    const buyInEthNum = parseFloat(buyInEth) || 0;
    launchToken({ name: tokenName, symbol: tokenSymbol, buyInEth: buyInEthNum });
    setLaunched({ symbol: tokenSymbol.trim().toUpperCase() });
  }

  const buyInEthNum = parseFloat(buyInEth) || 0;

  let ctaLabel = "Launch Token";
  let ctaDisabled = false;
  let ctaAction: () => void = handleLaunch;

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
        <BuyAtLaunchRow />

        <div className="mt-3">
          <FieldHeader label="Initial Buy (ETH)" counter="Seeds Your Liquidity" />
          <input
            value={buyInEth}
            onChange={(event) => setBuyInEth(event.target.value.replace(/[^0-9.]/g, ""))}
            type="text"
            inputMode="decimal"
            placeholder="0.5"
            className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
          />
          <p className="mt-2 font-body text-xs text-bronze">
            This creates your token's initial liquidity pool — you can lock it right after launch.
          </p>
        </div>

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
        <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          Deploys On Giwa Chain • Takes A Few Seconds
        </p>
      </div>

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
          message={`$${launched.symbol} is live with its initial liquidity pool. Lock it now to boost your APR.`}
          primaryLabel="Lock Your Liquidity"
          onPrimary={() => router.push("/liquidity?tab=lock")}
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
