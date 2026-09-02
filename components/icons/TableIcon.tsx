import type { IconProps } from "./types";

export default function TableIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="3.5" y="5" width="17" height="14" rx="1" />
      <path d="M3.5 10h17M9 10v9" strokeLinecap="round" />
    </svg>
  );
}
