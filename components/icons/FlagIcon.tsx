import type { IconProps } from "./types";

export default function FlagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M5 3.5v17" strokeLinecap="round" />
      <path d="M5 4.5h11.5l-2.4 3.5 2.4 3.5H5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
