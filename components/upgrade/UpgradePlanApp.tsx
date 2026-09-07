"use client";

import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet-context";
import {
  CrownIcon,
  CheckIcon,
  LockIcon,
  CompassIcon,
  SwapIcon,
  FrameIcon,
} from "@/components/icons";
import { GUMI_MINT_PRICE_ETH } from "@/lib/nft-onchain";

const FREE_FEATURES = [
  "Full access to Discover, Launchpad & Dex",
  "Create and trade tokens instantly",
  "Swap with routing and MEV protection",
  "Track your on-chain portfolio",
  "Standard wallet handle (0x… address)",
];

const GUMI_FEATURES = [
  "Everything in the Free Plan",
  "Custom .gumi on-chain identity NFT",
  "Gold crown badge across the ecosystem",
  "Verified .gumi tag on Discover, Launchpad & Dex",
  "Personal profile page at your .gumi name",
  "Permanent ownership — a true ERC-721 you keep forever",
];

export default function UpgradePlanApp() {
  const router = useRouter();
  const { isConnected, connect, isGumiHolder, gumiNftBalance } = useWallet();

  function handleGumiCta() {
    if (!isConnected) {
      connect();
      return;
    }
    router.push("/nft/mint");
  }

  return (
    <div>
      <section className="border-b border-line px-6 py-20 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 animate-fadeUp">
          <div className="flex h-14 w-14 items-center justify-center border border-gold/60 text-goldLight">
            <CrownIcon className="h-6 w-6" />
          </div>
          <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
            Membership
          </span>
          <h1 className="font-display text-3xl uppercase tracking-wider2 text-ivory text-shadow-gold md:text-4xl">
            Upgrade Your Plan
          </h1>
          <p className="font-body text-base italic text-bronze md:text-lg">
            Stay on the Free Plan, or mint a permanent .gumi identity and carry the
            crown across the entire Gumifi ecosystem.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <PlanCard
            eyebrow="Base Tier"
            title="Free Plan"
            price="Free"
            priceNote="No wallet action required"
            features={FREE_FEATURES}
            footer={
              !isGumiHolder ? (
                <span className="block w-full border border-line px-4 py-3 text-center font-mono text-[11px] uppercase tracking-wider2 text-bronze">
                  Current Plan
                </span>
              ) : (
                <span className="block w-full border border-line px-4 py-3 text-center font-mono text-[11px] uppercase tracking-wider2 text-bronze">
                  Included By Default
                </span>
              )
            }
          />

          <PlanCard
            highlighted
            eyebrow="Prestige Tier"
            title="Gumi Plan"
            price={`${GUMI_MINT_PRICE_ETH} ETH`}
            priceNote="One-time mint · permanent"
            features={GUMI_FEATURES}
            footer={
              isGumiHolder ? (
                <div className="flex w-full flex-col gap-2">
                  <span className="flex w-full items-center justify-center gap-2 border border-gold bg-gold/10 px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 text-goldLight">
                    <CheckIcon className="h-3.5 w-3.5" />
                    Plan Active{gumiNftBalance > 1 ? ` · ${gumiNftBalance} Identities` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/nft/mint")}
                    className="w-full border border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-ivory"
                  >
                    Mint Another Identity
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGumiCta}
                  className="w-full border border-gold px-4 py-3 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
                >
                  Mint Your NFT
                </button>
              )
            }
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoTile icon={CompassIcon} label="Verified Everywhere" text="Your crown and .gumi tag follow you across Discover, Launchpad, and Dex." />
          <InfoTile icon={SwapIcon} label="No Subscriptions" text="One mint, one payment. No recurring fees, ever." />
          <InfoTile icon={FrameIcon} label="Truly Yours" text="The identity is an ERC-721 NFT in your own wallet — transferable and permanent." />
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-center font-mono text-[10px] uppercase tracking-wider2 text-bronze">
          <LockIcon className="h-3 w-3" />
          Minted on Giwa Chain • Price fixed at {GUMI_MINT_PRICE_ETH} ETH per identity
        </p>
      </div>
    </div>
  );
}

function PlanCard({
  eyebrow,
  title,
  price,
  priceNote,
  features,
  footer,
  highlighted = false,
}: {
  eyebrow: string;
  title: string;
  price: string;
  priceNote: string;
  features: string[];
  footer: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col border px-6 py-8 md:px-8 md:py-10 ${
        highlighted
          ? "border-gold bg-gradient-to-b from-panel to-panel2 shadow-[0_0_40px_rgba(201,162,39,0.12)]"
          : "border-line bg-panel"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 border border-gold bg-void px-3 py-1 font-mono text-[9px] uppercase tracking-wider2 text-goldLight">
          Most Prestigious
        </span>
      )}
      <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">{eyebrow}</span>
      <h2 className="mt-2 font-display text-xl uppercase tracking-wider2 text-ivory">{title}</h2>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-3xl text-goldLight">{price}</span>
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze">{priceNote}</p>

      <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
        {features.map((item) => (
          <li key={item} className="flex items-start gap-2.5 font-body text-sm text-ivory/85">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-8">{footer}</div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  text,
}: {
  icon: (props: { className?: string }) => JSX.Element;
  label: string;
  text: string;
}) {
  return (
    <div className="border border-line bg-panel p-5">
      <Icon className="h-4 w-4 text-goldLight" />
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wider2 text-goldLight">{label}</p>
      <p className="mt-2 font-body text-xs text-bronze">{text}</p>
    </div>
  );
}
