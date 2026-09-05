"use client";

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className="relative flex h-5 w-9 shrink-0 cursor-not-allowed items-center rounded-full border border-line bg-panel px-0.5"
      >
        <span className="h-3.5 w-3.5 rounded-full bg-bronze/60" />
      </span>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
        checked ? "border-gold bg-gold/30" : "border-line bg-void"
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-goldLight transition-all ${
          checked ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}
