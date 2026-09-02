import type { IconProps } from "./types";

export default function MinusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" strokeLinecap="round" />
    </svg>
  );
}
