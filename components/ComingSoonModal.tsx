"use client";

import { ClockIcon } from "@/components/icons";

export default function ComingSoonModal({
  label,
  onClose,
}: {
  label: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xs border border-gold/40 bg-panel px-6 py-8 text-center animate-fadeUp">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold/50 text-goldLight">
          <ClockIcon className="h-5 w-5" />
        </div>
        <p className="font-display text-sm tracking-wider2 text-ivory">{label}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider3 text-bronze">
          Coming Soon
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full border border-gold px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
        >
          Close
        </button>
      </div>
    </div>
  );
}
