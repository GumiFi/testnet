"use client";

import { WalletIcon, GlobeIcon } from "@/components/icons";
import type { EIP6963ProviderDetail } from "@/lib/wallet-context";

export default function WalletConnectModal({
  providers,
  connecting,
  error,
  onSelect,
  onClose,
}: {
  providers: EIP6963ProviderDetail[];
  connecting: boolean;
  error: string | null;
  onSelect: (uuid: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xs border border-gold/40 bg-panel px-6 py-7 animate-fadeUp">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
          <WalletIcon className="h-5 w-5" />
        </div>
        <p className="text-center font-display text-sm tracking-wider2 text-ivory">
          Connect Wallet
        </p>
        <p className="mt-1 text-center font-mono text-[9px] uppercase tracking-wider3 text-bronze">
          Choose a provider
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {providers.map((detail) => (
            <button
              key={detail.info.uuid}
              type="button"
              disabled={connecting}
              onClick={() => onSelect(detail.info.uuid)}
              className="flex items-center gap-3 border border-line bg-panel2 px-3.5 py-2.5 text-left transition-colors hover:border-gold/60 hover:bg-panel2/70 disabled:opacity-50"
            >
              {detail.info.icon ? (
                <img src={detail.info.icon} alt="" className="h-6 w-6 shrink-0" />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-gold/40 text-goldLight">
                  <WalletIcon className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] uppercase tracking-wider2 text-ivory">
                {detail.info.name}
              </span>
            </button>
          ))}

          {providers.length === 0 && (
            <div className="border border-line bg-panel2 px-3.5 py-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                No wallet detected
              </p>
              <a
                href="https://ethereum.org/wallets"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:text-gold"
              >
                <GlobeIcon className="h-3 w-3" />
                Get a Wallet
              </a>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-wider2 text-garnetLight">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full border border-gold px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
