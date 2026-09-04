"use client";

import { CheckIcon } from "@/components/icons";
import CopyField from "./CopyField";

export default function SwapSuccessModal({
  message,
  txHash,
  explorerUrl,
  onClose,
}: {
  message: string;
  txHash: string;
  explorerUrl: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs border border-gold/40 bg-panel px-6 py-8 text-center animate-fadeUp">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
          <CheckIcon className="h-5 w-5" />
        </div>
        <p className="font-display text-sm tracking-wider2 text-ivory">Swap Confirmed</p>
        <p className="mt-2 font-body text-xs text-bronze">{message}</p>

        <div className="mt-5 border border-line bg-panel2 text-left">
          <CopyField label="Transaction Hash" value={txHash} isLast />
        </div>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block w-full border border-line px-4 py-2 text-center font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-ivory"
        >
          View On Explorer
        </a>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full border border-gold px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
        >
          Close
        </button>
      </div>
    </div>
  );
}
