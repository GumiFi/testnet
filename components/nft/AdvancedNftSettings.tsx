"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";
import ToggleSwitch from "./ToggleSwitch";

export type RevealMode = "instant" | "delayed";

export type TokenStandard = "ERC721" | "ERC721A";

export type AdvancedNftSettingsValue = {
  tokenStandard: TokenStandard;
  royaltyPct: number;
  maxPerWallet: number;
  revealMode: RevealMode;
  revealDate: string;
  allowlistEnabled: boolean;
  presalePrice: string;
  presaleStart: string;
  publicSaleStart: string;
  freezeMetadata: boolean;
};

const inputClasses =
  "mt-2 w-full border border-line bg-panel2 px-3 py-2.5 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none";

export default function AdvancedNftSettings({
  value,
  onChange,
}: {
  value: AdvancedNftSettingsValue;
  onChange: (next: AdvancedNftSettingsValue) => void;
}) {
  function set<K extends keyof AdvancedNftSettingsValue>(key: K, next: AdvancedNftSettingsValue[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Token Standard</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => set("tokenStandard", "ERC721")}
            className={`flex-1 border py-2 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              value.tokenStandard === "ERC721"
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            ERC-721
          </button>
          <button
            type="button"
            onClick={() => set("tokenStandard", "ERC721A")}
            className={`flex-1 border py-2 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              value.tokenStandard === "ERC721A"
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            ERC-721A
          </button>
        </div>
        <p className="mt-1 font-body text-[11px] text-bronze">
          {value.tokenStandard === "ERC721"
            ? "Each NFT mints in its own transaction. Simple and widely supported."
            : "Mint many NFTs in one transaction, at a much lower gas cost per item."}
        </p>
      </div>

      <div className="border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Creator Royalty</p>
          <span className="font-mono text-[10px] text-goldLight">{value.royaltyPct.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={value.royaltyPct}
          onChange={(event) => set("royaltyPct", parseFloat(event.target.value))}
          className="mt-2 w-full accent-gold"
        />
        <p className="mt-1 font-body text-[11px] text-bronze">Percentage you earn on every secondary sale.</p>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Max Per Wallet</p>
          <p className="mt-1 font-body text-[11px] text-bronze">Limit how many a single wallet can mint.</p>
        </div>
        <div className="flex shrink-0 items-center border border-line">
          <button
            type="button"
            onClick={() => set("maxPerWallet", Math.max(1, value.maxPerWallet - 1))}
            aria-label="Decrease max per wallet"
            className="flex h-8 w-8 items-center justify-center text-bronze transition-colors hover:text-goldLight"
          >
            <MinusIcon className="h-3 w-3" />
          </button>
          <span className="w-6 text-center font-mono text-xs text-ivory">{value.maxPerWallet}</span>
          <button
            type="button"
            onClick={() => set("maxPerWallet", Math.min(20, value.maxPerWallet + 1))}
            aria-label="Increase max per wallet"
            className="flex h-8 w-8 items-center justify-center text-bronze transition-colors hover:text-goldLight"
          >
            <PlusIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Reveal</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => set("revealMode", "instant")}
            className={`flex-1 border py-2 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              value.revealMode === "instant"
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            Instant
          </button>
          <button
            type="button"
            onClick={() => set("revealMode", "delayed")}
            className={`flex-1 border py-2 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              value.revealMode === "delayed"
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            Delayed
          </button>
        </div>
        {value.revealMode === "delayed" && (
          <div className="mt-3">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Reveal Date</p>
            <input
              type="datetime-local"
              value={value.revealDate}
              onChange={(event) => set("revealDate", event.target.value)}
              className={inputClasses}
            />
          </div>
        )}
      </div>

      <div className="border-t border-line pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Provenance Hash</p>
        <p className="mt-1 font-body text-[11px] text-bronze">
          A fingerprint of your final artwork order. Generated automatically at deploy time so collectors can verify
          your reveal was never changed.
        </p>
        <p className="mt-2 border border-line bg-panel2 px-3 py-2 font-mono text-[10px] text-bronze">
          Generated automatically on deploy
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Whitelist Stage</p>
          <p className="mt-1 font-body text-[11px] text-bronze">Give allowlisted wallets a head start before public mint.</p>
        </div>
        <ToggleSwitch
          checked={value.allowlistEnabled}
          onChange={(next) => set("allowlistEnabled", next)}
          label="Toggle whitelist stage"
        />
      </div>
      {value.allowlistEnabled && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Whitelist Unit Price (ETH)</p>
            <input
              value={value.presalePrice}
              onChange={(event) => set("presalePrice", event.target.value.replace(/[^0-9.]/g, ""))}
              type="text"
              inputMode="decimal"
              placeholder="0.03"
              className={inputClasses}
            />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Whitelist Start Time</p>
            <input
              type="datetime-local"
              value={value.presaleStart}
              onChange={(event) => set("presaleStart", event.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      )}

      <div className="border-t border-line pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Public Mint Start</p>
        <input
          type="datetime-local"
          value={value.publicSaleStart}
          onChange={(event) => set("publicSaleStart", event.target.value)}
          className={inputClasses}
        />
        <p className="mt-1 font-body text-[11px] text-bronze">Leave blank to open public mint right at launch.</p>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">Freeze Metadata</p>
          <p className="mt-1 font-body text-[11px] text-bronze">Locks metadata permanently once minting completes.</p>
        </div>
        <ToggleSwitch
          checked={value.freezeMetadata}
          onChange={(next) => set("freezeMetadata", next)}
          label="Toggle freeze metadata"
        />
      </div>
    </div>
  );
}
