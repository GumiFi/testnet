"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

function truncateMiddle(value: string, head = 10, tail = 8): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export default function CopyField({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`px-4 py-3 ${isLast ? "" : "border-b border-line"}`}>
      <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">{label}</p>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate font-mono text-xs text-ivory">{truncateMiddle(value)}</p>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
        >
          {copied ? (
            <CheckIcon className="h-3 w-3 text-emeraldLight" />
          ) : (
            <CopyIcon className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}
