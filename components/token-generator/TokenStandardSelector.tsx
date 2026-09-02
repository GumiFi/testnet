"use client";

import { CheckIcon } from "@/components/icons";
import { TOKEN_STANDARDS, type TokenStandard } from "@/lib/token-generator-data";

export default function TokenStandardSelector({
  value,
  onChange,
}: {
  value: TokenStandard;
  onChange: (next: TokenStandard) => void;
}) {
  return (
    <div className="space-y-2">
      {TOKEN_STANDARDS.map((standard) => {
        const active = value === standard.id;
        return (
          <button
            key={standard.id}
            type="button"
            onClick={() => onChange(standard.id)}
            className={`flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
              active ? "border-gold bg-gold/10" : "border-line bg-panel2 hover:border-gold/40"
            }`}
          >
            <span>
              <span
                className={`font-mono text-[11px] uppercase tracking-wider2 ${
                  active ? "text-goldLight" : "text-ivory"
                }`}
              >
                {standard.label}
              </span>
              <span className="mt-1 block font-body text-[11px] text-bronze">{standard.description}</span>
            </span>
            {active && (
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gold text-goldLight">
                <CheckIcon className="h-2.5 w-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
