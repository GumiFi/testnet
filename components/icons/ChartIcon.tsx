import type { IconProps } from "./types";

export default function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M4 20V10M10 20V4M16 20v-7M20 20H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
