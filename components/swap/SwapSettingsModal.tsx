"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";

const SLIPPAGE_PRESETS = [0.1, 0.5, 1];

export type SwapSettings = {
  slippagePct: number;
  deadlineMinutes: number;
  mevProtection: boolean;
};

export default function SwapSettingsModal({
  settings,
  onChange,
  onClose,
}: {
  settings: SwapSettings;
  onChange: (settings: SwapSettings) => void;
  onClose: () => void;
}) {
  const isPreset = SLIPPAGE_PRESETS.includes(settings.slippagePct);
  const [customOpen, setCustomOpen] = useState(!isPreset);
  const [customValue, setCustomValue] = useState(
    isPreset ? "" : settings.slippagePct.toString()
  );

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function setSlippage(value: number) {
    onChange({ ...settings, slippagePct: value });
  }

  function handleCustomChange(value: string) {
    setCustomValue(value);
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setSlippage(Math.min(parsed, 50));
    }
  }

  function handleDeadlineChange(value: string) {
    const parsed = parseInt(value, 10);
    onChange({ ...settings, deadlineMinutes: Number.isNaN(parsed) ? 0 : Math.min(parsed, 180) });
  }

  const highPriceRisk = settings.slippagePct > 5;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
      <div className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full rounded-t-2xl border-t border-gold/40 bg-panel px-5 py-6 animate-fadeUp md:max-w-sm md:rounded-2xl md:border md:border-gold/40">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm uppercase tracking-wider2 text-ivory">Swap Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
            aria-label="Close"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
            Slippage Tolerance
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {SLIPPAGE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setCustomOpen(false);
                  setCustomValue("");
                  setSlippage(preset);
                }}
                className={`rounded-lg border px-2 py-2 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
                  !customOpen && settings.slippagePct === preset
                    ? "border-gold bg-gold/10 text-goldLight"
                    : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
                }`}
              >
                {preset}%
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomOpen(true)}
              className={`rounded-lg border px-2 py-2 font-mono text-[11px] uppercase tracking-wider2 transition-colors ${
                customOpen
                  ? "border-gold bg-gold/10 text-goldLight"
                  : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
              }`}
            >
              Custom
            </button>
          </div>

          {customOpen && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-2 focus-within:border-gold/60">
              <input
                autoFocus
                value={customValue}
                onChange={(event) => handleCustomChange(event.target.value)}
                type="number"
                min="0.01"
                max="50"
                step="0.1"
                placeholder="0.5"
                className="w-full bg-transparent font-mono text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
              />
              <span className="font-mono text-xs text-bronze">%</span>
            </div>
          )}

          {highPriceRisk && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider2 text-garnetLight">
              High slippage — your trade may be frontrun
            </p>
          )}
        </div>

        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">
            Transaction Deadline
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-2 focus-within:border-gold/60">
            <input
              value={settings.deadlineMinutes}
              onChange={(event) => handleDeadlineChange(event.target.value)}
              type="number"
              min="1"
              max="180"
              className="w-full bg-transparent font-mono text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
            />
            <span className="font-mono text-xs text-bronze">minutes</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-line bg-panel2 px-3 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">
              MEV Protection
            </p>
            <p className="mt-1 font-body text-xs text-bronze">
              Shield this swap from front-running bots.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...settings, mevProtection: !settings.mevProtection })}
            className={`flex h-4 w-8 shrink-0 items-center rounded-full border px-0.5 transition-colors ${
              settings.mevProtection
                ? "justify-end border-gold bg-gold/20"
                : "justify-start border-line bg-panel"
            }`}
            aria-pressed={settings.mevProtection}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${settings.mevProtection ? "bg-goldLight" : "bg-bronze"}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-gold px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
        >
          Done
        </button>
      </div>
    </div>
  );
}
