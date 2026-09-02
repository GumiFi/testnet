import type { IconProps } from "./types";

export default function SwapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M4 8h13M17 8l-3-3M17 8l-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16H7M7 16l3-3M7 16l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
