import type { IconProps } from "./types";

export default function WalletIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M4 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1H6a2 2 0 0 0-2 2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h15a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.5" cy="14.5" r="1.2" />
    </svg>
  );
}
