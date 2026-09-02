"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { BoltIcon, GearIcon, GlobeIcon, GridIcon, ImageIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import CreateNftHeader from "./CreateNftHeader";
import AdvancedNftSettings, { type AdvancedNftSettingsValue } from "./AdvancedNftSettings";
import TraitsSection, { type TraitRow } from "./TraitsSection";
import ToggleSwitch from "./ToggleSwitch";
import ImageUploadField from "@/components/launchpad/ImageUploadField";
import CollapsibleSection from "@/components/launchpad/CollapsibleSection";
import SocialLinksFields from "@/components/launchpad/SocialLinksFields";
import LiquiditySuccessModal from "@/components/liquidity/LiquiditySuccessModal";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";

const ImageCropModal = dynamic(() => import("@/components/launchpad/ImageCropModal"), {
  loading: () => <ModalSkeleton />,
});

type CropTarget = "logo" | "banner";

type CropRequest = {
  target: CropTarget;
  src: string;
};

const DEFAULT_ADVANCED: AdvancedNftSettingsValue = {
  tokenStandard: "ERC721",
  royaltyPct: 5,
  maxPerWallet: 3,
  revealMode: "instant",
  revealDate: "",
  allowlistEnabled: false,
  presalePrice: "0.03",
  presaleStart: "",
  publicSaleStart: "",
  freezeMetadata: true,
};

export default function CreateNftApp() {
  const router = useRouter();
  const { isConnected, connect } = useWallet();

  const [collectionName, setCollectionName] = useState("");
  const [collectionSymbol, setCollectionSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [collectionImage, setCollectionImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [collectionSize, setCollectionSize] = useState("1000");
  const [mintPrice, setMintPrice] = useState("0.05");
  const [freeMint, setFreeMint] = useState(false);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [advanced, setAdvanced] = useState<AdvancedNftSettingsValue>(DEFAULT_ADVANCED);
  const [traits, setTraits] = useState<TraitRow[]>([]);
  const [cropRequest, setCropRequest] = useState<CropRequest | null>(null);
  const [created, setCreated] = useState<{ name: string; symbol: string } | null>(null);

  function handleCropConfirm(result: string) {
    if (!cropRequest) return;
    if (cropRequest.target === "logo") {
      setCollectionImage(result);
    } else {
      setBannerImage(result);
    }
    setCropRequest(null);
  }

  function handleCreate() {
    setCreated({ name: collectionName.trim(), symbol: collectionSymbol.trim().toUpperCase() });
  }

  const sizeNum = parseInt(collectionSize, 10) || 0;
  const priceNum = freeMint ? 0 : parseFloat(mintPrice) || 0;

  let ctaLabel = "Create Collection (Mock)";
  let ctaDisabled = false;
  let ctaAction: () => void = handleCreate;

  if (!isConnected) {
    ctaLabel = "Connect Wallet";
    ctaAction = connect;
  } else if (!collectionName.trim()) {
    ctaLabel = "Enter Collection Name";
    ctaDisabled = true;
  } else if (!collectionSymbol.trim()) {
    ctaLabel = "Enter Collection Symbol";
    ctaDisabled = true;
  } else if (!collectionImage) {
    ctaLabel = "Upload Collection Image";
    ctaDisabled = true;
  } else if (sizeNum <= 0) {
    ctaLabel = "Enter Collection Size";
    ctaDisabled = true;
  } else if (!freeMint && priceNum <= 0) {
    ctaLabel = "Enter Unit Price";
    ctaDisabled = true;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <CreateNftHeader />

      <div className="mb-6 flex items-start gap-3 border border-gold/30 bg-panel2 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/40 text-goldLight">
          <BoltIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">Mock Preview</p>
          <p className="mt-1 font-body text-xs text-bronze">
            No smart contract is connected yet — this only builds a local mock of your collection, nothing is
            deployed on-chain.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/40 bg-panel px-5 py-6 md:px-6">
        <div>
          <FieldHeader label="Collection Name" counter={`${collectionName.length}/32`} />
          <input
            value={collectionName}
            onChange={(event) => setCollectionName(event.target.value.slice(0, 32))}
            type="text"
            maxLength={32}
            placeholder="e.g. Gilded Ravens"
            className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <div className="mt-5">
          <FieldHeader label="Collection Symbol" counter={`${collectionSymbol.length}/10`} />
          <input
            value={collectionSymbol}
            onChange={(event) => setCollectionSymbol(event.target.value.slice(0, 10))}
            type="text"
            maxLength={10}
            placeholder="e.g. GRVN"
            className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <div className="mt-5">
          <ImageUploadField
            label="Collection Image"
            ratioLabel="1:1"
            aspectClassName="aspect-square w-full"
            image={collectionImage}
            onFileSelected={(src) => setCropRequest({ target: "logo", src })}
            onRemove={() => setCollectionImage(null)}
          />
        </div>

        <div className="mt-5">
          <FieldHeader label="Description (Optional)" counter={`${description.length}/300`} />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 300))}
            maxLength={300}
            rows={3}
            placeholder="Tell the world about your collection..."
            className="mt-2 w-full resize-none border border-line bg-panel2 px-4 py-3 font-body text-sm text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <FieldHeader label="Collection Size" counter="Items" />
            <input
              value={collectionSize}
              onChange={(event) => setCollectionSize(event.target.value.replace(/[^0-9]/g, ""))}
              type="text"
              inputMode="numeric"
              placeholder="1000"
              className="mt-2 w-full border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Unit Price</p>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Free</span>
                <ToggleSwitch
                  checked={freeMint}
                  onChange={(next) => {
                    setFreeMint(next);
                    if (next) setMintPrice("0");
                  }}
                  label="Toggle free mint"
                />
              </div>
            </div>
            <input
              value={freeMint ? "0" : mintPrice}
              onChange={(event) => setMintPrice(event.target.value.replace(/[^0-9.]/g, ""))}
              type="text"
              inputMode="decimal"
              disabled={freeMint}
              placeholder="0.05"
              className={`mt-2 w-full border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none ${
                freeMint ? "cursor-not-allowed opacity-60" : ""
              }`}
            />
          </div>
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

        <CollapsibleSection icon={GearIcon} label="Advanced Settings">
          <AdvancedNftSettings value={advanced} onChange={setAdvanced} />
        </CollapsibleSection>

        <CollapsibleSection icon={GridIcon} label="Traits & Rarity">
          <TraitsSection traits={traits} onChange={setTraits} collectionSize={sizeNum} />
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
        <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          Mock Only • No Smart Contract Deployed
        </p>
      </div>

      {cropRequest && (
        <ImageCropModal
          src={cropRequest.src}
          aspect={cropRequest.target === "logo" ? 1 : 3}
          title={cropRequest.target === "logo" ? "Crop Collection Image" : "Crop Banner Image"}
          onCancel={() => setCropRequest(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      {created && (
        <LiquiditySuccessModal
          title="Collection Created"
          message={`${created.name || "Your collection"}${
            created.symbol ? ` ($${created.symbol})` : ""
          } was created as a local mock. Connect a smart contract to deploy it for real.`}
          primaryLabel="View My Collections"
          onPrimary={() => router.push("/profile")}
          onClose={() => setCreated(null)}
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
