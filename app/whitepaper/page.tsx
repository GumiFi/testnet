import type { Metadata } from "next";
import Logo from "@/components/Logo";
import TableOfContents from "@/components/TableOfContents";
import FeeFlowDiagram from "@/components/FeeFlowDiagram";

export const metadata: Metadata = {
  title: "Whitepaper — Gumifi Ecosystem",
};

function FeatureCard({
  title,
  tag,
  items,
}: {
  title: string;
  tag?: string;
  items: string[];
}) {
  return (
    <div className="border border-line bg-panel p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-sm uppercase tracking-wider2 text-goldLight">
          {title}
        </h3>
        {tag && (
          <span className="font-mono text-[10px] uppercase text-bronze">
            {tag}
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-wider2 text-bronze">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function WhitepaperPage() {
  return (
    <div>
      <section className="border-b border-line px-6 py-24 text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 animate-fadeUp">
          <Logo className="h-24 w-auto" />
          <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
            Whitepaper — Version 3.2
          </span>
          <h1 className="font-display text-4xl uppercase tracking-wider2 text-ivory text-shadow-gold md:text-5xl">
            Gumifi Ecosystem
          </h1>
          <p className="font-body text-lg italic text-bronze md:text-xl">
            A unified decentralized platform combining an instant-bonding
            curve launchpad, a decentralized exchange, and an NFT suite.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl gap-16 px-6 py-20">
        <TableOfContents />

        <article className="max-w-2xl space-y-24">
          <section id="vision" className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider3 text-gold">
              01
            </span>
            <h2 className="font-display text-2xl uppercase tracking-wider2 text-ivory">
              Ecosystem Vision
            </h2>
            <p className="font-body leading-relaxed text-ivory/90">
              Gumifi is a unified decentralized platform combining an
              instant-bonding curve launchpad, a decentralized exchange
              (DEX), and an NFT suite. The ecosystem is built to deliver
              seamless access, flexible transaction fee management, and a
              sustainable token deflation engine.
            </p>
          </section>

          <section id="features" className="space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider3 text-gold">
              02
            </span>
            <h2 className="font-display text-2xl uppercase tracking-wider2 text-ivory">
              Core Ecosystem Features
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FeatureCard
                title="Instant Launchpad"
                tag="Pump-style"
                items={[
                  "Instant Creation",
                  "Bonding Curve Trading",
                  "Auto-Graduation to DEX",
                ]}
              />
              <FeatureCard
                title="Token Generator"
                items={["Custom ERC-20 Standard", "Manual LP Locking Option"]}
              />
              <FeatureCard
                title="Decentralized Exchange"
                items={["Swap / Automated Market Maker", "Liquidity Pools"]}
              />
              <FeatureCard
                title="NFT Suite"
                items={["NFT Creator", "NFT Marketplace"]}
              />
            </div>
            <div className="border border-gold/60 bg-panel px-6 py-5 text-center">
              <p className="font-mono text-xs uppercase tracking-wider2 text-goldLight">
                Infrastructure & Utility Engine
              </p>
              <p className="mt-2 font-body text-sm text-bronze">
                Multi-Currency Relayer Fee Engine (ETH & $GUMI) · Dual-Asset
                30% Deflationary Fee Burn Engine
              </p>
            </div>
          </section>

          <section id="launchpad" className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider3 text-gold">
              2.1
            </span>
            <h2 className="font-display text-xl uppercase tracking-wider2 text-ivory">
              Instant Launchpad (Pump-Style Model)
            </h2>
            <p className="font-body leading-relaxed text-ivory/90">
              An instant token launch module allowing anyone to launch meme
              coins or community tokens in seconds with zero initial
              liquidity required.
            </p>
            <ul className="space-y-3 border-l border-line pl-6">
              <li>
                <span className="font-mono text-goldLight">
                  Instant Token Creation —{" "}
                </span>
                <span className="text-ivory/80">
                  Creators only need to provide a name, symbol, image, and
                  description without supplying funds for liquidity pools.
                </span>
              </li>
              <li>
                <span className="font-mono text-goldLight">
                  Bonding Curve Trading —{" "}
                </span>
                <span className="text-ivory/80">
                  Token prices scale dynamically via a mathematical curve.
                  Early buys start at lower prices and increase alongside
                  trading volume.
                </span>
              </li>
              <li>
                <span className="font-mono text-goldLight">
                  Auto-Graduation to DEX —{" "}
                </span>
                <span className="text-ivory/80">
                  Once the market cap/liquidity threshold on the bonding
                  curve is reached, accumulated funds and liquidity
                  automatically migrate and lock into the internal Gumifi DEX
                  for open trading.
                </span>
              </li>
            </ul>
          </section>

          <section id="generator" className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider3 text-gold">
              2.2
            </span>
            <h2 className="font-display text-xl uppercase tracking-wider2 text-ivory">
              Token Generator
            </h2>
            <p className="font-body leading-relaxed text-ivory/90">
              An alternative creation module for users who require standard
              token configurations with custom supply allocations and manual
              liquidity locking (LP lock).
            </p>
          </section>

          <section id="dex" className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider3 text-gold">
              2.3
            </span>
            <h2 className="font-display text-xl uppercase tracking-wider2 text-ivory">
              Decentralized Exchange (DEX)
            </h2>
            <p className="font-body leading-relaxed text-ivory/90">
              An Automated Market Maker (AMM) serving as the primary
              secondary market for tokens that have graduated from the
              Launchpad or deployed liquidity via the Generator.
            </p>
          </section>

          <section id="nft" className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider3 text-gold">
              2.4
            </span>
            <h2 className="font-display text-xl uppercase tracking-wider2 text-ivory">
              NFT Suite (Creator & Marketplace)
            </h2>
            <p className="font-body leading-relaxed text-ivory/90">
              An all-in-one platform for creating digital collections
              (ERC-721/1155) and an open marketplace supporting listings,
              bidding, and automated creator royalties.
            </p>
          </section>

          <section id="infrastructure" className="space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider3 text-gold">
              03
            </span>
            <h2 className="font-display text-2xl uppercase tracking-wider2 text-ivory">
              Multi-Currency Relayer & Buyback-Burn Infrastructure
            </h2>
            <p className="font-body leading-relaxed text-ivory/90">
              The platform utilizes a flexible Relayer network accepting
              platform fees in ETH or $GUMI. Users paying with $GUMI unlock
              discounted promotional fees.
            </p>
            <FeeFlowDiagram />
          </section>

          <section id="mechanism" className="space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider3 text-gold">
              3.1
            </span>
            <h2 className="font-display text-xl uppercase tracking-wider2 text-ivory">
              30% Fee Burn Mechanism
            </h2>
            <p className="font-body leading-relaxed text-ivory/90">
              Every platform fee processed by the Relayer, across Launchpad,
              DEX, Generator, or NFT Marketplace transactions, allocates 30%
              toward burning $GUMI tokens.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="border border-line bg-panel p-6">
                <p className="font-mono text-xs uppercase tracking-wider2 text-goldLight">
                  Fees Paid in ETH
                </p>
                <ul className="mt-4 space-y-2 font-body text-sm text-ivory/80">
                  <li>70% flows to the ecosystem Treasury.</li>
                  <li>
                    30% is used to automatically buy back $GUMI from the
                    internal DEX and permanently burn it.
                  </li>
                </ul>
              </div>
              <div className="border border-line bg-panel p-6">
                <p className="font-mono text-xs uppercase tracking-wider2 text-goldLight">
                  Fees Paid in $GUMI (Promo Rate)
                </p>
                <ul className="mt-4 space-y-2 font-body text-sm text-ivory/80">
                  <li>70% flows to the ecosystem Treasury.</li>
                  <li>
                    30% of the received $GUMI is directly and permanently
                    burned.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
