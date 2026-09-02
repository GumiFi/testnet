"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { GlobeIcon, BoltIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import ToggleSwitch from "@/components/nft/ToggleSwitch";
import ImageUploadField from "@/components/launchpad/ImageUploadField";
import CollapsibleSection from "@/components/launchpad/CollapsibleSection";
import SocialLinksFields from "@/components/launchpad/SocialLinksFields";
import ModalSkeleton from "@/components/skeletons/ModalSkeleton";
import SimpleTokenGeneratorHeader from "./SimpleTokenGeneratorHeader";
import Stepper from "./Stepper";
import TokenDeploySuccessModal from "./TokenDeploySuccessModal";
import { generateMockContractAddress } from "@/lib/token-generator-data";

const ImageCropModal = dynamic(() => import("@/components/launchpad/ImageCropModal"), {
  loading: () => <ModalSkeleton />,
});

export default function SimpleTokenGeneratorApp() {
  const router = useRouter();
  const { isConnected, connect } = useWallet();

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);
  const [totalSupply, setTotalSupply] = useState("1000000");
  const [description, setDescription] = useState("");
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const [mintable, setMintable] = useState(false);
  const [burnable, setBurnable] = useState(true);
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [deployed, setDeployed] = useState<{ symbol: string; address: string } | null>(null);

  function handleCropConfirm(result: string) {
    setTokenImage(result);
    setCropSrc(null);
  }

  function handleGenerate() {
    const address = generateMockContractAddress(`${tokenSymbol}-${tokenName}`);
    setDeployed({ symbol: tokenSymbol.trim().toUpperCase(), address });
  }

  const supplyNum = parseFloat(totalSupply.replace(/,/g, "")) || 0;

  let ctaLabel = "Generate Token";
  let ctaDisabled = false;
  let ctaAction: () => void = handleGenerate;

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
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <SimpleTokenGeneratorHeader />

      <div className="mb-6 flex items-start gap-3 border border-gold/30 bg-panel2 px-4 py-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/40 text-goldLight">
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

        <div className="mt-5 grid grid-cols-2 gap-3">
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
              placeholder="1000000"
              className="mt-2 w-full border border-line bg-panel2 px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
            />
          </div>
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

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Mintable</p>
            <p className="mt-1 font-body text-[11px] text-bronze">Allow the owner to mint new supply later.</p>
          </div>
          <ToggleSwitch checked={mintable} onChange={setMintable} label="Toggle mintable" />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Burnable</p>
            <p className="mt-1 font-body text-[11px] text-bronze">Let holders permanently burn their own tokens.</p>
          </div>
          <ToggleSwitch checked={burnable} onChange={setBurnable} label="Toggle burnable" />
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
        <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-wider2 text-bronze">
          Mock Only • No Smart Contract Deployed
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
          message={`$${deployed.symbol} was generated as a local mock. Connect a smart contract to deploy it for real.`}
          contractAddress={deployed.address}
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
