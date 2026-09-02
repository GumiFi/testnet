"use client";

import { CoinIcon, PieIcon, LockIcon, RocketIcon, CheckIcon } from "@/components/icons";

export const ADVANCED_TOKEN_STEPS = [
  { id: 1, label: "Identity", icon: CoinIcon },
  { id: 2, label: "Tokenomics", icon: PieIcon },
  { id: 3, label: "Security", icon: LockIcon },
  { id: 4, label: "Launch", icon: RocketIcon },
] as const;

export default function StepProgress({
  current,
  furthest,
  onStepClick,
}: {
  current: number;
  furthest: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="mb-6 flex items-start">
      {ADVANCED_TOKEN_STEPS.map((step, index) => {
        const isCompleted = step.id < current;
        const isActive = step.id === current;
        const isReachable = step.id <= furthest;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => onStepClick(step.id)}
              className="flex flex-col items-center gap-2 disabled:cursor-not-allowed"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
                  isActive
                    ? "border-gold bg-gold/15 text-goldLight shadow-[0_0_18px_rgba(201,162,39,0.4)]"
                    : isCompleted
                      ? "border-gold bg-gold text-void"
                      : "border-line bg-panel2 text-bronze"
                }`}
              >
                {isCompleted ? <CheckIcon className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-wider2 ${
                  isActive ? "text-goldLight" : isCompleted ? "text-ivory" : "text-bronze"
                }`}
              >
                {step.label}
              </span>
            </button>
            {index < ADVANCED_TOKEN_STEPS.length - 1 && (
              <span
                className={`mx-2 mt-[18px] h-px flex-1 transition-colors ${
                  step.id < current ? "bg-gold" : "bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
